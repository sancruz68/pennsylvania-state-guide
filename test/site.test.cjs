
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'index.html'),
  'utf8'
);

const javascript = fs.readFileSync(
  path.join(__dirname, '..', 'script.js'),
  'utf8'
);

function createWebsite(saved = []) {
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'outside-only'
  });

  dom.window.localStorage.setItem(
    'pa-saved-cities',
    JSON.stringify(saved)
  );

  dom.window.eval(javascript);

  return dom.window;
}

test('displays all six destinations', () => {
  const { document } = createWebsite();

  assert.equal(
    document.querySelectorAll('.city-card').length,
    6
  );
});

test('search filters cities by name', () => {
  const { document, Event } = createWebsite();

  const search = document.getElementById('citySearch');

  search.value = 'York';
  search.dispatchEvent(new Event('input', { bubbles: true }));

  const cards = document.querySelectorAll('.city-card');

  assert.equal(cards.length, 1);
  assert.match(cards[0].textContent, /York/);
});

test('regional filtering displays matching cities', () => {
  const { document, Event } = createWebsite();

  const region = document.getElementById('regionFilter');

  region.value = 'Western';
  region.dispatchEvent(new Event('change'));

  const cards = document.querySelectorAll('.city-card');

  assert.equal(cards.length, 1);
  assert.match(cards[0].textContent, /Pittsburgh/);
});

test('invalid searches show an empty state', () => {
  const { document, Event } = createWebsite();

  const search = document.getElementById('citySearch');

  search.value = 'xyz123';
  search.dispatchEvent(new Event('input'));

  assert.equal(
    document.querySelectorAll('.city-card').length,
    0
  );

  assert.equal(
    document.getElementById('emptyState').hidden,
    false
  );
});

test('saving a city updates local storage', () => {
  const { document, localStorage } = createWebsite();

  document.querySelector('[data-save="york"]').click();

  const saved = JSON.parse(
    localStorage.getItem('pa-saved-cities')
  );

  assert.ok(saved.includes('york'));

  document.getElementById('savedFilter').click();

  const cards = document.querySelectorAll('.city-card');

  assert.equal(cards.length, 1);
  assert.match(cards[0].textContent, /York/);
});

test('saved cities are restored from storage', () => {
  const { document } = createWebsite(['york']);

  document.getElementById('savedFilter').click();

  const cards = document.querySelectorAll('.city-card');

  assert.equal(cards.length, 1);
  assert.match(cards[0].textContent, /York/);
});

test('city details display the correct information', () => {
  const { document } = createWebsite();

  const dialog = document.getElementById('cityDialog');

  // Simulate dialog behavior in the test environment
  dialog.showModal = () => dialog.setAttribute('open', '');
  dialog.close = () => dialog.removeAttribute('open');

  document.querySelector('[data-open="york"]').click();

  assert.equal(dialog.hasAttribute('open'), true);

  assert.equal(
    document.getElementById('dialogTitle').textContent,
    'York'
  );

  assert.match(
    document.getElementById('dialogHighlights').textContent,
    /Central Market House/
  );

  document.getElementById('closeDialog').click();

  assert.equal(dialog.hasAttribute('open'), false);
});
