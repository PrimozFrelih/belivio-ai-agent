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

test('config text supports sanitized html rendering in agent ui', () => {
  assert.match(loaderSource, /titleHtml:\s*false/);
  assert.match(loaderSource, /subtitleHtml:\s*false/);
  assert.match(loaderSource, /welcomeMessageHtml:\s*false/);
  assert.match(loaderSource, /disclaimerHtml:\s*false/);
  assert.match(loaderSource, /suggestedPromptsHtml:\s*false/);
  assert.match(loaderSource, /function renderConfigText\(/);
  assert.match(loaderSource, /function sanitizeInlineHtml\(/);
  assert.match(loaderSource, /function shouldRenderConfigHtml\(/);
  assert.match(loaderSource, /linkClass:\s*"beliv-rich-link"/);
});

test('viewport height sync prefers visual viewport and updates mobile sizing variable', () => {
  const sandbox = loadFunctions(['syncViewportHeight']);
  const styleState = {};

  sandbox.refs = {
    shell: {
      style: {
        setProperty(name, value) {
          styleState[name] = value;
        }
      }
    }
  };
  sandbox.window.visualViewport = { height: 724.6 };
  sandbox.window.innerHeight = 812;

  sandbox.syncViewportHeight();

  assert.equal(styleState['--beliv-viewport-height'], '725px');
  assert.match(loaderSource, /--beliv-viewport-height:100vh/);
  assert.match(loaderSource, /calc\(var\(--beliv-viewport-height,100vh\) - 82px\)/);
  assert.match(loaderSource, /top:max\(8px,calc\(env\(safe-area-inset-top\) \+ 8px\)\)/);
  assert.match(loaderSource, /bottom:max\(8px,calc\(env\(safe-area-inset-bottom\) \+ 8px\)\)/);
  assert.match(loaderSource, /transform:translate\(-50%,0\) scale\(1\)/);
});

test('viewport height sync falls back to innerHeight when visual viewport is unavailable', () => {
  const sandbox = loadFunctions(['syncViewportHeight']);
  const styleState = {};

  sandbox.refs = {
    shell: {
      style: {
        setProperty(name, value) {
          styleState[name] = value;
        }
      }
    }
  };
  sandbox.window.innerHeight = 667;

  sandbox.syncViewportHeight();

  assert.equal(styleState['--beliv-viewport-height'], '667px');
});

test('modal open state animates overlay and panel instead of fading the wrapper', () => {
  assert.match(loaderSource, /\.beliv-modal\{[\s\S]*?visibility:hidden;[\s\S]*?transition:visibility 0s linear \.22s;/);
  assert.match(
    loaderSource,
    /\.beliv-modal\.beliv-open\{visibility:visible;pointer-events:auto;transition-delay:0s;\}/
  );
  assert.match(loaderSource, /\.beliv-overlay\{[\s\S]*?opacity:0;[\s\S]*?transition:opacity \.22s ease;/);
  assert.match(loaderSource, /\.beliv-modal\.beliv-open \.beliv-overlay\{opacity:1;\}/);
  assert.match(loaderSource, /\.beliv-panel\{[\s\S]*?opacity:0;[\s\S]*?transition:transform \.22s ease,opacity \.22s ease;/);
  assert.match(loaderSource, /\.beliv-modal\.beliv-open \.beliv-panel\{opacity:1;transform:translateY\(0\) scale\(1\)/);
});

test('chat input autofocus is skipped for touch-style pointers', () => {
  const sandbox = loadFunctions(['shouldAutoFocusChatInput']);

  sandbox.window.matchMedia = (query) => ({
    matches: query === '(pointer: coarse)'
  });

  assert.equal(sandbox.shouldAutoFocusChatInput(), false);
});

test('launcher field click uses the shared launcher modal opener', () => {
  assert.match(
    loaderSource,
    /refs\.launcherInput\.addEventListener\("click", function \(event\) \{[\s\S]*?event\.preventDefault\(\);[\s\S]*?openLauncherModal\(\);[\s\S]*?\}\);/
  );

  const sandbox = loadFunctions(['openLauncherModal']);
  let blurCount = 0;
  let launcherEffectsCount = 0;
  let openModalSource = '';

  sandbox.refs = {
    launcherForm: {},
    launcherInput: {
      value: 'Need help with pricing',
      blur() {
        blurCount += 1;
      }
    },
    chatInput: {
      value: ''
    }
  };
  sandbox.config = { mode: 'fullcenter' };
  sandbox.triggerLauncherOpenEffects = () => {
    launcherEffectsCount += 1;
  };
  sandbox.openModal = (source) => {
    openModalSource = source;
  };

  sandbox.openLauncherModal();

  assert.equal(sandbox.refs.chatInput.value, 'Need help with pricing');
  assert.equal(blurCount, 1);
  assert.equal(launcherEffectsCount, 1);
  assert.equal(openModalSource, 'launcher');
});
