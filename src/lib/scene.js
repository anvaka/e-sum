const wgl = require('w-gl');
const bus = require('../bus');
const LineStrip = require('./lines/LineStrip').default;

module.exports = function createScene() {
  let lastSumCalculator;
  let lastFrame;
  let touched = false;
  let lines;
  let lineA = 0.06, lineR = 255, lineG = 255, lineB = 255;
  let sceneA = 1, sceneR = 12, sceneG = 41, sceneB = 82;
  let canvas = document.getElementById('scene-canvas');
  let webGLScene;

  let webGLEnabled = wgl.isWebGLEnabled(canvas);
  if (webGLEnabled) {
    listenToEvents();

    webGLScene = wgl.scene(canvas, {});
    webGLScene.setClearColor(sceneR/255, sceneG/255, sceneB/255, sceneA)
    webGLScene.setPixelRatio(1);

    window.addEventListener('resize', redrawCurrentPoints);
  }

  return {
    webGLEnabled,
    setSumCalculator,
    restartCalculator,
    redrawCurrentPoints,
    dispose,
    setClearColor,
    getClearColor,
    setLineColor,
    getLineColor
  }

  function setClearColor(r, g, b, a) {
    sceneR = r;
    sceneG = g;
    sceneB = b;
    sceneA = Math.round(a * 100)/100;

    webGLScene.setClearColor(sceneR/255, sceneG/255, sceneB/255, sceneA)
    redrawCurrentPoints();
  }

  function setLineColor(r, g, b, a) {
    lineR = r;
    lineG = g;
    lineB = b;
    lineA = a;

    if (lines) {
      lines.color.r = lineR/255;
      lines.color.g = lineG/255;
      lines.color.b = lineB/255;
      lines.color.a = lineA;
      webGLScene.renderFrame();
    }
  }

  function getLineColor() {
    return `rgba(${lineR}, ${lineG}, ${lineB}, ${Math.round(lineA * 100)/100})`; 
  }

  function getClearColor() {
    return `rgba(${sceneR}, ${sceneG}, ${sceneB}, ${sceneA})`; 
  }

  function dispose() {
    webGLScene.dispose();
    removeEventListeners();
    if (lastFrame) {
      cancelAnimationFrame(lastFrame);
      lastFrame = 0;
    }
  }

  function listenToEvents() {
    canvas.addEventListener('mousedown', markTouched)
    canvas.addEventListener('touchstart', markTouched)
    canvas.addEventListener('wheel', markTouched)
  }

  function removeEventListeners() {
    canvas.removeEventListener('mousedown', markTouched)
    canvas.removeEventListener('touchstart', markTouched)
    canvas.removeEventListener('wheel', markTouched)
  }

  function setSumCalculator(sumCalculator) {
    touched = false;
    createSumCalculator(sumCalculator);
  }

  function createSumCalculator(sumCalculator) {
    lastSumCalculator = sumCalculator;
    resetLines();
  }

  function restartCalculator() {
    if (!lastSumCalculator) return;
    lastSumCalculator.reset();
    resetLines();
  }

  function resetLines() {
    if (lines) webGLScene.removeChild(lines);

    let options = lastSumCalculator.getOptions();
    lines = new LineStrip(Math.min(options.bufferSize), false);
    lines.color.r = lineR/255;
    lines.color.g = lineG/255;
    lines.color.b = lineB/255;
    lines.color.a = lineA;
    lines.add(0, 0);
    lastSumCalculator.setPolyLine(lines);

    webGLScene.appendChild(lines);
    scheduleNextFrame();
  }



  function scheduleNextFrame() {
    if (lastSumCalculator.isDone() || lastFrame) return;
    lastFrame = requestAnimationFrame(nextFrame);
  }

  function nextFrame() {
    lastFrame = 0;
    lastSumCalculator.compute();
    
    updateBoundingBox();
    webGLScene.renderFrame();
    bus.fire('progress', lastSumCalculator.getCurrentStep(), lastSumCalculator.getTotalSteps())
    scheduleNextFrame();
  }

  function redrawCurrentPoints() {
    webGLScene.renderFrame();
  }

  function markTouched() { touched = true; }

  function updateBoundingBox() {
    if (touched || !lastSumCalculator.bboxChanged) {
      return;
    }

    let boundingBox = lastSumCalculator.getBoundingBox();
    let dx = (boundingBox.maxX - boundingBox.minX) * 0.1;
    let dy = (boundingBox.maxY - boundingBox.minY) * 0.1;

    webGLScene.setViewBox({
      left:  boundingBox.minX - dx,
      top:   boundingBox.minY - dy,
      right:  boundingBox.maxX + dx,
      bottom: boundingBox.maxY + dy,
    })

    lastSumCalculator.bboxChanged = false;
  }
};