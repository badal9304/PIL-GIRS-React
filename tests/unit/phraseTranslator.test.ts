import { describe, expect, it } from 'vitest';
import { PhraseTranslator, type PhraseBook } from '@/shared/lib/phraseTranslator';

const zh: PhraseBook = {
  dict: { 'Invoice List': '发票列表', '# of #': '# / #', Paid: '已付款', Status: '状态' },
  tpl: { 'No results for “{x}”': '没有“{x}”的结果' },
};

describe('PhraseTranslator', () => {
  it('returns English unchanged', () => {
    expect(new PhraseTranslator('en').t('Invoice List')).toBe('Invoice List');
  });
  it('translates exact phrases and keeps surrounding spaces', () => {
    const t = new PhraseTranslator('zh', zh).t;
    expect(t('Invoice List')).toBe('发票列表');
    expect(t(' Invoice List ')).toBe(' 发票列表 ');
  });
  it('matches numbers through # placeholders', () => {
    expect(new PhraseTranslator('zh', zh).t('12 of 23')).toBe('12 / 23');
  });
  it('fills templates only with data-like values', () => {
    const t = new PhraseTranslator('zh', zh).t;
    expect(t('No results for “SINOF2602401”')).toBe('没有“SINOF2602401”的结果');
    expect(t('No results for “some words here”')).toBe('No results for “some words here”');
  });
  it('translates "A · B" and "Label: value" pairs', () => {
    const t = new PhraseTranslator('zh', zh).t;
    expect(t('Paid · SGSIN')).toBe('已付款 · SGSIN');
    expect(t('Status: Paid')).toBe('状态：已付款');
  });
  it('isolates Latin data runs in Arabic text', () => {
    const tx = new PhraseTranslator('ar', { dict: {}, tpl: {} }).tx;
    expect(tx('Vessel 01 / 073N')).toBe('⁦Vessel 01 / 073N⁩');
  });
});
