<?php
// Disable OPcache to prevent file content caching issues during development
ini_set('opcache.enable', 0);

// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Clear file status cache to ensure the latest data is read from db.json
clearstatcache(true);

// Utility to obtain client IP (including proxy support and CLI fallbacks)
function get_client_ip() {
    $ip_sources = [
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'HTTP_X_CLIENT_IP',
        'REMOTE_ADDR'
    ];

    foreach ($ip_sources as $key) {
        if (!empty($_SERVER[$key])) {
            $ip_list = explode(',', $_SERVER[$key]);
            foreach ($ip_list as $ip) {
                $trimmed_ip = trim($ip);
                if (!filter_var($trimmed_ip, FILTER_VALIDATE_IP)) {
                    continue;
                }
                
                if ($trimmed_ip === '::1') {
                    return '127.0.0.1';
                }

                if (strpos($trimmed_ip, '::ffff:') === 0) {
                    return substr($trimmed_ip, 7);
                }

                return $trimmed_ip;
            }
        }
    }

    return '127.0.0.1';
}

function log_debug_message($message, $context = []) {
    $log_dir = __DIR__ . '/../storage/logs';
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0777, true);
    }

    $log_file = $log_dir . '/api.log';
    $timestamp = date('Y-m-d H:i:s');
    $formatted_context = json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    file_put_contents($log_file, "[$timestamp] $message $formatted_context" . PHP_EOL, FILE_APPEND);
}

// Handle pre-flight OPTIONS request from browsers
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    log_debug_message('OPTIONS request received', [
        'client_ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'headers' => array_change_key_case($_SERVER, CASE_LOWER),
    ]);
    http_response_code(200);
    exit();
}

$db_path = __DIR__ . '/../db.json';

// Function to read the database file
function read_db($path) {
    if (!file_exists($path)) {
        return [];
    }
    $json_data = file_get_contents($path);
    return json_decode($json_data, true);
}

// Function to write data back to the database file
function write_db($path, $data) {
    // Use LOCK_EX to prevent race conditions during file writing.
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// --- Basic Routing ---
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_parts = explode('/', $uri);

$resource = $uri_parts[1] ?? null;
$resource_id = $uri_parts[2] ?? null;

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$db = read_db($db_path);

// Attach client IP for log creation
$client_ip = get_client_ip();
log_debug_message('Client IP resolved', [
    'http_x_client_ip' => $_SERVER['HTTP_X_CLIENT_IP'] ?? null,
    'http_x_forwarded_for' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
    'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? null,
    'resolved_ip' => $client_ip,
]);

// --- Handle Login Request ---
if ($resource === 'login' && $method === 'POST') {
    $username = $input['username'] ?? null;
    $password = $input['password'] ?? null;

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required.']);
        exit();
    }

    $user_found = null;
    foreach ($db['users'] as $user) {
        if ($user['username'] === $username && $user['password'] === $password) {
            $user_found = $user;
            break;
        }
    }

    if ($user_found) {
        $role = $user_found['userType'];
        $permissions = $db['permissions'][$role] ?? [];
        
        // Don't send password back to client
        unset($user_found['password']);

        http_response_code(200);
        echo json_encode([
            'user' => $user_found,
            'permissions' => $permissions
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials.']);
    }
    exit();
}


// Validate resource
if (!$resource || !isset($db[$resource])) {
    http_response_code(404);
    echo json_encode(['error' => "Resource '{$resource}' not found"]);
    exit();
}

// --- Handle Requests ---
switch ($method) {
    case 'GET':
        if ($resource_id) {
            $item = null;
            foreach ($db[$resource] as $i) {
                if (isset($i['id']) && $i['id'] == $resource_id) {
                    $item = $i;
                    break;
                }
            }
            if ($item) {
                echo json_encode($item);
            } else {
                http_response_code(404);
                echo json_encode(['error' => "Item with ID {$resource_id} not found in {$resource}"]);
            }
        } else {
            // For objects (like permissions/tokenConfig), return the object. For arrays, return the array.
            echo json_encode($db[$resource]);
        }
        break;

    case 'POST':
        // Handle votes resource creation
        if ($resource === 'votes') {
            // For creating a new vote, add it to the votes array
            $input['id'] = bin2hex(random_bytes(4));
            if (!isset($db['votes'])) {
                $db['votes'] = [];
            }
            $db['votes'][] = $input;
            write_db($db_path, $db);
            echo json_encode($input);
            exit();
        }

        // Explicitly handle permissions, tokenConfig update (whole object replacement)
        if ($resource === 'permissions' || $resource === 'tokenConfig') {
             $db[$resource] = $input;
             write_db($db_path, $db);
             echo json_encode($input);
             exit();
        }

        log_debug_message('POST request received', [
            'resource' => $resource,
            'client_ip' => $client_ip,
            'headers' => array_change_key_case($_SERVER, CASE_LOWER),
        ]);

        // Handle array resources (like adding a new user, role, etc.)
        $input['id'] = bin2hex(random_bytes(4));

        if ($resource === 'logs') {
            // Enforce server-side IP attribution
            $input['ip'] = $client_ip;
        }

        $db[$resource][] = $input;
        write_db($db_path, $db);
        http_response_code(201);
        echo json_encode($input);
        break;

    case 'PUT':
        if (!$resource_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Resource ID is required for PUT requests']);
            exit();
        }
        $found_key = null;
        foreach ($db[$resource] as $key => $item) {
            if (isset($item['id']) && $item['id'] == $resource_id) {
                $found_key = $key;
                break;
            }
        }
        if ($found_key !== null) {
            // Ensure the ID from the URL is respected, not overwritten by the input body
            $db[$resource][$found_key] = array_merge($db[$resource][$found_key], $input);
            $db[$resource][$found_key]['id'] = (int)$resource_id;
            write_db($db_path, $db);
            echo json_encode($db[$resource][$found_key]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => "Item with ID {$resource_id} not found"]);
        }
        break;

    case 'DELETE':
        if (!$resource_id) {
            // 处理删除所有投票的请求
            if ($resource === 'votes') {
                $db['votes'] = [];
                write_db($db_path, $db);
                http_response_code(204); // No Content
                exit();
            }
            http_response_code(400);
            echo json_encode(['error' => 'Resource ID is required for DELETE requests']);
            exit();
        }
        $found_key = null;
        foreach ($db[$resource] as $key => $item) {
            // 支持字符串和数字ID的比较
            if (isset($item['id']) && (string)$item['id'] === (string)$resource_id) {
                $found_key = $key;
                break;
            }
        }
        if ($found_key !== null) {
            array_splice($db[$resource], $found_key, 1);
            write_db($db_path, $db);
            http_response_code(204); // No Content
        } else {
            http_response_code(404);
            echo json_encode(['error' => "Item with ID {$resource_id} not found"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
?>