function encodeColor(r, g, b, a) {
  return ((r & 0xFF) << 24) | ((g & 0xFF) << 16) | ((b & 0xFF) << 8) | ((a * 255) & 0xFF);
}
exports.encodeColor = encodeColor;
