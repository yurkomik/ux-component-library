import type { TextSegmenter, Segment, SegmentGranularity } from "@/types";

const WORD_RE = /\b[\w']+\b/g;
const SENTENCE_RE = /[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g;

export class RegexFallbackSegmenter implements TextSegmenter {
  segment(text: string, granularity: SegmentGranularity): Segment[] {
    const re = granularity === "word" ? WORD_RE : SENTENCE_RE;
    const results: Segment[] = [];

    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      results.push({
        text: match[0],
        index: match.index,
        isWordLike: granularity === "word" ? true : undefined,
      });
    }

    return results;
  }
}
