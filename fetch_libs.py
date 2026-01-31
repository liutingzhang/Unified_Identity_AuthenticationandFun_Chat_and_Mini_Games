import os, ssl, json, urllib.request

ssl._create_default_https_context = ssl._create_unverified_context

def dl(url, out):
    print(f"downloading {url} -> {out}")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with urllib.request.urlopen(url) as r:
        data = r.read()
    with open(out, 'wb') as f:
        f.write(data)

def first_ok(urls):
    for u in urls:
        try:
            with urllib.request.urlopen(u) as r:
                if r.status == 200:
                    return u
        except Exception:
            continue
    raise RuntimeError("no url available")

def ensure_libs():
    libs = {
        'libs/pixi.min.js': [
            'https://cdn.jsdelivr.net/npm/pixi.js@6/dist/browser/pixi.min.js',
            'https://unpkg.com/pixi.js@6/dist/browser/pixi.min.js'
        ],
        'libs/live2d.min.js': [
            'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/lib/live2d.min.js',
            'https://unpkg.com/pixi-live2d-display@0.4.0/lib/live2d.min.js'
        ],
        'libs/pixi-live2d-display.min.js': [
            'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js',
            'https://unpkg.com/pixi-live2d-display@0.4.0/dist/index.min.js'
        ],
    }
    for out, urls in libs.items():
        if os.path.exists(out) and os.path.getsize(out) > 1024:
            print(f"exists {out}")
            continue
        src = first_ok(urls)
        dl(src, out)

def ensure_model():
    base_urls = [
        'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/example/Hiyori/',
        'https://unpkg.com/pixi-live2d-display@0.4.0/example/Hiyori/'
    ]
    out_base = os.path.join('assets', 'live2d', 'Hiyori')
    os.makedirs(out_base, exist_ok=True)
    model_name = 'Hiyori.model3.json'
    # download model3.json
    model_url = first_ok([u + model_name for u in base_urls])
    dl(model_url, os.path.join(out_base, model_name))
    # parse references
    with open(os.path.join(out_base, model_name), 'r', encoding='utf-8') as f:
        j = json.load(f)
    refs = j.get('FileReferences', {})
    # moc
    moc = refs.get('Moc') or refs.get('Moc3') or j.get('Moc')
    if moc:
        dl(first_ok([u + moc for u in base_urls]), os.path.join(out_base, moc))
    # textures
    for tex in refs.get('Textures', []):
        dl(first_ok([u + tex for u in base_urls]), os.path.join(out_base, tex))
    # physics
    phys = refs.get('Physics')
    if phys:
        dl(first_ok([u + phys for u in base_urls]), os.path.join(out_base, phys))
    # motions
    motions = refs.get('Motions', {})
    for group, arr in motions.items():
        for m in arr:
            f = m.get('File')
            if f:
                dl(first_ok([u + f for u in base_urls]), os.path.join(out_base, f))

if __name__ == '__main__':
    ensure_libs()
    ensure_model()
    print('done')
