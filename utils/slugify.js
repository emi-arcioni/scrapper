const slugify = (str) =>
  str
    .split(' ')
    .map((word) => word.toLowerCase())
    .join('-');

export default slugify;
