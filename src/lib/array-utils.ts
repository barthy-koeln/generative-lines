export function fillArray<InnerType>(length: number, callback: () => InnerType): InnerType[] {
  return Array.from({ length }, callback);
}