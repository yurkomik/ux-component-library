import type { TextSegmenter } from "@/types";
import { IntlTextSegmenter } from "./intl-segmenter";
import { RegexFallbackSegmenter } from "./regex-fallback";

export function createSegmenter(): TextSegmenter {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return new IntlTextSegmenter();
  }
  return new RegexFallbackSegmenter();
}

export { IntlTextSegmenter, RegexFallbackSegmenter };
