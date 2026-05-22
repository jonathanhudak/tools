const PROXY = 'https://api.allorigins.win/raw?url=';

export interface ResolvedSource {
  /** URL that returns a unified diff (a `.diff`/`.patch` endpoint or a raw blob). */
  diffUrl: string;
  /** Human label for the header. */
  label: string;
}

/**
 * Turn a github.com PR / commit / compare URL (or a direct .diff/.patch URL)
 * into a URL that serves a unified diff. Throws on anything we don't recognise.
 */
export function resolveGitHubUrl(input: string): ResolvedSource {
  const raw = input.trim();
  if (!raw) throw new Error('Enter a GitHub URL.');

  // Already a diff/patch endpoint — use as-is.
  if (/\.(diff|patch)(\?|#|$)/i.test(raw)) {
    return { diffUrl: raw, label: shortLabel(raw) };
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('That does not look like a valid URL.');
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host !== 'github.com') {
    throw new Error('Only github.com URLs (PR, commit, or compare) are supported.');
  }

  const parts = url.pathname.split('/').filter(Boolean);
  // [owner, repo, kind, ...rest]
  if (parts.length < 4) {
    throw new Error('Use a pull request, commit, or compare URL.');
  }
  const [owner, repo, kind, ...rest] = parts;
  const base = `https://github.com/${owner}/${repo}`;

  switch (kind) {
    case 'pull': {
      const num = rest[0];
      return { diffUrl: `${base}/pull/${num}.diff`, label: `${owner}/${repo} #${num}` };
    }
    case 'commit': {
      const sha = rest[0];
      return { diffUrl: `${base}/commit/${sha}.diff`, label: `${owner}/${repo} @ ${sha.slice(0, 7)}` };
    }
    case 'compare': {
      const range = rest.join('/');
      return { diffUrl: `${base}/compare/${range}.diff`, label: `${owner}/${repo} ${range}` };
    }
    default:
      throw new Error(`Unsupported GitHub URL type: "${kind}". Use pull, commit, or compare.`);
  }
}

function shortLabel(diffUrl: string): string {
  try {
    const p = new URL(diffUrl).pathname.split('/').filter(Boolean);
    return p.slice(0, 2).join('/') || diffUrl;
  } catch {
    return diffUrl;
  }
}

/** Fetch the diff text. GitHub does not send CORS headers, so route through a proxy. */
export async function fetchDiff(diffUrl: string): Promise<string> {
  const res = await fetch(`${PROXY}${encodeURIComponent(diffUrl)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch diff (HTTP ${res.status}).`);
  }
  const text = await res.text();
  if (!text.trim()) {
    throw new Error('The diff is empty. Is the repository public?');
  }
  if (/^\s*</.test(text) && /<html/i.test(text.slice(0, 500))) {
    throw new Error('Got an HTML page instead of a diff. Check the URL or that the repo is public.');
  }
  return text;
}
