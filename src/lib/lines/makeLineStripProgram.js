import {utils} from 'w-gl';
import shaderGraph from 'w-gl/src/shaderGraph/index.js';

export default makeLineProgram;

let lineProgramCache = new Map();

function makeLineProgram(gl, data, allowColors) {
  // TODO: Cache on allow colors too
  let lineProgram = lineProgramCache.get(gl)
  const itemsPerVertex = allowColors ? 3 : 2;
  if (!lineProgram) {
    const {lineFSSrc, lineVSSrc} = getShadersCode(allowColors);
    var lineVSShader = utils.compile(gl, gl.VERTEX_SHADER, lineVSSrc);
    var lineFSShader = utils.compile(gl, gl.FRAGMENT_SHADER, lineFSSrc);
    lineProgram = utils.link(gl, lineVSShader, lineFSShader);
    lineProgramCache.set(gl, lineProgram);
  }

  var locations = utils.getLocations(gl, lineProgram);

  var lineBuffer = gl.createBuffer();

  var api = {
    draw,
    dispose
  }

  return api;

  function dispose() {
    gl.deleteBuffer(lineBuffer);
    gl.deleteProgram(lineProgram);
    lineProgramCache.delete(gl);
  }

  function draw(transform, color, screen, startFrom, madeFullCircle) {
    if (data.length === 0) return;

    gl.useProgram(lineProgram);

    const transformArray = transform.getArray();
    gl.uniformMatrix4fv(locations.uniforms.uTransform, false, transformArray);
    gl.uniform2f(locations.uniforms.uScreenSize, screen.width, screen.height);
    gl.uniform4f(locations.uniforms.uColor, color.r, color.g, color.b, color.a);

    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.enableVertexAttribArray(locations.attributes.aPosition)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    if (allowColors) {
      gl.vertexAttribPointer(locations.attributes.aPosition, 2, gl.FLOAT, false, 3 * 4, 0)
      gl.enableVertexAttribArray(locations.attributes.aColor);
      gl.vertexAttribPointer(locations.attributes.aColor, 4, gl.UNSIGNED_BYTE, true, 3 * 4, 2 * 4)
    } else {
      gl.vertexAttribPointer(locations.attributes.aPosition, 2, gl.FLOAT, false, 0, 0)
    }

    if (madeFullCircle) {
      let elementsCount = ((data.byteLength/4) / itemsPerVertex) - startFrom;
      gl.drawArrays(gl.LINE_STRIP, startFrom, elementsCount); 
      if (startFrom > 1) gl.drawArrays(gl.LINE_STRIP, 0, startFrom - 1); 
    } else {
      gl.drawArrays(gl.LINE_STRIP, 1, startFrom - 1); 
    }
  }
}

function getShadersCode(allowColors) {
  const lineFSSrc = `precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}
`;
  const lineVSSrc = shaderGraph.getVSCode([{
    globals() {
      return `
  attribute vec2 aPosition;
  varying vec4 vColor;
  ${allowColors ? 'attribute vec4 aColor;' : ''}
  uniform vec4 uColor;
  uniform vec2 uScreenSize;
  uniform mat4 uTransform;
`;
  },
  mainBody() {
    return `
  mat4 transformed = mat4(uTransform);

  // Translate screen coordinates to webgl space
  vec2 vv = 2.0 * uTransform[3].xy/uScreenSize;
  transformed[3][0] = vv.x - 1.0;
  transformed[3][1] = 1.0 - vv.y;
  vec2 xy = 2.0 * aPosition.xy/uScreenSize;
  gl_Position = transformed * vec4(xy.x, -xy.y, 0.0, 1.0);
  vColor = ${allowColors ? 'aColor.abgr' : 'uColor'};
`
  }
}]);
return {lineVSSrc, lineFSSrc};

}