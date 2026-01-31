import os, ssl, json, urllib.request

ssl._create_default_https_context = ssl._create_unverified_context

def dl(url, out):
    print(f"downloading {url} -> {out}")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    try:
        with urllib.request.urlopen(url) as r:
            data = r.read()
        with open(out, 'wb') as f:
            f.write(data)
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def first_ok(urls):
    for u in urls:
        try:
            with urllib.request.urlopen(u) as r:
                if r.status == 200:
                    return u
        except Exception:
            continue
    print(f"Warning: no url available for {urls}")
    return urls[0]

def ensure_libs():
    libs = {
        'libs/pixi.min.js': [
            'https://cdn.jsdelivr.net/npm/pixi.js@6.5.1/dist/browser/pixi.min.js',
            'https://unpkg.com/pixi.js@6.5.1/dist/browser/pixi.min.js'
        ],
        'libs/live2dcubismcore.min.js': [
            'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
        ],
        'libs/pixi-live2d-display.min.js': [
            'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js',
            'https://unpkg.com/pixi-live2d-display@0.4.0/dist/index.min.js'
        ],
        'libs/cubism4.min.js': [
            'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js',
            'https://unpkg.com/pixi-live2d-display@0.4.0/dist/cubism4.min.js'
        ]
    }
    for out, urls in libs.items():
        if os.path.exists(out) and os.path.getsize(out) > 1024:
            print(f"exists {out}")
            continue
        src = first_ok(urls)
        dl(src, out)

if __name__ == '__main__':
    ensure_libs()
    print('done')
