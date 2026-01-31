import base64, json, os, re, zipfile
from http.server import HTTPServer, BaseHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))

def ensure_dirs():
    os.makedirs(os.path.join(ROOT, 'libs'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'assets', 'live2d'), exist_ok=True)

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)
        self.wfile.write(b'{}')

    def do_GET(self):
        try:
            rel = self.path.split('?',1)[0]
            if rel == '/' or rel == '':
                rel = 'index.html'
            rel = rel.lstrip('/')
            try:
                from urllib.parse import unquote
                rel = unquote(rel)
            except Exception:
                pass
            abs_path = os.path.normpath(os.path.join(ROOT, rel))
            if not abs_path.startswith(ROOT):
                return self._fail('forbidden')
            if not os.path.exists(abs_path):
                self.send_response(404)
                self.end_headers()
                return
            ext = os.path.splitext(abs_path)[1].lower()
            if ext == '.html': ct = 'text/html; charset=utf-8'
            elif ext == '.css': ct = 'text/css; charset=utf-8'
            elif ext == '.js': ct = 'application/javascript; charset=utf-8'
            elif ext in ('.png','.jpg','.jpeg','.gif','.webp'): ct = 'image/'+ext.strip('.')
            elif ext in ('.json',): ct = 'application/json; charset=utf-8'
            else: ct = 'application/octet-stream'
            try:
                with open(abs_path,'rb') as f:
                    buf = f.read()
                self.send_response(200)
                self.send_header('Content-Type', ct)
                self.send_header('Cache-Control','no-cache')
                self.end_headers()
                self.wfile.write(buf)
            except Exception as e:
                self._fail(str(e))
        except Exception as e:
            self._fail(str(e))

    def do_POST(self):
        ensure_dirs()
        length = int(self.headers.get('Content-Length', '0'))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode('utf-8'))
        except Exception:
            return self._fail('bad json')
        if self.path == '/libs/upload':
            content = data.get('content')
            name = data.get('name') or 'live2d.min.js'
            if not content:
                return self._fail('no content')
            try:
                buf = base64.b64decode(content)
                out = os.path.join(ROOT, 'libs', name)
                with open(out, 'wb') as f:
                    f.write(buf)
                return self._ok({ 'ok': True, 'path': 'libs/'+name })
            except Exception as e:
                return self._fail(str(e))
        if self.path == '/model/upload':
            content = data.get('content')
            name = data.get('name') or 'model.zip'
            if not content:
                return self._fail('no content')
            try:
                buf = base64.b64decode(content)
                tmp = os.path.join(ROOT, 'assets', 'live2d', name)
                with open(tmp, 'wb') as f:
                    f.write(buf)
                out_dir = os.path.join(ROOT, 'assets', 'live2d', os.path.splitext(name)[0])
                os.makedirs(out_dir, exist_ok=True)
                with zipfile.ZipFile(tmp, 'r') as z:
                    z.extractall(out_dir)
                os.remove(tmp)
                model_path = self._find_model3(out_dir)
                return self._ok({ 'ok': True, 'model_path': model_path })
            except Exception as e:
                return self._fail(str(e))
        if self.path == '/model/uploadfolder':
            folder_name = data.get('name') or 'model-folder'
            files = data.get('files') or []
            if not files:
                return self._fail('no files')
            try:
                base = os.path.join(ROOT, 'assets', 'live2d', folder_name)
                os.makedirs(base, exist_ok=True)
                for f in files:
                    rel = f.get('path') or f.get('name')
                    b64 = f.get('content')
                    if not rel or not b64: continue
                    out = os.path.join(base, rel)
                    os.makedirs(os.path.dirname(out), exist_ok=True)
                    with open(out, 'wb') as w:
                        w.write(base64.b64decode(b64))
                model_path = self._find_model3(base)
                return self._ok({ 'ok': True, 'model_path': model_path })
            except Exception as e:
                return self._fail(str(e))
        if self.path == '/libs/fetch':
            url = data.get('url')
            name = data.get('name') or 'lib.js'
            if not url:
                return self._fail('no url')
            try:
                import urllib.request
                req = urllib.request.Request(url, headers={'User-Agent':'TraeAgent'})
                with urllib.request.urlopen(req) as r:
                    buf = r.read()
                out = os.path.join(ROOT, 'libs', name)
                os.makedirs(os.path.dirname(out), exist_ok=True)
                with open(out, 'wb') as f:
                    f.write(buf)
                return self._ok({ 'ok': True, 'path': 'libs/'+name })
            except Exception as e:
                return self._fail(str(e))
        return self._fail('unknown path')

    def _find_model3(self, base):
        for root, _, files in os.walk(base):
            for f in files:
                if f.endswith('.model3.json'):
                    p = os.path.relpath(os.path.join(root, f), ROOT)
                    return p.replace('\\','/')
        return None

    def _ok(self, obj):
        self._set_headers(200)
        self.wfile.write(json.dumps(obj).encode('utf-8'))

    def _fail(self, msg):
        self._set_headers(400)
        self.wfile.write(json.dumps({ 'ok': False, 'error': msg }).encode('utf-8'))

if __name__ == '__main__':
    ensure_dirs()
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default=os.environ.get('HOST', '0.0.0.0'))
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '8001')))
    args = parser.parse_args()

    HTTPServer((args.host, args.port), Handler).serve_forever()
