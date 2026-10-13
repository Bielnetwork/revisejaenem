import { createFileRoute } from "@tanstack/react-router";
import landingHtml from "../content/revisaja.html?raw";

// Serve a página aprovada diretamente pela rota existente do TanStack Start.
// Sem iframe, redirecionamento, scripts de marketing ou publicação automática.
export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(landingHtml, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Robots-Tag": "noindex, nofollow",
          },
        }),
    },
  },
});
