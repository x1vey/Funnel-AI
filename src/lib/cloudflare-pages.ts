// ============================================================================
// Cloudflare Pages — Deploy funnels as static sites via Direct Upload API
// ============================================================================
// No git repo, no build step. Upload files → get a live URL in seconds.
//
// Flow:
//   1. Create a project (once per funnel, idempotent)
//   2. Upload files as a deployment (each publish = new deployment)
//   3. Get back a URL: https://{project}.pages.dev
//   4. Optionally attach a custom domain
//
// Requires:
//   CLOUDFLARE_ACCOUNT_ID  — your CF account ID
//   CLOUDFLARE_API_TOKEN   — API token with "Cloudflare Pages: Edit" permission
//
// Docs: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
// ============================================================================

const CF_API = 'https://api.cloudflare.com/client/v4';

function headers(): Record<string, string> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error('CLOUDFLARE_API_TOKEN is not set.');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function accountId(): string {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!id) throw new Error('CLOUDFLARE_ACCOUNT_ID is not set.');
  return id;
}

// ---- Project management ----

/**
 * Create a Cloudflare Pages project for a funnel.
 * Idempotent — returns the existing project if it already exists.
 * Project name = funnel slug (sanitized).
 */
export async function ensureProject(projectName: string): Promise<{ name: string; subdomain: string }> {
  const name = sanitizeName(projectName);

  // Try to get existing project first
  const getRes = await fetch(`${CF_API}/accounts/${accountId()}/pages/projects/${name}`, {
    headers: headers(),
  });

  if (getRes.ok) {
    const data = await getRes.json() as { result: { name: string; subdomain: string } };
    return { name: data.result.name, subdomain: data.result.subdomain };
  }

  // Create new project
  const createRes = await fetch(`${CF_API}/accounts/${accountId()}/pages/projects`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name,
      production_branch: 'main',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json() as { errors?: Array<{ message: string }> };
    throw new Error(`Failed to create CF Pages project: ${err.errors?.[0]?.message || createRes.statusText}`);
  }

  const data = await createRes.json() as { result: { name: string; subdomain: string } };
  return { name: data.result.name, subdomain: data.result.subdomain };
}

// ---- Deployment via Direct Upload ----

/**
 * Deploy static files to Cloudflare Pages.
 * `files` is a Record<filename, content> — e.g. { "index.html": "<!DOCTYPE...", "styles.css": "..." }
 *
 * Returns the live deployment URL.
 */
export async function deploy(
  projectName: string,
  files: Record<string, string>
): Promise<{ url: string; deploymentId: string }> {
  const name = sanitizeName(projectName);

  // Step 1: Ensure project exists
  await ensureProject(name);

  // Step 2: Upload files using multipart form (Direct Upload)
  // CF Pages Direct Upload uses a multipart form where each file is a part
  const formData = new FormData();

  // Create a manifest of files
  for (const [filename, content] of Object.entries(files)) {
    const blob = new Blob([content], {
      type: filename.endsWith('.html') ? 'text/html'
        : filename.endsWith('.css') ? 'text/css'
        : filename.endsWith('.js') ? 'application/javascript'
        : 'text/plain',
    });
    // CF Pages expects the path as the form field name, prefixed with /
    formData.append(`/${filename}`, blob, filename);
  }

  const deployRes = await fetch(
    `${CF_API}/accounts/${accountId()}/pages/projects/${name}/deployments`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
      // Don't set Content-Type — fetch sets it with the boundary for multipart
      body: formData,
    }
  );

  if (!deployRes.ok) {
    const err = await deployRes.json() as { errors?: Array<{ message: string }> };
    throw new Error(`CF Pages deploy failed: ${err.errors?.[0]?.message || deployRes.statusText}`);
  }

  const data = await deployRes.json() as {
    result: { id: string; url: string; aliases: string[] };
  };

  // The production URL is {project}.pages.dev
  const productionUrl = `https://${name}.pages.dev`;

  return {
    url: data.result.url || productionUrl,
    deploymentId: data.result.id,
  };
}

// ---- Custom domains ----

/**
 * Add a custom domain to a Cloudflare Pages project.
 * The user must point their domain's CNAME to {project}.pages.dev.
 * CF auto-provisions SSL.
 */
export async function addCustomDomain(
  projectName: string,
  domain: string
): Promise<{ domain: string; status: string }> {
  const name = sanitizeName(projectName);

  const res = await fetch(
    `${CF_API}/accounts/${accountId()}/pages/projects/${name}/domains`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name: domain }),
    }
  );

  if (!res.ok) {
    const err = await res.json() as { errors?: Array<{ message: string }> };
    throw new Error(`Failed to add domain: ${err.errors?.[0]?.message || res.statusText}`);
  }

  const data = await res.json() as { result: { name: string; status: string } };
  return { domain: data.result.name, status: data.result.status };
}

/**
 * Remove a custom domain from a Cloudflare Pages project.
 */
export async function removeCustomDomain(
  projectName: string,
  domain: string
): Promise<void> {
  const name = sanitizeName(projectName);

  const res = await fetch(
    `${CF_API}/accounts/${accountId()}/pages/projects/${name}/domains/${domain}`,
    {
      method: 'DELETE',
      headers: headers(),
    }
  );

  if (!res.ok && res.status !== 404) {
    const err = await res.json() as { errors?: Array<{ message: string }> };
    throw new Error(`Failed to remove domain: ${err.errors?.[0]?.message || res.statusText}`);
  }
}

/**
 * Delete a Cloudflare Pages project entirely (when a funnel is deleted).
 */
export async function deleteProject(projectName: string): Promise<void> {
  const name = sanitizeName(projectName);

  const res = await fetch(
    `${CF_API}/accounts/${accountId()}/pages/projects/${name}`,
    {
      method: 'DELETE',
      headers: headers(),
    }
  );

  if (!res.ok && res.status !== 404) {
    const err = await res.json() as { errors?: Array<{ message: string }> };
    throw new Error(`Failed to delete project: ${err.errors?.[0]?.message || res.statusText}`);
  }
}

// ---- Helpers ----

/**
 * Sanitize a funnel slug into a valid CF Pages project name.
 * Must be lowercase, alphanumeric + hyphens, no leading/trailing hyphens, max 63 chars.
 */
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63) || 'funnel';
}
