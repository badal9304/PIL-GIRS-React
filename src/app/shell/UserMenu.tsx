import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/context';
import { LANGUAGES } from '../../i18n/translator';
import { useSettings } from '../providers/contexts';
import { LOGINS, USER } from '../session/user';
import { useToast } from '../providers/contexts';

const ic16 = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;
const mark = { flex: 'none', width: '16px', color: 'var(--accent)', fontWeight: 700, textAlign: 'center' } as const;

/** Profile menu: switch login, language (searchable panel), appearance (light / dark) and sign out. */
export function UserMenu() {
  const { t, tx } = useI18n();
  const toast = useToast();
  const { loginIndex, setLoginIndex, lang, setLang, theme, setTheme } = useSettings();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lgq, setLgq] = useState('');
  const langInput = useRef<HTMLInputElement>(null);
  const login = LOGINS[loginIndex] || LOGINS[0];
  const curRole = login.role + ' · ' + login.code;

  const close = () => {
    setOpen(false);
    setLangOpen(false);
    setLgq('');
  };
  useEffect(() => {
    if (langOpen) langInput.current?.focus();
  }, [langOpen]);

  const query = lgq.trim().toLowerCase();
  const langs = LANGUAGES.filter((l) => (l.code + ' ' + l.label + ' ' + l.english).toLowerCase().includes(query));
  const langName = (LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]).label;

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="ubtn"
        aria-expanded={open ? 'true' : 'false'}
        aria-haspopup="menu"
        aria-label={t(`User menu: ${USER.name}, ${curRole}`)}
        onClick={() => (open ? close() : (setOpen(true), setLangOpen(false), setLgq('')))}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'var(--onaccent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            flex: 'none',
          }}
        >
          {USER.initials}
        </span>
        <span className="gutxt" style={{ display: 'flex', flexDirection: 'column', lineHeight: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{tx(USER.name)}</span>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx(curRole)}</span>
        </span>
        <svg className="gutxt uchev" {...ic16} width={14} height={14} strokeWidth={2} style={{ color: 'var(--muted)' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <>
          <div aria-hidden="true" onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
          <div className="menu" role="menu" aria-label={t('User menu')}>
            {!langOpen ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px 10px' }}>
                  <span
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: 'var(--onaccent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      flex: 'none',
                    }}
                  >
                    {USER.initials}
                  </span>
                  <span className="mi-txt">
                    <span style={{ fontWeight: 600, lineHeight: '20px' }}>{tx(USER.name)}</span>
                    <span className="mi-sub">{tx('2 logins · roles from LMS IAM')}</span>
                  </span>
                </div>
                <div className="menu-sep" />
                <div className="k" style={{ padding: '6px 10px 4px' }}>
                  {tx('Switch login')}
                </div>
                {LOGINS.map((g, i) => (
                  <button
                    key={g.code}
                    className="mi"
                    role="menuitemradio"
                    aria-checked={loginIndex === i ? 'true' : 'false'}
                    onClick={() => {
                      setLoginIndex(i);
                      close();
                      toast.show('Switched to ' + g.role + ' · ' + g.agency + '. Screens and actions follow this login.');
                    }}
                  >
                    <svg {...ic16}>
                      <rect x="3" y="7" width="18" height="13" rx="2" />
                      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="mi-txt">
                      <span className="mi-lbl">{tx(g.role)}</span>
                      <span className="mi-sub">{tx(g.agency)}</span>
                    </span>
                    <span aria-hidden="true" style={mark}>
                      {loginIndex === i ? '✓' : ''}
                    </span>
                  </button>
                ))}
                <div className="menu-sep" />
                <button className="mi" role="menuitem" aria-haspopup="true" onClick={() => setLangOpen(true)}>
                  <svg {...ic16}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
                  </svg>
                  <span className="mi-txt">
                    <span className="mi-lbl">{tx('Language')}</span>
                    <span className="mi-sub" translate="no">
                      {langName}
                    </span>
                  </span>
                  <svg {...ic16} strokeWidth={2} style={{ flex: 'none', color: 'var(--muted)' }}>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
                <div className="mi ap-row" role="none">
                  <svg {...ic16}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v18" />
                    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
                  </svg>
                  <span className="mi-txt">
                    <span className="mi-lbl">{tx('Appearance')}</span>
                  </span>
                  <div className="ap-seg" role="radiogroup" aria-label={t('Theme')}>
                    <button role="radio" aria-checked={theme === 'dark' ? 'false' : 'true'} onClick={() => setTheme('light')}>
                      <svg {...ic16} width={14} height={14} strokeWidth={2}>
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                      </svg>
                      <span>{tx('Light')}</span>
                    </button>
                    <button role="radio" aria-checked={theme === 'dark' ? 'true' : 'false'} onClick={() => setTheme('dark')}>
                      <svg {...ic16} width={14} height={14} strokeWidth={2}>
                        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                      </svg>
                      <span>{tx('Dark')}</span>
                    </button>
                  </div>
                </div>
                <div className="menu-sep" />
                <button
                  className="mi mi-danger"
                  role="menuitem"
                  onClick={() => {
                    close();
                    toast.show('Signed out of GIRS (prototype — no session is ended).');
                  }}
                >
                  <svg {...ic16}>
                    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
                    <path d="M10 17l-5-5 5-5" />
                    <path d="M5 12h11" />
                  </svg>
                  <span className="mi-lbl">{tx('Sign out')}</span>
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 4px 8px' }}>
                  <button
                    className="btn btn-icon btn-sm"
                    aria-label={t('Back to profile menu')}
                    onClick={() => (setLangOpen(false), setLgq(''))}
                    style={{ width: '32px', padding: 0, justifyContent: 'center' }}
                  >
                    <svg {...ic16} strokeWidth={2}>
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <span style={{ fontWeight: 600 }}>{tx('Language')}</span>
                </div>
                <div style={{ padding: '0 6px 6px' }}>
                  <input
                    ref={langInput}
                    className="input lg-q"
                    style={{ width: '100%', height: '34px' }}
                    placeholder={t('Search language')}
                    aria-label={t('Search language')}
                    autoComplete="off"
                    value={lgq}
                    onChange={(e) => setLgq(e.target.value)}
                  />
                </div>
                <div className="lg-list" role="group" aria-label={t('Languages')} translate="no">
                  {langs.map((g) => (
                    <button
                      key={g.code}
                      className="mi"
                      role="menuitemradio"
                      aria-checked={lang === g.code ? 'true' : 'false'}
                      onClick={() => {
                        if (g.code !== lang) setLang(g.code);
                        close();
                      }}
                    >
                      <span className="mi-txt">
                        <span className="mi-lbl" lang={g.code}>
                          {g.label}
                        </span>
                        <span className="mi-sub">{g.english}</span>
                      </span>
                      <span aria-hidden="true" style={mark}>
                        {lang === g.code ? '✓' : ''}
                      </span>
                    </button>
                  ))}
                  {!langs.length ? <div style={{ padding: '12px 10px', color: 'var(--muted)' }}>No language matches “{lgq}”</div> : null}
                </div>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
