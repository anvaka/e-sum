//let generators = [generateRandomSum, generateRandomPeriod, generateSimplePeriod];
let generators = [ generateRandomSum, generateSimplePeriod];

function generateRandomSum() {
  return {
    code: `x/${getDivider()} + x*x*x/${getDivider()}`,
    totalSteps: 12000,
    stepsPerIteration: 500,
    bufferSize: 12000,
    color: {
      r: 255, 
      g: 255,
      b: 255,
      a: 0.42
    }
  }
}

function generateRandomPeriod() {
  return {
    code: `x/${getDivider(10)} + sin(pi*x*${getDivider(10, 1000)})`,
    totalSteps: 20000,
    stepsPerIteration: 500,
    bufferSize: 20000,
    color: {
      r: 255, 
      g: 255,
      b: 255,
      a: 0.06
    }
  } 
}

function generateSimplePeriod() {
  return {
    code: `x/${getDivider(85)} + cos(x*${getDivider(100, 1000)})`,
    totalSteps: 30000000,
    stepsPerIteration: 500,
    bufferSize: 30000,
    color: {
      r: 255, 
      g: 255,
      b: 255,
      a: 0.06
    }
  }
}

function getDivider(cap = 100, exponent = 0) {
  let value = Math.random() * cap + 2;
  let divider = exponent === 0 ? Math.round(value) : Math.round(value * exponent) / exponent;
  // x/32 + x*x*x/62 - eye
  // x/(6) + x * x * x /51;
  // x/21 + x*x*x/27;  -- impossible loop
  // x + x * x * x /35;
  // x/39 + x*x*x/39; // another dog
  // x/8 + x*x*x/24004 -- clown
  // k/6 + k * k /7 + k * k * k/6 // running man
  // cross k/4 + k * k * k/18
  // apple logo k/6 + k * k /7 + k * k * k/14
  // candy k/24 + k * k * k/12;
  // k*k*k/101; // ram
  // mooseneckle   return k/90 + k * k * k/92;
  // scary monster k/3 + k * k * k/61;
  //   return k/3+Math.sin(k*2/Math.PI)+k * k/61;
// https://anvaka.github.io/share/esum/?code=x%2F3%20%2Bsin%28230*x%2Fe*pi%29%20%20&bufferSize=12000&totalSteps=12000&spi=500
    // return k/4+Math.sin(k*5/Math.PI);
    // x/3 + sin(x*45/PI) + sin(x*5/PI); // ring
// function f(k) {
//   return k/3+Math.sin(k*5/Math.PI);  
// }
  return divider;
}

module.exports = function generate() {
  let randomGenerator = generators[Math.floor(Math.random() * generators.length)]
  return randomGenerator();
}