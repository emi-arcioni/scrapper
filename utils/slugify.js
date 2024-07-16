const slugify = (str) =>
  str
    .split(' ')
    .map((word) => word.toLowerCase())
    .join('-')
    .replace(/[.,!?]/g, '');

export default slugify;
