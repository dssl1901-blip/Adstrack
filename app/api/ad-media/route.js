import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const runtime = 'nodejs';
export const maxDuration = 60;

let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 800, height: 1000 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  return browserPromise;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const snapshotUrl = searchParams.get('url');

  if (!snapshotUrl || !snapshotUrl.startsWith('https://www.facebook.com/')) {
    return NextResponse.json({ error: 'URL de snapshot invalide' }, { status: 400 });
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    );

    await page.goto(snapshotUrl, { waitUntil: 'networkidle2', timeout: 25000 });

    await page
      .waitForSelector('video, img[src*="scontent"]', { timeout: 8000 })
      .catch(() => {});

    const media = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video && video.src) {
        return { type: 'video', url: video.src, poster: video.poster || null };
      }

      const imgs = Array.from(document.querySelectorAll('img'))
        .filter((img) => img.src && img.naturalWidth > 120 && img.naturalHeight > 120)
        .sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight);

      if (imgs.length) {
        return { type: 'image', url: imgs[0].src };
      }
      return null;
    });

    await page.close();

    if (!media) {
      return NextResponse.json({ error: 'Aucun média détecté sur cette pub' }, { status: 404 });
    }

    if (media.type === 'video') {
      return NextResponse.json({ video: media.url, image: media.poster });
    }
    return NextResponse.json({ image: media.url });
  } catch (err) {
    if (page) await page.close().catch(() => {});
    return NextResponse.json(
      { error: `Rendu échoué : ${err.message || 'erreur inconnue'}` },
      { status: 502 }
    );
  }
}
