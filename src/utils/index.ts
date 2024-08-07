export const splitRemainder = (str: string, delimiter: string, limit: number): string[] => {
  const parts = str.split(delimiter);
  return parts.slice(0, limit - 1).concat([parts.slice(limit - 1).join(delimiter)]);
};

export const truncate = (str: string, maxLen: number) =>
  str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : str;
