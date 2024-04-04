const createArray = (size, value = "") => {
  const array = new Array(size);
  array.fill(value);
  return array;
};

const htmlStringToNode = (str) => {
  return document.createRange().createContextualFragment(str).firstChild;
};
