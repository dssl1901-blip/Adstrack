'use client';

import styles from './detailpanel.module.css';

function daysLive(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(0, Math.round((now - start) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdDetailPanel({ ad, media, activeCount, onClose }) {
  if (!ad) return null;

  const live = daysLive(ad.ad_delivery_start_time);
  const isActive = !ad.ad_delivery_stop_time;
  const format = media?.video ? 'Vidéo' : media?.image ? 'Image' : 'Inconnu';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.pageName}>{ad.page_name || 'Annonceur inconnu'}</span>
            {activeCount > 1 && (
              <span className={styles.subLabel}>{activeCount} publicités dans cette recherche</span>
            )}
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {media?.video ? (
          <video className={styles.media} src={media.video} controls preload="metadata" poster={media.image || undefined} />
        ) : media?.image ? (
          <img className={styles.media} src={media.image} alt="" />
        ) : (
          <div className={styles.mediaEmpty}>Aperçu indisponible</div>
        )}

        <p className={styles.adText}>
          {(ad.ad_creative_bodies && ad.ad_creative_bodies[0]) || 'Pas de texte disponible pour cette annonce.'}
        </p>

        <section className={styles.section}>
          <h3>Signaux de performance</h3>
          <dl className={styles.grid}>
            <dt>Statut</dt>
            <dd>
              <span className={isActive ? styles.dotActive : styles.dotInactive} />
              {isActive ? 'En cours' : 'Terminée'}
            </dd>

            <dt>Durée de diffusion</dt>
            <dd>{live !== null ? `${live} jour${live > 1 ? 's' : ''}` : 'n/a'}</dd>

            <dt>Période active</dt>
            <dd>
              {formatDate(ad.ad_delivery_start_time) || 'n/a'} →{' '}
              {ad.ad_delivery_stop_time ? formatDate(ad.ad_delivery_stop_time) : "Aujourd'hui"}
            </dd>

            <dt>Portée UE</dt>
            <dd>{ad.eu_total_reach ? Number(ad.eu_total_reach).toLocaleString('fr-FR') : 'n/a'}</dd>

            <dt>Spend</dt>
            <dd>{ad.spend ? `${ad.spend.lower_bound}–${ad.spend.upper_bound} ${ad.currency || 'EUR'}` : 'n/a'}</dd>

            <dt>Impressions</dt>
            <dd>{ad.impressions ? `${ad.impressions.lower_bound}–${ad.impressions.upper_bound}` : 'n/a'}</dd>
          </dl>
        </section>

        <section className={styles.section}>
          <h3>Créatif &amp; liens</h3>
          <dl className={styles.grid}>
            <dt>Meta ID</dt>
            <dd className={styles.mono}>{ad.id}</dd>

            <dt>Format</dt>
            <dd>{format}</dd>

            <dt>Plateformes</dt>
            <dd>{(ad.publisher_platforms || []).join(', ') || 'n/a'}</dd>

            <dt>Publicité originale</dt>
            <dd>
              {ad.ad_snapshot_url ? (
                <a href={ad.ad_snapshot_url} target="_blank" rel="noreferrer" className={styles.link}>
                  Ouvrir dans Facebook ↗
                </a>
              ) : (
                'n/a'
              )}
            </dd>
          </dl>
        </section>
      </div>
    </div>
  );
}
