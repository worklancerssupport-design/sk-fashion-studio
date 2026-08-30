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
