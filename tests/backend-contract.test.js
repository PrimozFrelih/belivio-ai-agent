const test = require('node:test');
const assert = require('node:assert/strict');

const runBackendTests = process.env.RUN_BACKEND_TESTS === '1';
const baseUrl = process.env.BACKEND_TEST_URL;

function skipMessage() {
  return 'Set RUN_BACKEND_TESTS=1 and BACKEND_TEST_URL to run backend API contract tests.';
}

test(
  'backend health endpoint responds',
  { skip: !runBackendTests || !baseUrl ? skipMessage() : false },
  async () => {
    const healthPath = process.env.BACKEND_HEALTH_PATH || '/health';
    const response = await fetch(new URL(healthPath, baseUrl));

    assert.equal(response.status, 200);
    const text = (await response.text()).trim();
    assert.notEqual(text, '');
  }
);

test(
  'AI webhook accepts expected payload contract',
  { skip: !runBackendTests || !baseUrl ? skipMessage() : false },
  async () => {
    const webhookPath = process.env.BACKEND_AI_ENDPOINT || '/webhook/ai-agent';
    const payload = {
      ChatInput: 'Contract test ping',
      CurrentURL: 'https://agital.si/tests/contract',
      SessionID: 'contract-test-session',
      domain: 'agital.si'
    };

    const response = await fetch(new URL(webhookPath, baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    assert.ok(response.status < 500, `Expected non-5xx response, got ${response.status}`);

    const bodyText = (await response.text()).trim();
    assert.notEqual(bodyText, '');
  }
);
