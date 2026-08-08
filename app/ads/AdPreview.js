'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import { enqueue } from './mediaQueue';

export default function AdPreview({ ad, onLoaded }) {
  const [media, setMedia] = useState(null);
  const [status, setStatus] = useState('idle');
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (!ad.id) {
      setStatus('empty');
      return;
    }
    let cancelled = false;
    setStatus('loading');

    enqueue(() => fetch(`/api/ad-media?id=${ad.id}`).then((res) => res.json()))
      .then((data) => {
        if (cancelled) return;
        if (data.image || data.video) {
          setMedia(data);
          setStatus('ready');
          if (onLoaded) onLoaded(ad.id, data);
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
  }, [visible, ad.id]);

  if (status === 'empty') return null;

  if (status === 'idle' || status === 'loading') {
    return (
      <div ref={rootRef} className={`${styles.previewWrap} ${styles.previewLoading}`} aria-hidden="true" />
    );
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
    <a className={styles.previewWrap} href={ad.meta_public_url || '#'} target="_blank" rel="noreferrer">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="m9.5 9.5 6 3-6 3v-6Z" strokeLinejoin="round" />
      </svg>
      <span>Voir l&rsquo;aperçu Meta</span>
    </a>
  );
}
