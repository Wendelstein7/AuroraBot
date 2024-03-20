export const splitRemainder = (str: string, delimiter: string, limit: number): string[] => {
  const parts = str.split(delimiter);
  return parts.slice(0, limit - 1).concat([parts.slice(limit - 1).join(delimiter)]);
};
