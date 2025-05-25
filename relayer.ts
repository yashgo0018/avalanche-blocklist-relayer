const TARGET_URL =
  "http://127.0.0.1:9650/ext/bc/PG2kCEBpLpxVCway9hKyNkCeQAbgFBgSvpNBG3z9Ut2uimemk/rpc";

Bun.serve({
  port: 3005,
  async fetch(req) {
    const url = new URL(req.url);
    const targetUrl = new URL(TARGET_URL);

    console.log(req.headers);

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow any origin
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Allow common methods
          "Access-Control-Allow-Headers": "Content-Type, Authorization", // Allow common headers
        },
      });
    }

    // Preserve the path and query params from the original request
    targetUrl.pathname =
      url.pathname === "/"
        ? targetUrl.pathname
        : targetUrl.pathname + url.pathname;
    targetUrl.search = url.search;

    console.log(`Relaying ${req.method} request to: ${targetUrl.toString()}`);

    try {
      const response = await fetch(targetUrl.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.body,
        // redirect: "manual", // Pass redirects through
      });

      console.log(
        `Received response: ${response.status} from ${targetUrl.toString()}`
      );

      // Add CORS headers to the actual response
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*"); // Allow any origin

      responseHeaders.delete("content-encoding");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Error relaying request:", error);
      return new Response("Error relaying request", { status: 500 });
    }
  },
});

console.log("Relayer server running on port 3005");
