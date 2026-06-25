const LINKEDIN_API = 'https://api.linkedin.com';
const LINKEDIN_VERSION = process.env.LINKEDIN_VERSION || '202506';

export function linkedinHeaders(accessToken, extra = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Restli-Protocol-Version': '2.0.0',
    'Linkedin-Version': LINKEDIN_VERSION,
    ...extra,
  };
}

export async function refreshAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`LinkedIn token refresh failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

export async function getMemberUrn(accessToken) {
  if (process.env.LINKEDIN_PERSON_URN) {
    return process.env.LINKEDIN_PERSON_URN;
  }

  const userinfo = await fetch(`${LINKEDIN_API}/v2/userinfo`, {
    headers: linkedinHeaders(accessToken),
  });
  if (userinfo.ok) {
    const data = await userinfo.json();
    if (data.sub) {
      return `urn:li:person:${data.sub}`;
    }
  }

  const me = await fetch(`${LINKEDIN_API}/v2/me`, {
    headers: linkedinHeaders(accessToken),
  });
  const meData = await me.json();
  if (me.ok && meData.id) {
    return `urn:li:person:${meData.id}`;
  }

  throw new Error(
    'Could not resolve member URN. Set LINKEDIN_PERSON_URN in GitHub secrets, or add the OpenID Connect product and re-authorize.',
  );
}

export async function createTextPost(accessToken, { authorUrn, commentary }) {
  const res = await fetch(`${LINKEDIN_API}/rest/posts`, {
    method: 'POST',
    headers: linkedinHeaders(accessToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      author: authorUrn,
      commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn post failed (${res.status}): ${text}`);
  }

  return {
    postUrn: res.headers.get('x-restli-id'),
  };
}

export function buildHashtags(tags = []) {
  const seen = new Set();
  const tagsOut = [];
  for (const tag of tags) {
    const normalized = `#${String(tag)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join('')}`;
    if (normalized.length > 1 && !seen.has(normalized.toLowerCase())) {
      seen.add(normalized.toLowerCase());
      tagsOut.push(normalized);
    }
  }
  return tagsOut;
}

export function buildPostCommentary(post, siteUrl) {
  if (post.linkedinCaption) {
    return post.linkedinCaption.trim();
  }

  const url = `${siteUrl.replace(/\/$/, '')}/blog#${post.slug}`;
  const hashtags = buildHashtags(post.tags).slice(0, 5);
  const parts = [post.excerpt.trim(), '', `Read more: ${url}`];
  if (hashtags.length) {
    parts.push('', hashtags.join(' '));
  }
  return parts.join('\n');
}