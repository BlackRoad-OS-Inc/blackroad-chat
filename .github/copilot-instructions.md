# BlackRoad Chat - Copilot Instructions

## Project Overview

BlackRoad Chat is a self-contained, single-page AI chat interface that connects to a local Ollama instance. No backend required — everything runs in the browser. Core philosophy: "Your AI. Your Hardware. Your Rules."

**Key components:**
- **index.html**: Complete chat application (HTML + CSS + JS in one file)
- **_headers**: Cloudflare Pages security headers
- **Cloudflare Pages**: Deployment target

## Architecture

### Single-File Application
The entire application lives in `index.html`:
- CSS custom properties for the BlackRoad design system (gradient theme)
- Vanilla JavaScript with no dependencies
- Streaming fetch API for real-time Ollama responses
- localStorage for settings persistence

### Design System
BlackRoad gradient palette:
```css
--amber:  #F5A623;
--pink:   #FF1D6C;
--blue:   #2979FF;
--violet: #9C27B0;
--grad:   linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%);
```

Dark surface colors: `#0d0d0d` (surface), `#141414` (card), `#222` (border).

### Ollama Integration
- Connects to Ollama REST API (`/api/tags` for models, `/api/chat` for streaming)
- Default endpoint: `http://192.168.4.38:9083`
- Streaming via `ReadableStream` with line-delimited JSON

## Build & Test Commands

No build process — static HTML served directly.

```bash
# Serve locally
npx serve .

# Or any static server
python3 -m http.server 8080
```

## Key Conventions

### Code Style
- Vanilla JS, no framework
- CSS custom properties for theming
- Semantic HTML
- Mobile-responsive (600px breakpoint)

### Settings Storage
All settings persist in `localStorage` with `br_` prefix:
- `br_endpoint`, `br_model`, `br_system`, `br_temp`, `br_ctx`

## Deployment

Deployed to Cloudflare Pages via GitHub Actions on push to `main`.

## Security Considerations

- No secrets in client-side code
- Security headers configured in `_headers`
- Ollama endpoint is user-configurable (local network)
- No server-side processing — purely static
