# Edit Console — Implementation Reference

A reusable admin panel system for any Vite + React website that stores data as JSON files in GitHub. The `/edit` route lets non-technical users modify site data through a browser UI, with changes committed directly to the repo.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Data Files](#3-data-files)
4. [Environment Variables & Security](#4-environment-variables--security)
5. [Serverless Functions](#5-serverless-functions)
6. [GitHub API Integration](#6-github-api-integration)
7. [Authentication](#7-authentication)
8. [Data Fetching & Context](#8-data-fetching--context)
9. [Edit Panel Structure](#9-edit-panel-structure)
10. [Edit Hooks Pattern](#10-edit-hooks-pattern)
11. [Edit Render-Prop Components](#11-edit-render-prop-components)
12. [Edit UI Components](#12-edit-ui-components)
13. [Image Handling — Cloudinary](#13-image-handling--cloudinary)
14. [Dev Server Setup (Vite)](#14-dev-server-setup-vite)
15. [Deployment (Vercel)](#15-deployment-vercel)
16. [Adding a New Editable Data Section](#16-adding-a-new-editable-data-section)
17. [File Inventory](#17-file-inventory)

---

## 1. System Overview

**Core idea:** JSON files in `src/data/` serve as the database. A serverless proxy handles all GitHub API calls so the PAT never reaches the browser. The edit panel reads files, lets users modify data in-browser, and writes changes back with commit messages.

**Key design decisions:**
- **GitHub as database** — no separate DB needed.
- **Serverless proxy** — GitHub token stays server-side.
- **No VITE_ prefix on secrets** — Vite won't bundle server-only vars into client JS.
- **Unsigned Cloudinary uploads** — image uploads use presets designed for client-side use.
- **In-memory auth** — no JWT/cookies/sessions; `isAuthenticated` boolean in React state.

---

## 2. Architecture & Data Flow

### Read Path (Main Site)
```
Browser → GET /api/site-data → Serverless fn → GitHub Contents API (parallel fetch all JSON files) → aggregated JSON → DataContext → components
```

### Read Path (Edit Panel)
```
EditPage → useDataSection() hook → GET /api/github-file?path=... → Serverless fn → GitHub API → { content, sha } → parse into edit state
```

### Write Path (Edit Panel)
```
User edits → clicks Save → PUT /api/github-file { path, content, sha, message } → Serverless fn → GitHub Contents API PUT → { newSha } → update local SHA
```

### Auth Path
```
EditLogin → POST /api/auth { username, password } → Serverless fn → compare against env vars → { success: true/false }
```

---

## 3. Data Files

All site data lives as JSON files in `src/data/`. Each file is a distinct data domain.

### Rules

1. Each file is a single JSON object or array — no JS, no exports.
2. Consistent key naming across all files (pick camelCase or snake_case).
3. Prices as strings, not numbers — format currency at display time.
4. Image URLs as full strings (Cloudinary, CDN, etc.).
5. IDs as strings (e.g., `"item-001"`, not `1`).
6. Indent with 4 spaces — save functions use `JSON.stringify(data, null, 4)`.

### Example Structures

**Array of items** (e.g., services, packages, testimonials):
```json
[
  { "id": "item-001", "name": "Item Name", "price": "500", "image": "https://..." }
]
```

**Grouped object** (e.g., hairstyles split by category):
```json
{
  "categoryA": [{ "id": "a-001", "name": "...", "image": "..." }],
  "categoryB": [{ "id": "b-001", "name": "...", "image": "..." }]
}
```

**Single object** (e.g., contact info, owner profile):
```json
{
  "name": "...",
  "phone": "...",
  "social": { "instagram": "https://..." }
}
```

**Flat table** (e.g., catalogue/price list):
```json
[
  { "CATEGORY": "Type A", "ITEM": "Item Name", "PRICE": "200", "OLD PRICE": "250", "image_url": "" }
]
```

---

## 4. Environment Variables & Security

### The VITE_ Prefix Rule

Vite only exposes env vars prefixed with `VITE_` to client code. Variables **without** `VITE_` are server-only (serverless functions + Vite dev middleware). This is the core security mechanism.

### Variable Classification

| Variable | Prefix | Available | Purpose |
|---|---|---|---|
| `GITHUB_TOKEN` | None | Server | GitHub PAT for repo read/write |
| `GITHUB_OWNER` | None | Server | Repo owner |
| `GITHUB_REPO` | None | Server | Repo name |
| `GITHUB_BRANCH` | None | Server | Branch (default: `main`) |
| `EDIT_USERNAME` | None | Server | Admin login username |
| `EDIT_PASSWORD` | None | Server | Admin login password |
| `VITE_CLOUDINARY_CLOUD_NAME` | `VITE_` | Client | Cloudinary cloud name (safe — unsigned preset) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `VITE_` | Client | Cloudinary upload preset (safe — unsigned preset) |

Cloudinary vars are safe to expose because unsigned upload presets are designed for client-side use. Security is controlled by the preset's dashboard settings (allowed folders, file types, max size).

### .env Template

```env
# Server-only (NO VITE_ prefix)
GITHUB_TOKEN=github_pat_xxxxx
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
EDIT_USERNAME=admin
EDIT_PASSWORD=your-secure-password

# Client-safe (VITE_ prefix)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

`.env` must be in `.gitignore`.

---

## 5. Serverless Functions

Three functions in `api/`. In production (Vercel) they run as serverless functions; in dev they're emulated by Vite middleware ([Section 14](#14-dev-server-setup-vite)).

### api/site-data.ts — Bulk Fetch

Fetches all JSON files from GitHub in parallel, returns aggregated response.

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

const HEADERS = { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" };

function apiUrl(filePath: string) {
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}&t=${Date.now()}`;
}

function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

async function fetchJson(filePath: string) {
  const r = await fetch(apiUrl(filePath), { headers: HEADERS });
  if (!r.ok) throw new Error(`Failed to fetch ${filePath}: ${r.statusText}`);
  const data = await r.json();
  return JSON.parse(decodeBase64Utf8(data.content));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // List all your data files here:
    const [items, categories, settings] = await Promise.all([
      fetchJson("src/data/items.json"),
      fetchJson("src/data/categories.json"),
      fetchJson("src/data/settings.json"),
    ]);
    res.status(200).json({ items, categories, settings });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
```

**Notes:**
- Uses `api.github.com` (not `raw.githubusercontent.com`) — the raw CDN serves stale content.
- `?t=${Date.now()}` busts any caching.
- If a JSON file has nested keys (e.g., `{ mens: [...], womens: [...] }`), flatten them in the response or handle the mapping in the client hook.

### api/github-file.ts — Single File Read/Write

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

const HEADERS = { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" };

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
```

**Notes:**
- GET returns `{ content, sha }` — SHA is required for subsequent PUT (optimistic concurrency).
- PUT sends `{ message, content, sha, branch }` — SHA ensures you're updating the latest version.
- Content is base64-encoded with UTF-8 support.

### api/auth.ts — Authentication

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

const USERNAME = process.env.EDIT_USERNAME;
const PASSWORD = process.env.EDIT_PASSWORD;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) return res.status(200).json({ success: true });
  return res.status(401).json({ success: false, error: "Invalid username or password" });
}
```

Credentials are compared server-side only. No JWT, no sessions. Client holds `isAuthenticated` in React state; page refresh requires re-login.

---

## 6. GitHub API Integration

### Why api.github.com, Not raw.githubusercontent.com

`raw.githubusercontent.com` uses a CDN that caches aggressively — old versions persist for minutes after commits. `api.github.com` always returns the latest.

### Contents API

- **GET** `/repos/{owner}/{repo}/contents/{path}?ref={branch}` — returns base64 content + SHA.
- **PUT** `/repos/{owner}/{repo}/contents/{path}` — requires `{ message, content (base64), sha, branch }`. SHA acts as an optimistic lock.

### PAT Setup

GitHub → Settings → Developer settings → Fine-grained tokens. Required permissions: `Contents` (Read/Write), `Metadata` (Read-only). Scope: only the data repo.

### Frontend Client (src/edit/lib/github.ts)

```typescript
export async function fetchFileFromGitHub(filePath: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`/api/github-file?path=${encodeURIComponent(filePath)}`);
  if (!res.ok) throw new Error(`Failed to fetch ${filePath}`);
  return res.json();
}

export async function saveFileToGitHub(filePath: string, content: string, sha: string, message: string): Promise<{ newSha: string }> {
  const res = await fetch("/api/github-file", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: filePath, content, sha, message }),
  });
  if (!res.ok) throw new Error(`Failed to save ${filePath}`);
  return res.json();
}
```

---

## 7. Authentication

### Flow

1. User navigates to `/edit`.
2. `EditPage` wraps content in `<AuthProvider>`.
3. `useAuth()` checks `isAuthenticated` — if false, renders `<EditLogin />`.
4. User submits credentials → `POST /api/auth` → server compares against env vars.
5. On success, `isAuthenticated = true` in React state. Page refresh logs out.

### Implementation (src/edit/hooks/useAuth.tsx)

```typescript
const login = useCallback(async (username: string, password: string) => {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.success) { setIsAuthenticated(true); setError(null); return true; }
  setError(data.error || "Invalid username or password");
  return false;
}, []);
```

**Security notes:**
- Credentials never enter the client bundle.
- Auth state is in-memory only.
- No rate limiting — consider adding it for production.

---

## 8. Data Fetching & Context

### src/lib/fetchData.ts

Define TypeScript interfaces for every data file, then a single fetch function:

```typescript
export interface Item { id: string; name: string; price: string; /* ... */ }
export interface Category { id: string; title: string; items: Item[]; /* ... */ }
export interface Settings { siteName: string; phone: string; /* ... */ }

export interface SiteData {
  items: Item[];
  categories: Category[];
  settings: Settings;
  // Add a key for each data file
}

export async function fetchSiteData(): Promise<SiteData> {
  const res = await fetch("/api/site-data");
  if (!res.ok) throw new Error("Failed to fetch site data");
  return res.json();
}
```

### src/contexts/DataContext.tsx

Wraps the main site (not the edit panel). Shows loading spinner/error states. Children only render when data is loaded.

```typescript
export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteData().then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <DataContext.Provider value={{ data, loading, error }}>{children}</DataContext.Provider>;
}

export function useDataContext(): SiteData {
  const ctx = useContext(DataContext);
  if (!ctx?.data) throw new Error("useDataContext must be used within DataProvider");
  return ctx.data;
}
```

**Usage in components:**
```typescript
const { items, categories } = useDataContext();
```

---

## 9. Edit Panel Structure

### Route

```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/edit" element={<EditPage />} />
</Routes>
```

### EditPage

```typescript
export default function EditPage() {
  return (
    <AuthProvider>
      <EditShell />
    </AuthProvider>
  );
}

function EditShell() {
  const { isAuthenticated, logout } = useAuth();
  if (!isAuthenticated) return <EditLogin />;
  return (
    <div>
      {/* Header with branding, "Back to Site", "Logout" */}
      <EditItemsEditor />      {/* One editor per data section */}
      <EditCategoriesEditor />
    </div>
  );
}
```

### Directory Structure

```
src/edit/
  EditPage.tsx              — Entry point, wraps in AuthProvider
  EditLogin.tsx             — Login form
  types.ts                  — Shared types
  hooks/
    useAuth.tsx             — Auth provider + hook
    useItems.ts             — Data hook for items
    useCategories.ts        — Data hook for categories
  lib/
    github.ts               — GitHub API client (proxied)
    cloudinary.ts           — Image upload + compression
  EditItems.tsx             — Render-prop for items
  EditItemsEditor.tsx       — Editor UI for items
  EditCategories.tsx        — Render-prop for categories
  EditCategoriesEditor.tsx  — Editor UI for categories
```

---

## 10. Edit Hooks Pattern

Each editable data section has a hook managing the read/edit/write lifecycle.

### Interface

```typescript
interface EditHook<T> {
  originalData: T | null;    // Last saved state
  editData: T | null;        // Current working state
  sha: string;               // GitHub file SHA (optimistic locking)
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  refresh: () => void;
  save: () => Promise<void>;
  discard: () => void;
  updateEditData: (updater: (draft: T) => void) => void;
}
```

### Implementation Pattern

```typescript
export function useItems(): EditHook<Item[]> {
  const [originalData, setOriginalData] = useState<Item[] | null>(null);
  const [editData, setEditData] = useState<Item[] | null>(null);
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { content, sha } = await fetchFileFromGitHub("src/data/items.json");
      const parsed = JSON.parse(content) as Item[];
      setOriginalData(parsed);
      setEditData(structuredClone(parsed));
      setSha(sha);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(editData);

  const save = useCallback(async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const { newSha } = await saveFileToGitHub("src/data/items.json", JSON.stringify(editData, null, 4), sha, "Update items via edit panel");
      setOriginalData(structuredClone(editData));
      setSha(newSha);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [editData, sha]);

  const discard = useCallback(() => setEditData(structuredClone(originalData)), [originalData]);

  const updateEditData = useCallback((updater: (draft: Item[]) => void) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
      updater(draft);
      return draft;
    });
  }, []);

  return { originalData, editData, sha, loading, saving, error, hasChanges, refresh: fetchData, save, discard, updateEditData };
}
```

**If JSON keys need renaming** (e.g., file uses `mensItems` but internal state uses `mens`), handle the mapping in `fetchData` (parse) and `save` (serialize).

---

## 11. Edit Render-Prop Components

Bridges the hook and UI editor. Separates data logic from presentation.

```typescript
interface EditItemsRenderProps {
  editData: Item[] | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  refresh: () => void;
  updateItem: (index: number, updates: Partial<Item>) => void;
  addItem: (item: Item) => void;
  removeItem: (index: number) => void;
  save: () => Promise<void>;
  discard: () => void;
}

export default function EditItems({ children }: { children: (props: EditItemsRenderProps) => ReactNode }) {
  const hook = useItems();

  const updateItem = useCallback((index: number, updates: Partial<Item>) => {
    hook.updateEditData((draft) => { Object.assign(draft[index], updates); });
  }, [hook.updateEditData]);

  const addItem = useCallback((item: Item) => {
    hook.updateEditData((draft) => { draft.push(item); });
  }, [hook.updateEditData]);

  const removeItem = useCallback((index: number) => {
    hook.updateEditData((draft) => { draft.splice(index, 1); });
  }, [hook.updateEditData]);

  return children({ editData: hook.editData, loading: hook.loading, saving: hook.saving, error: hook.error, hasChanges: hook.hasChanges, refresh: hook.refresh, updateItem, addItem, removeItem, save: hook.save, discard: hook.discard });
}
```

**Usage:**
```typescript
<EditItems>
  {({ editData, loading, hasChanges, updateItem, addItem, removeItem, save, discard, refresh }) => (
    // editor UI
  )}
</EditItems>
```

---

## 12. Edit UI Components

### InlineEdit

Double-click to edit, Enter to commit, Escape to cancel. Touch: single tap.

```typescript
function InlineEdit({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const commit = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) return <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }} onBlur={commit} className={className} />;
  return <span onDoubleClick={() => { setDraft(value); setEditing(true); }} className={className}>{value || "—"}</span>;
}
```

### Action Bar

Every editor has: `[Refresh] [Discard] [Save]` + unsaved changes indicator.

- **Refresh** — re-fetch from GitHub (discards local changes)
- **Discard** — reset to last saved state
- **Save** — commit to GitHub

### Image Editor

Modal with three input methods:
1. **URL input** — paste a direct image link
2. **Upload** — file picker → compress → upload to Cloudinary
3. **Camera** — camera capture → compress → upload to Cloudinary

---

## 13. Image Handling — Cloudinary

### src/edit/lib/cloudinary.ts

#### Upload

```typescript
export async function uploadToCloudinary(file: File, folder = "uploads"): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height };
}
```

#### Compression (client-side canvas)

```typescript
export function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })), "image/jpeg", quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function compressAndUpload(file: File, maxWidth = 800, quality = 0.7, folder = "uploads") {
  const compressed = await compressImage(file, maxWidth, quality);
  return uploadToCloudinary(compressed, folder);
}
```

#### Source Selection

```typescript
export function selectFromFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}

export function captureFromCamera(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.capture = "environment";
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}
```

#### URL Validation

```typescript
export function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.protocol.startsWith("http")) return false;
    const allowedDomains = ["res.cloudinary.com", "images.unsplash.com", "cdn.shopify.com", "i.pinimg.com", "lh3.googleusercontent.com"];
    return allowedDomains.some((d) => u.hostname.includes(d)) || /\.(jpg|jpeg|png|webp|gif)$/i.test(u.pathname);
  } catch { return false; }
}
```

---

## 14. Dev Server Setup (Vite)

In production, `api/*.ts` runs as Vercel serverless functions. In dev, a Vite plugin emulates them.

### vite.config.ts

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // "" loads ALL env vars, not just VITE_ prefixed

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
          const HEADERS = { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" };

          // ... same helper functions (apiUrl, decodeBase64Utf8, encodeBase64Utf8) ...

          res.setHeader("Content-Type", "application/json");

          try {
            if (req.url === "/api/site-data") { /* same logic as api/site-data.ts */ }
            if (req.url?.startsWith("/api/github-file")) { /* same logic as api/github-file.ts */ }
            if (req.url === "/api/auth" && req.method === "POST") { /* same logic as api/auth.ts */ }
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
    server: { port: 3000 },
  };
});
```

**Critical:** `loadEnv(mode, process.cwd(), "")` — the empty third arg loads ALL env vars (including those without `VITE_` prefix). The middleware must parse request bodies manually for POST/PUT. Logic must be identical to serverless functions for dev/prod parity.

---

## 15. Deployment (Vercel)

### vercel.json

Required for SPA routing — without this, `/edit` returns 404 on direct navigation:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Project Settings

| Setting | Value |
|---|---|
| Framework Preset | Vite (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Dependencies

```bash
npm install -D @vercel/node  # Types only — Vercel runtime provides implementation
```

### Environment Variables

Add all variables in Vercel → Settings → Environment Variables. Server-only vars (no `VITE_` prefix) are never bundled into client JS.

---

## 16. Adding a New Editable Data Section

To add an editor for a new data file (e.g., `testimonials.json`):

1. **Create data file** — `src/data/testimonials.json`
2. **Add types** — define interface in `src/lib/fetchData.ts`, add to `SiteData`
3. **Add to site-data fetch** — add `fetchJson("src/data/testimonials.json")` in both `api/site-data.ts` AND the Vite dev middleware in `vite.config.ts`
4. **Create edit hook** — `src/edit/hooks/useTestimonials.ts` (pattern from [Section 10](#10-edit-hooks-pattern))
5. **Create render-prop** — `src/edit/EditTestimonials.tsx` (pattern from [Section 11](#11-edit-render-prop-components))
6. **Create editor UI** — `src/edit/EditTestimonialsEditor.tsx` (pattern from [Section 12](#12-edit-ui-components))
7. **Add to EditPage** — import and render `<EditTestimonialsEditor />` in `EditShell`
8. **Wire into main site** — use `useDataContext()` in the component that renders this data

---

## 17. File Inventory

### Serverless Functions
| File | Purpose |
|---|---|
| `api/site-data.ts` | Bulk fetch all JSON data |
| `api/github-file.ts` | Single file read (GET) / write (PUT) |
| `api/auth.ts` | Credential validation |

### Client — Shared
| File | Purpose |
|---|---|
| `src/lib/fetchData.ts` | TypeScript interfaces + `fetchSiteData()` |
| `src/contexts/DataContext.tsx` | React context provider for site data |

### Client — Edit Panel
| File | Purpose |
|---|---|
| `src/edit/EditPage.tsx` | Entry point, AuthProvider wrapper |
| `src/edit/EditLogin.tsx` | Login form |
| `src/edit/types.ts` | Shared types |
| `src/edit/hooks/useAuth.tsx` | Auth provider + hook |
| `src/edit/hooks/use*.ts` | One hook per data section |
| `src/edit/lib/github.ts` | GitHub API client (proxied) |
| `src/edit/lib/cloudinary.ts` | Image upload + compression |
| `src/edit/Edit*.tsx` | Render-prop components |
| `src/edit/Edit*Editor.tsx` | Editor UI components |

### Config
| File | Purpose |
|---|---|
| `.env` | Environment variables (gitignored) |
| `vercel.json` | SPA rewrite rule |
| `vite.config.ts` | Dev server with API middleware |
