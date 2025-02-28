const port = 3000;

Bun.serve({
  port,
  fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname === "/") pathname = "/index.html";
    try {
      return new Response(Bun.file('.' + pathname));
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
});

console.log(`Server running on http://localhost:${port}`);
