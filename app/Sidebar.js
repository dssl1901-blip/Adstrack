'use client';

import { useState } from 'react';
import styles from './sidebar.module.css';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'ads',
    label: 'Ads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="12" cy="12" r="8" strokeOpacity="0.5" />
        <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sidebar({ active = 'home' }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09090c" strokeWidth="2.4">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="8.5" />
            </svg>
          </span>
          {!collapsed && <span className={styles.brandName}>AdScout</span>}
        </div>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {!collapsed && <div className={styles.sectionLabel}>Vue d&rsquo;ensemble</div>}

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            href={item.key === 'home' ? '/' : `/${item.key}`}
            className={`${styles.navItem} ${active === item.key ? styles.active : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}
