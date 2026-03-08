import type { TextSegmenter, Segment, SegmentGranularity } from "@/types";

export class IntlTextSegmenter implements TextSegmenter {
  segment(text: string, granularity: SegmentGranularity): Segment[] {
    const segmenter = new Intl.Segmenter("en", { granularity });
    const results: Segment[] = [];

    for (const seg of segmenter.segment(text)) {
      results.push({
        text: seg.segment,
        index: seg.index,
        isWordLike: seg.isWordLike,
      });
    }

    return results;
  }
}
