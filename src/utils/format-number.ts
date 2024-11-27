export const formatNumber = (number: string): number => {
  return +number.replace(/[,.$ ]/g, "");
};
