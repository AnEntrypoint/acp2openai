const assert = require('assert');
const api = require('./index.js');

async function run() {
  // Format registry
  const { getFormat, FORMATS } = api;
  assert.deepStrictEqual(Object.keys(FORMATS).sort(), ['acp','anthropic','gemini','openai']);

  // Anthropic toParams
  const anth = getFormat('anthropic');
  const p = anth.toParams({ model:'m', messages:[{role:'user',content:'hi'}], max_tokens:10 });
  assert.strictEqual(p.model, 'm');
  assert.strictEqual(p.maxOutputTokens, 10);
  assert.strictEqual(p.messages[0].content, 'hi');

  // Anthropic toResponse
  const events = [
    { type:'text-delta', textDelta:'hello' },
    { type:'finish-step', finishReason:'stop' },
  ];
  const resp = anth.toResponse(events);
  assert.strictEqual(resp.type, 'message');
  assert.strictEqual(resp.content[0].text, 'hello');
  assert.strictEqual(resp.stop_reason, 'end_turn');

  // Anthropic toSSE
  const sse = anth.toSSE({ type:'text-delta', textDelta:'hi' });
  assert(sse.includes('content_block_delta'), 'SSE missing content_block_delta');

  // OpenAI toParams
  const oai = getFormat('openai');
  const op = oai.toParams({ model:'gpt-4', messages:[{role:'user',content:'test'}], max_tokens:5 });
  assert.strictEqual(op.model, 'gpt-4');
  assert.strictEqual(op.maxOutputTokens, 5);

  // OpenAI toResponse
  const oresp = oai.toResponse(events);
  assert.strictEqual(oresp.object, 'chat.completion');
  assert.strictEqual(oresp.choices[0].message.content, 'hello');

  // Provider registry
  const { getProvider, PROVIDERS } = api;
  assert(Object.keys(PROVIDERS).includes('gemini'));
  assert(Object.keys(PROVIDERS).includes('openai-compat'));
  const gp = getProvider('gemini');
  assert.strictEqual(typeof gp.stream, 'function');
  assert.throws(() => getProvider('bogus'), /Unknown provider/);

  // SDK clients
  const a = new api.Anthropic({ provider:'gemini', apiKey:'test' });
  assert.strictEqual(typeof a.messages.create, 'function');
  assert.strictEqual(typeof a.messages.stream, 'function');
  const o = new api.OpenAI({ baseURL:'http://localhost:1/v1', apiKey:'test' });
  assert.strictEqual(typeof o.chat.completions.create, 'function');

  // HTTP servers
  const srv = api.createAnthropicServer({ provider:'gemini', apiKey:'test' });
  assert.strictEqual(srv.constructor.name, 'Server');
  const osrv = api.createOpenAIServer({ provider:'gemini', apiKey:'test' });
  assert.strictEqual(osrv.constructor.name, 'Server');

  // translate function exists
  assert.strictEqual(typeof api.translate, 'function');
  assert.strictEqual(typeof api.translateSync, 'function');
  assert.strictEqual(typeof api.createStreamActor, 'function');

  console.log('ALL TESTS PASS');
}

run().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
