# blackroad-chat

> Local AI chat interface powered by Ollama — built on BlackRoad infrastructure.

[![Deploy](https://github.com/BlackRoad-OS-Inc/blackroad-chat/actions/workflows/deploy.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-chat/actions/workflows/deploy.yml)

## Overview

A self-contained, single-page AI chat application that connects to your local Ollama instance. No backend required — runs entirely in the browser with streaming responses, model selection, and a dark-mode interface styled with the BlackRoad design system.

## Structure

```
blackroad-chat/
├── index.html        # Complete chat application (HTML + CSS + JS)
├── _headers          # Cloudflare Pages security headers
└── LICENSE           # Proprietary license
```

## Quick Start

```bash
# Serve locally (any static server works)
npx serve .

# Or open directly
open index.html
```

Ensure Ollama is running on the configured endpoint (default: `http://192.168.4.38:9083`).

## Features

- **Streaming responses** — real-time token-by-token output
- **Model switching** — auto-detects available Ollama models
- **Settings panel** — configurable endpoint, system prompt, temperature, context window
- **Markdown rendering** — code blocks, bold, italic, headings, lists
- **Dark mode** — BlackRoad gradient design system
- **Zero dependencies** — single HTML file, no build step

## Configuration

All settings persist in `localStorage`:

| Setting | Key | Default |
|---------|-----|---------|
| Endpoint | `br_endpoint` | `http://192.168.4.38:9083` |
| Model | `br_model` | First available |
| System prompt | `br_system` | Helpful AI assistant |
| Temperature | `br_temp` | `0.7` |
| Context window | `br_ctx` | `8192` |

## Deployment

Deployed to Cloudflare Pages on push to `main`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

© BlackRoad OS, Inc. — All rights reserved. Proprietary.
