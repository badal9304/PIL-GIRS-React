'use client';

import { useEffect } from 'react';

/**
 * Wherever text is cut off with "…" (table cells, chips, labels, side menu, inputs and selects),
 * hovering or focusing it shows the full text in a tooltip. Elements with their own title keep it.
 */
export function useTruncationTooltip(): void {
  useEffect(() => {
    let tip: HTMLDivElement | null = null;
    let timer = 0;
    let cur: HTMLElement | null = null;
    let canvas: HTMLCanvasElement | null = null;

    const full = (el: HTMLElement) => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value || '';
      if (el instanceof HTMLSelectElement) return el.options[el.selectedIndex]?.text || '';
      return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    };
    const textWidth = (el: HTMLElement, text: string) => {
      canvas = canvas || document.createElement('canvas');
      const c = canvas.getContext('2d');
      if (!c) return 0;
      const cs = getComputedStyle(el);
      c.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      return c.measureText(text).width;
    };
    const cut = (el: HTMLElement | null): boolean => {
      if (!el || el.nodeType !== 1 || el.closest('#gs-panel') || el.closest('.sr') || el.clientWidth < 8) return false;
      const cs = getComputedStyle(el);
      if (el instanceof HTMLSelectElement) {
        const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        return textWidth(el, full(el)) > el.clientWidth - pad + 1;
      }
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.scrollWidth > el.clientWidth + 1 && !!el.value;
      // text boxes only — never a scroll area, panel or table
      if (!el.firstChild || el.querySelector('div,p,table,ul,ol,section,article,nav,input,select,textarea,button')) return false;
      const clipX = cs.textOverflow === 'ellipsis' || (cs.overflowX === 'hidden' && cs.whiteSpace.indexOf('nowrap') === 0);
      const clamp = (cs as CSSStyleDeclaration & { webkitLineClamp?: string }).webkitLineClamp;
      const clipY = !!clamp && clamp !== 'none';
      return (clipX && el.scrollWidth > el.clientWidth + 1) || (clipY && el.scrollHeight > el.clientHeight + 1);
    };
    // the truncated element is usually the hovered one or a near ancestor (e.g. a cell around a link)
    const find = (t: EventTarget | null) => {
      let el = t instanceof HTMLElement ? t : null;
      for (let i = 0; el && el !== document.body && i < 4; el = el.parentElement, i++) {
        if (el.getAttribute('title')) return null;
        if (cut(el)) return el;
      }
      return null;
    };
    const show = (el: HTMLElement) => {
      const text = full(el);
      if (!text) return;
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'girs-tip';
        tip.setAttribute('role', 'tooltip');
        tip.style.cssText =
          'position:fixed;z-index:2000;max-width:min(420px,calc(100vw - 24px));padding:6px 10px;border-radius:6px;background:#161A21;color:#fff;' +
          'font:12px/17px "IBM Plex Sans",system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.22);pointer-events:none;white-space:normal;overflow-wrap:anywhere';
        document.body.appendChild(tip);
      }
      tip.textContent = text;
      tip.hidden = false;
      const r = el.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
      let top = r.top - h - 6;
      if (top < 8) top = r.bottom + 6;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      el.setAttribute('aria-describedby', 'girs-tip');
      cur = el;
    };
    const hide = () => {
      window.clearTimeout(timer);
      if (tip) tip.hidden = true;
      if (cur) {
        cur.removeAttribute('aria-describedby');
        cur = null;
      }
    };
    const enter = (e: Event) => {
      const el = find(e.target);
      if (el === cur) return;
      hide();
      if (el) timer = window.setTimeout(() => document.contains(el) && cut(el) && show(el), 350);
    };
    const out = (e: MouseEvent) => {
      if (cur && (!e.relatedTarget || !cur.contains(e.relatedTarget as Node))) hide();
      else if (!cur) window.clearTimeout(timer);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && hide();

    document.addEventListener('mouseover', enter, true);
    document.addEventListener('focusin', enter, true);
    document.addEventListener('mouseout', out, true);
    document.addEventListener('focusout', hide, true);
    document.addEventListener('scroll', hide, true);
    document.addEventListener('keydown', esc);
    window.addEventListener('blur', hide);
    return () => {
      hide();
      document.removeEventListener('mouseover', enter, true);
      document.removeEventListener('focusin', enter, true);
      document.removeEventListener('mouseout', out, true);
      document.removeEventListener('focusout', hide, true);
      document.removeEventListener('scroll', hide, true);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('blur', hide);
      tip?.remove();
    };
  }, []);
}
