# Собирает index.html (GitHub Pages) и tilda-block.html (HTML-блок Tilda) из src/
import json, re, sys
API = open('apps-script/API_URL.txt').read().strip() if __import__('os').path.exists('apps-script/API_URL.txt') else '{{API}}'
a = json.load(open('/home/claude/figma/assets.json'))
def svg(s, label):
    s = re.sub(r'<\?xml[^>]*>', '', s)
    s = re.sub(r'(<svg[^>]*?)\s(width|height)="[^"]*"', r'\1', s, count=1)
    s = re.sub(r'(<svg[^>]*?)\s(width|height)="[^"]*"', r'\1', s, count=1)
    s = re.sub(r'\sid="[^"]*"', '', s); s = re.sub(r'\sdata-name="[^"]*"', '', s)
    return s.replace('<svg', f'<svg role="img" aria-label="{label}"', 1)
page = open('src/page.html').read().replace('{{ALAY}}', svg(a['alay'], 'Alay.pro')).replace('{{PUMA}}', svg(a['puma'], 'Puma'))
css = open('src/style.css').read()
js = open('src/app.js').read().replace('{{API}}', API)
fonts = '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'
block = f'{fonts}\n<style>\n{css}</style>\n{page}\n<script>\n{js}</script>\n'
site_css = open('src/tilda-site.css').read()
open('tilda-block.html', 'w').write(f'<style>\n{site_css}</style>\n' + block)
open('index.html', 'w').write(f'''<!DOCTYPE html>
<html lang="kk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Alay.pro × Puma — Кроссовка + сыйлық</title>
<meta name="description" content="Купи беговые кроссовки Puma и тренируйся неделю с Alay.pro бесплатно.">
<style>html,body{{margin:0;background:#0D4FA8}}</style>
</head><body>
{block}</body></html>
''')
print('ok', len(block), 'API set' if '{{' not in API else 'API placeholder')
