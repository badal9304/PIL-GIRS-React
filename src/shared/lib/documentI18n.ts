import { PhraseTranslator } from './phraseTranslator';

/**
 * Translator used by generated documents (invoice / receipt previews, print views), which are built outside React.
 * The i18n provider sets it whenever the language changes.
 */
let current = new PhraseTranslator('en');

export function setDocumentTranslator(tr: PhraseTranslator): void {
  current = tr;
}

export function documentTranslator(): PhraseTranslator {
  return current;
}
