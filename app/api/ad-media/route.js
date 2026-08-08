import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 jours — le visuel d'une pub ne change pas

let redis = null;
function getRedis() {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  redis = Redis.fromEnv();
  return redis;
}

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
  const adId = searchParams.get('id');

  if (!adId || !/^\d+$/.test(adId)) {
    return NextResponse.json({ error: 'Paramètre "id" invalide' }, { status: 400 });
  }

  const cacheKey = `ad-media:${adId}`;
  const cache = getRedis();

  if (cache) {
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    } catch {
      // cache indisponible, on continue sans bloquer la requête
    }
  }

  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'SCRAPINGBEE_API_KEY manquant côté serveur' },
      { status: 500 }
    );
  }

  const metaToken = process.env.META_ACCESS_TOKEN;
  if (!metaToken) {
    return NextResponse.json(
      { error: 'META_ACCESS_TOKEN manquant côté serveur' },
      { status: 500 }
    );
  }

  const snapshotUrl = `https://www.facebook.com/ads/archive/render_ad/?id=${adId}&access_token=${metaToken}`;

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

    const result = { video, image };
    if (cache) {
      try {
        await cache.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });
      } catch {
        // écriture cache échouée, on renvoie quand même le résultat
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Impossible de contacter ScrapingBee : ${err.message || 'erreur inconnue'}` },
      { status: 502 }
    );
  }
}
