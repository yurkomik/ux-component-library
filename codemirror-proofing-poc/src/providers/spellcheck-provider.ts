import type { ProofingProvider, Suggestion } from "@/types";
import { createSegmenter } from "@/segmentation";

interface NSpellInstance {
  correct: (word: string) => boolean;
  suggest: (word: string) => string[];
}

let nspellInstance: NSpellInstance | null = null;
let loadingPromise: Promise<NSpellInstance> | null = null;

async function loadDictionary(): Promise<NSpellInstance> {
  if (nspellInstance) return nspellInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Load nspell module and dictionary files in parallel
    const [nspellModule, affResponse, dicResponse] = await Promise.all([
      import("nspell"),
      fetch("/dictionaries/en.aff"),
      fetch("/dictionaries/en.dic"),
    ]);

    const nspell = nspellModule.default;
    const affText = await affResponse.text();
    const dicText = await dicResponse.text();

    nspellInstance = nspell(affText, dicText) as unknown as NSpellInstance;
    return nspellInstance;
  })();

  return loadingPromise;
}

export class SpellcheckProvider implements ProofingProvider {
  readonly name = "spellcheck";
  readonly source = "spell" as const;

  private segmenter = createSegmenter();
  private idCounter = 0;

  async check(text: string, signal: AbortSignal): Promise<Suggestion[]> {
    const spell = await loadDictionary();

    if (signal.aborted) return [];

    const words = this.segmenter.segment(text, "word");
    const suggestions: Suggestion[] = [];

    for (const word of words) {
      if (!word.isWordLike) continue;
      if (word.text.length < 2) continue;

      // Skip words that look like URLs, emails, or numbers
      if (/^https?:\/\//.test(word.text)) continue;
      if (/@/.test(word.text)) continue;
      if (/^\d+$/.test(word.text)) continue;

      // Skip ALL CAPS words (likely acronyms)
      if (word.text === word.text.toUpperCase() && word.text.length > 1) continue;

      if (!spell.correct(word.text)) {
        const replacements = (spell.suggest(word.text) as string[]).slice(0, 5);
        suggestions.push({
          id: `spell-${this.idCounter++}`,
          source: "spell",
          category: "spelling",
          severity: "high",
          from: word.index,
          to: word.index + word.text.length,
          original: word.text,
          replacements,
          message: `"${word.text}" may be misspelled`,
        });
      }
    }

    return suggestions;
  }
}
