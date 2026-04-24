const { getProvider } = require('./providers/index');
const { getFormat } = require('./formats/index');

async function* translate({ from, to, provider: providerName, ...params }) {
  let resolved = params;
  if (from) {
    const fmt = getFormat(from);
    if (fmt.toParams) resolved = fmt.toParams(params);
  }
  const provider = getProvider(providerName || 'gemini');
  for await (const ev of provider.stream(resolved)) {
    yield ev;
  }
}

async function translateSync(opts) {
  const events = [];
  for await (const ev of translate(opts)) events.push(ev);
  return events;
}

function stream(opts) {
  return { fullStream: translate(opts), warnings: Promise.resolve([]) };
}

module.exports = { translate, translateSync, stream };
