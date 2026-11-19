import { describe, expect, it } from 'vitest';
import { Translator, type LocaleData } from '../i18n/translator';

const zh: LocaleData = {
  lang: 'zh',
  dict: { 'Invoice List': '发票列表', '# of #': '# / #', Paid: '已付款', Status: '状态' },
  tpl: [['No results for “{x}”', '没有“{x}”的结果']],
};

describe('Translator', () => {
  it('returns English unchanged', () => {
    expect(new Translator('en').t('Invoice List')).toBe('Invoice List');
  });
  it('translates exact phrases and keeps surrounding spaces', () => {
    const t = new Translator('zh', zh).t;
    expect(t('Invoice List')).toBe('发票列表');
    expect(t(' Invoice List ')).toBe(' 发票列表 ');
  });
  it('matches numbers through # placeholders', () => {
    expect(new Translator('zh', zh).t('12 of 23')).toBe('12 / 23');
  });
  it('fills templates only with data-like values', () => {
    const t = new Translator('zh', zh).t;
    expect(t('No results for “SINOF2602401”')).toBe('没有“SINOF2602401”的结果');
    expect(t('No results for “some words here”')).toBe('No results for “some words here”');
  });
  it('translates "A · B" and "Label: value" pairs', () => {
    const t = new Translator('zh', zh).t;
    expect(t('Paid · SGSIN')).toBe('已付款 · SGSIN');
    expect(t('Status: Paid')).toBe('状态：已付款');
  });
  it('isolates Latin data runs in Arabic text', () => {
    const tx = new Translator('ar', { lang: 'ar', dict: {}, tpl: [] }).tx;
    expect(tx('Vessel 01 / 073N')).toBe('⁦Vessel 01 / 073N⁩');
  });
});
