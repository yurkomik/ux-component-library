import type { TextSegmenter, Segment, SegmentGranularity } from "@/types";

const segmenterCache = new Map<SegmentGranularity, Intl.Segmenter>();

function getSegmenter(granularity: SegmentGranularity): Intl.Segmenter {
  let segmenter = segmenterCache.get(granularity);
  if (!segmenter) {
    segmenter = new Intl.Segmenter("en", { granularity });
    segmenterCache.set(granularity, segmenter);
  }
  return segmenter;
}

export class IntlTextSegmenter implements TextSegmenter {
  segment(text: string, granularity: SegmentGranularity): Segment[] {
    const segmenter = getSegmenter(granularity);
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
