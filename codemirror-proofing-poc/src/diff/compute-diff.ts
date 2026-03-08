import type { DiffChunk } from "./diff-types";

/**
 * Simple word-level diff using longest common subsequence.
 * Good enough for POC — not optimized for large texts.
 */
export function computeWordDiff(
  oldText: string,
  newText: string,
): DiffChunk[] {
  const oldWords = tokenize(oldText);
  const newWords = tokenize(newText);

  const lcs = longestCommonSubsequence(oldWords, newWords);
  const chunks: DiffChunk[] = [];

  let oi = 0;
  let ni = 0;

  for (const item of lcs) {
    // Deletions before this LCS item
    while (oi < item.oldIndex) {
      pushChunk(chunks, "delete", oldWords[oi]!);
      oi++;
    }
    // Insertions before this LCS item
    while (ni < item.newIndex) {
      pushChunk(chunks, "insert", newWords[ni]!);
      ni++;
    }
    // Equal
    pushChunk(chunks, "equal", oldWords[oi]!);
    oi++;
    ni++;
  }

  // Remaining deletions
  while (oi < oldWords.length) {
    pushChunk(chunks, "delete", oldWords[oi]!);
    oi++;
  }
  // Remaining insertions
  while (ni < newWords.length) {
    pushChunk(chunks, "insert", newWords[ni]!);
    ni++;
  }

  return mergeChunks(chunks);
}

function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

interface LCSItem {
  oldIndex: number;
  newIndex: number;
}

function longestCommonSubsequence(
  a: string[],
  b: string[],
): LCSItem[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0) as number[],
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  const result: LCSItem[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift({ oldIndex: i - 1, newIndex: j - 1 });
      i--;
      j--;
    } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

function pushChunk(
  chunks: DiffChunk[],
  kind: DiffChunk["kind"],
  text: string,
): void {
  const last = chunks[chunks.length - 1];
  if (last && last.kind === kind) {
    last.text += text;
  } else {
    chunks.push({ kind, text });
  }
}

function mergeChunks(chunks: DiffChunk[]): DiffChunk[] {
  // Already merged in pushChunk
  return chunks;
}

export type { DiffChunk };
