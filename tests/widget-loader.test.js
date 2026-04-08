const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const loaderPath = path.join(__dirname, '..', 'ai-agent-chat-loader.js');
const loaderSource = fs.readFileSync(loaderPath, 'utf8');

function extractFunctionSource(source, functionName) {
  const signature = `function ${functionName}(`;
  const start = source.indexOf(signature);
  assert.ok(start >= 0, `Function not found: ${functionName}`);
  const nextStart = source.indexOf('\n  function ', start + signature.length);
  const chunk = source.slice(start, nextStart === -1 ? source.length : nextStart).trim();
  assert.ok(chunk.endsWith('}'), `Could not extract function body: ${functionName}`);
  return chunk;
}

function createSandbox() {
  const sandbox = {
    MAX_INPUT_LENGTH: 200,
    URL,
    window: {
      location: {
        href: 'https://agital.si/demo-page'
      }
    },
    document: {
      createElement(tagName) {
        return {
          tagName: String(tagName || '').toUpperCase(),
          children: [],
          attributes: {},
          className: '',
          appendChild(node) {
            this.children.push(node);
            return node;
          },
          setAttribute(name, value) {
            this.attributes[name] = String(value);
            this[name] = String(value);
          }
        };
      },
      createTextNode(text) {
        return {
          nodeType: 3,
          textContent: String(text)
        };
      }
    }
  };

  vm.createContext(sandbox);
  return sandbox;
}

function loadFunctions(functionNames) {
  const sandbox = createSandbox();
  const source = functionNames.map((name) => extractFunctionSource(loaderSource, name)).join('\n\n');
  vm.runInContext(source, sandbox);
  return sandbox;
}

test('default config includes agital defaults', () => {
  assert.match(loaderSource, /domain:\s*"agital\.si"/);
  assert.match(loaderSource, /contactEmail:\s*"primoz\.frelih@agital\.si"/);
  assert.match(loaderSource, /contactPhone:\s*"00 386 41 980 991"/);
  assert.match(loaderSource, /PLACEHOLDER_ROTATE_INTERVAL_MS\s*=\s*2000/);
  assert.match(loaderSource, /brandLabelHtml:\s*false/);
  assert.match(loaderSource, /suggestedPrompts:\s*\[/);
  assert.match(loaderSource, /Kak\\u0161ni so pogoji sodelovanja\?/);
  assert.match(loaderSource, /Kako sodelujete z ekipami v podjetju\?/);
});

test('chat links are configured for top-level navigation, not blank tab', () => {
  assert.match(loaderSource, /link\.target\s*=\s*"_top"/);
  assert.doesNotMatch(loaderSource, /link\.target\s*=\s*"_blank"/);
});

test('email and phone href builders normalize values', () => {
  const sandbox = loadFunctions([
    'normalizeOptionalText',
    'normalizeEmail',
    'normalizePhone',
    'buildMailtoHref',
    'buildTelHref'
  ]);

  assert.equal(
    sandbox.buildMailtoHref('  mailto:primoz.frelih@agital.si  '),
    'mailto:primoz.frelih@agital.si'
  );
  assert.equal(sandbox.buildMailtoHref('invalid address'), '');

  assert.equal(sandbox.buildTelHref('00 386 41 980 991'), 'tel:0038641980991');
  assert.equal(sandbox.buildTelHref('tel:+386 41 980 991'), 'tel:+38641980991');
  assert.equal(sandbox.buildTelHref('not-a-phone'), '');
});

test('assistant auto-link renderer creates clickable URL and phone anchors with _top target', () => {
  const sandbox = loadFunctions([
    'normalizeOptionalText',
    'normalizeEmail',
    'normalizePhone',
    'buildTelHref',
    'splitTrailingLinkPunctuation',
    'normalizeAutoLinkUrl',
    'createAutoLinkNode',
    'appendAutoLinkedText'
  ]);

  const container = {
    children: [],
    appendChild(node) {
      this.children.push(node);
      return node;
    }
  };

  sandbox.appendAutoLinkedText(
    container,
    'Vec informacij: https://agital.si/primoz-frelih/ ali poklici 00 386 41 980 991.'
  );

  const anchors = container.children.filter((node) => node && node.tagName === 'A');
  assert.equal(anchors.length, 2);

  assert.ok(anchors.some((node) => node.href === 'https://agital.si/primoz-frelih/'));
  assert.ok(anchors.some((node) => node.href === 'tel:0038641980991'));

  for (const anchor of anchors) {
    assert.equal(anchor.className, 'beliv-auto-link');
    assert.equal(anchor.target, '_top');
  }
});

test('streaming fallback threshold stays explicit in source', () => {
  assert.match(loaderSource, /streamUpdateCount\s*>\s*3/);
  assert.match(loaderSource, /await renderAssistantReplyInJs\(ensureAssistantRow\(\), reply\)/);
});

test('placeholder sequence normalizer keeps order and removes empty values', () => {
  const sandbox = loadFunctions(['normalizePlaceholderSequence']);
  const result = sandbox.normalizePlaceholderSequence(
    [' First ', '', 'Second', '  ', 'Third'],
    ['Fallback']
  );

  assert.equal(Array.isArray(result), true);
  assert.equal(result.length, 3);
  assert.equal(result[0], 'First');
  assert.equal(result[1], 'Second');
  assert.equal(result[2], 'Third');
});

test('suggested prompt normalizer trims, deduplicates, and caps length', () => {
  const sandbox = loadFunctions(['normalizePromptInput', 'normalizePromptList']);
  const result = sandbox.normalizePromptList(
    ['  First prompt  ', '', 'Second prompt', 'First prompt', 'x'.repeat(240)],
    ['Fallback']
  );

  assert.equal(Array.isArray(result), true);
  assert.equal(result.length, 3);
  assert.equal(result[0], 'First prompt');
  assert.equal(result[1], 'Second prompt');
  assert.equal(result[2].length, 200);
});

test('brand label supports optional safe html rendering and top-level links', () => {
  assert.match(loaderSource, /function renderBrandLabel\(/);
  assert.match(loaderSource, /function sanitizeBrandLabelHtml\(/);
  assert.match(loaderSource, /function sanitizeBrandLabelHref\(/);
  assert.match(loaderSource, /beliv-brand-link/);
  assert.match(loaderSource, /clean\.setAttribute\("target", "_top"\)/);
});
