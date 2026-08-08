'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { enqueue } from './mediaQueue';

export default function AdPreview({ ad }) {
  const [media, setMedia] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!ad.ad_snapshot_url) {
      setStatus('empty');
      return;
    }
    let cancelled = false;
    setStatus('loading');

    enqueue(() => fetch(`/api/ad-media?url=${encodeURIComponent(ad.ad_snapshot_url)}`).then((res) => res.json()))
      .then((data) => {
        if (cancelled) return;
        if (data.image || data.video) {
          setMedia(data);
          setStatus('ready');
        } else {
          setStatus('fallback');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('fallback');
      });

    return () => {
      cancelled = true;
    };
  }, [ad.ad_snapshot_url]);

  if (status === 'empty') return null;

  if (status === 'loading') {
    return <div className={`${styles.previewWrap} ${styles.previewLoading}`} aria-hidden="true" />;
  }

  if (status === 'ready' && media) {
    return (
      <div className={styles.mediaWrap}>
        {media.video ? (
          <video className={styles.media} src={media.video} controls preload="metadata" poster={media.image || undefined} />
        ) : (
          <img className={styles.media} src={media.image} alt="" loading="lazy" />
        )}
      </div>
    );
  }

  return (
    <a className={styles.previewWrap} href={ad.ad_snapshot_url} target="_blank" rel="noreferrer">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="m9.5 9.5 6 3-6 3v-6Z" strokeLinejoin="round" />
      </svg>
      <span>Voir l&rsquo;aperçu Meta</span>
    </a>
  );
}
