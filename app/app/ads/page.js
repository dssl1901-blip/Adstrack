'use client';

import { useState } from 'react';
import styles from './page.module.css';
import FilterBar from './FilterBar';
import AdPreview from './AdPreview';

const DEFAULT_COUNTRIES = ['FR', 'DE', 'ES', 'IT', 'BE', 'NL', 'PT', 'PL', 'SE', 'IE'];

const DEFAULT_FILTERS = {
  status: 'ACTIVE',
  countries: DEFAULT_COUNTRIES,
  mediaType: 'ALL',
  platforms: [],
  dateMin: '',
  dateMax: '',
  minDaysActive: '',
  maxDaysActive: '',
  cpmMin: '',
  cpmMax: '',
  reachMin: '',
  reachMax: '',
  spendMin: '',
  spendMax: '',
  gender: 'ALL',
  ageRange: 'ALL',
  activeAdsMin: '',
  activeAdsMax: '',
};

function impressionsMidpoint(impressions) {
  if (!impressions || !impressions.lower_bound) return 0;
  const lower = Number(impressions.lower_bound) || 0;
  const upper = Number(impressions.upper_bound) || lower;
  return (lower + upper) / 2;
}

function estimatedCpm(ad) {
  const spend = spendMidpointStandalone(ad.spend);
  const impressions = impressionsMidpoint(ad.impressions);
  if (!spend || !impressions) return null;
  return (spend / impressions) * 1000;
}

function spendMidpointStandalone(spend) {
  if (!spend || !spend.lower_bound) return 0;
  const lower = Number(spend.lower_bound) || 0;
  const upper = Number(spend.upper_bound) || lower;
  return (lower + upper) / 2;
}

function genderMatches(ad, gender) {
  if (gender === 'ALL') return true;
  const breakdown = ad.age_country_gender_reach_breakdown;
  if (!breakdown) return false;
  return breakdown.some((entry) =>
    (entry.age_gender_breakdowns || []).some(
      (g) => g.gender === gender && Number(g.reach) > 0
    )
  );
}

function ageMatches(ad, ageRange) {
  if (ageRange === 'ALL') return true;
  const breakdown = ad.age_country_gender_reach_breakdown;
  if (!breakdown) return false;
  return breakdown.some((entry) =>
    (entry.age_gender_breakdowns || []).some(
      (g) => g.age_range === ageRange && Number(g.reach) > 0
    )
  );
}

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
      const maxDays = Number(filters.maxDaysActive);
      if (maxDays > 0) {
        list = list.filter((ad) => {
          const live = daysLive(ad.ad_delivery_start_time);
          return live !== null && live <= maxDays;
        });
      }

      const cpmMin = Number(filters.cpmMin);
      if (cpmMin > 0) {
        list = list.filter((ad) => {
          const cpm = estimatedCpm(ad);
          return cpm !== null && cpm >= cpmMin;
        });
      }
      const cpmMax = Number(filters.cpmMax);
      if (cpmMax > 0) {
        list = list.filter((ad) => {
          const cpm = estimatedCpm(ad);
          return cpm !== null && cpm <= cpmMax;
        });
      }

      const reachMin = Number(filters.reachMin);
      if (reachMin > 0) {
        list = list.filter((ad) => Number(ad.eu_total_reach) >= reachMin);
      }
      const reachMax = Number(filters.reachMax);
      if (reachMax > 0) {
        list = list.filter((ad) => Number(ad.eu_total_reach) <= reachMax);
      }

      const spendMin = Number(filters.spendMin);
      if (spendMin > 0) {
        list = list.filter((ad) => spendMidpoint(ad.spend) >= spendMin);
      }
      const spendMax = Number(filters.spendMax);
      if (spendMax > 0) {
        list = list.filter((ad) => spendMidpoint(ad.spend) <= spendMax);
      }

      if (filters.gender !== 'ALL') {
        list = list.filter((ad) => genderMatches(ad, filters.gender));
      }

      if (filters.ageRange !== 'ALL') {
        list = list.filter((ad) => ageMatches(ad, filters.ageRange));
      }

      const activeAdsMin = Number(filters.activeAdsMin);
      const activeAdsMax = Number(filters.activeAdsMax);
      if (activeAdsMin > 0 || activeAdsMax > 0) {
        const counts = {};
        list.forEach((ad) => {
          const key = ad.page_name || '—';
          counts[key] = (counts[key] || 0) + 1;
        });
        list = list.filter((ad) => {
          const count = counts[ad.page_name || '—'];
          if (activeAdsMin > 0 && count < activeAdsMin) return false;
          if (activeAdsMax > 0 && count > activeAdsMax) return false;
          return true;
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
          const live = daysLive(ad.ad_delivery_start_time);
          return (
            <li key={ad.id || i} className={styles.card}>
              <AdPreview ad={ad} />
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
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
