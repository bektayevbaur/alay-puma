/**
 * Alay.pro × Puma — приём заявок с alaypro.kz/puma в Google Таблицу.
 *
 * 1. ID таблицы «Alay × Puma — заявки» уже вставлен ниже.
 * 2. Выполните функцию setup() один раз: создаст листы «Заявки» и «Коды».
 * 3. Коды купонов уже в листе «Коды».
 * 4. Развернуть → Новое развертывание → Веб-приложение:
 *    «Запуск от имени» — Я, «Доступ» — Все. Скопируйте URL (…/exec).
 */
const SHEET_ID = '1NtCDnB_787A33o_osJJd4o5ZDixLwSXD5JCa4LVSe9I';
const FOLDER_NAME = 'Alay × Puma — фото чеков';
const REQ = 'Заявки';
const CODES = 'Коды';
const HEAD = ['Дата', 'Код', 'Имя', 'Телефон', 'Страна', 'Email', 'Instagram', 'Магазин', 'Модель', 'Premium', 'Опыт', 'Цель', 'Время', 'Фото', 'Язык', 'utm_source', 'utm_campaign', 'Статус', 'Комментарий'];

function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let r = ss.getSheetByName(REQ) || ss.insertSheet(REQ);
  if (r.getLastRow() === 0) { r.appendRow(HEAD); r.setFrozenRows(1); r.getRange(1, 1, 1, HEAD.length).setFontWeight('bold'); }
  let c = ss.getSheetByName(CODES) || ss.insertSheet(CODES);
  if (c.getLastRow() === 0) { c.appendRow(['Код', 'Активирован', 'Телефон', 'Имя']); c.setFrozenRows(1); c.getRange(1, 1, 1, 4).setFontWeight('bold'); }
  folder_();
}

function doGet() { return out_({ ok: true, service: 'alay-puma' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const req = ss.getSheetByName(REQ), codes = ss.getSheetByName(CODES);
    const code = String(d.code || '').trim().toUpperCase();
    const phone = String(d.phone || '').trim();
    const digits = phone.replace(/\D/g, '');
    if (!code || !String(d.name || '').trim() || digits.length < 7) return out_({ ok: false, err: 'need' });
    const isTest = code === 'TEST';

    let row = -1;
    if (!isTest) {
      const n = Math.max(codes.getLastRow() - 1, 0);
      const vals = n ? codes.getRange(2, 1, n, 2).getValues() : [];
      row = vals.findIndex(r => String(r[0]).trim().toUpperCase() === code);
      if (row < 0) return out_({ ok: false, err: 'code' });
      if (vals[row][1]) return out_({ ok: false, err: 'used' });
      const m = Math.max(req.getLastRow() - 1, 0);
      if (m) {
        const prev = req.getRange(2, 2, m, 3).getValues(); // Код, Имя, Телефон
        if (prev.some(p => String(p[0]).toUpperCase() !== 'TEST' && String(p[2]).replace(/\D/g, '') === digits)) return out_({ ok: false, err: 'phone' });
      }
    }

    const links = [];
    (d.photos || []).slice(0, 3).forEach((p, i) => {
      const blob = Utilities.newBlob(Utilities.base64Decode(p.data), 'image/jpeg', code + '_' + (i + 1) + '.jpg');
      const file = folder_().createFile(blob);
      links.push(file.getUrl());
    });

    const model = d.model === 'other' ? (d.model_other || 'Другая') : (d.model || '');
    req.appendRow([new Date(), code, d.name, "'" + phone, d.country || '', d.email || '', d.instagram || '', d.store || '',
      model, /★/.test(model) ? 'да' : '', d.level || '', d.goal || '', d.time || '', links.join('\n'),
      d.lang || '', d.utm_source || '', d.utm_campaign || '', isTest ? 'тест' : 'новая', '']);
    if (!isTest) codes.getRange(row + 2, 2, 1, 3).setValues([[new Date(), "'" + phone, d.name]]);
    return out_({ ok: true });
  } catch (err) {
    console.error(err);
    return out_({ ok: false, err: 'server' });
  } finally {
    lock.releaseLock();
  }
}

function folder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
