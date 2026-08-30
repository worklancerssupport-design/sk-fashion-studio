import type { VercelRequest, VercelResponse } from "@vercel/node";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const filePath = req.query.path as string;
      if (!filePath) return res.status(400).json({ error: "Missing path" });
      const r = await fetch(apiUrl(filePath), { headers: HEADERS });
      if (!r.ok) return res.status(r.status).json({ error: r.statusText });
      const data = await r.json();
      return res.status(200).json({ content: decodeBase64Utf8(data.content), sha: data.sha });
    }

    if (req.method === "PUT") {
      const { path, content, sha, message } = req.body;
      const r = await fetch(apiUrl(path), {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify({ message, content: encodeBase64Utf8(content), sha, branch: GITHUB_BRANCH }),
      });
      if (!r.ok) return res.status(r.status).json({ error: r.statusText });
      const data = await r.json();
      return res.status(200).json({ newSha: data.content.sha });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
