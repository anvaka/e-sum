module.exports = cyclicArray;

function cyclicArray(maxSize) {
  let points = [];
  let startFrom = 0;
  return {
    push,
    forEach,
    get length() {
      return points.length;
    }
  };
  function push(point) {
    if (points.length >= maxSize) {
      points[startFrom] = point;
      startFrom += 1;
      if (startFrom === maxSize)
        startFrom = 0;
    }
    else {
      points.push(point);
    }
  }
  function forEach(callback) {
    let index = startFrom;
    let visited = 0;
    while (visited < points.length) {
      callback(points[index], visited);
      index += 1;
      visited += 1;
      if (index === maxSize)
        index = 0;
    }
  }
}
