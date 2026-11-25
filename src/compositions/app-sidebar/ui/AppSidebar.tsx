'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings, useSettingsActions } from '@/features/settings';
import { HOME, NAV, type NavIcon } from '@/shared/constants/screens';
import { publicUrl } from '@/shared/lib/basePath';
import { cx } from '@/shared/lib/cx';
import { groupOf, normalizePath } from '@/shared/lib/routing';

const ic = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/** Menu group icons. */
const GROUP_ICON: Record<NavIcon, ReactNode> = {
  operations: (
    <svg className="size-5.5" {...ic}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  ),
  invoicing: (
    <svg className="size-5.5" {...ic}>
      <path d="M5 3h9l5 5v13H5z" />
      <path d="M14 3v5h5M8.5 12.5h7M8.5 16.5h7" />
    </svg>
  ),
  receivables: (
    <svg className="size-5.5" {...ic}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6.5 9v6M17.5 9v6" />
    </svg>
  ),
  control: (
    <svg className="size-5.5" {...ic}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-4.5" />
    </svg>
  ),
  'system-master': (
    <svg className="size-5.5" {...ic}>
      <path d="M3 6h10M17 6h4M3 12h4M11 12h10M3 18h12M19 18h2" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  'industry-master': (
    <svg className="size-5.5" {...ic}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  ),
};

const chevron = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const focusRing = 'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';

/**
 * Left navigation. Expanded: accordion of sections. Collapsed (64px rail): section icons that open
 * their screens in a flyout beside the rail; the rail only expands from the button at the bottom.
 */
export function AppSidebar(): ReactNode {
  const { t } = useTranslation('common');
  const { sidebarCollapsed: c, theme } = useSettings();
  const { sidebarToggled } = useSettingsActions();
  const pathname = normalizePath(usePathname());
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const activeGroup = groupOf(pathname)?.id || '';
  // expanded menu: the open section (defaults to the section of the open screen)
  const [accPick, setAcc] = useState<string | null>(null);
  const acc = accPick ?? activeGroup;
  // collapsed rail: flyout of one section; it belongs to the screen it was opened on
  const [flyState, setFly] = useState<{ id: string; top: number; at: string } | null>(null);
  const fly = c && flyState?.at === pathname ? flyState : null;

  // Esc closes the flyout
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFly(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const toggleGroup = (id: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (c) {
      const top = Math.round(e.currentTarget.getBoundingClientRect().top);
      setFly(fly?.id === id ? null : { id, top, at: pathname });
    } else setAcc(acc === id ? '' : id);
  };

  const sbLabel = c ? t('Expand side panel') : t('Collapse side panel');

  return (
    <aside
      id="gside"
      aria-label={t('Side panel')}
      className={cx(
        'flex-none bg-surface border-e border-e-line flex flex-col overflow-hidden box-border [transition:width_.18s_ease]',
        c ? 'w-16' : 'w-60',
      )}
    >
      <div
        className={cx('h-13 flex-none flex items-center gap-3 border-b border-b-line2 box-border', c ? 'justify-center p-0' : 'py-0 px-5')}
      >
        <span className="inline-flex rounded-[4px] py-0.5 px-1 bg-white dark:bg-transparent">
          <Image
            src={publicUrl(theme === 'dark' ? '/pil-logo-dark.png' : '/pil-logo.png')}
            alt="PIL"
            width={329}
            height={108}
            unoptimized
            priority
            className={cx('block h-6.5', c ? 'w-7.5 object-cover object-left' : 'w-auto')}
          />
        </span>
        {c ? null : (
          <>
            <span className="w-px h-5 bg-line" />
            <span className="text-[15px] font-bold tracking-[0.04em] text-accent">GIRS</span>
          </>
        )}
      </div>

      <nav
        aria-label={t('Screens')}
        data-c={c ? 'true' : 'false'}
        className="flex-auto min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-1 pt-2.5 px-2.5 pb-4"
      >
        {fly ? <div className="fixed top-0 right-0 bottom-0 left-16 z-60" aria-hidden="true" onClick={() => setFly(null)} /> : null}
        {(() => {
          const active = isActive(HOME.path);
          return (
            <Link
              href={HOME.path}
              title={t(HOME.label)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'group/grp box-border flex items-center gap-3 w-full rounded-[6px] text-[13px] font-semibold leading-[18px] no-underline',
                c ? 'justify-center p-0 h-11' : 'py-0 pr-2 pl-3 h-9',
                active ? cx('text-ink', c ? 'bg-tint' : '') : 'text-muted2 hover:bg-hover hover:text-ink',
                focusRing,
              )}
            >
              <span className={cx('flex-none flex group-hover/grp:text-accent', active ? 'text-accent' : 'text-muted')}>
                <svg
                  className="size-5.5"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 10.5L12 3l9 7.5" />
                  <path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
                </svg>
              </span>
              {c ? null : (
                <span className="flex-auto min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-start">{t(HOME.label)}</span>
              )}
            </Link>
          );
        })()}
        {NAV.map((g) => {
          const open = c ? fly?.id === g.id : acc === g.id;
          const on = g.id === activeGroup;
          return (
            <div key={g.id} className="flex flex-col gap-0.5">
              <button
                aria-expanded={open ? 'true' : 'false'}
                aria-controls={'ng-' + g.id}
                title={t(g.label)}
                onClick={toggleGroup(g.id)}
                className={cx(
                  'group/grp unstyled box-border cursor-pointer flex items-center gap-3 w-full rounded-[6px] text-[13px] font-semibold leading-[18px]',
                  on ? 'text-ink' : 'text-muted2',
                  c ? 'justify-center p-0 h-11' : 'py-0 pr-2 pl-3 h-9',
                  // collapsed rail: open section, else the section of the open screen
                  c && open ? 'bg-hover' : c && on ? 'bg-tint' : 'hover:bg-hover hover:text-ink',
                  focusRing,
                )}
              >
                <span className={cx('flex-none flex group-hover/grp:text-accent', on ? 'text-accent' : 'text-muted')}>
                  {GROUP_ICON[g.icon]}
                </span>
                {c ? null : (
                  <>
                    <span className="flex-auto min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-start">{t(g.label)}</span>
                    <svg
                      {...chevron}
                      className={cx(
                        'flex-none text-muted [transition:transform_.15s]',
                        open ? '[transform:rotate(180deg)]' : '[transform:rotate(0deg)]',
                      )}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </>
                )}
              </button>
              {open ? (
                <div
                  id={'ng-' + g.id}
                  role="group"
                  aria-label={t(g.label)}
                  className={cx(
                    'flex flex-col gap-0.5',
                    c &&
                      'fixed left-17 z-61 w-70 overflow-auto p-2 bg-surface border border-line rounded-[10px] box-border shadow-[0_12px_32px_rgba(22,26,33,.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,.6)]',
                  )}
                  style={c ? { top: (fly?.top || 0) + 'px', maxHeight: `calc(100vh - ${(fly?.top || 0) + 16}px)` } : undefined}
                >
                  {c ? (
                    <div className="py-2 px-3.5 text-[12px] leading-[16px] font-semibold tracking-[0.07em] uppercase text-muted">
                      {t(g.label)}
                    </div>
                  ) : null}
                  {g.screens.map((sc) => {
                    const active = isActive(sc.path);
                    return (
                      <Link
                        key={sc.id}
                        href={sc.path}
                        title={t(sc.label)}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          'relative flex items-center rounded-[6px] no-underline whitespace-nowrap overflow-hidden text-ellipsis',
                          c ? 'h-10 px-3.5 text-[14px] leading-[20px]' : 'h-8 ps-10.5 pe-3 text-[13px] leading-[18px]',
                          active
                            ? cx(
                                'bg-tint text-accent font-semibold',
                                !c &&
                                  "before:content-[''] before:absolute before:start-0 before:top-1.5 before:bottom-1.5 before:w-0.75 before:rounded-[0_2px_2px_0] before:bg-accent",
                              )
                            : 'text-muted2 font-normal hover:bg-hover hover:text-ink',
                          focusRing,
                        )}
                      >
                        {t(sc.label)}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="flex-none py-2 px-2.5 border-t border-t-line2">
        <button
          aria-expanded={c ? 'false' : 'true'}
          aria-label={sbLabel}
          title={sbLabel}
          onClick={() => sidebarToggled(!c)}
          className={cx(
            'unstyled box-border cursor-pointer w-full flex items-center gap-3 h-11 rounded-[6px] text-muted text-[13px] font-medium whitespace-nowrap overflow-hidden hover:bg-hover hover:text-ink',
            c ? 'justify-center px-0' : 'px-3',
            focusRing,
          )}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
            <path d={c ? 'M14 9l3 3-3 3' : 'M16 15l-3-3 3-3'} />
          </svg>
          {c ? null : <span>{t('Collapse side panel')}</span>}
        </button>
      </div>
    </aside>
  );
}
