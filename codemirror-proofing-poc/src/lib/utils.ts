let _idCounter = 0;

/** Generate a unique ID with an optional prefix */
export function uniqueId(prefix = ""): string {
  return `${prefix}${++_idCounter}`;
}
