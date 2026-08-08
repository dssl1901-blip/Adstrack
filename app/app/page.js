import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Vue d&rsquo;ensemble</h1>
        <p className={styles.tagline}>
          AdScout surveille la Meta Ad Library pour repérer les produits qui scalent en Europe.
        </p>
      </header>

      <a href="/ads" className={styles.ctaCard}>
        <span className={styles.ctaIcon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3.2" />
            <circle cx="12" cy="12" r="8" strokeOpacity="0.5" />
          </svg>
        </span>
        <span>
          <span className={styles.ctaTitle}>Lancer une recherche</span>
          <span className={styles.ctaSub}>Scanner les pubs actives par mot-clé</span>
        </span>
        <span className={styles.ctaArrow} aria-hidden="true">→</span>
      </a>
    </main>
  );
}
