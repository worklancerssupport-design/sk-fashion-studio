import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  function apiPlugin() {
    return {
      name: "api-dev-server",
      configureServer(server: any) {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          if (!req.url?.startsWith("/api/")) return next();

          const GITHUB_TOKEN = env.GITHUB_TOKEN;
          const GITHUB_OWNER = env.GITHUB_OWNER;
          const GITHUB_REPO = env.GITHUB_REPO;
          const GITHUB_BRANCH = env.GITHUB_BRANCH || "main";
          const HEADERS = {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          };

          function apiUrl(filePath: string) {
            return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}&t=${Date.now()}`;
          }

          function decodeBase64Utf8(b64: string): string {
            const binary = atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return new TextDecoder("utf-8").decode(bytes);
          }

          function encodeBase64Utf8(str: string): string {
            const bytes = new TextEncoder().encode(str);
            let binary = "";
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
          }

          async function parseBody(req: any): Promise<any> {
            return new Promise((resolve, reject) => {
              let body = "";
              req.on("data", (chunk: any) => (body += chunk));
              req.on("end", () => {
                try { resolve(JSON.parse(body)); } catch { resolve({}); }
              });
              req.on("error", reject);
            });
          }

          res.setHeader("Content-Type", "application/json");

          try {
            // Auth endpoint
            if (req.url === "/api/auth" && req.method === "POST") {
              const body = await parseBody(req);
              const USERNAME = env.EDIT_USERNAME;
              const PASSWORD = env.EDIT_PASSWORD;
              if (body.username === USERNAME && body.password === PASSWORD) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } else {
                res.statusCode = 401;
                res.end(JSON.stringify({ success: false, error: "Invalid username or password" }));
              }
              return;
            }

            // GitHub file endpoint
            if (req.url?.startsWith("/api/github-file")) {
              if (req.method === "GET") {
                const url = new URL(req.url, "http://localhost");
                const filePath = url.searchParams.get("path");
                if (!filePath) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: "Missing path" }));
                  return;
                }
                const r = await fetch(apiUrl(filePath), { headers: HEADERS });
                if (!r.ok) {
                  res.statusCode = r.status;
                  res.end(JSON.stringify({ error: r.statusText }));
                  return;
                }
                const data = await r.json();
                res.statusCode = 200;
                res.end(JSON.stringify({ content: decodeBase64Utf8(data.content), sha: data.sha }));
                return;
              }

              if (req.method === "PUT") {
                const body = await parseBody(req);
                const { path: filePath, content, sha, message } = body;
                const r = await fetch(apiUrl(filePath), {
                  method: "PUT",
                  headers: HEADERS,
                  body: JSON.stringify({ message, content: encodeBase64Utf8(content), sha, branch: GITHUB_BRANCH }),
                });
                if (!r.ok) {
                  res.statusCode = r.status;
                  res.end(JSON.stringify({ error: r.statusText }));
                  return;
                }
                const data = await r.json();
                res.statusCode = 200;
                res.end(JSON.stringify({ newSha: data.content.sha }));
                return;
              }
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Not found" }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }));
          }
        });
      },
    };
  }

  return {
    plugins: [react(), apiPlugin()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    server: { port: 5173 },
  };
});
