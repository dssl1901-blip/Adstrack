import { NextResponse } from 'next/server';

function extractMeta(html, property) {
  const re1 = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  let match = html.match(re1);
  if (match) return decodeEntities(match[1]);

  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    'i'
  );
  match = html.match(re2);
  return match ? decodeEntities(match[1]) : null;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const snapshotUrl = searchParams.get('url');

  if (!snapshotUrl || !snapshotUrl.startsWith('https://www.facebook.com/')) {
    return NextResponse.json({ error: 'URL de snapshot invalide' }, { status: 400 });
  }

  try {
    const res = await fetch(snapshotUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AdScoutBot/1.0)' },
    });
    const html = await res.text();

    const image = extractMeta(html, 'og:image');
    const video = extractMeta(html, 'og:video:secure_url') || extractMeta(html, 'og:video');

    if (!image && !video) {
      return NextResponse.json({ error: 'Aucun média trouvé sur cette pub' }, { status: 404 });
    }

    return NextResponse.json({ image, video });
  } catch (err) {
    return NextResponse.json({ error: 'Impossible de récupérer le média' }, { status: 502 });
  }
}
