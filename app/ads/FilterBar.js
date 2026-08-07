'use client';

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
};

export default function FilterBar({ filters, onChange }) {
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
    <div className={styles.bar}>
      <span className={styles.label}>Filtrer par :</span>

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
  );
}
