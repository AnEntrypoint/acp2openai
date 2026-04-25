# Changelog

## Unreleased

- feat: add Ollama streaming provider (lib/providers/ollama.js) with NDJSON, tool-call loop, 404→BridgeError

- feat: add reasoning-delta SSE handler to anthropic, openai, gemini, acp format files
- feat: add /debug/providers, /debug/config, /debug/translate endpoints to server
- feat: add Cohere v2 Chat API format (lib/formats/cohere.js) with toParams, toResponse, toSSE
