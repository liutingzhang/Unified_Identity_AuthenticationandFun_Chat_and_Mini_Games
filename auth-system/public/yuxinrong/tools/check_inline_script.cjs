const fs = require('fs');
const vm = require('vm');

function lineCount(s) {
  return (s.match(/\r?\n/g) || []).length + 1;
}

function extractInlineScript(html) {
  const start = html.indexOf('<script>');
  const end = html.lastIndexOf('</script>');
  if (start < 0 || end < 0 || end <= start) return null;
  const before = html.slice(0, start);
  const scriptTagLine = lineCount(before);
  const js = html.slice(start + '<script>'.length, end);
  return { js, scriptTagLine };
}

function tryParse(js) {
  try {
    new vm.Script(js, { filename: 'angry_birds.inline.js' });
    return { ok: true };
  } catch (e) {
    const stack = String(e && e.stack ? e.stack : e);
    const m = stack.match(/angry_birds\.inline\.js:(\d+)(?::(\d+))?/);
    const line = m ? Number(m[1]) : null;
    const col = m && m[2] ? Number(m[2]) : null;
    return { ok: false, message: e && e.message ? e.message : String(e), stack, line, col };
  }
}

function scanUnclosed(js) {
  const stack = [];
  let line = 1;
  let col = 0;
  let mode = 'code';
  let quote = '';
  const modeStack = [];

  const push = (t) => stack.push({ t, line, col });
  const pop = (t) => {
    if (!stack.length) return false;
    const top = stack[stack.length - 1].t;
    if (top !== t) return false;
    stack.pop();
    return true;
  };

  for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const next = js[i + 1];

    if (ch === '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }

    if (mode === 'linecomment') {
      if (ch === '\n') mode = 'code';
      continue;
    }
    if (mode === 'blockcomment') {
      if (ch === '*' && next === '/') {
        mode = 'code';
        i++;
        col++;
      }
      continue;
    }
    if (mode === 'string') {
      if (ch === '\\') {
        i++;
        col++;
        continue;
      }
      if (ch === quote) {
        mode = 'code';
        quote = '';
      }
      continue;
    }
    if (mode === 'template') {
      if (ch === '\\') {
        i++;
        col++;
        continue;
      }
      if (ch === '`') {
        mode = 'code';
        continue;
      }
      if (ch === '$' && next === '{') {
        push('${');
        i++;
        col++;
        modeStack.push('template');
        mode = 'code';
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      mode = 'linecomment';
      i++;
      col++;
      continue;
    }
    if (ch === '/' && next === '*') {
      mode = 'blockcomment';
      i++;
      col++;
      continue;
    }
    if (ch === '\'' || ch === '"') {
      mode = 'string';
      quote = ch;
      continue;
    }
    if (ch === '`') {
      mode = 'template';
      continue;
    }

    if (ch === '{' || ch === '[' || ch === '(') {
      push(ch);
      continue;
    }
    if (ch === '}') {
      if (stack.length && stack[stack.length - 1].t === '${') {
        stack.pop();
        if (modeStack.length && modeStack[modeStack.length - 1] === 'template') {
          modeStack.pop();
          mode = 'template';
        }
        continue;
      }
      if (!pop('{')) return { ok: false, unexpected: '}', line, col };
      continue;
    }
    if (ch === ']') {
      if (!pop('[')) return { ok: false, unexpected: ']', line, col };
      continue;
    }
    if (ch === ')') {
      if (!pop('(')) return { ok: false, unexpected: ')', line, col };
      continue;
    }
  }

  if (mode !== 'code') return { ok: false, eofInMode: mode, line, col };
  if (stack.length) return { ok: false, unclosed: stack[stack.length - 1], depth: stack.length };
  return { ok: true };
}

function printContext(js, lineNumber, radius) {
  const lines = js.split(/\r?\n/);
  const from = Math.max(1, lineNumber - radius);
  const to = Math.min(lines.length, lineNumber + radius);
  for (let i = from; i <= to; i++) {
    const mark = i === lineNumber ? '>>' : '  ';
    process.stdout.write(`${mark}${String(i).padStart(5)}: ${lines[i - 1]}\n`);
  }
}

const html = fs.readFileSync('angry_birds.html', 'utf8');
const extracted = extractInlineScript(html);
if (!extracted) {
  process.stdout.write('NO_INLINE_SCRIPT\n');
  process.exit(1);
}

const { js, scriptTagLine } = extracted;
const parsed = tryParse(js);
if (parsed.ok) {
  process.stdout.write('JS_PARSE_OK\n');
  process.exit(0);
}

process.stdout.write(`JS_PARSE_FAIL: ${parsed.message}\n`);
if (parsed.line) {
  const htmlLine = scriptTagLine + parsed.line;
  process.stdout.write(`AT_INLINE_JS_LINE: ${parsed.line}${parsed.col ? ':' + parsed.col : ''}\n`);
  process.stdout.write(`APPROX_HTML_LINE: ${htmlLine}\n`);
  printContext(js, parsed.line, 8);
} else {
  process.stdout.write(parsed.stack + '\n');
}

const scan = scanUnclosed(js);
if (!scan.ok) {
  if (scan.unexpected) process.stdout.write(`UNEXPECTED_TOKEN: ${scan.unexpected} at ${scan.line}:${scan.col}\n`);
  if (scan.eofInMode) process.stdout.write(`EOF_IN_MODE: ${scan.eofInMode} at ${scan.line}:${scan.col}\n`);
  if (scan.unclosed) {
    const htmlLine = scriptTagLine + scan.unclosed.line;
    process.stdout.write(`TOP_UNCLOSED: ${scan.unclosed.t} opened at inline ${scan.unclosed.line}:${scan.unclosed.col}\n`);
    process.stdout.write(`APPROX_HTML_LINE_TOP_UNCLOSED: ${htmlLine}\n`);
    printContext(js, scan.unclosed.line, 8);
  }
}
