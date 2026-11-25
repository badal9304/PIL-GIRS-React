'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/entities/notification';
import { useSettings, useSettingsActions } from '@/features/settings';
import { useSession } from '@/entities/user';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { LANGUAGES } from '@/shared/lib/phraseTranslator';

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

const avatar = 'rounded-full bg-accent text-onaccent inline-flex items-center justify-center font-semibold flex-none';
const check = 'flex-none w-4 text-accent font-bold text-center';
const segBtn =
  'unstyled box-border cursor-pointer h-6.5 px-2.5 rounded-[4px] text-[12px] font-medium text-muted inline-flex items-center gap-1.5 hover:text-ink ' +
  'aria-checked:bg-surface aria-checked:text-ink aria-checked:shadow-[0_1px_2px_rgba(0,0,0,.18)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1';

/** Profile menu: switch login, language (searchable panel), appearance (light / dark) and sign out. */
export function UserMenu(): ReactNode {
  const { t } = useTranslation('common');
  const { tx } = usePhrase();
  const toast = useToast();
  const { loginIndex, lang, theme } = useSettings();
  const { loginSwitched, languageChanged, themeChanged } = useSettingsActions();
  const session = useSession();
  const LOGINS = session.logins;
  const USER = { name: session.name, initials: session.initials };
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
    <div className="relative">
      <button
        aria-expanded={open ? 'true' : 'false'}
        aria-haspopup="menu"
        aria-label={t('User menu: {{name}}, {{role}}', { name: USER.name, role: tx(curRole) })}
        onClick={() => (open ? close() : (setOpen(true), setLangOpen(false), setLgq('')))}
        className={
          'group/u unstyled cursor-pointer flex items-center gap-2 h-9 pr-2.5 pl-1 border border-line rounded-[18px] box-border [transition:background_.12s,border-color_.12s] ' +
          'hover:bg-hover hover:border-bd active:bg-neutral aria-expanded:border-accent aria-expanded:shadow-[0_0_0_3px_rgba(0,113,183,.2)] ' +
          'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2'
        }
      >
        <span className={`${avatar} size-7 text-[12px]`}>{USER.initials}</span>
        <span className="flex flex-col leading-[14px]">
          <span className="text-[12px] font-semibold">{tx(USER.name)}</span>
          <span className="text-[12px] text-muted">{tx(curRole)}</span>
        </span>
        <svg
          {...ic16}
          width={14}
          height={14}
          strokeWidth={2}
          className="text-muted [transition:transform_.15s_ease] group-aria-expanded/u:[transform:rotate(180deg)]"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <>
          <div aria-hidden="true" onClick={close} className="fixed inset-0 z-29" />
          <div
            role="menu"
            aria-label={t('User menu')}
            className="absolute top-11 end-0 z-30 w-74 max-w-[calc(100vw-24px)] p-1.5 bg-surface border border-line rounded-[10px] box-border shadow-[0_12px_32px_rgba(22,26,33,.16)] dark:shadow-[0_16px_40px_rgba(0,0,0,.6)]"
          >
            {!langOpen ? (
              <>
                <div className="flex items-center gap-2.5 pt-2 px-2.5 pb-2.5">
                  <span className={`${avatar} size-9 text-[13px]`}>{USER.initials}</span>
                  <span className="mi-txt">
                    <span className="font-semibold leading-[20px]">{tx(USER.name)}</span>
                    <span className="mi-sub">{t('{{count}} logins · roles from LMS IAM', { count: LOGINS.length })}</span>
                  </span>
                </div>
                <div className="menu-sep" />
                <div className="k pt-1.5 px-2.5 pb-1">{t('Switch login')}</div>
                {LOGINS.map((g, i) => (
                  <button
                    key={g.code}
                    className="mi"
                    role="menuitemradio"
                    aria-checked={loginIndex === i ? 'true' : 'false'}
                    onClick={() => {
                      loginSwitched(i);
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
                    <span aria-hidden="true" className={check}>
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
                    <span className="mi-lbl">{t('Language')}</span>
                    <span className="mi-sub" translate="no">
                      {langName}
                    </span>
                  </span>
                  <svg {...ic16} strokeWidth={2} className="flex-none text-muted">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
                <div className="mi cursor-default hover:bg-transparent" role="none">
                  <svg {...ic16}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v18" />
                    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
                  </svg>
                  <span className="mi-txt">
                    <span className="mi-lbl">{t('Appearance')}</span>
                  </span>
                  <div
                    className="inline-flex flex-none ms-auto p-0.5 gap-0.5 rounded-[6px] bg-neutral"
                    role="radiogroup"
                    aria-label={t('Theme')}
                  >
                    <button
                      role="radio"
                      aria-checked={theme === 'dark' ? 'false' : 'true'}
                      onClick={() => themeChanged('light')}
                      className={segBtn}
                    >
                      <svg {...ic16} width={14} height={14} strokeWidth={2}>
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                      </svg>
                      <span>{t('Light')}</span>
                    </button>
                    <button
                      role="radio"
                      aria-checked={theme === 'dark' ? 'true' : 'false'}
                      onClick={() => themeChanged('dark')}
                      className={segBtn}
                    >
                      <svg {...ic16} width={14} height={14} strokeWidth={2}>
                        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                      </svg>
                      <span>{t('Dark')}</span>
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
                  <span className="mi-lbl">{t('Sign out')}</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 pt-0.5 px-1 pb-2">
                  <button
                    className="btn btn-icon btn-sm w-8 p-0 justify-center"
                    aria-label={t('Back to profile menu')}
                    onClick={() => (setLangOpen(false), setLgq(''))}
                  >
                    <svg {...ic16} strokeWidth={2}>
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <span className="font-semibold">{t('Language')}</span>
                </div>
                <div className="pt-0 px-1.5 pb-1.5">
                  <input
                    ref={langInput}
                    className="input w-full h-8.5"
                    placeholder={t('Search language')}
                    aria-label={t('Search language')}
                    autoComplete="off"
                    value={lgq}
                    onChange={(e) => setLgq(e.target.value)}
                  />
                </div>
                <div className="max-h-70 overflow-y-auto overscroll-contain" role="group" aria-label={t('Languages')} translate="no">
                  {langs.map((g) => (
                    <button
                      key={g.code}
                      className="mi"
                      role="menuitemradio"
                      aria-checked={lang === g.code ? 'true' : 'false'}
                      onClick={() => {
                        if (g.code !== lang) languageChanged(g.code);
                        close();
                      }}
                    >
                      <span className="mi-txt">
                        <span className="mi-lbl" lang={g.code}>
                          {g.label}
                        </span>
                        <span className="mi-sub">{g.english}</span>
                      </span>
                      <span aria-hidden="true" className={check}>
                        {lang === g.code ? '✓' : ''}
                      </span>
                    </button>
                  ))}
                  {!langs.length ? (
                    <div className="py-3 px-2.5 text-muted">{t('No language matches “{{query}}”', { query: lgq })}</div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
