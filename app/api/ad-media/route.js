import { NextResponse } from 'next/server';

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

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

function extractVideoSrc(html) {
  let match = html.match(/<video[^>]+src=["']([^"']+)["']/i);
  if (match) return decodeEntities(match[1]);

  match = html.match(/<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["']/i);
  return match ? decodeEntities(match[1]) : null;
}

function extractLargeImage(html) {
  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']*scontent[^"']+)["']/gi)].map((m) => m[1]);
  const filtered = matches.filter(
    (url) => !/s(32|40|48|60|64|100)x(32|40|48|60|64|100)/i.test(url)
  );
  const chosen = filtered[0] || matches[0];
  return chosen ? decodeEntities(chosen) : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const snapshotUrl = searchParams.get('url');

  if (!snapshotUrl || !snapshotUrl.startsWith('https://www.facebook.com/')) {
    return NextResponse.json({ error: 'URL de snapshot invalide' }, { status: 400 });
  }

  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'SCRAPINGBEE_API_KEY manquant côté serveur' },
      { status: 500 }
    );
  }

  const scrapeUrl = new URL('https://app.scrapingbee.com/api/v1/');
  scrapeUrl.searchParams.set('api_key', apiKey);
  scrapeUrl.searchParams.set('url', snapshotUrl);
  scrapeUrl.searchParams.set('render_js', 'true');
  scrapeUrl.searchParams.set('wait', '3000');

  try {
    const res = await fetch(scrapeUrl.toString());

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `ScrapingBee a échoué (${res.status}) : ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    const video = extractVideoSrc(html) || extractMeta(html, 'og:video:secure_url') || extractMeta(html, 'og:video');
    const image = extractLargeImage(html) || extractMeta(html, 'og:image');

    if (!video && !image) {
      return NextResponse.json({ error: 'Aucun média détecté sur cette pub' }, { status: 404 });
    }

    return NextResponse.json({ video, image });
  } catch (err) {
    return NextResponse.json(
      { error: `Impossible de contacter ScrapingBee : ${err.message || 'erreur inconnue'}` },
      { status: 502 }
    );
  }
}
