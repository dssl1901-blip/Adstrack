'use client';

import { useState } from 'react';
import styles from './page.module.css';
import FilterBar from './FilterBar';

const DEFAULT_COUNTRIES = ['FR', 'DE', 'ES', 'IT', 'BE', 'NL', 'PT', 'PL', 'SE', 'IE'];

const DEFAULT_FILTERS = {
  status: 'ACTIVE',
  countries: DEFAULT_COUNTRIES,
  mediaType: 'ALL',
  platforms: [],
  dateMin: '',
  dateMax: '',
  minDaysActive: '',
};

function daysLive(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(0, Math.round((now - start) / (1000 * 60 * 60 * 24)));
}

function spendMidpoint(spend) {
  if (!spend || !spend.lower_bound) return 0;
  const lower = Number(spend.lower_bound) || 0;
  const upper = Number(spend.upper_bound) || lower;
  return (lower + upper) / 2;
}

export default function Ads() {
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        keyword,
        status: filters.status,
        countries: filters.countries.join(','),
        mediaType: filters.mediaType,
      });
      if (filters.platforms.length) params.set('platforms', filters.platforms.join(','));
      if (filters.dateMin) params.set('dateMin', filters.dateMin);
      if (filters.dateMax) params.set('dateMax', filters.dateMax);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      let list = data.results || [];

      const minDays = Number(filters.minDaysActive);
      if (minDays > 0) {
        list = list.filter((ad) => {
          const live = daysLive(ad.ad_delivery_start_time);
          return live !== null && live >= minDays;
        });
      }

      const sorted = list.sort((a, b) => spendMidpoint(b.spend) - spendMidpoint(a.spend));
      setResults(sorted);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const maxSpend = Math.max(1, ...results.map((r) => spendMidpoint(r.spend)));

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Ads</h1>
        <p className={styles.tagline}>
          Radar produit — pubs actives en Europe, triées par intensité de diffusion.
        </p>
      </header>

      <form className={styles.searchBar} onSubmit={handleSearch}>
        <input
          className={styles.input}
          type="text"
          placeholder="ex : lampe led, tapis yoga, montre connectée…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Scan en cours…' : 'Scanner'}
        </button>
      </form>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && <div className={styles.error}>Le scan a échoué : {error}</div>}

      {!loading && searched && !error && results.length === 0 && (
        <div className={styles.empty}>
          Aucun signal détecté pour « {keyword} » avec ces filtres. Essaie un terme plus large ou élargis les filtres.
        </div>
      )}

      <ul className={styles.results}>
        {results.map((ad, i) => {
          const spend = spendMidpoint(ad.spend);
          const intensity = Math.max(0.08, spend / maxSpend);
          const live = daysLive(ad.ad_delivery_start_time);
          return (
            <li key={ad.id || i} className={styles.card}>
              <div className={styles.signal} style={{ opacity: intensity }} aria-hidden="true" />
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.pageName}>{ad.page_name || 'Annonceur inconnu'}</span>
                  {live !== null && <span className={styles.liveBadge}>{live} j en diffusion</span>}
                </div>

                <p className={styles.adText}>
                  {(ad.ad_creative_bodies && ad.ad_creative_bodies[0]) ||
                    'Pas de texte disponible pour cette annonce.'}
                </p>

                <div className={styles.cardFoot}>
                  <span className={styles.metric}>
                    Spend&nbsp;:{' '}
                    <strong>
                      {ad.spend
                        ? `${ad.spend.lower_bound}–${ad.spend.upper_bound} ${ad.currency || 'EUR'}`
                        : 'n/a'}
                    </strong>
                  </span>
                  <span className={styles.metric}>
                    Impressions&nbsp;:{' '}
                    <strong>
                      {ad.impressions
                        ? `${ad.impressions.lower_bound}–${ad.impressions.upper_bound}`
                        : 'n/a'}
                    </strong>
                  </span>
                  {ad.ad_snapshot_url && (
                    <a className={styles.link} href={ad.ad_snapshot_url} target="_blank" rel="noreferrer">
                      Voir la pub ↗
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
