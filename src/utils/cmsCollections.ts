export const isCmsCollection = <T,>(
  collection: T[] | undefined,
): collection is T[] => Array.isArray(collection);
