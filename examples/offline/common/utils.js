
module.exports = {
  delay,
  sortArrayByProp,
};

function sortArrayByProp (array, key) {
  return array.sort((a, b) => {
    const x = a[key];
    const y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

// Delay so other .then()'s be placed on micro-queue, and what called this be placed afterwards.
function delay (ms = 100) {
  return new Promise(resolve => {
    setTimeout(() => { resolve(); }, ms);
  });
}
