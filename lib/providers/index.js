const { BridgeError } = require('../errors');

const PROVIDERS = {
  gemini: {
    stream: (p) => require('../../index').createFullStream(p),
  },
  'openai-compat': {
    stream: (p) => require('./openai').streamOpenAI(p),
  },
  acp: {
    stream: (p) => require('./acp').streamACP(p),
  },
  cloud: {
    stream: (p) => require('../cloud-generate').cloudStream(p),
  },
  router: {
    stream: (p) => require('../router-stream').streamRouter(p).fullStream,
  },

};

function getProvider(name) {
  if (!PROVIDERS[name]) throw new BridgeError(`Unknown provider: ${name}`, { retryable: false });
  return PROVIDERS[name];
}

module.exports = { getProvider, PROVIDERS };
