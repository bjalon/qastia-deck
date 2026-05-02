export function currentKey(namespace: string, deckId: string): string {
  return `${namespace}:v1:${deckId}:current`;
}

export function draftKey(namespace: string, deckId: string): string {
  return `${namespace}:v1:${deckId}:draft`;
}

export function versionsIndexKey(namespace: string, deckId: string): string {
  return `${namespace}:v1:${deckId}:versions:index`;
}

export function versionKey(namespace: string, deckId: string, versionId: string): string {
  return `${namespace}:v1:${deckId}:versions:${versionId}`;
}
