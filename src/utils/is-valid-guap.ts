export const isValidGuap = (number: string) => {
  const regexp = /^[0-9,.$ ]+$/;
  return regexp.test(number);
};
