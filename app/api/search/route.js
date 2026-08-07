import { NextResponse } from 'next/server';

const EU_COUNTRIES = ['FR', 'DE', 'ES', 'IT', 'BE', 'NL', 'PT', 'PL', 'SE', 'IE'];
const FIELDS = [
  'id',
  'page_name',
  'ad_creative_bodies',
  'ad_delivery_start_time',
  'ad_delivery_stop_time',
  'ad_snapshot_url',
  'spend',
  'impressions',
  'currency',
  'publisher_platforms',
].join(',');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ error: 'Paramètre "keyword" manquant' }, { status: 400 });
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'META_ACCESS_TOKEN manquant côté serveur (variable d\'environnement)' },
      { status: 500 }
    );
  }

  const url = new URL('https://graph.facebook.com/v19.0/ads_archive');
  url.searchParams.set('search_terms', keyword);
  url.searchParams.set('ad_type', 'ALL');
  url.searchParams.set('ad_active_status', 'ACTIVE');
  url.searchParams.set('ad_reached_countries', JSON.stringify(EU_COUNTRIES));
  url.searchParams.set('fields', FIELDS);
  url.searchParams.set('limit', '50');
  url.searchParams.set('access_token', token);

  try {
    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Erreur Meta Ad Library API' },
        { status: res.status }
      );
    }

    return NextResponse.json({ results: data.data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Impossible de contacter Meta' }, { status: 502 });
  }
}
