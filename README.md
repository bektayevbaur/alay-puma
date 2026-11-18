# Alay.pro × Puma — лендинг акции

Страница alaypro.kz/puma: подарок, base −15% / premium −20%, шаги и своя форма активации (KZ/RU). Заявки уходят в Google Таблицу через Apps Script.

- `src/` — исходники (page.html, style.css, app.js); `python3 build.py` собирает:
  - `index.html` — для GitHub Pages
  - `tilda-block.html` — код для HTML-блока T123 в Tilda
- `apps-script/Code.gs` — приём заявок: проверка кода, один код — один раз, один телефон — один сертификат, фото в Google Drive
- Ссылки: `?code=ALY-XXXXX` подставит код, `?lang=ru` — русский
