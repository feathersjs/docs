
module.exports = {
  sortArrayByProp
};

function sortArrayByProp (array, key) {
  return array.sort((a, b) => {
    const x = a[key];
    const y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}
