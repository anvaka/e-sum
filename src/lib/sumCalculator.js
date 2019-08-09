const {useDecimal} = require('./config');
const Decimal = require('decimal.js');
const { encodeColor } = require("./encodeColor");

const PI_2 = useDecimal ? Decimal.acos(-1).times(2) : Math.PI * 2;

module.exports = sumCalculator;

function sumCalculator(options) {
  const getNextPoint = useDecimal ? getNextDecimalPoint : getNextFloatPoint;

  let next;
  let currentStep;
  let maxTotalSteps;
  let px, py;
  let box;
  let polyLine;

  const api = {
    reset,
    compute,
    setPolyLine,
    bboxChanged: false,
    getOptions() { return options; },
    getBoundingBox: () => box,
    getPoints: () => points,
    isDone() { return currentStep >= maxTotalSteps; },
    getCurrentStep() { return currentStep; },
    getTotalSteps() { return maxTotalSteps; }
  }

  reset();
  return api;

  function initialBoundingBox() {
    return {
      minX: 0, maxX: 0,
      minY: 0, maxY: 0
    };
  }

  function setPolyLine(newPolyLine) {
    polyLine = newPolyLine;
  }

  function reset() {
    next = options.next;
    currentStep = 1;
    maxTotalSteps = options.totalSteps;
    px = useDecimal ? Decimal(0) : 0; 
    py = useDecimal ? Decimal(0) : 0;
    
    box = initialBoundingBox();
    api.bboxChanged = true;
  }

  function compute() {
    let frameSteps = 0;
    let start = window.performance.now();
    while (currentStep < maxTotalSteps && frameSteps < options.stepsPerIteration) {
      let pt = getNextPoint(currentStep);
      pt.y = -pt.y;
      extendBoundingBoxIfNeeded(pt.x, pt.y);
      polyLine.add(pt.x, pt.y);
      currentStep += 1;
      frameSteps += 1;
      let elapsed = window.performance.now() - start;
      if (elapsed > 12) break;
    }

    return (currentStep < maxTotalSteps);
  }

  function getNextDecimalPoint(n) {
    const phi = next(n).times(PI_2);
    px = px.plus(phi.cos());
    py = py.plus(phi.sin());

    return {x: Number(px), y: Number(py)}
  }

  function getNextFloatPoint(n) {
    const phi = next(n) * PI_2;
    // const r = PI_2 * 12 * n;
    px += Math.cos(phi); // * Math.cos(r) - Math.sin(phi) * Math.sin(r);
    py += Math.sin(phi); // * Math.cos(r) + Math.cos(phi) * Math.sin(r);
    return {x: px, y: py}
  }

  function extendBoundingBoxIfNeeded(px, py) {
    if (px < box.minX) { box.minX = px; api.bboxChanged = true; }
    if (px > box.maxX) { box.maxX = px; api.bboxChanged = true; }
    if (py < box.minY) { box.minY = py; api.bboxChanged = true; }
    if (py > box.maxY) { box.maxY = py; api.bboxChanged = true; }
  }
}

function getColor(r, g, b, a) {
  r = Math.round(r * 255); 
  g = Math.round(g * 255);
  b = Math.round(b * 255);
  a = Math.round(a * 255);
  return (r << 24) | (g << 16) | (b << 8) | a;
}