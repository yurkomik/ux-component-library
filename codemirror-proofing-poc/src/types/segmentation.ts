export type SegmentGranularity = "word" | "sentence";

export interface Segment {
  text: string;
  index: number;
  isWordLike?: boolean;
}

export interface TextSegmenter {
  segment(text: string, granularity: SegmentGranularity): Segment[];
}
