/**
 * BlackRoad AI Chat — Cloudflare Worker
 *
 * Proxies requests to an Ollama backend with:
 *   - Full CORS support for cross-origin browser requests
 *   - Streaming pass-through for chat completions
 *   - Extended CPU time via Cloudflare Workers (no 30-second gateway timeout)
 *
 * Configure your Ollama host via the OLLAMA_HOST environment variable in
 * wrangler.toml or via a Cloudflare Workers secret:
 *
 *   wrangler secret put OLLAMA_HOST
 *
 * The worker rewrites paths so the chat UI can call `/api/tags` and
 * `/api/chat` on this worker's hostname instead of the Ollama host directly.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Only proxy /api/* paths
    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    }

    const ollamaHost = env.OLLAMA_HOST;
    if (!ollamaHost) {
      return new Response(
        JSON.stringify({ error: 'OLLAMA_HOST not configured' }),
        {
          status: 503,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate OLLAMA_HOST to prevent SSRF — only http/https schemes are allowed.
    let parsedHost;
    try {
      parsedHost = new URL(ollamaHost);
    } catch {
      return new Response(
        JSON.stringify({ error: 'OLLAMA_HOST is not a valid URL' }),
        {
          status: 503,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }
    if (parsedHost.protocol !== 'http:' && parsedHost.protocol !== 'https:') {
      return new Response(
        JSON.stringify({ error: 'OLLAMA_HOST must use http or https' }),
        {
          status: 503,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    const targetUrl = `${parsedHost.origin}${url.pathname}${url.search}`;

    // Forward request to Ollama
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    });

    let response;
    try {
      response = await fetch(proxyRequest);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Ollama unreachable', detail: String(err) }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    // Rebuild response with CORS headers preserved
    const responseHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      responseHeaders.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
