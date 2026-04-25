const { getProvider } = require('./providers/index');
const { getFormat } = require('./formats/index');

async function* translate({ from, to, provider: providerName, ...params }) {
  let resolved = params;
  if (from) {
    const fmt = getFormat(from);
    if (fmt.toParams) resolved = fmt.toParams(params);
  }
  const provider = getProvider(providerName || 'gemini');
  const toFmt = to ? getFormat(to) : null;
  const sseState = {};
  for await (const ev of provider.stream(resolved)) {
    if (!toFmt) { yield ev; continue; }
    const sse = toFmt.toSSE(ev, sseState);
    if (sse) yield { type: 'sse', raw: sse, event: ev };
    else yield { type: 'raw', event: ev };
  }
}

async function translateSync(opts) {
  const events = [];
  for await (const ev of translate(opts)) events.push(ev);
  return events;
}

async function buffer({ from, to, provider: providerName, ...params }) {
  let resolved = params;
  if (from) {
    const fmt = getFormat(from);
    if (fmt.toParams) resolved = fmt.toParams(params);
  }
  const provider = getProvider(providerName || 'gemini');
  const events = [];
  for await (const ev of provider.stream(resolved)) events.push(ev);
  if (!to) return events;
  const toFmt = getFormat(to);
  return toFmt.toResponse ? toFmt.toResponse(events) : events;
}

function stream(opts) {
  return { fullStream: translate(opts), warnings: Promise.resolve([]) };
}

module.exports = { translate, translateSync, buffer, stream };
