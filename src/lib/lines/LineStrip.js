import {Element} from 'w-gl';
import Color from 'w-gl/src/Color';
import makeLineStripProgram from './makeLineStripProgram';


export default class LineStripCollection extends Element {
  constructor(capacity, allowColors = false) {
    super();

    let bytesPerElement = 4;
    this.drawCount = 0;
    this.madeFullCircle = false;

    this.allowColors = allowColors;
    this.itemsPerLine = allowColors ? 2 + 1 : 2;
    this.capacity = capacity;
    this.nextElementIndex = 1;
    this._program = null;
    this.color = new Color(1, 1, 1, 1);
    this.buffer = new ArrayBuffer((capacity + 1) * this.itemsPerLine * bytesPerElement)
    this.positions = new Float32Array(this.buffer);
    if (allowColors) {
      this.colors = new Uint32Array(this.buffer);
    }
  }

  draw(gl, screen) {
    if (!this._program) {
      this._program = makeLineStripProgram(gl, this.buffer, this.allowColors);
    }
    let transform = this.worldTransform;

    this._program.draw(transform, this.color, screen, this.nextElementIndex, this.madeFullCircle);
  }

  add(x, y, color) {
    var offset = this.nextElementIndex * this.itemsPerLine;
    let positions = this.positions;
    positions[offset] = x;
    positions[offset + 1] = y;

    if (this.allowColors) {
      this.colors[offset + 2] = color === undefined ? 0 : color;
    }
    this.nextElementIndex += 1;
    this.drawCount += 1;

    if (this.nextElementIndex > this.capacity) {
      this.nextElementIndex = 1;
      positions[0] = x;
      positions[0 + 1] = y;
      if (this.allowColors) {
        this.colors[2] = this.colors[offset + 2];
      }
      this.madeFullCircle = true;
    }
  }

  dispose() {
    if (this._program) {
      this._program.dispose();
      this._program = null;
    }
  }
}