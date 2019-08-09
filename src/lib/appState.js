const {useDecimal} = require('./config');
const queryState = require('query-state');
var qs = queryState({
  code: 'x / 3',
  bufferSize: 12000,
  totalSteps: 30000,
  spi: 500 // stepsPerIteration
}, {
  useSearch: true
});

const sumCalculator = require('./sumCalculator.js');
const createScene = require('./scene');
const {parse} = require('../js-arithmetics');
const {parse:parseDecimal} = require('../decimal-arithmetics');
const Decimal = require('decimal.js');
let shouldIgnoreCodeChange = false;
window.Decimal = Decimal;
Decimal.PI = Decimal.acos(-1);
Decimal.E = Decimal(1).exp();


const scene = createScene();
const persistedState = qs.get();

let generatorOptions = {
  next: null,
  bufferSize: persistedState.bufferSize,
  stepsPerIteration: persistedState.spi,
  totalSteps: persistedState.totalSteps,
};


var code = {
  code: persistedState.code,
  error: null,
  isImmediate: false,
  setCode(newCode, immediate) {
    if (!appState.webGLEnabled) return;

    if (shouldIgnoreCodeChange) {
      shouldIgnoreCodeChange = false;
      return;
    }

    var newNext = compileNextFunction(newCode);
    if (!newNext) return; // error

    qs.set('code', newCode);
    code.error = null;
    code.code = newCode;

    generatorOptions.next = newNext;

    if (immediate) {
      const newSumCalculator = sumCalculator(generatorOptions);
      scene.setSumCalculator(newSumCalculator);
    } else if (!code.immediate) {
      scene.redrawCurrentPoints();
    }
    code.immediate = immediate;
  }
}

var appState = {
  code,
  webGLEnabled: scene.webGLEnabled,

  ignoreNextEditorChange() {
    shouldIgnoreCodeChange = true;
  },
  getLineColor() { return scene.getLineColor() },
  setLineColor(r, g, b, a) { 
    scene.setLineColor(r, g, b, a);
  },
  getFillColor() { return scene.getClearColor(); },
  setFillColor(r, g, b, a) {
    scene.setClearColor(r, g, b, a);
  },
  getTotalSteps() { return generatorOptions.totalSteps; },
  setTotalSteps(newValue, doNotRestart) {
    generatorOptions.totalSteps = getNumber(newValue, generatorOptions.totalSteps);
    qs.set('totalSteps', generatorOptions.totalSteps);
    if (doNotRestart) return;
    scene.restartCalculator();
  },

  getBufferSize() { return generatorOptions.bufferSize; },
  setBufferSize(newValue, doNotRestart) {
    generatorOptions.bufferSize = getNumber(newValue, generatorOptions.bufferSize);
    qs.set('bufferSize', generatorOptions.bufferSize);

    if (doNotRestart) return;
    scene.restartCalculator();
  },

  getStepsPerIteration() { return generatorOptions.stepsPerIteration; },
  setStepsPerIteration(newValue) { 
    generatorOptions.stepsPerIteration = getNumber(newValue, generatorOptions.stepsPerIteration);
    qs.set('spi', generatorOptions.stepsPerIteration);
    scene.redrawCurrentPoints()
  },

  settingsPanel: {
    collapsed: true
  },
}

module.exports = appState

code.setCode(persistedState.code, true);

function getNumber(str, defaultValue) {
  var parsed = Number.parseFloat(str);
  if (Number.isNaN(parsed)) return defaultValue;
  return parsed;
}

function compileNextFunction(newCode) {
  try {
    console.log('compiling ' + newCode);
    const compiledCode = useDecimal ? parseDecimal(newCode) : parse(newCode);
    console.log('compiled: ' + compiledCode)
    var creator = new Function(`function f(x) {
  return ${compiledCode};
}
return f;`);
    var next = creator();
    next(0); // just a test.
    return next;
  } catch (e) {
    code.error = e.message;
    code.location = e.location && e.location.start;
    console.error(e);
    return null;
  }
}
