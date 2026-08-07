'use client';

import { useEffect, useState } from 'react';
import styles from './watchlist.module.css';

const STORAGE_KEY = 'adscout_watchlist';

const EMPTY_FORM = {
  productName: '',
  pageName: '',
  spend: '',
  views: '',
  adLink: '',
  videoUrl: '',
  notes: '',
};

function loadEntries() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage plein ou indisponible — on ignore silencieusement
  }
}

export default function Watchlist() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [localFileWarning, setLocalFileWarning] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveEntries(entries);
  }, [entries, loaded]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    updateField('videoUrl', objectUrl);
    setLocalFileWarning(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.productName.trim()) return;
    const entry = { ...form, id: Date.now(), addedAt: new Date().toISOString() };
    setEntries((prev) => [entry, ...prev]);
    setForm(EMPTY_FORM);
    setLocalFileWarning(false);
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Watchlist</h1>
        <p className={styles.tagline}>
          Ajoute à la main les pubs que tu repères sur l&rsquo;Ad Library, en attendant que l&rsquo;accès API soit validé.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <label className={styles.field}>
            Produit <span className={styles.req}>*</span>
            <input
              type="text"
              placeholder="ex : lampe led nuage"
              value={form.productName}
              onChange={(e) => updateField('productName', e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            Annonceur / Page
            <input
              type="text"
              placeholder="ex : GlowHome Store"
              value={form.pageName}
              onChange={(e) => updateField('pageName', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            Dépenses estimées (€)
            <input
              type="text"
              placeholder="ex : 1000-5000"
              value={form.spend}
              onChange={(e) => updateField('spend', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            Vues / Impressions
            <input
              type="text"
              placeholder="ex : 250K"
              value={form.views}
              onChange={(e) => updateField('views', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            Lien de la pub
            <input
              type="url"
              placeholder="https://facebook.com/ads/library/?id=..."
              value={form.adLink}
              onChange={(e) => updateField('adLink', e.target.value)}
            />
          </label>

          <label className={styles.field}>
            Lien vidéo (externe, persiste après reload)
            <input
              type="url"
              placeholder="https://...mp4 ou lien de la pub avec vidéo"
              value={form.videoUrl.startsWith('blob:') ? '' : form.videoUrl}
              onChange={(e) => {
                updateField('videoUrl', e.target.value);
                setLocalFileWarning(false);
              }}
            />
          </label>
        </div>

        <label className={styles.fileField}>
          Ou uploader un fichier vidéo local
          <input type="file" accept="video/*" onChange={handleFileChange} />
        </label>
        {localFileWarning && (
          <p className={styles.warning}>
            ⚠ Fichier local : cette vidéo ne survivra pas à un rechargement de page. Utilise un lien externe pour un stockage durable.
          </p>
        )}

        <label className={styles.field}>
          Notes
          <textarea
            rows={2}
            placeholder="pourquoi ce produit t'intéresse, angle marketing repéré..."
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </label>

        <button type="submit" className={styles.submit}>
          Ajouter à la watchlist
        </button>
      </form>

      {entries.length === 0 && loaded && (
        <p className={styles.empty}>Ta watchlist est vide pour l&rsquo;instant — ajoute ta première pub ci-dessus.</p>
      )}

      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.card}>
            {entry.videoUrl && (
              <video className={styles.video} src={entry.videoUrl} controls preload="metadata" />
            )}
            <div className={styles.cardBody}>
              <div className={styles.cardTop}>
                <span className={styles.productName}>{entry.productName}</span>
                <button className={styles.remove} onClick={() => removeEntry(entry.id)} aria-label="Supprimer">
                  ✕
                </button>
              </div>
              {entry.pageName && <span className={styles.pageName}>{entry.pageName}</span>}

              <div className={styles.metrics}>
                {entry.spend && (
                  <span className={styles.metric}>
                    Spend&nbsp;: <strong>{entry.spend}</strong>
                  </span>
                )}
                {entry.views && (
                  <span className={styles.metric}>
                    Vues&nbsp;: <strong>{entry.views}</strong>
                  </span>
                )}
              </div>

              {entry.notes && <p className={styles.notes}>{entry.notes}</p>}

              {entry.adLink && (
                <a className={styles.link} href={entry.adLink} target="_blank" rel="noreferrer">
                  Voir la pub d&rsquo;origine ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
