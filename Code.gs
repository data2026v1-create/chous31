/**
 * ============================================================
 *  STEPSTORE — API Google Apps Script  (fichier : Code.gs)
 *  Base de données : Google Sheets
 * ============================================================
 *  LIVRABLE — Fichier à déployer sur Google Sheets
 *
 *  INSTALLATION (5 min) :
 *  1. Créez un Google Sheet : https://docs.google.com/spreadsheets
 *     (les feuilles Produits / Categories / Parametres sont
 *      créées automatiquement au premier appel).
 *  2. Dans le sheet : Extensions > Apps Script
 *     → collez TOUT ce fichier dans Code.gs.
 *  3. Déployer > Nouveau déploiement > Application Web :
 *       Exécuter en tant que : Moi
 *       Qui a accès : Toute personne
 *  4. Copiez l'URL « Web app » (elle se termine par /exec).
 *     Vous pouvez l'utiliser avec n'importe quel client HTTP.
 * ============================================================
 */

var VERSION = '1.1';

/** Point d'entrée GET : https://.../macros/s/XXX/exec?action=all */
function doGet(e) {
  return json(handleRequest(e.parameter || {}));
}

/** Point d'entrée POST : corps JSON { action: "...", ...payload } */
function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : '{}');
  } catch (err) {
    body = {};
  }
  var params = Object.assign({}, e.parameter || {}, body);
  return json(handleRequest(params));
}

/** Réponse JSON brute (compatible CORS simple-request) */
function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok(data) { return { success: true, data: data }; }
function err(message) { return { success: false, error: String(message) }; }

function handleRequest(p) {
  try {
    switch (String(p.action || '')) {
      case 'ping':
        return ok({ message: 'StepStore API en ligne', version: VERSION, time: new Date().toISOString() });
      case 'all':
        return ok({ products: getProducts(), categories: getCategories(), settings: getSettings() });
      case 'getProducts':
        return ok({ products: getProducts() });
      case 'getCategories':
        return ok({ categories: getCategories() });
      case 'getSettings':
        return ok({ settings: getSettings() });
      case 'saveProduct':
        upsertItem_('Produits', p.item || p.product);
        return ok({ saved: true });
      case 'deleteProduct':
        deleteItem_('Produits', p.id);
        return ok({ deleted: true });
      case 'saveCategory':
        upsertItem_('Categories', p.item || p.category);
        return ok({ saved: true });
      case 'deleteCategory':
        deleteItem_('Categories', p.id);
        return ok({ deleted: true });
      case 'saveSettings':
        saveSettings(p.settings);
        return ok({ saved: true });
      case 'syncAll':
        saveAll_(p.products || [], p.categories || [], p.settings || null);
        return ok({ products: getProducts(), categories: getCategories(), settings: getSettings() });
      case 'bootstrap':
        bootstrap_();
        return ok({ products: getProducts(), categories: getCategories(), settings: getSettings() });
      default:
        return err('Action inconnue : ' + p.action);
    }
  } catch (ex) {
    return err(ex.message || ex);
  }
}

/* ============ HELPERS SHEETS ============ */

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1).setValue('id');
    sh.getRange(1, 2).setValue('data');
  }
  return sh;
}

function readAll_(name) {
  var sh = getSheet_(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 2, last - 1, 1).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    if (values[i][0]) {
      try { out.push(JSON.parse(values[i][0])); } catch (e) { /* ligne invalide */ }
    }
  }
  return out;
}

function upsertItem_(name, item) {
  if (!item) throw new Error('Donnée manquante');
  var sh = getSheet_(name);
  var last = sh.getLastRow();
  var id = item.id || ('item_' + Date.now());
  item.id = id;
  if (last >= 2) {
    var ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        sh.getRange(i + 2, 2).setValue(JSON.stringify(item));
        return;
      }
    }
  }
  sh.getRange(last + 1, 1).setValue(id);
  sh.getRange(last + 1, 2).setValue(JSON.stringify(item));
}

function deleteItem_(name, id) {
  if (!id) throw new Error('id manquant');
  var sh = getSheet_(name);
  var last = sh.getLastRow();
  if (last < 2) return;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) sh.deleteRow(i + 2);
  }
}

function getProducts() { return readAll_('Produits'); }
function getCategories() { return readAll_('Categories'); }

function getSettings() {
  var sh = getSheet_('Parametres');
  var last = sh.getLastRow();
  if (last < 2) return {};
  var raw = sh.getRange(2, 2).getValue();
  try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
}

function saveSettings(settings) {
  var sh = getSheet_('Parametres');
  sh.getRange(2, 1).setValue('settings');
  sh.getRange(2, 2).setValue(JSON.stringify(settings || {}));
}

function saveAll_(products, categories, settings) {
  ['Produits', 'Categories', 'Parametres'].forEach(function (n) {
    var sh = getSheet_(n);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).clearContent();
  });
  (products || []).forEach(function (p) { upsertItem_('Produits', p); });
  (categories || []).forEach(function (c) { upsertItem_('Categories', c); });
  if (settings) saveSettings(settings);
}

/** Remplit la base avec 2 produits d'exemple (pratique pour tester). */
function bootstrap_() {
  if (getProducts().length === 0) {
    upsertItem_('Produits', {
      id: 'demo-1', name: 'Demo Runner', brand: 'StepStore', category: 'running',
      price: 9990, description: 'Produit de démonstration créé par bootstrap.',
      images: ['https://images.pexels.com/photos/26852035/pexels-photo-26852035.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'],
      colors: [{ name: 'Gris', hex: '#9AA0A6' }], sizes: ['40', '41', '42', '43', '44'],
      popular: true, stock: 10, rating: 4.5
    });
    upsertItem_('Produits', {
      id: 'demo-2', name: 'Demo Street', brand: 'StepStore', category: 'lifestyle',
      price: 6990, description: 'Produit de démonstration créé par bootstrap.',
      images: ['https://images.pexels.com/photos/11324548/pexels-photo-11324548.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'],
      colors: [{ name: 'Blanc', hex: '#F4F4F4' }], sizes: ['38', '39', '40', '41', '42'],
      popular: false, stock: 15, rating: 4.3
    });
  }
  if (getCategories().length === 0) {
    upsertItem_('Categories', { id: 'running', name: 'Running', emoji: '🏃', image: '' });
    upsertItem_('Categories', { id: 'lifestyle', name: 'Lifestyle', emoji: '👟', image: '' });
  }
}
