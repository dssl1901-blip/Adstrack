'use client';

import { useState } from 'react';
import styles from './filterbar.module.css';

const COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'ES', label: 'Espagne' },
  { code: 'IT', label: 'Italie' },
  { code: 'BE', label: 'Belgique' },
  { code: 'NL', label: 'Pays-Bas' },
  { code: 'PT', label: 'Portugal' },
  { code: 'PL', label: 'Pologne' },
  { code: 'SE', label: 'Suède' },
  { code: 'IE', label: 'Irlande' },
  { code: 'GB', label: 'Royaume-Uni' },
];

const AGE_RANGES = [
  ['13-17', '13–17 ans'],
  ['18-24', '18–24 ans'],
  ['25-34', '25–34 ans'],
  ['35-44', '35–44 ans'],
  ['45-54', '45–54 ans'],
  ['55-64', '55–64 ans'],
  ['65+', '65 ans et +'],
];

const ICONS = {
  status: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  countries: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.8 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.8-3.8-9s1.3-6.4 3.8-9Z" />
    </svg>
  ),
  media: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="m9 9.5 6 3.2-6 3.2v-6.4Z" strokeLinejoin="round" />
    </svg>
  ),
  platform: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  ),
  date: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" strokeLinecap="round" />
    </svg>
  ),
  duration: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2M9.5 2.5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cpm: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15.5V8.5M9 8.5h3.2a2 2 0 1 1 0 4H9M15 8.5v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  reach: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="2.4" />
      <path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9" strokeLinecap="round" />
    </svg>
  ),
  spend: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 15h3a1.7 1.7 0 0 0 0-3.4h-1a1.7 1.7 0 0 1 0-3.4h3M12 7.2v1M12 15.6v1.2" strokeLinecap="round" />
    </svg>
  ),
  gender: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="14" r="5" />
      <path d="M17 3l3 0 0 3M20 3l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  age: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c1-3.6 3.6-5.6 6.5-5.6s5.5 2 6.5 5.6" strokeLinecap="round" />
    </svg>
  ),
};

export default function FilterBar({ filters, onChange }) {
  const [tab, setTab] = useState('ads');

  function set(patch) {
    onChange({ ...filters, ...patch });
  }

  function toggleCountry(code) {
    const has = filters.countries.includes(code);
    const next = has
      ? filters.countries.filter((c) => c !== code)
      : [...filters.countries, code];
    set({ countries: next });
  }

  function togglePlatform(code) {
    const has = filters.platforms.includes(code);
    const next = has
      ? filters.platforms.filter((c) => c !== code)
      : [...filters.platforms, code];
    set({ platforms: next });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        <span className={styles.label}>Filtrer par :</span>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'ads' ? styles.tabActive : ''}`}
          onClick={() => setTab('ads')}
        >
          Ads
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === 'reach' ? styles.tabActive : ''}`}
          onClick={() => setTab('reach')}
        >
          Portée &amp; dépenses
        </button>
      </div>

      {tab === 'ads' && (
        <div className={styles.bar}>

      <details className={styles.filter}>
        <summary>
          {ICONS.status}
          Statut
          <span className={styles.chevron}>⌄</span>
        </summary>
        <div className={styles.panel}>
          {[
            ['ACTIVE', 'Actives'],
            ['INACTIVE', 'Inactives'],
            ['ALL', 'Toutes'],
          ].map(([value, label]) => (
            <label key={value} className={styles.radioRow}>
              <input
                type="radio"
                name="status"
                checked={filters.status === value}
                onChange={() => set({ status: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </details>

      <details className={styles.filter}>
        <summary>
          {ICONS.countries}
          Pays
          <span className={styles.chevron}>⌄</span>
        </summary>
        <div className={`${styles.panel} ${styles.panelWide}`}>
          {COUNTRIES.map((c) => (
            <label key={c.code} className={styles.checkRow}>
              <input
                type="checkbox"
                checked={filters.countries.includes(c.code)}
                onChange={() => toggleCountry(c.code)}
              />
              {c.label}
            </label>
          ))}
        </div>
      </details>

      <details className={styles.filter}>
        <summary>
          {ICONS.media}
          Type de média
          <span className={styles.chevron}>⌄</span>
        </summary>
        <div className={styles.panel}>
          {[
            ['ALL', 'Tous'],
            ['IMAGE', 'Image'],
            ['VIDEO', 'Vidéo'],
          ].map(([value, label]) => (
            <label key={value} className={styles.radioRow}>
              <input
                type="radio"
                name="mediaType"
                checked={filters.mediaType === value}
                onChange={() => set({ mediaType: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </details>

      <details className={styles.filter}>
        <summary>
          {ICONS.platform}
          Plateforme
          <span className={styles.chevron}>⌄</span>
        </summary>
        <div className={styles.panel}>
          {[
            ['FACEBOOK', 'Facebook'],
            ['INSTAGRAM', 'Instagram'],
          ].map(([value, label]) => (
            <label key={value} className={styles.checkRow}>
              <input
                type="checkbox"
                checked={filters.platforms.includes(value)}
                onChange={() => togglePlatform(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </details>

      <details className={styles.filter}>
        <summary>
          {ICONS.date}
          Date de création
          <span className={styles.chevron}>⌄</span>
        </summary>
        <div className={styles.panel}>
          <label className={styles.fieldRow}>
            Depuis
            <input
              type="date"
              value={filters.dateMin}
              onChange={(e) => set({ dateMin: e.target.value })}
            />
          </label>
          <label className={styles.fieldRow}>
            Jusqu&rsquo;au
            <input
              type="date"
              value={filters.dateMax}
              onChange={(e) => set({ dateMax: e.target.value })}
            />
          </label>
        </div>
      </details>

      <details className={styles.filter}>
        <summary>
          {ICONS.duration}
          Actives depuis
          <span className={styles.chevron}>⌄</span>
        </summary>
        <div className={styles.panel}>
          <label className={styles.fieldRow}>
            Minimum (jours)
            <input
              type="number"
              min="0"
              placeholder="ex : 21"
              value={filters.minDaysActive}
              onChange={(e) => set({ minDaysActive: e.target.value })}
            />
          </label>
        </div>
      </details>
        </div>
      )}

      {tab === 'reach' && (
        <div className={styles.bar}>
          <details className={styles.filter}>
            <summary>
              {ICONS.cpm}
              CPM max (estimé)
              <span className={styles.chevron}>⌄</span>
            </summary>
            <div className={styles.panel}>
              <label className={styles.fieldRow}>
                CPM max (€)
                <input
                  type="number"
                  min="0"
                  placeholder="ex : 15"
                  value={filters.cpmMax}
                  onChange={(e) => set({ cpmMax: e.target.value })}
                />
              </label>
              <p className={styles.hint}>Estimé à partir du spend et des impressions.</p>
            </div>
          </details>

          <details className={styles.filter}>
            <summary>
              {ICONS.reach}
              Portée Ad min
              <span className={styles.chevron}>⌄</span>
            </summary>
            <div className={styles.panel}>
              <label className={styles.fieldRow}>
                Portée minimum
                <input
                  type="number"
                  min="0"
                  placeholder="ex : 50000"
                  value={filters.reachMin}
                  onChange={(e) => set({ reachMin: e.target.value })}
                />
              </label>
              <p className={styles.hint}>Portée UE réelle, disponible uniquement si Meta la fournit pour la pub.</p>
            </div>
          </details>

          <details className={styles.filter}>
            <summary>
              {ICONS.spend}
              Dépenses Ad min
              <span className={styles.chevron}>⌄</span>
            </summary>
            <div className={styles.panel}>
              <label className={styles.fieldRow}>
                Spend minimum (€)
                <input
                  type="number"
                  min="0"
                  placeholder="ex : 1000"
                  value={filters.spendMin}
                  onChange={(e) => set({ spendMin: e.target.value })}
                />
              </label>
            </div>
          </details>

          <details className={styles.filter}>
            <summary>
              {ICONS.gender}
              Genre
              <span className={styles.chevron}>⌄</span>
            </summary>
            <div className={styles.panel}>
              {[
                ['ALL', 'Tous'],
                ['female', 'Femme'],
                ['male', 'Homme'],
                ['unknown', 'Non précisé'],
              ].map(([value, label]) => (
                <label key={value} className={styles.radioRow}>
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.gender === value}
                    onChange={() => set({ gender: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </details>

          <details className={styles.filter}>
            <summary>
              {ICONS.age}
              Âge
              <span className={styles.chevron}>⌄</span>
            </summary>
            <div className={`${styles.panel} ${styles.panelWide}`}>
              <label className={styles.checkRow}>
                <input
                  type="radio"
                  name="age"
                  checked={filters.ageRange === 'ALL'}
                  onChange={() => set({ ageRange: 'ALL' })}
                />
                Tous
              </label>
              {AGE_RANGES.map(([value, label]) => (
                <label key={value} className={styles.checkRow}>
                  <input
                    type="radio"
                    name="age"
                    checked={filters.ageRange === value}
                    onChange={() => set({ ageRange: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
