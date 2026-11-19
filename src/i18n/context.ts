import { createContext, useContext } from 'react';
import { Translator } from './translator';

export const I18nContext = createContext<Translator>(new Translator('en'));

/** `t` for attributes (titles, placeholders, labels), `tx` for visible text. */
export function useI18n() {
  return useContext(I18nContext);
}
