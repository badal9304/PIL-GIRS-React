import { useEffect, useState, type MouseEvent } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV, groupOf } from '../navigation';
import { useSettings } from '../providers/contexts';
import { useI18n } from '../../i18n/context';
import { cx } from '../../lib/cx';

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
export function SideNav() {
  const { t, tx } = useI18n();
  const { sidebarCollapsed: c, setSidebarCollapsed, theme } = useSettings();
  const { pathname } = useLocation();
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

  const sbLabel = c ? 'Expand side panel' : 'Collapse side panel';

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
          <img
            src={`${import.meta.env.BASE_URL}${theme === 'dark' ? 'pil-logo-dark.png' : 'pil-logo.png'}`}
            alt="PIL"
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
                <span className={cx('flex-none flex group-hover/grp:text-accent', on ? 'text-accent' : 'text-muted')}>{g.icon}</span>
                {c ? null : (
                  <>
                    <span className="flex-auto min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-start">{tx(g.label)}</span>
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
                      {tx(g.label)}
                    </div>
                  ) : null}
                  {g.screens.map((sc) => (
                    <NavLink
                      key={sc.id}
                      to={sc.path}
                      title={t(sc.label)}
                      className={({ isActive }) =>
                        cx(
                          'relative flex items-center rounded-[6px] no-underline whitespace-nowrap overflow-hidden text-ellipsis',
                          c ? 'h-10 px-3.5 text-[14px] leading-[20px]' : 'h-8 ps-10.5 pe-3 text-[13px] leading-[18px]',
                          isActive
                            ? cx(
                                'bg-tint text-accent font-semibold',
                                !c &&
                                  "before:content-[''] before:absolute before:start-0 before:top-1.5 before:bottom-1.5 before:w-0.75 before:rounded-[0_2px_2px_0] before:bg-accent",
                              )
                            : 'text-muted2 font-normal hover:bg-hover hover:text-ink',
                          focusRing,
                        )
                      }
                    >
                      {tx(sc.label)}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="flex-none py-2 px-2.5 border-t border-t-line2">
        <button
          aria-expanded={c ? 'false' : 'true'}
          aria-label={t(sbLabel)}
          title={t(sbLabel)}
          onClick={() => setSidebarCollapsed(!c)}
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
          {c ? null : <span>{tx('Collapse side panel')}</span>}
        </button>
      </div>
    </aside>
  );
}
