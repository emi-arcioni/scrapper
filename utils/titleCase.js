const titleCase = (str) =>
  str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1))
    .join(' ');

export default titleCase;