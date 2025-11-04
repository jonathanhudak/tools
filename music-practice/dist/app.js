var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all4) => {
  for (var name2 in all4)
    __defProp(target, name2, { get: all4[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod2, enumerable: true }) ,
  mod2
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/fft.js/lib/fft.js
var require_fft = __commonJS({
  "node_modules/fft.js/lib/fft.js"(exports, module) {
    function FFT2(size) {
      this.size = size | 0;
      if (this.size <= 1 || (this.size & this.size - 1) !== 0)
        throw new Error("FFT size must be a power of two and bigger than 1");
      this._csize = size << 1;
      var table = new Array(this.size * 2);
      for (var i = 0; i < table.length; i += 2) {
        const angle = Math.PI * i / this.size;
        table[i] = Math.cos(angle);
        table[i + 1] = -Math.sin(angle);
      }
      this.table = table;
      var power = 0;
      for (var t = 1; this.size > t; t <<= 1)
        power++;
      this._width = power % 2 === 0 ? power - 1 : power;
      this._bitrev = new Array(1 << this._width);
      for (var j = 0; j < this._bitrev.length; j++) {
        this._bitrev[j] = 0;
        for (var shift = 0; shift < this._width; shift += 2) {
          var revShift = this._width - shift - 2;
          this._bitrev[j] |= (j >>> shift & 3) << revShift;
        }
      }
      this._out = null;
      this._data = null;
      this._inv = 0;
    }
    module.exports = FFT2;
    FFT2.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
      var res = storage || new Array(complex.length >>> 1);
      for (var i = 0; i < complex.length; i += 2)
        res[i >>> 1] = complex[i];
      return res;
    };
    FFT2.prototype.createComplexArray = function createComplexArray() {
      const res = new Array(this._csize);
      for (var i = 0; i < res.length; i++)
        res[i] = 0;
      return res;
    };
    FFT2.prototype.toComplexArray = function toComplexArray(input, storage) {
      var res = storage || this.createComplexArray();
      for (var i = 0; i < res.length; i += 2) {
        res[i] = input[i >>> 1];
        res[i + 1] = 0;
      }
      return res;
    };
    FFT2.prototype.completeSpectrum = function completeSpectrum(spectrum) {
      var size = this._csize;
      var half = size >>> 1;
      for (var i = 2; i < half; i += 2) {
        spectrum[size - i] = spectrum[i];
        spectrum[size - i + 1] = -spectrum[i + 1];
      }
    };
    FFT2.prototype.transform = function transform(out, data) {
      if (out === data)
        throw new Error("Input and output buffers must be different");
      this._out = out;
      this._data = data;
      this._inv = 0;
      this._transform4();
      this._out = null;
      this._data = null;
    };
    FFT2.prototype.realTransform = function realTransform(out, data) {
      if (out === data)
        throw new Error("Input and output buffers must be different");
      this._out = out;
      this._data = data;
      this._inv = 0;
      this._realTransform4();
      this._out = null;
      this._data = null;
    };
    FFT2.prototype.inverseTransform = function inverseTransform(out, data) {
      if (out === data)
        throw new Error("Input and output buffers must be different");
      this._out = out;
      this._data = data;
      this._inv = 1;
      this._transform4();
      for (var i = 0; i < out.length; i++)
        out[i] /= this.size;
      this._out = null;
      this._data = null;
    };
    FFT2.prototype._transform4 = function _transform4() {
      var out = this._out;
      var size = this._csize;
      var width = this._width;
      var step = 1 << width;
      var len = size / step << 1;
      var outOff;
      var t;
      var bitrev = this._bitrev;
      if (len === 4) {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleTransform2(outOff, off, step);
        }
      } else {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleTransform4(outOff, off, step);
        }
      }
      var inv = this._inv ? -1 : 1;
      var table = this.table;
      for (step >>= 2; step >= 2; step >>= 2) {
        len = size / step << 1;
        var quarterLen = len >>> 2;
        for (outOff = 0; outOff < size; outOff += len) {
          var limit = outOff + quarterLen;
          for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
            const A = i;
            const B = A + quarterLen;
            const C = B + quarterLen;
            const D = C + quarterLen;
            const Ar = out[A];
            const Ai = out[A + 1];
            const Br = out[B];
            const Bi = out[B + 1];
            const Cr = out[C];
            const Ci = out[C + 1];
            const Dr = out[D];
            const Di = out[D + 1];
            const MAr = Ar;
            const MAi = Ai;
            const tableBr = table[k];
            const tableBi = inv * table[k + 1];
            const MBr = Br * tableBr - Bi * tableBi;
            const MBi = Br * tableBi + Bi * tableBr;
            const tableCr = table[2 * k];
            const tableCi = inv * table[2 * k + 1];
            const MCr = Cr * tableCr - Ci * tableCi;
            const MCi = Cr * tableCi + Ci * tableCr;
            const tableDr = table[3 * k];
            const tableDi = inv * table[3 * k + 1];
            const MDr = Dr * tableDr - Di * tableDi;
            const MDi = Dr * tableDi + Di * tableDr;
            const T0r = MAr + MCr;
            const T0i = MAi + MCi;
            const T1r = MAr - MCr;
            const T1i = MAi - MCi;
            const T2r = MBr + MDr;
            const T2i = MBi + MDi;
            const T3r = inv * (MBr - MDr);
            const T3i = inv * (MBi - MDi);
            const FAr = T0r + T2r;
            const FAi = T0i + T2i;
            const FCr = T0r - T2r;
            const FCi = T0i - T2i;
            const FBr = T1r + T3i;
            const FBi = T1i - T3r;
            const FDr = T1r - T3i;
            const FDi = T1i + T3r;
            out[A] = FAr;
            out[A + 1] = FAi;
            out[B] = FBr;
            out[B + 1] = FBi;
            out[C] = FCr;
            out[C + 1] = FCi;
            out[D] = FDr;
            out[D + 1] = FDi;
          }
        }
      }
    };
    FFT2.prototype._singleTransform2 = function _singleTransform2(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const evenR = data[off];
      const evenI = data[off + 1];
      const oddR = data[off + step];
      const oddI = data[off + step + 1];
      const leftR = evenR + oddR;
      const leftI = evenI + oddI;
      const rightR = evenR - oddR;
      const rightI = evenI - oddI;
      out[outOff] = leftR;
      out[outOff + 1] = leftI;
      out[outOff + 2] = rightR;
      out[outOff + 3] = rightI;
    };
    FFT2.prototype._singleTransform4 = function _singleTransform4(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const inv = this._inv ? -1 : 1;
      const step2 = step * 2;
      const step3 = step * 3;
      const Ar = data[off];
      const Ai = data[off + 1];
      const Br = data[off + step];
      const Bi = data[off + step + 1];
      const Cr = data[off + step2];
      const Ci = data[off + step2 + 1];
      const Dr = data[off + step3];
      const Di = data[off + step3 + 1];
      const T0r = Ar + Cr;
      const T0i = Ai + Ci;
      const T1r = Ar - Cr;
      const T1i = Ai - Ci;
      const T2r = Br + Dr;
      const T2i = Bi + Di;
      const T3r = inv * (Br - Dr);
      const T3i = inv * (Bi - Di);
      const FAr = T0r + T2r;
      const FAi = T0i + T2i;
      const FBr = T1r + T3i;
      const FBi = T1i - T3r;
      const FCr = T0r - T2r;
      const FCi = T0i - T2i;
      const FDr = T1r - T3i;
      const FDi = T1i + T3r;
      out[outOff] = FAr;
      out[outOff + 1] = FAi;
      out[outOff + 2] = FBr;
      out[outOff + 3] = FBi;
      out[outOff + 4] = FCr;
      out[outOff + 5] = FCi;
      out[outOff + 6] = FDr;
      out[outOff + 7] = FDi;
    };
    FFT2.prototype._realTransform4 = function _realTransform4() {
      var out = this._out;
      var size = this._csize;
      var width = this._width;
      var step = 1 << width;
      var len = size / step << 1;
      var outOff;
      var t;
      var bitrev = this._bitrev;
      if (len === 4) {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
        }
      } else {
        for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
          const off = bitrev[t];
          this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
        }
      }
      var inv = this._inv ? -1 : 1;
      var table = this.table;
      for (step >>= 2; step >= 2; step >>= 2) {
        len = size / step << 1;
        var halfLen = len >>> 1;
        var quarterLen = halfLen >>> 1;
        var hquarterLen = quarterLen >>> 1;
        for (outOff = 0; outOff < size; outOff += len) {
          for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
            var A = outOff + i;
            var B = A + quarterLen;
            var C = B + quarterLen;
            var D = C + quarterLen;
            var Ar = out[A];
            var Ai = out[A + 1];
            var Br = out[B];
            var Bi = out[B + 1];
            var Cr = out[C];
            var Ci = out[C + 1];
            var Dr = out[D];
            var Di = out[D + 1];
            var MAr = Ar;
            var MAi = Ai;
            var tableBr = table[k];
            var tableBi = inv * table[k + 1];
            var MBr = Br * tableBr - Bi * tableBi;
            var MBi = Br * tableBi + Bi * tableBr;
            var tableCr = table[2 * k];
            var tableCi = inv * table[2 * k + 1];
            var MCr = Cr * tableCr - Ci * tableCi;
            var MCi = Cr * tableCi + Ci * tableCr;
            var tableDr = table[3 * k];
            var tableDi = inv * table[3 * k + 1];
            var MDr = Dr * tableDr - Di * tableDi;
            var MDi = Dr * tableDi + Di * tableDr;
            var T0r = MAr + MCr;
            var T0i = MAi + MCi;
            var T1r = MAr - MCr;
            var T1i = MAi - MCi;
            var T2r = MBr + MDr;
            var T2i = MBi + MDi;
            var T3r = inv * (MBr - MDr);
            var T3i = inv * (MBi - MDi);
            var FAr = T0r + T2r;
            var FAi = T0i + T2i;
            var FBr = T1r + T3i;
            var FBi = T1i - T3r;
            out[A] = FAr;
            out[A + 1] = FAi;
            out[B] = FBr;
            out[B + 1] = FBi;
            if (i === 0) {
              var FCr = T0r - T2r;
              var FCi = T0i - T2i;
              out[C] = FCr;
              out[C + 1] = FCi;
              continue;
            }
            if (i === hquarterLen)
              continue;
            var ST0r = T1r;
            var ST0i = -T1i;
            var ST1r = T0r;
            var ST1i = -T0i;
            var ST2r = -inv * T3i;
            var ST2i = -inv * T3r;
            var ST3r = -inv * T2i;
            var ST3i = -inv * T2r;
            var SFAr = ST0r + ST2r;
            var SFAi = ST0i + ST2i;
            var SFBr = ST1r + ST3i;
            var SFBi = ST1i - ST3r;
            var SA = outOff + quarterLen - i;
            var SB = outOff + halfLen - i;
            out[SA] = SFAr;
            out[SA + 1] = SFAi;
            out[SB] = SFBr;
            out[SB + 1] = SFBi;
          }
        }
      }
    };
    FFT2.prototype._singleRealTransform2 = function _singleRealTransform2(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const evenR = data[off];
      const oddR = data[off + step];
      const leftR = evenR + oddR;
      const rightR = evenR - oddR;
      out[outOff] = leftR;
      out[outOff + 1] = 0;
      out[outOff + 2] = rightR;
      out[outOff + 3] = 0;
    };
    FFT2.prototype._singleRealTransform4 = function _singleRealTransform4(outOff, off, step) {
      const out = this._out;
      const data = this._data;
      const inv = this._inv ? -1 : 1;
      const step2 = step * 2;
      const step3 = step * 3;
      const Ar = data[off];
      const Br = data[off + step];
      const Cr = data[off + step2];
      const Dr = data[off + step3];
      const T0r = Ar + Cr;
      const T1r = Ar - Cr;
      const T2r = Br + Dr;
      const T3r = inv * (Br - Dr);
      const FAr = T0r + T2r;
      const FBr = T1r;
      const FBi = -T3r;
      const FCr = T0r - T2r;
      const FDr = T1r;
      const FDi = T3r;
      out[outOff] = FAr;
      out[outOff + 1] = 0;
      out[outOff + 2] = FBr;
      out[outOff + 3] = FBi;
      out[outOff + 4] = FCr;
      out[outOff + 5] = 0;
      out[outOff + 6] = FDr;
      out[outOff + 7] = FDi;
    };
  }
});

// node_modules/@tonaljs/pitch/dist/index.mjs
function isNamedPitch(src) {
  return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
}
function isPitch(pitch2) {
  return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
}
var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
var STEPS_TO_OCTS = FIFTHS.map(
  (fifths) => Math.floor(fifths * 7 / 12)
);
function coordinates(pitch2) {
  const { step, alt, oct, dir = 1 } = pitch2;
  const f = FIFTHS[step] + 7 * alt;
  if (oct === void 0) {
    return [dir * f];
  }
  const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
  return [dir * f, dir * o];
}
var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
function pitch(coord) {
  const [f, o, dir] = coord;
  const step = FIFTHS_TO_STEPS[unaltered(f)];
  const alt = Math.floor((f + 1) / 7);
  if (o === void 0) {
    return { step, alt, dir };
  }
  const oct = o + 4 * alt + STEPS_TO_OCTS[step];
  return { step, alt, oct, dir };
}
function unaltered(f) {
  const i = (f + 1) % 7;
  return i < 0 ? 7 + i : i;
}

// node_modules/@tonaljs/pitch-interval/dist/index.mjs
var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
var NoInterval = Object.freeze({
  empty: true,
  name: "",
  num: NaN,
  q: "",
  type: "",
  step: NaN,
  alt: NaN,
  dir: NaN,
  simple: NaN,
  semitones: NaN,
  chroma: NaN,
  coord: [],
  oct: NaN
});
var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
var REGEX = new RegExp(
  "^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$"
);
function tokenizeInterval(str) {
  const m = REGEX.exec(`${str}`);
  if (m === null) {
    return ["", ""];
  }
  return m[1] ? [m[1], m[2]] : [m[4], m[3]];
}
var cache = {};
function interval(src) {
  return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : isPitch(src) ? interval(pitchName(src)) : isNamedPitch(src) ? interval(src.name) : NoInterval;
}
var SIZES = [0, 2, 4, 5, 7, 9, 11];
var TYPES = "PMMPPMM";
function parse(str) {
  const tokens = tokenizeInterval(str);
  if (tokens[0] === "") {
    return NoInterval;
  }
  const num = +tokens[0];
  const q = tokens[1];
  const step = (Math.abs(num) - 1) % 7;
  const t = TYPES[step];
  if (t === "M" && q === "P") {
    return NoInterval;
  }
  const type = t === "M" ? "majorable" : "perfectable";
  const name2 = "" + num + q;
  const dir = num < 0 ? -1 : 1;
  const simple = num === 8 || num === -8 ? num : dir * (step + 1);
  const alt = qToAlt(type, q);
  const oct = Math.floor((Math.abs(num) - 1) / 7);
  const semitones = dir * (SIZES[step] + alt + 12 * oct);
  const chroma3 = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
  const coord = coordinates({ step, alt, oct, dir });
  return {
    empty: false,
    name: name2,
    num,
    q,
    step,
    alt,
    dir,
    type,
    simple,
    semitones,
    chroma: chroma3,
    coord,
    oct
  };
}
function coordToInterval(coord, forceDescending) {
  const [f, o = 0] = coord;
  const isDescending = f * 7 + o * 12 < 0;
  const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
  return interval(pitch(ivl));
}
function qToAlt(type, q) {
  return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
}
function pitchName(props) {
  const { step, alt, oct = 0, dir } = props;
  if (!dir) {
    return "";
  }
  const calcNum = step + 1 + 7 * oct;
  const num = calcNum === 0 ? step + 1 : calcNum;
  const d = dir < 0 ? "-" : "";
  const type = TYPES[step] === "M" ? "majorable" : "perfectable";
  const name2 = d + num + altToQ(type, alt);
  return name2;
}
function altToQ(type, alt) {
  if (alt === 0) {
    return type === "majorable" ? "M" : "P";
  } else if (alt === -1 && type === "majorable") {
    return "m";
  } else if (alt > 0) {
    return fillStr("A", alt);
  } else {
    return fillStr("d", type === "perfectable" ? alt : alt + 1);
  }
}

// node_modules/@tonaljs/pitch-note/dist/index.mjs
var fillStr2 = (s, n) => Array(Math.abs(n) + 1).join(s);
var NoNote = Object.freeze({
  empty: true,
  name: "",
  letter: "",
  acc: "",
  pc: "",
  step: NaN,
  alt: NaN,
  chroma: NaN,
  height: NaN,
  coord: [],
  midi: null,
  freq: null
});
var cache2 = /* @__PURE__ */ new Map();
var stepToLetter = (step) => "CDEFGAB".charAt(step);
var altToAcc = (alt) => alt < 0 ? fillStr2("b", -alt) : fillStr2("#", alt);
var accToAlt = (acc) => acc[0] === "b" ? -acc.length : acc.length;
function note(src) {
  const stringSrc = JSON.stringify(src);
  const cached = cache2.get(stringSrc);
  if (cached) {
    return cached;
  }
  const value = typeof src === "string" ? parse2(src) : isPitch(src) ? note(pitchName2(src)) : isNamedPitch(src) ? note(src.name) : NoNote;
  cache2.set(stringSrc, value);
  return value;
}
var REGEX2 = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;
function tokenizeNote(str) {
  const m = REGEX2.exec(str);
  return m ? [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]] : ["", "", "", ""];
}
function coordToNote(noteCoord) {
  return note(pitch(noteCoord));
}
var mod = (n, m) => (n % m + m) % m;
var SEMI = [0, 2, 4, 5, 7, 9, 11];
function parse2(noteName) {
  const tokens = tokenizeNote(noteName);
  if (tokens[0] === "" || tokens[3] !== "") {
    return NoNote;
  }
  const letter = tokens[0];
  const acc = tokens[1];
  const octStr = tokens[2];
  const step = (letter.charCodeAt(0) + 3) % 7;
  const alt = accToAlt(acc);
  const oct = octStr.length ? +octStr : void 0;
  const coord = coordinates({ step, alt, oct });
  const name2 = letter + acc + octStr;
  const pc = letter + acc;
  const chroma3 = (SEMI[step] + alt + 120) % 12;
  const height = oct === void 0 ? mod(SEMI[step] + alt, 12) - 12 * 99 : SEMI[step] + alt + 12 * (oct + 1);
  const midi2 = height >= 0 && height <= 127 ? height : null;
  const freq2 = oct === void 0 ? null : Math.pow(2, (height - 69) / 12) * 440;
  return {
    empty: false,
    acc,
    alt,
    chroma: chroma3,
    coord,
    freq: freq2,
    height,
    letter,
    midi: midi2,
    name: name2,
    oct,
    pc,
    step
  };
}
function pitchName2(props) {
  const { step, alt, oct } = props;
  const letter = stepToLetter(step);
  if (!letter) {
    return "";
  }
  const pc = letter + altToAcc(alt);
  return oct || oct === 0 ? pc + oct : pc;
}

// node_modules/@tonaljs/pitch-distance/dist/index.mjs
function transpose(noteName, intervalName) {
  const note2 = note(noteName);
  const intervalCoord = Array.isArray(intervalName) ? intervalName : interval(intervalName).coord;
  if (note2.empty || !intervalCoord || intervalCoord.length < 2) {
    return "";
  }
  const noteCoord = note2.coord;
  const tr2 = noteCoord.length === 1 ? [noteCoord[0] + intervalCoord[0]] : [noteCoord[0] + intervalCoord[0], noteCoord[1] + intervalCoord[1]];
  return coordToNote(tr2).name;
}
function tonicIntervalsTransposer(intervals, tonic) {
  const len = intervals.length;
  return (normalized) => {
    if (!tonic) return "";
    const index4 = normalized < 0 ? (len - -normalized % len) % len : normalized % len;
    const octaves = Math.floor(normalized / len);
    const root = transpose(tonic, [0, octaves]);
    return transpose(root, intervals[index4]);
  };
}
function distance(fromNote, toNote) {
  const from = note(fromNote);
  const to = note(toNote);
  if (from.empty || to.empty) {
    return "";
  }
  const fcoord = from.coord;
  const tcoord = to.coord;
  const fifths = tcoord[0] - fcoord[0];
  const octs = fcoord.length === 2 && tcoord.length === 2 ? tcoord[1] - fcoord[1] : -Math.floor(fifths * 7 / 12);
  const forceDescending = to.height === from.height && to.midi !== null && from.oct === to.oct && from.step > to.step;
  return coordToInterval([fifths, octs], forceDescending).name;
}

// node_modules/@tonaljs/chord/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  chord: () => chord,
  chordScales: () => chordScales,
  default: () => chord_default,
  degrees: () => degrees,
  detect: () => detect,
  extended: () => extended,
  get: () => get4,
  getChord: () => getChord,
  notes: () => notes,
  reduced: () => reduced,
  steps: () => steps,
  tokenize: () => tokenize,
  transpose: () => transpose2
});

// node_modules/@tonaljs/collection/dist/index.mjs
function ascR(b, n) {
  const a = [];
  for (; n--; a[n] = n + b) ;
  return a;
}
function descR(b, n) {
  const a = [];
  for (; n--; a[n] = b - n) ;
  return a;
}
function range(from, to) {
  return from < to ? ascR(from, to - from + 1) : descR(from, from - to + 1);
}
function rotate(times, arr) {
  const len = arr.length;
  const n = (times % len + len) % len;
  return arr.slice(n, len).concat(arr.slice(0, n));
}
function compact(arr) {
  return arr.filter((n) => n === 0 || n);
}

// node_modules/@tonaljs/pcset/dist/index.mjs
var EmptyPcset = {
  empty: true,
  name: "",
  setNum: 0,
  chroma: "000000000000",
  normalized: "000000000000",
  intervals: []
};
var setNumToChroma = (num2) => Number(num2).toString(2).padStart(12, "0");
var chromaToNumber = (chroma22) => parseInt(chroma22, 2);
var REGEX3 = /^[01]{12}$/;
function isChroma(set) {
  return REGEX3.test(set);
}
var isPcsetNum = (set) => typeof set === "number" && set >= 0 && set <= 4095;
var isPcset = (set) => set && isChroma(set.chroma);
var cache3 = { [EmptyPcset.chroma]: EmptyPcset };
function get(src) {
  const chroma22 = isChroma(src) ? src : isPcsetNum(src) ? setNumToChroma(src) : Array.isArray(src) ? listToChroma(src) : isPcset(src) ? src.chroma : EmptyPcset.chroma;
  return cache3[chroma22] = cache3[chroma22] || chromaToPcset(chroma22);
}
var chroma = (set) => get(set).chroma;
var IVLS = [
  "1P",
  "2m",
  "2M",
  "3m",
  "3M",
  "4P",
  "5d",
  "5P",
  "6m",
  "6M",
  "7m",
  "7M"
];
function chromaToIntervals(chroma22) {
  const intervals2 = [];
  for (let i = 0; i < 12; i++) {
    if (chroma22.charAt(i) === "1") intervals2.push(IVLS[i]);
  }
  return intervals2;
}
function modes(set, normalize = true) {
  const pcs = get(set);
  const binary = pcs.chroma.split("");
  return compact(
    binary.map((_, i) => {
      const r = rotate(i, binary);
      return normalize && r[0] === "0" ? null : r.join("");
    })
  );
}
function isSubsetOf(set) {
  const s = get(set).setNum;
  return (notes2) => {
    const o = get(notes2).setNum;
    return s && s !== o && (o & s) === o;
  };
}
function isSupersetOf(set) {
  const s = get(set).setNum;
  return (notes2) => {
    const o = get(notes2).setNum;
    return s && s !== o && (o | s) === o;
  };
}
function chromaRotations(chroma22) {
  const binary = chroma22.split("");
  return binary.map((_, i) => rotate(i, binary).join(""));
}
function chromaToPcset(chroma22) {
  const setNum = chromaToNumber(chroma22);
  const normalizedNum = chromaRotations(chroma22).map(chromaToNumber).filter((n) => n >= 2048).sort()[0];
  const normalized = setNumToChroma(normalizedNum);
  const intervals2 = chromaToIntervals(chroma22);
  return {
    empty: false,
    name: "",
    setNum,
    chroma: chroma22,
    normalized,
    intervals: intervals2
  };
}
function listToChroma(set) {
  if (set.length === 0) {
    return EmptyPcset.chroma;
  }
  let pitch2;
  const binary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < set.length; i++) {
    pitch2 = note(set[i]);
    if (pitch2.empty) pitch2 = interval(set[i]);
    if (!pitch2.empty) binary[pitch2.chroma] = 1;
  }
  return binary.join("");
}

// node_modules/@tonaljs/chord-type/dist/index.mjs
var CHORDS = [
  // ==Major==
  ["1P 3M 5P", "major", "M ^  maj"],
  ["1P 3M 5P 7M", "major seventh", "maj7 \u0394 ma7 M7 Maj7 ^7"],
  ["1P 3M 5P 7M 9M", "major ninth", "maj9 \u03949 ^9"],
  ["1P 3M 5P 7M 9M 13M", "major thirteenth", "maj13 Maj13 ^13"],
  ["1P 3M 5P 6M", "sixth", "6 add6 add13 M6"],
  ["1P 3M 5P 6M 9M", "sixth added ninth", "6add9 6/9 69 M69"],
  ["1P 3M 6m 7M", "major seventh flat sixth", "M7b6 ^7b6"],
  [
    "1P 3M 5P 7M 11A",
    "major seventh sharp eleventh",
    "maj#4 \u0394#4 \u0394#11 M7#11 ^7#11 maj7#11"
  ],
  // ==Minor==
  // '''Normal'''
  ["1P 3m 5P", "minor", "m min -"],
  ["1P 3m 5P 7m", "minor seventh", "m7 min7 mi7 -7"],
  [
    "1P 3m 5P 7M",
    "minor/major seventh",
    "m/ma7 m/maj7 mM7 mMaj7 m/M7 -\u03947 m\u0394 -^7 -maj7"
  ],
  ["1P 3m 5P 6M", "minor sixth", "m6 -6"],
  ["1P 3m 5P 7m 9M", "minor ninth", "m9 -9"],
  ["1P 3m 5P 7M 9M", "minor/major ninth", "mM9 mMaj9 -^9"],
  ["1P 3m 5P 7m 9M 11P", "minor eleventh", "m11 -11"],
  ["1P 3m 5P 7m 9M 13M", "minor thirteenth", "m13 -13"],
  // '''Diminished'''
  ["1P 3m 5d", "diminished", "dim \xB0 o"],
  ["1P 3m 5d 7d", "diminished seventh", "dim7 \xB07 o7"],
  ["1P 3m 5d 7m", "half-diminished", "m7b5 \xF8 -7b5 h7 h"],
  // ==Dominant/Seventh==
  // '''Normal'''
  ["1P 3M 5P 7m", "dominant seventh", "7 dom"],
  ["1P 3M 5P 7m 9M", "dominant ninth", "9"],
  ["1P 3M 5P 7m 9M 13M", "dominant thirteenth", "13"],
  ["1P 3M 5P 7m 11A", "lydian dominant seventh", "7#11 7#4"],
  // '''Altered'''
  ["1P 3M 5P 7m 9m", "dominant flat ninth", "7b9"],
  ["1P 3M 5P 7m 9A", "dominant sharp ninth", "7#9"],
  ["1P 3M 7m 9m", "altered", "alt7"],
  // '''Suspended'''
  ["1P 4P 5P", "suspended fourth", "sus4 sus"],
  ["1P 2M 5P", "suspended second", "sus2"],
  ["1P 4P 5P 7m", "suspended fourth seventh", "7sus4 7sus"],
  ["1P 5P 7m 9M 11P", "eleventh", "11"],
  [
    "1P 4P 5P 7m 9m",
    "suspended fourth flat ninth",
    "b9sus phryg 7b9sus 7b9sus4"
  ],
  // ==Other==
  ["1P 5P", "fifth", "5"],
  ["1P 3M 5A", "augmented", "aug + +5 ^#5"],
  ["1P 3m 5A", "minor augmented", "m#5 -#5 m+"],
  ["1P 3M 5A 7M", "augmented seventh", "maj7#5 maj7+5 +maj7 ^7#5"],
  [
    "1P 3M 5P 7M 9M 11A",
    "major sharp eleventh (lydian)",
    "maj9#11 \u03949#11 ^9#11"
  ],
  // ==Legacy==
  ["1P 2M 4P 5P", "", "sus24 sus4add9"],
  ["1P 3M 5A 7M 9M", "", "maj9#5 Maj9#5"],
  ["1P 3M 5A 7m", "", "7#5 +7 7+ 7aug aug7"],
  ["1P 3M 5A 7m 9A", "", "7#5#9 7#9#5 7alt"],
  ["1P 3M 5A 7m 9M", "", "9#5 9+"],
  ["1P 3M 5A 7m 9M 11A", "", "9#5#11"],
  ["1P 3M 5A 7m 9m", "", "7#5b9 7b9#5"],
  ["1P 3M 5A 7m 9m 11A", "", "7#5b9#11"],
  ["1P 3M 5A 9A", "", "+add#9"],
  ["1P 3M 5A 9M", "", "M#5add9 +add9"],
  ["1P 3M 5P 6M 11A", "", "M6#11 M6b5 6#11 6b5"],
  ["1P 3M 5P 6M 7M 9M", "", "M7add13"],
  ["1P 3M 5P 6M 9M 11A", "", "69#11"],
  ["1P 3m 5P 6M 9M", "", "m69 -69"],
  ["1P 3M 5P 6m 7m", "", "7b6"],
  ["1P 3M 5P 7M 9A 11A", "", "maj7#9#11"],
  ["1P 3M 5P 7M 9M 11A 13M", "", "M13#11 maj13#11 M13+4 M13#4"],
  ["1P 3M 5P 7M 9m", "", "M7b9"],
  ["1P 3M 5P 7m 11A 13m", "", "7#11b13 7b5b13"],
  ["1P 3M 5P 7m 13M", "", "7add6 67 7add13"],
  ["1P 3M 5P 7m 9A 11A", "", "7#9#11 7b5#9 7#9b5"],
  ["1P 3M 5P 7m 9A 11A 13M", "", "13#9#11"],
  ["1P 3M 5P 7m 9A 11A 13m", "", "7#9#11b13"],
  ["1P 3M 5P 7m 9A 13M", "", "13#9"],
  ["1P 3M 5P 7m 9A 13m", "", "7#9b13"],
  ["1P 3M 5P 7m 9M 11A", "", "9#11 9+4 9#4"],
  ["1P 3M 5P 7m 9M 11A 13M", "", "13#11 13+4 13#4"],
  ["1P 3M 5P 7m 9M 11A 13m", "", "9#11b13 9b5b13"],
  ["1P 3M 5P 7m 9m 11A", "", "7b9#11 7b5b9 7b9b5"],
  ["1P 3M 5P 7m 9m 11A 13M", "", "13b9#11"],
  ["1P 3M 5P 7m 9m 11A 13m", "", "7b9b13#11 7b9#11b13 7b5b9b13"],
  ["1P 3M 5P 7m 9m 13M", "", "13b9"],
  ["1P 3M 5P 7m 9m 13m", "", "7b9b13"],
  ["1P 3M 5P 7m 9m 9A", "", "7b9#9"],
  ["1P 3M 5P 9M", "", "Madd9 2 add9 add2"],
  ["1P 3M 5P 9m", "", "Maddb9"],
  ["1P 3M 5d", "", "Mb5"],
  ["1P 3M 5d 6M 7m 9M", "", "13b5"],
  ["1P 3M 5d 7M", "", "M7b5"],
  ["1P 3M 5d 7M 9M", "", "M9b5"],
  ["1P 3M 5d 7m", "", "7b5"],
  ["1P 3M 5d 7m 9M", "", "9b5"],
  ["1P 3M 7m", "", "7no5"],
  ["1P 3M 7m 13m", "", "7b13"],
  ["1P 3M 7m 9M", "", "9no5"],
  ["1P 3M 7m 9M 13M", "", "13no5"],
  ["1P 3M 7m 9M 13m", "", "9b13"],
  ["1P 3m 4P 5P", "", "madd4"],
  ["1P 3m 5P 6m 7M", "", "mMaj7b6"],
  ["1P 3m 5P 6m 7M 9M", "", "mMaj9b6"],
  ["1P 3m 5P 7m 11P", "", "m7add11 m7add4"],
  ["1P 3m 5P 9M", "", "madd9"],
  ["1P 3m 5d 6M 7M", "", "o7M7"],
  ["1P 3m 5d 7M", "", "oM7"],
  ["1P 3m 6m 7M", "", "mb6M7"],
  ["1P 3m 6m 7m", "", "m7#5"],
  ["1P 3m 6m 7m 9M", "", "m9#5"],
  ["1P 3m 5A 7m 9M 11P", "", "m11A"],
  ["1P 3m 6m 9m", "", "mb6b9"],
  ["1P 2M 3m 5d 7m", "", "m9b5"],
  ["1P 4P 5A 7M", "", "M7#5sus4"],
  ["1P 4P 5A 7M 9M", "", "M9#5sus4"],
  ["1P 4P 5A 7m", "", "7#5sus4"],
  ["1P 4P 5P 7M", "", "M7sus4"],
  ["1P 4P 5P 7M 9M", "", "M9sus4"],
  ["1P 4P 5P 7m 9M", "", "9sus4 9sus"],
  ["1P 4P 5P 7m 9M 13M", "", "13sus4 13sus"],
  ["1P 4P 5P 7m 9m 13m", "", "7sus4b9b13 7b9b13sus4"],
  ["1P 4P 7m 10m", "", "4 quartal"],
  ["1P 5P 7m 9m 11P", "", "11b9"]
];
var data_default = CHORDS;
var NoChordType = {
  ...EmptyPcset,
  name: "",
  quality: "Unknown",
  intervals: [],
  aliases: []
};
var dictionary = [];
var index = {};
function get2(type) {
  return index[type] || NoChordType;
}
function all() {
  return dictionary.slice();
}
function add(intervals, aliases, fullName) {
  const quality = getQuality(intervals);
  const chord2 = {
    ...get(intervals),
    name: fullName || "",
    quality,
    intervals,
    aliases
  };
  dictionary.push(chord2);
  if (chord2.name) {
    index[chord2.name] = chord2;
  }
  index[chord2.setNum] = chord2;
  index[chord2.chroma] = chord2;
  chord2.aliases.forEach((alias) => addAlias(chord2, alias));
}
function addAlias(chord2, alias) {
  index[alias] = chord2;
}
function getQuality(intervals) {
  const has = (interval2) => intervals.indexOf(interval2) !== -1;
  return has("5A") ? "Augmented" : has("3M") ? "Major" : has("5d") ? "Diminished" : has("3m") ? "Minor" : "Unknown";
}
data_default.forEach(
  ([ivls, fullName, names22]) => add(ivls.split(" "), names22.split(" "), fullName)
);
dictionary.sort((a, b) => a.setNum - b.setNum);

// node_modules/@tonaljs/chord-detect/dist/index.mjs
var namedSet = (notes2) => {
  const pcToName = notes2.reduce((record, n) => {
    const chroma3 = note(n).chroma;
    if (chroma3 !== void 0) {
      record[chroma3] = record[chroma3] || note(n).name;
    }
    return record;
  }, {});
  return (chroma3) => pcToName[chroma3];
};
function detect(source, options = {}) {
  const notes2 = source.map((n) => note(n).pc).filter((x) => x);
  if (note.length === 0) {
    return [];
  }
  const found = findMatches(notes2, 1, options);
  return found.filter((chord2) => chord2.weight).sort((a, b) => b.weight - a.weight).map((chord2) => chord2.name);
}
var BITMASK = {
  // 3m 000100000000
  // 3M 000010000000
  anyThirds: 384,
  // 5P 000000010000
  perfectFifth: 16,
  // 5d 000000100000
  // 5A 000000001000
  nonPerfectFifths: 40,
  anySeventh: 3
};
var testChromaNumber = (bitmask) => (chromaNumber) => Boolean(chromaNumber & bitmask);
var hasAnyThird = testChromaNumber(BITMASK.anyThirds);
var hasPerfectFifth = testChromaNumber(BITMASK.perfectFifth);
var hasAnySeventh = testChromaNumber(BITMASK.anySeventh);
var hasNonPerfectFifth = testChromaNumber(BITMASK.nonPerfectFifths);
function hasAnyThirdAndPerfectFifthAndAnySeventh(chordType) {
  const chromaNumber = parseInt(chordType.chroma, 2);
  return hasAnyThird(chromaNumber) && hasPerfectFifth(chromaNumber) && hasAnySeventh(chromaNumber);
}
function withPerfectFifth(chroma3) {
  const chromaNumber = parseInt(chroma3, 2);
  return hasNonPerfectFifth(chromaNumber) ? chroma3 : (chromaNumber | 16).toString(2);
}
function findMatches(notes2, weight, options) {
  const tonic = notes2[0];
  const tonicChroma = note(tonic).chroma;
  const noteName = namedSet(notes2);
  const allModes = modes(notes2, false);
  const found = [];
  allModes.forEach((mode, index4) => {
    const modeWithPerfectFifth = options.assumePerfectFifth && withPerfectFifth(mode);
    const chordTypes = all().filter((chordType) => {
      if (options.assumePerfectFifth && hasAnyThirdAndPerfectFifthAndAnySeventh(chordType)) {
        return chordType.chroma === modeWithPerfectFifth;
      }
      return chordType.chroma === mode;
    });
    chordTypes.forEach((chordType) => {
      const chordName = chordType.aliases[0];
      const baseNote = noteName(index4);
      const isInversion = index4 !== tonicChroma;
      if (isInversion) {
        found.push({
          weight: 0.5 * weight,
          name: `${baseNote}${chordName}/${tonic}`
        });
      } else {
        found.push({ weight: 1 * weight, name: `${baseNote}${chordName}` });
      }
    });
  });
  return found;
}
var subtract = combinator((a, b) => [a[0] - b[0], a[1] - b[1]]);
function combinator(fn) {
  return (a, b) => {
    const coordA = interval(a).coord;
    const coordB = interval(b).coord;
    if (coordA && coordB) {
      const coord = fn(coordA, coordB);
      return coordToInterval(coord).name;
    }
  };
}

// node_modules/@tonaljs/scale-type/dist/index.mjs
var SCALES = [
  // Basic scales
  ["1P 2M 3M 5P 6M", "major pentatonic", "pentatonic"],
  ["1P 2M 3M 4P 5P 6M 7M", "major", "ionian"],
  ["1P 2M 3m 4P 5P 6m 7m", "minor", "aeolian"],
  // Jazz common scales
  ["1P 2M 3m 3M 5P 6M", "major blues"],
  ["1P 3m 4P 5d 5P 7m", "minor blues", "blues"],
  ["1P 2M 3m 4P 5P 6M 7M", "melodic minor"],
  ["1P 2M 3m 4P 5P 6m 7M", "harmonic minor"],
  ["1P 2M 3M 4P 5P 6M 7m 7M", "bebop"],
  ["1P 2M 3m 4P 5d 6m 6M 7M", "diminished", "whole-half diminished"],
  // Modes
  ["1P 2M 3m 4P 5P 6M 7m", "dorian"],
  ["1P 2M 3M 4A 5P 6M 7M", "lydian"],
  ["1P 2M 3M 4P 5P 6M 7m", "mixolydian", "dominant"],
  ["1P 2m 3m 4P 5P 6m 7m", "phrygian"],
  ["1P 2m 3m 4P 5d 6m 7m", "locrian"],
  // 5-note scales
  ["1P 3M 4P 5P 7M", "ionian pentatonic"],
  ["1P 3M 4P 5P 7m", "mixolydian pentatonic", "indian"],
  ["1P 2M 4P 5P 6M", "ritusen"],
  ["1P 2M 4P 5P 7m", "egyptian"],
  ["1P 3M 4P 5d 7m", "neopolitan major pentatonic"],
  ["1P 3m 4P 5P 6m", "vietnamese 1"],
  ["1P 2m 3m 5P 6m", "pelog"],
  ["1P 2m 4P 5P 6m", "kumoijoshi"],
  ["1P 2M 3m 5P 6m", "hirajoshi"],
  ["1P 2m 4P 5d 7m", "iwato"],
  ["1P 2m 4P 5P 7m", "in-sen"],
  ["1P 3M 4A 5P 7M", "lydian pentatonic", "chinese"],
  ["1P 3m 4P 6m 7m", "malkos raga"],
  ["1P 3m 4P 5d 7m", "locrian pentatonic", "minor seven flat five pentatonic"],
  ["1P 3m 4P 5P 7m", "minor pentatonic", "vietnamese 2"],
  ["1P 3m 4P 5P 6M", "minor six pentatonic"],
  ["1P 2M 3m 5P 6M", "flat three pentatonic", "kumoi"],
  ["1P 2M 3M 5P 6m", "flat six pentatonic"],
  ["1P 2m 3M 5P 6M", "scriabin"],
  ["1P 3M 5d 6m 7m", "whole tone pentatonic"],
  ["1P 3M 4A 5A 7M", "lydian #5P pentatonic"],
  ["1P 3M 4A 5P 7m", "lydian dominant pentatonic"],
  ["1P 3m 4P 5P 7M", "minor #7M pentatonic"],
  ["1P 3m 4d 5d 7m", "super locrian pentatonic"],
  // 6-note scales
  ["1P 2M 3m 4P 5P 7M", "minor hexatonic"],
  ["1P 2A 3M 5P 5A 7M", "augmented"],
  ["1P 2M 4P 5P 6M 7m", "piongio"],
  ["1P 2m 3M 4A 6M 7m", "prometheus neopolitan"],
  ["1P 2M 3M 4A 6M 7m", "prometheus"],
  ["1P 2m 3M 5d 6m 7m", "mystery #1"],
  ["1P 2m 3M 4P 5A 6M", "six tone symmetric"],
  ["1P 2M 3M 4A 5A 6A", "whole tone", "messiaen's mode #1"],
  ["1P 2m 4P 4A 5P 7M", "messiaen's mode #5"],
  // 7-note scales
  ["1P 2M 3M 4P 5d 6m 7m", "locrian major", "arabian"],
  ["1P 2m 3M 4A 5P 6m 7M", "double harmonic lydian"],
  [
    "1P 2m 2A 3M 4A 6m 7m",
    "altered",
    "super locrian",
    "diminished whole tone",
    "pomeroy"
  ],
  ["1P 2M 3m 4P 5d 6m 7m", "locrian #2", "half-diminished", "aeolian b5"],
  [
    "1P 2M 3M 4P 5P 6m 7m",
    "mixolydian b6",
    "melodic minor fifth mode",
    "hindu"
  ],
  ["1P 2M 3M 4A 5P 6M 7m", "lydian dominant", "lydian b7", "overtone"],
  ["1P 2M 3M 4A 5A 6M 7M", "lydian augmented"],
  [
    "1P 2m 3m 4P 5P 6M 7m",
    "dorian b2",
    "phrygian #6",
    "melodic minor second mode"
  ],
  [
    "1P 2m 3m 4d 5d 6m 7d",
    "ultralocrian",
    "superlocrian bb7",
    "superlocrian diminished"
  ],
  ["1P 2m 3m 4P 5d 6M 7m", "locrian 6", "locrian natural 6", "locrian sharp 6"],
  ["1P 2A 3M 4P 5P 5A 7M", "augmented heptatonic"],
  // Source https://en.wikipedia.org/wiki/Ukrainian_Dorian_scale
  [
    "1P 2M 3m 4A 5P 6M 7m",
    "dorian #4",
    "ukrainian dorian",
    "romanian minor",
    "altered dorian"
  ],
  ["1P 2M 3m 4A 5P 6M 7M", "lydian diminished"],
  ["1P 2M 3M 4A 5A 7m 7M", "leading whole tone"],
  ["1P 2M 3M 4A 5P 6m 7m", "lydian minor"],
  ["1P 2m 3M 4P 5P 6m 7m", "phrygian dominant", "spanish", "phrygian major"],
  ["1P 2m 3m 4P 5P 6m 7M", "balinese"],
  ["1P 2m 3m 4P 5P 6M 7M", "neopolitan major"],
  ["1P 2M 3M 4P 5P 6m 7M", "harmonic major"],
  ["1P 2m 3M 4P 5P 6m 7M", "double harmonic major", "gypsy"],
  ["1P 2M 3m 4A 5P 6m 7M", "hungarian minor"],
  ["1P 2A 3M 4A 5P 6M 7m", "hungarian major"],
  ["1P 2m 3M 4P 5d 6M 7m", "oriental"],
  ["1P 2m 3m 3M 4A 5P 7m", "flamenco"],
  ["1P 2m 3m 4A 5P 6m 7M", "todi raga"],
  ["1P 2m 3M 4P 5d 6m 7M", "persian"],
  ["1P 2m 3M 5d 6m 7m 7M", "enigmatic"],
  [
    "1P 2M 3M 4P 5A 6M 7M",
    "major augmented",
    "major #5",
    "ionian augmented",
    "ionian #5"
  ],
  ["1P 2A 3M 4A 5P 6M 7M", "lydian #9"],
  // 8-note scales
  ["1P 2m 2M 4P 4A 5P 6m 7M", "messiaen's mode #4"],
  ["1P 2m 3M 4P 4A 5P 6m 7M", "purvi raga"],
  ["1P 2m 3m 3M 4P 5P 6m 7m", "spanish heptatonic"],
  ["1P 2M 3m 3M 4P 5P 6M 7m", "bebop minor"],
  ["1P 2M 3M 4P 5P 5A 6M 7M", "bebop major"],
  ["1P 2m 3m 4P 5d 5P 6m 7m", "bebop locrian"],
  ["1P 2M 3m 4P 5P 6m 7m 7M", "minor bebop"],
  ["1P 2M 3M 4P 5d 5P 6M 7M", "ichikosucho"],
  ["1P 2M 3m 4P 5P 6m 6M 7M", "minor six diminished"],
  [
    "1P 2m 3m 3M 4A 5P 6M 7m",
    "half-whole diminished",
    "dominant diminished",
    "messiaen's mode #2"
  ],
  ["1P 3m 3M 4P 5P 6M 7m 7M", "kafi raga"],
  ["1P 2M 3M 4P 4A 5A 6A 7M", "messiaen's mode #6"],
  // 9-note scales
  ["1P 2M 3m 3M 4P 5d 5P 6M 7m", "composite blues"],
  ["1P 2M 3m 3M 4A 5P 6m 7m 7M", "messiaen's mode #3"],
  // 10-note scales
  ["1P 2m 2M 3m 4P 4A 5P 6m 6M 7M", "messiaen's mode #7"],
  // 12-note scales
  ["1P 2m 2M 3m 3M 4P 5d 5P 6m 6M 7m 7M", "chromatic"]
];
var data_default2 = SCALES;
var NoScaleType = {
  ...EmptyPcset,
  intervals: [],
  aliases: []
};
var dictionary2 = [];
var index2 = {};
function names() {
  return dictionary2.map((scale2) => scale2.name);
}
function get3(type) {
  return index2[type] || NoScaleType;
}
function all2() {
  return dictionary2.slice();
}
function add3(intervals, name2, aliases = []) {
  const scale2 = { ...get(intervals), name: name2, intervals, aliases };
  dictionary2.push(scale2);
  index2[scale2.name] = scale2;
  index2[scale2.setNum] = scale2;
  index2[scale2.chroma] = scale2;
  scale2.aliases.forEach((alias) => addAlias2(scale2, alias));
  return scale2;
}
function addAlias2(scale2, alias) {
  index2[alias] = scale2;
}
data_default2.forEach(
  ([ivls, name2, ...aliases]) => add3(ivls.split(" "), name2, aliases)
);

// node_modules/@tonaljs/chord/dist/index.mjs
var NoChord = {
  empty: true,
  name: "",
  symbol: "",
  root: "",
  bass: "",
  rootDegree: 0,
  type: "",
  tonic: null,
  setNum: NaN,
  quality: "Unknown",
  chroma: "",
  normalized: "",
  aliases: [],
  notes: [],
  intervals: []
};
function tokenize(name2) {
  const [letter, acc, oct, type] = tokenizeNote(name2);
  if (letter === "") {
    return tokenizeBass("", name2);
  } else if (letter === "A" && type === "ug") {
    return tokenizeBass("", "aug");
  } else {
    return tokenizeBass(letter + acc, oct + type);
  }
}
function tokenizeBass(note2, chord2) {
  const split = chord2.split("/");
  if (split.length === 1) {
    return [note2, split[0], ""];
  }
  const [letter, acc, oct, type] = tokenizeNote(split[1]);
  if (letter !== "" && oct === "" && type === "") {
    return [note2, split[0], letter + acc];
  } else {
    return [note2, chord2, ""];
  }
}
function get4(src) {
  if (Array.isArray(src)) {
    return getChord(src[1] || "", src[0], src[2]);
  } else if (src === "") {
    return NoChord;
  } else {
    const [tonic, type, bass] = tokenize(src);
    const chord2 = getChord(type, tonic, bass);
    return chord2.empty ? getChord(src) : chord2;
  }
}
function getChord(typeName, optionalTonic, optionalBass) {
  const type = get2(typeName);
  const tonic = note(optionalTonic || "");
  const bass = note(optionalBass || "");
  if (type.empty || optionalTonic && tonic.empty || optionalBass && bass.empty) {
    return NoChord;
  }
  const bassInterval = distance(tonic.pc, bass.pc);
  const bassIndex = type.intervals.indexOf(bassInterval);
  const hasRoot = bassIndex >= 0;
  const root = hasRoot ? bass : note("");
  const rootDegree = bassIndex === -1 ? NaN : bassIndex + 1;
  const hasBass = bass.pc && bass.pc !== tonic.pc;
  const intervals = Array.from(type.intervals);
  if (hasRoot) {
    for (let i = 1; i < rootDegree; i++) {
      const num = intervals[0][0];
      const quality = intervals[0][1];
      const newNum = parseInt(num, 10) + 7;
      intervals.push(`${newNum}${quality}`);
      intervals.shift();
    }
  } else if (hasBass) {
    const ivl = subtract(distance(tonic.pc, bass.pc), "8P");
    if (ivl) intervals.unshift(ivl);
  }
  const notes2 = tonic.empty ? [] : intervals.map((i) => transpose(tonic.pc, i));
  typeName = type.aliases.indexOf(typeName) !== -1 ? typeName : type.aliases[0];
  const symbol = `${tonic.empty ? "" : tonic.pc}${typeName}${hasRoot && rootDegree > 1 ? "/" + root.pc : hasBass ? "/" + bass.pc : ""}`;
  const name2 = `${optionalTonic ? tonic.pc + " " : ""}${type.name}${hasRoot && rootDegree > 1 ? " over " + root.pc : hasBass ? " over " + bass.pc : ""}`;
  return {
    ...type,
    name: name2,
    symbol,
    tonic: tonic.pc,
    type: type.name,
    root: root.pc,
    bass: hasBass ? bass.pc : "",
    intervals,
    rootDegree,
    notes: notes2
  };
}
var chord = get4;
function transpose2(chordName, interval2) {
  const [tonic, type, bass] = tokenize(chordName);
  if (!tonic) {
    return chordName;
  }
  const tr2 = transpose(bass, interval2);
  const slash = tr2 ? "/" + tr2 : "";
  return transpose(tonic, interval2) + type + slash;
}
function chordScales(name2) {
  const s = get4(name2);
  const isChordIncluded = isSupersetOf(s.chroma);
  return all2().filter((scale2) => isChordIncluded(scale2.chroma)).map((scale2) => scale2.name);
}
function extended(chordName) {
  const s = get4(chordName);
  const isSuperset = isSupersetOf(s.chroma);
  return all().filter((chord2) => isSuperset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
}
function reduced(chordName) {
  const s = get4(chordName);
  const isSubset = isSubsetOf(s.chroma);
  return all().filter((chord2) => isSubset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
}
function notes(chordName, tonic) {
  const chord2 = get4(chordName);
  const note2 = tonic || chord2.tonic;
  if (!note2 || chord2.empty) return [];
  return chord2.intervals.map((ivl) => transpose(note2, ivl));
}
function degrees(chordName, tonic) {
  const chord2 = get4(chordName);
  const note2 = tonic || chord2.tonic;
  const transpose22 = tonicIntervalsTransposer(chord2.intervals, note2);
  return (degree) => degree ? transpose22(degree > 0 ? degree - 1 : degree) : "";
}
function steps(chordName, tonic) {
  const chord2 = get4(chordName);
  const note2 = tonic || chord2.tonic;
  return tonicIntervalsTransposer(chord2.intervals, note2);
}
var chord_default = {
  getChord,
  get: get4,
  detect,
  chordScales,
  extended,
  reduced,
  tokenize,
  transpose: transpose2,
  degrees,
  steps,
  notes,
  chord
};

// node_modules/@tonaljs/duration-value/dist/index.mjs
var DATA = [
  [
    0.125,
    "dl",
    ["large", "duplex longa", "maxima", "octuple", "octuple whole"]
  ],
  [0.25, "l", ["long", "longa"]],
  [0.5, "d", ["double whole", "double", "breve"]],
  [1, "w", ["whole", "semibreve"]],
  [2, "h", ["half", "minim"]],
  [4, "q", ["quarter", "crotchet"]],
  [8, "e", ["eighth", "quaver"]],
  [16, "s", ["sixteenth", "semiquaver"]],
  [32, "t", ["thirty-second", "demisemiquaver"]],
  [64, "sf", ["sixty-fourth", "hemidemisemiquaver"]],
  [128, "h", ["hundred twenty-eighth"]],
  [256, "th", ["two hundred fifty-sixth"]]
];
var data_default3 = DATA;
data_default3.forEach(
  ([denominator, shorthand, names22]) => add4()
);
function add4(denominator, shorthand, names22) {
}

// node_modules/@tonaljs/note/dist/index.mjs
var dist_exports2 = {};
__export(dist_exports2, {
  accidentals: () => accidentals,
  ascending: () => ascending,
  chroma: () => chroma2,
  default: () => index_default,
  descending: () => descending,
  distance: () => distance2,
  enharmonic: () => enharmonic,
  freq: () => freq,
  fromFreq: () => fromFreq,
  fromFreqSharps: () => fromFreqSharps,
  fromMidi: () => fromMidi,
  fromMidiSharps: () => fromMidiSharps,
  get: () => get5,
  midi: () => midi,
  name: () => name,
  names: () => names2,
  octave: () => octave,
  pitchClass: () => pitchClass,
  simplify: () => simplify,
  sortedNames: () => sortedNames,
  sortedUniqNames: () => sortedUniqNames,
  tr: () => tr,
  trBy: () => trBy,
  trFifths: () => trFifths,
  trFrom: () => trFrom,
  transpose: () => transpose3,
  transposeBy: () => transposeBy,
  transposeFifths: () => transposeFifths,
  transposeFrom: () => transposeFrom,
  transposeOctaves: () => transposeOctaves
});

// node_modules/@tonaljs/midi/dist/index.mjs
var L2 = Math.log(2);
var L440 = Math.log(440);
function freqToMidi(freq2) {
  const v = 12 * (Math.log(freq2) - L440) / L2 + 69;
  return Math.round(v * 100) / 100;
}
var SHARPS = "C C# D D# E F F# G G# A A# B".split(" ");
var FLATS = "C Db D Eb E F Gb G Ab A Bb B".split(" ");
function midiToNoteName(midi2, options = {}) {
  if (isNaN(midi2) || midi2 === -Infinity || midi2 === Infinity) return "";
  midi2 = Math.round(midi2);
  const pcs = options.sharps === true ? SHARPS : FLATS;
  const pc = pcs[midi2 % 12];
  if (options.pitchClass) {
    return pc;
  }
  const o = Math.floor(midi2 / 12) - 1;
  return pc + o;
}

// node_modules/@tonaljs/note/dist/index.mjs
var NAMES = ["C", "D", "E", "F", "G", "A", "B"];
var toName = (n) => n.name;
var onlyNotes = (array) => array.map(note).filter((n) => !n.empty);
function names2(array) {
  if (array === void 0) {
    return NAMES.slice();
  } else if (!Array.isArray(array)) {
    return [];
  } else {
    return onlyNotes(array).map(toName);
  }
}
var get5 = note;
var name = (note2) => get5(note2).name;
var pitchClass = (note2) => get5(note2).pc;
var accidentals = (note2) => get5(note2).acc;
var octave = (note2) => get5(note2).oct;
var midi = (note2) => get5(note2).midi;
var freq = (note2) => get5(note2).freq;
var chroma2 = (note2) => get5(note2).chroma;
function fromMidi(midi2) {
  return midiToNoteName(midi2);
}
function fromFreq(freq2) {
  return midiToNoteName(freqToMidi(freq2));
}
function fromFreqSharps(freq2) {
  return midiToNoteName(freqToMidi(freq2), { sharps: true });
}
function fromMidiSharps(midi2) {
  return midiToNoteName(midi2, { sharps: true });
}
var distance2 = distance;
var transpose3 = transpose;
var tr = transpose;
var transposeBy = (interval2) => (note2) => transpose3(note2, interval2);
var trBy = transposeBy;
var transposeFrom = (note2) => (interval2) => transpose3(note2, interval2);
var trFrom = transposeFrom;
function transposeFifths(noteName, fifths) {
  return transpose3(noteName, [fifths, 0]);
}
var trFifths = transposeFifths;
function transposeOctaves(noteName, octaves) {
  return transpose3(noteName, [0, octaves]);
}
var ascending = (a, b) => a.height - b.height;
var descending = (a, b) => b.height - a.height;
function sortedNames(notes2, comparator) {
  comparator = comparator || ascending;
  return onlyNotes(notes2).sort(comparator).map(toName);
}
function sortedUniqNames(notes2) {
  return sortedNames(notes2, ascending).filter(
    (n, i, a) => i === 0 || n !== a[i - 1]
  );
}
var simplify = (noteName) => {
  const note2 = get5(noteName);
  if (note2.empty) {
    return "";
  }
  return midiToNoteName(note2.midi || note2.chroma, {
    sharps: note2.alt > 0,
    pitchClass: note2.midi === null
  });
};
function enharmonic(noteName, destName) {
  const src = get5(noteName);
  if (src.empty) {
    return "";
  }
  const dest = get5(
    destName || midiToNoteName(src.midi || src.chroma, {
      sharps: src.alt < 0,
      pitchClass: true
    })
  );
  if (dest.empty || dest.chroma !== src.chroma) {
    return "";
  }
  if (src.oct === void 0) {
    return dest.pc;
  }
  const srcChroma = src.chroma - src.alt;
  const destChroma = dest.chroma - dest.alt;
  const destOctOffset = srcChroma > 11 || destChroma < 0 ? -1 : srcChroma < 0 || destChroma > 11 ? 1 : 0;
  const destOct = src.oct + destOctOffset;
  return dest.pc + destOct;
}
var index_default = {
  names: names2,
  get: get5,
  name,
  pitchClass,
  accidentals,
  octave,
  midi,
  ascending,
  descending,
  distance: distance2,
  sortedNames,
  sortedUniqNames,
  fromMidi,
  fromMidiSharps,
  freq,
  fromFreq,
  fromFreqSharps,
  chroma: chroma2,
  transpose: transpose3,
  tr,
  transposeBy,
  trBy,
  transposeFrom,
  trFrom,
  transposeFifths,
  transposeOctaves,
  trFifths,
  simplify,
  enharmonic
};

// node_modules/@tonaljs/mode/dist/index.mjs
var MODES = [
  [0, 2773, 0, "ionian", "", "Maj7", "major"],
  [1, 2902, 2, "dorian", "m", "m7"],
  [2, 3418, 4, "phrygian", "m", "m7"],
  [3, 2741, -1, "lydian", "", "Maj7"],
  [4, 2774, 1, "mixolydian", "", "7"],
  [5, 2906, 3, "aeolian", "m", "m7", "minor"],
  [6, 3434, 5, "locrian", "dim", "m7b5"]
];
var NoMode = {
  ...EmptyPcset,
  name: "",
  alt: 0,
  modeNum: NaN,
  triad: "",
  seventh: "",
  aliases: []
};
var modes2 = MODES.map(toMode);
var index3 = {};
modes2.forEach((mode2) => {
  index3[mode2.name] = mode2;
  mode2.aliases.forEach((alias) => {
    index3[alias] = mode2;
  });
});
function get7(name2) {
  return typeof name2 === "string" ? index3[name2.toLowerCase()] || NoMode : name2 && name2.name ? get7(name2.name) : NoMode;
}
function toMode(mode2) {
  const [modeNum, setNum, alt, name2, triad, seventh, alias] = mode2;
  const aliases = alias ? [alias] : [];
  const chroma3 = Number(setNum).toString(2);
  const intervals = get3(name2).intervals;
  return {
    empty: false,
    intervals,
    modeNum,
    chroma: chroma3,
    normalized: chroma3,
    name: name2,
    setNum,
    alt,
    triad,
    seventh,
    aliases
  };
}
function chords(chords2) {
  return (modeName, tonic) => {
    const mode2 = get7(modeName);
    if (mode2.empty) return [];
    const triads22 = rotate(mode2.modeNum, chords2);
    const tonics = mode2.intervals.map((i) => transpose(tonic, i));
    return triads22.map((triad, i) => tonics[i] + triad);
  };
}
chords(MODES.map((x) => x[4]));
chords(MODES.map((x) => x[5]));

// node_modules/@tonaljs/scale/dist/index.mjs
var dist_exports3 = {};
__export(dist_exports3, {
  default: () => index_default2,
  degrees: () => degrees2,
  detect: () => detect2,
  extended: () => extended2,
  get: () => get8,
  modeNames: () => modeNames,
  names: () => names3,
  rangeOf: () => rangeOf,
  reduced: () => reduced2,
  scale: () => scale,
  scaleChords: () => scaleChords,
  scaleNotes: () => scaleNotes,
  steps: () => steps2,
  tokenize: () => tokenize3
});
var NoScale = {
  empty: true,
  name: "",
  type: "",
  tonic: null,
  setNum: NaN,
  chroma: "",
  normalized: "",
  aliases: [],
  notes: [],
  intervals: []
};
function tokenize3(name2) {
  if (typeof name2 !== "string") {
    return ["", ""];
  }
  const i = name2.indexOf(" ");
  const tonic = note(name2.substring(0, i));
  if (tonic.empty) {
    const n = note(name2);
    return n.empty ? ["", name2.toLowerCase()] : [n.name, ""];
  }
  const type = name2.substring(tonic.name.length + 1).toLowerCase();
  return [tonic.name, type.length ? type : ""];
}
var names3 = names;
function get8(src) {
  const tokens = Array.isArray(src) ? src : tokenize3(src);
  const tonic = note(tokens[0]).name;
  const st = get3(tokens[1]);
  if (st.empty) {
    return NoScale;
  }
  const type = st.name;
  const notes2 = tonic ? st.intervals.map((i) => transpose(tonic, i)) : [];
  const name2 = tonic ? tonic + " " + type : type;
  return { ...st, name: name2, type, tonic, notes: notes2 };
}
var scale = get8;
function detect2(notes2, options = {}) {
  const notesChroma = chroma(notes2);
  const tonic = note(options.tonic ?? notes2[0] ?? "");
  const tonicChroma = tonic.chroma;
  if (tonicChroma === void 0) {
    return [];
  }
  const pitchClasses = notesChroma.split("");
  pitchClasses[tonicChroma] = "1";
  const scaleChroma = rotate(tonicChroma, pitchClasses).join("");
  const match = all2().find((scaleType) => scaleType.chroma === scaleChroma);
  const results = [];
  if (match) {
    results.push(tonic.name + " " + match.name);
  }
  if (options.match === "exact") {
    return results;
  }
  extended2(scaleChroma).forEach((scaleName) => {
    results.push(tonic.name + " " + scaleName);
  });
  return results;
}
function scaleChords(name2) {
  const s = get8(name2);
  const inScale = isSubsetOf(s.chroma);
  return all().filter((chord2) => inScale(chord2.chroma)).map((chord2) => chord2.aliases[0]);
}
function extended2(name2) {
  const chroma22 = isChroma(name2) ? name2 : get8(name2).chroma;
  const isSuperset = isSupersetOf(chroma22);
  return all2().filter((scale2) => isSuperset(scale2.chroma)).map((scale2) => scale2.name);
}
function reduced2(name2) {
  const isSubset = isSubsetOf(get8(name2).chroma);
  return all2().filter((scale2) => isSubset(scale2.chroma)).map((scale2) => scale2.name);
}
function scaleNotes(notes2) {
  const pcset = notes2.map((n) => note(n).pc).filter((x) => x);
  const tonic = pcset[0];
  const scale2 = sortedUniqNames(pcset);
  return rotate(scale2.indexOf(tonic), scale2);
}
function modeNames(name2) {
  const s = get8(name2);
  if (s.empty) {
    return [];
  }
  const tonics = s.tonic ? s.notes : s.intervals;
  return modes(s.chroma).map((chroma22, i) => {
    const modeName = get8(chroma22).name;
    return modeName ? [tonics[i], modeName] : ["", ""];
  }).filter((x) => x[0]);
}
function getNoteNameOf(scale2) {
  const names22 = Array.isArray(scale2) ? scaleNotes(scale2) : get8(scale2).notes;
  const chromas = names22.map((name2) => note(name2).chroma);
  return (noteOrMidi) => {
    const currNote = typeof noteOrMidi === "number" ? note(fromMidi(noteOrMidi)) : note(noteOrMidi);
    const height = currNote.height;
    if (height === void 0) return void 0;
    const chroma22 = height % 12;
    const position = chromas.indexOf(chroma22);
    if (position === -1) return void 0;
    return enharmonic(currNote.name, names22[position]);
  };
}
function rangeOf(scale2) {
  const getName = getNoteNameOf(scale2);
  return (fromNote, toNote) => {
    const from = note(fromNote).height;
    const to = note(toNote).height;
    if (from === void 0 || to === void 0) return [];
    return range(from, to).map(getName).filter((x) => x);
  };
}
function degrees2(scaleName) {
  const { intervals, tonic } = get8(scaleName);
  const transpose22 = tonicIntervalsTransposer(intervals, tonic);
  return (degree) => degree ? transpose22(degree > 0 ? degree - 1 : degree) : "";
}
function steps2(scaleName) {
  const { intervals, tonic } = get8(scaleName);
  return tonicIntervalsTransposer(intervals, tonic);
}
var index_default2 = {
  degrees: degrees2,
  detect: detect2,
  extended: extended2,
  get: get8,
  modeNames,
  names: names3,
  rangeOf,
  reduced: reduced2,
  scaleChords,
  scaleNotes,
  steps: steps2,
  tokenize: tokenize3,
  // deprecated
  scale
};

// js/utils/music-theory.ts
var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var vexflowNoteNames = {
  treble: {
    "c/4": 60,
    "d/4": 62,
    "e/4": 64,
    "f/4": 65,
    "g/4": 67,
    "a/4": 69,
    "b/4": 71,
    "c/5": 72,
    "d/5": 74,
    "e/5": 76,
    "f/5": 77,
    "g/5": 79,
    "a/5": 81,
    "b/5": 83,
    "c/6": 84
  },
  bass: {
    "a/2": 45,
    "b/2": 47,
    "c/3": 48,
    "d/3": 50,
    "e/3": 52,
    "f/3": 53,
    "g/3": 55,
    "a/3": 57,
    "b/3": 59,
    "c/4": 60,
    "d/4": 62,
    "e/4": 64,
    "f/4": 65
  }
};
function midiToNoteName2(midiNote) {
  return dist_exports2.fromMidi(midiNote) || "";
}
function noteNameToMidi(noteName) {
  const midi2 = dist_exports2.midi(noteName);
  return midi2 !== null ? midi2 : -1;
}
function midiToVexflow(midiNote, clef = "treble") {
  const octave2 = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  const noteName = noteNames[noteIndex].toLowerCase().replace("#", "#");
  if (noteName.includes("#")) {
    return null;
  }
  return `${noteName}/${octave2}`;
}
function generateRandomNote(range2 = "c4-c5", clef = "treble", naturalsOnly = true) {
  const [start, end] = range2.split("-");
  const startMidi = noteNameToMidi(start.toUpperCase());
  const endMidi = noteNameToMidi(end.toUpperCase());
  if (startMidi === -1 || endMidi === -1) {
    console.error("Invalid range");
    return null;
  }
  const availableNotes = Object.entries(vexflowNoteNames[clef]).filter(([_, midi2]) => midi2 >= startMidi && midi2 <= endMidi).map(([note2, midi2]) => ({ vexflowNote: note2, midiNote: midi2 }));
  if (availableNotes.length === 0) {
    console.error("No notes available in range");
    return null;
  }
  const randomIndex = Math.floor(Math.random() * availableNotes.length);
  return availableNotes[randomIndex];
}
function generateRandomNoteFromMidiRange(minMidi, maxMidi, naturalsOnly = true) {
  const availableNotes = [];
  for (let midi2 = minMidi; midi2 <= maxMidi; midi2++) {
    if (naturalsOnly) {
      const noteIndex = midi2 % 12;
      if (![1, 3, 6, 8, 10].includes(noteIndex)) {
        availableNotes.push(midi2);
      }
    } else {
      availableNotes.push(midi2);
    }
  }
  if (availableNotes.length === 0) {
    return minMidi;
  }
  return availableNotes[Math.floor(Math.random() * availableNotes.length)];
}
function validateNote(playedMidi, targetMidi, options = {}) {
  const {
    allowOctaveError = true,
    tolerance = 0,
    pitchToleranceCents = 0
  } = options;
  if (playedMidi === targetMidi) {
    return { isCorrect: true, message: "Perfect!", centsOff: 0 };
  }
  if (allowOctaveError) {
    const playedPitch = playedMidi % 12;
    const targetPitch = targetMidi % 12;
    if (playedPitch === targetPitch) {
      return {
        isCorrect: true,
        message: "Correct note, wrong octave!"
      };
    }
  }
  if (tolerance > 0) {
    const diff = Math.abs(playedMidi - targetMidi);
    if (diff <= tolerance) {
      return {
        isCorrect: true,
        message: "Close enough!"
      };
    }
  }
  return {
    isCorrect: false,
    message: `Try again. You played ${midiToNoteName2(playedMidi)}`
  };
}
function validatePitchWithCents(playedFrequency, targetMidi, toleranceCents = 50) {
  const targetFrequency = midiToFrequency(targetMidi);
  const playedMidi = frequencyToMidi(playedFrequency);
  const centsOff = getCentsDeviation(playedFrequency, targetFrequency);
  if (Math.abs(centsOff) <= toleranceCents) {
    let message = "Perfect!";
    if (Math.abs(centsOff) > 5) {
      message = `${Math.abs(centsOff).toFixed(0)} cents ${centsOff > 0 ? "sharp" : "flat"}`;
    }
    return {
      isCorrect: true,
      message,
      centsOff
    };
  }
  return {
    isCorrect: false,
    message: `Try again. You played ${midiToNoteName2(playedMidi)} (${Math.abs(centsOff).toFixed(0)} cents ${centsOff > 0 ? "sharp" : "flat"})`,
    centsOff
  };
}
function midiToFrequency(midiNote) {
  const noteName = dist_exports2.fromMidi(midiNote);
  return noteName ? dist_exports2.freq(noteName) || 440 : 440;
}
function frequencyToMidi(frequency) {
  return Math.round(12 * Math.log2(frequency / 440) + 69);
}
function getCentsDeviation(frequency, targetFrequency) {
  return 1200 * Math.log2(frequency / targetFrequency);
}
function getCentsFromMidi(frequency, targetMidi) {
  const targetFrequency = midiToFrequency(targetMidi);
  return getCentsDeviation(frequency, targetFrequency);
}
function generateMajorScale(root) {
  const scale2 = dist_exports3.get(`${root} major`);
  return scale2.notes.map((note2) => noteNameToMidi(note2)).filter((midi2) => midi2 !== -1);
}
function generateMinorScale(root) {
  const scale2 = dist_exports3.get(`${root} minor`);
  return scale2.notes.map((note2) => noteNameToMidi(note2)).filter((midi2) => midi2 !== -1);
}
function generateScale(root, scaleType = "major") {
  const scale2 = dist_exports3.get(`${root} ${scaleType}`);
  return scale2.notes.map((note2) => noteNameToMidi(note2)).filter((midi2) => midi2 !== -1);
}
function generateChord(root, type = "major") {
  const chord2 = dist_exports.get(`${root}${type}`);
  return chord2.notes.map((note2) => noteNameToMidi(note2)).filter((midi2) => midi2 !== -1);
}
function getAllKeySignatures() {
  return [
    { name: "C Major / A Minor", sharps: 0, flats: 0 },
    { name: "G Major / E Minor", sharps: 1, flats: 0 },
    { name: "D Major / B Minor", sharps: 2, flats: 0 },
    { name: "A Major / F# Minor", sharps: 3, flats: 0 },
    { name: "E Major / C# Minor", sharps: 4, flats: 0 },
    { name: "B Major / G# Minor", sharps: 5, flats: 0 },
    { name: "F# Major / D# Minor", sharps: 6, flats: 0 },
    { name: "F Major / D Minor", sharps: 0, flats: 1 },
    { name: "Bb Major / G Minor", sharps: 0, flats: 2 },
    { name: "Eb Major / C Minor", sharps: 0, flats: 3 },
    { name: "Ab Major / F Minor", sharps: 0, flats: 4 },
    { name: "Db Major / Bb Minor", sharps: 0, flats: 5 },
    { name: "Gb Major / Eb Minor", sharps: 0, flats: 6 }
  ];
}
function getInterval(note1, note2) {
  const midi1 = noteNameToMidi(note1);
  const midi2 = noteNameToMidi(note2);
  return Math.abs(midi2 - midi1);
}
function isFrequencyInRange(frequency, minFreq, maxFreq) {
  return frequency >= minFreq && frequency <= maxFreq;
}
var MusicTheory = {
  noteNames,
  vexflowNoteNames,
  midiToNoteName: midiToNoteName2,
  noteNameToMidi,
  midiToVexflow,
  generateRandomNote,
  generateRandomNoteFromMidiRange,
  validateNote,
  validatePitchWithCents,
  midiToFrequency,
  frequencyToMidi,
  getCentsDeviation,
  getCentsFromMidi,
  generateMajorScale,
  generateMinorScale,
  generateScale,
  generateChord,
  getAllKeySignatures,
  getInterval,
  isFrequencyInRange
};
if (typeof window !== "undefined") {
  window.MusicTheory = MusicTheory;
}

// js/midi/midi-manager.ts
var MidiManager = class {
  constructor() {
    this.midiAccess = null;
    this.selectedInput = null;
    this.listeners = {
      noteOn: [],
      noteOff: [],
      deviceChange: [],
      error: []
    };
    this.activeNotes = /* @__PURE__ */ new Set();
  }
  /**
   * Initialize MIDI access
   */
  async init() {
    try {
      if (!navigator.requestMIDIAccess) {
        this.emitError("Web MIDI API is not supported in this browser. Try Chrome or Edge.");
        return false;
      }
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.addEventListener("statechange", (e) => {
        this.handleStateChange(e);
      });
      this.updateDeviceList();
      console.log("MIDI initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize MIDI:", error);
      this.emitError("Failed to access MIDI devices. Please check your browser permissions.");
      return false;
    }
  }
  /**
   * Get list of available MIDI input devices
   */
  getInputDevices() {
    if (!this.midiAccess) return [];
    const devices = [];
    for (const input of this.midiAccess.inputs.values()) {
      devices.push({
        id: input.id,
        name: input.name || "Unknown Device",
        manufacturer: input.manufacturer || "Unknown",
        state: input.state,
        connection: input.connection
      });
    }
    return devices;
  }
  /**
   * Connect to a specific MIDI input device
   */
  connectDevice(deviceId) {
    if (!this.midiAccess) {
      console.error("MIDI not initialized");
      return false;
    }
    this.disconnectDevice();
    const input = this.midiAccess.inputs.get(deviceId);
    if (!input) {
      console.error("Device not found:", deviceId);
      return false;
    }
    input.onmidimessage = (message) => this.handleMidiMessage(message);
    this.selectedInput = input;
    this.emitDeviceChange({ connected: true, device: input });
    console.log("Connected to MIDI device:", input.name);
    return true;
  }
  /**
   * Disconnect current MIDI device
   */
  disconnectDevice() {
    if (this.selectedInput) {
      this.selectedInput.onmidimessage = null;
      this.selectedInput = null;
      this.activeNotes.clear();
      this.emitDeviceChange({ connected: false, device: null });
      console.log("Disconnected MIDI device");
    }
  }
  /**
   * Handle incoming MIDI messages
   */
  handleMidiMessage(message) {
    if (!message.data || message.data.length < 3) return;
    const status = message.data[0];
    const note2 = message.data[1];
    const velocity = message.data[2];
    const messageType = status & 240;
    switch (messageType) {
      case 144:
        if (velocity > 0) {
          this.handleNoteOn(note2, velocity);
        } else {
          this.handleNoteOff(note2);
        }
        break;
      case 128:
        this.handleNoteOff(note2);
        break;
    }
  }
  /**
   * Handle note on event
   */
  handleNoteOn(note2, velocity) {
    this.activeNotes.add(note2);
    this.listeners.noteOn.forEach((callback) => {
      try {
        callback({
          note: note2,
          velocity,
          noteName: midiToNoteName2(note2),
          frequency: midiToFrequency(note2),
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Error in noteOn listener:", error);
      }
    });
  }
  /**
   * Handle note off event
   */
  handleNoteOff(note2) {
    this.activeNotes.delete(note2);
    this.listeners.noteOff.forEach((callback) => {
      try {
        callback({
          note: note2,
          noteName: midiToNoteName2(note2),
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Error in noteOff listener:", error);
      }
    });
  }
  /**
   * Handle device state changes (connection/disconnection)
   */
  handleStateChange(event) {
    if (!event.port) return;
    console.log("MIDI device state changed:", event.port.name, event.port.state);
    this.updateDeviceList();
    if (this.selectedInput && event.port.id === this.selectedInput.id && event.port.state === "disconnected") {
      this.disconnectDevice();
    }
    this.emitDeviceChange({
      type: "statechange",
      port: event.port
    });
  }
  /**
   * Update the device list (called on state changes)
   */
  updateDeviceList() {
    const devices = this.getInputDevices();
    console.log("Available MIDI devices:", devices);
    if (!this.selectedInput && devices.length > 0) {
      this.connectDevice(devices[0].id);
    }
  }
  /**
   * Register an event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      console.warn("Unknown event type:", event);
    }
  }
  /**
   * Remove an event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index4 = this.listeners[event].indexOf(callback);
      if (index4 > -1) {
        this.listeners[event].splice(index4, 1);
      }
    }
  }
  /**
   * Emit device change event
   */
  emitDeviceChange(data) {
    this.listeners.deviceChange.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in deviceChange listener:", error);
      }
    });
  }
  /**
   * Emit error event
   */
  emitError(message) {
    this.listeners.error.forEach((callback) => {
      try {
        callback({ message });
      } catch (error) {
        console.error("Error in error listener:", error);
      }
    });
  }
  /**
   * Check if a note is currently being played
   */
  isNoteActive(note2) {
    return this.activeNotes.has(note2);
  }
  /**
   * Get all currently active notes
   */
  getActiveNotes() {
    return Array.from(this.activeNotes);
  }
  /**
   * Simulate a note (for testing without MIDI device)
   */
  simulateNote(note2, velocity = 64, duration = 500) {
    this.handleNoteOn(note2, velocity);
    setTimeout(() => {
      this.handleNoteOff(note2);
    }, duration);
  }
  /**
   * Check if MIDI is supported
   */
  static isSupported() {
    return typeof navigator !== "undefined" && !!navigator.requestMIDIAccess;
  }
  /**
   * Get current connected device
   */
  getConnectedDevice() {
    if (!this.selectedInput) return null;
    return {
      id: this.selectedInput.id,
      name: this.selectedInput.name || "Unknown Device",
      manufacturer: this.selectedInput.manufacturer || "Unknown",
      state: this.selectedInput.state,
      connection: this.selectedInput.connection
    };
  }
};
if (typeof window !== "undefined") {
  window.MidiManager = MidiManager;
}

// node_modules/pitchy/index.js
var import_fft = __toESM(require_fft());
var Autocorrelator = class _Autocorrelator {
  /**
   * Constructs a new {@link Autocorrelator} able to handle input arrays of the
   * given length.
   *
   * @param inputLength {number} the input array length to support. This
   * `Autocorrelator` will only support operation on arrays of this length.
   * @param bufferSupplier {(length: number) => T} the function to use for
   * creating buffers, accepting the length of the buffer to create and
   * returning a new buffer of that length. The values of the returned buffer
   * need not be initialized in any particular way.
   */
  constructor(inputLength, bufferSupplier) {
    /** @private @readonly @type {number} */
    __publicField(this, "_inputLength");
    /** @private @type {FFT} */
    __publicField(this, "_fft");
    /** @private @type {(size: number) => T} */
    __publicField(this, "_bufferSupplier");
    /** @private @type {T} */
    __publicField(this, "_paddedInputBuffer");
    /** @private @type {T} */
    __publicField(this, "_transformBuffer");
    /** @private @type {T} */
    __publicField(this, "_inverseBuffer");
    if (inputLength < 1) {
      throw new Error(`Input length must be at least one`);
    }
    this._inputLength = inputLength;
    this._fft = new import_fft.default(ceilPow2(2 * inputLength));
    this._bufferSupplier = bufferSupplier;
    this._paddedInputBuffer = this._bufferSupplier(this._fft.size);
    this._transformBuffer = this._bufferSupplier(2 * this._fft.size);
    this._inverseBuffer = this._bufferSupplier(2 * this._fft.size);
  }
  /**
   * A helper method to create an {@link Autocorrelator} using
   * {@link Float32Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {Autocorrelator<Float32Array>}
   */
  static forFloat32Array(inputLength) {
    return new _Autocorrelator(
      inputLength,
      (length) => new Float32Array(length)
    );
  }
  /**
   * A helper method to create an {@link Autocorrelator} using
   * {@link Float64Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {Autocorrelator<Float64Array>}
   */
  static forFloat64Array(inputLength) {
    return new _Autocorrelator(
      inputLength,
      (length) => new Float64Array(length)
    );
  }
  /**
   * A helper method to create an {@link Autocorrelator} using `number[]`
   * buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {Autocorrelator<number[]>}
   */
  static forNumberArray(inputLength) {
    return new _Autocorrelator(inputLength, (length) => Array(length));
  }
  /**
   * Returns the supported input length.
   *
   * @returns {number} the supported input length
   */
  get inputLength() {
    return this._inputLength;
  }
  /**
   * Autocorrelates the given input data.
   *
   * @param input {ArrayLike<number>} the input data to autocorrelate
   * @param output {T} the output buffer into which to write the autocorrelated
   * data. If not provided, a new buffer will be created.
   * @returns {T} `output`
   */
  autocorrelate(input, output = this._bufferSupplier(input.length)) {
    if (input.length !== this._inputLength) {
      throw new Error(
        `Input must have length ${this._inputLength} but had length ${input.length}`
      );
    }
    for (let i = 0; i < input.length; i++) {
      this._paddedInputBuffer[i] = input[i];
    }
    for (let i = input.length; i < this._paddedInputBuffer.length; i++) {
      this._paddedInputBuffer[i] = 0;
    }
    this._fft.realTransform(this._transformBuffer, this._paddedInputBuffer);
    this._fft.completeSpectrum(this._transformBuffer);
    const tb = this._transformBuffer;
    for (let i = 0; i < tb.length; i += 2) {
      tb[i] = tb[i] * tb[i] + tb[i + 1] * tb[i + 1];
      tb[i + 1] = 0;
    }
    this._fft.inverseTransform(this._inverseBuffer, this._transformBuffer);
    for (let i = 0; i < input.length; i++) {
      output[i] = this._inverseBuffer[2 * i];
    }
    return output;
  }
};
function getKeyMaximumIndices(input) {
  const keyIndices = [];
  let lookingForMaximum = false;
  let max = -Infinity;
  let maxIndex = -1;
  for (let i = 1; i < input.length - 1; i++) {
    if (input[i - 1] <= 0 && input[i] > 0) {
      lookingForMaximum = true;
      maxIndex = i;
      max = input[i];
    } else if (input[i - 1] > 0 && input[i] <= 0) {
      lookingForMaximum = false;
      if (maxIndex !== -1) {
        keyIndices.push(maxIndex);
      }
    } else if (lookingForMaximum && input[i] > max) {
      max = input[i];
      maxIndex = i;
    }
  }
  return keyIndices;
}
function refineResultIndex(index4, data) {
  const [x0, x1, x2] = [index4 - 1, index4, index4 + 1];
  const [y0, y1, y2] = [data[x0], data[x1], data[x2]];
  const a = y0 / 2 - y1 + y2 / 2;
  const b = -(y0 / 2) * (x1 + x2) + y1 * (x0 + x2) - y2 / 2 * (x0 + x1);
  const c = y0 * x1 * x2 / 2 - y1 * x0 * x2 + y2 * x0 * x1 / 2;
  const xMax = -b / (2 * a);
  const yMax = a * xMax * xMax + b * xMax + c;
  return [xMax, yMax];
}
var PitchDetector = class _PitchDetector {
  /**
   * Constructs a new {@link PitchDetector} able to handle input arrays of the
   * given length.
   *
   * @param inputLength {number} the input array length to support. This
   * `PitchDetector` will only support operation on arrays of this length.
   * @param bufferSupplier {(inputLength: number) => T} the function to use for
   * creating buffers, accepting the length of the buffer to create and
   * returning a new buffer of that length. The values of the returned buffer
   * need not be initialized in any particular way.
   */
  constructor(inputLength, bufferSupplier) {
    /** @private @type {Autocorrelator<T>} */
    __publicField(this, "_autocorrelator");
    /** @private @type {T} */
    __publicField(this, "_nsdfBuffer");
    /** @private @type {number} */
    __publicField(this, "_clarityThreshold", 0.9);
    /** @private @type {number} */
    __publicField(this, "_minVolumeAbsolute", 0);
    /** @private @type {number} */
    __publicField(this, "_maxInputAmplitude", 1);
    this._autocorrelator = new Autocorrelator(inputLength, bufferSupplier);
    this._nsdfBuffer = bufferSupplier(inputLength);
  }
  /**
   * A helper method to create an {@link PitchDetector} using {@link Float32Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<Float32Array>}
   */
  static forFloat32Array(inputLength) {
    return new _PitchDetector(inputLength, (length) => new Float32Array(length));
  }
  /**
   * A helper method to create an {@link PitchDetector} using {@link Float64Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<Float64Array>}
   */
  static forFloat64Array(inputLength) {
    return new _PitchDetector(inputLength, (length) => new Float64Array(length));
  }
  /**
   * A helper method to create an {@link PitchDetector} using `number[]` buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<number[]>}
   */
  static forNumberArray(inputLength) {
    return new _PitchDetector(inputLength, (length) => Array(length));
  }
  /**
   * Returns the supported input length.
   *
   * @returns {number} the supported input length
   */
  get inputLength() {
    return this._autocorrelator.inputLength;
  }
  /**
   * Sets the clarity threshold used when identifying the correct pitch (the constant
   * `k` from the MPM paper). The value must be between 0 (exclusive) and 1
   * (inclusive), with the most suitable range being between 0.8 and 1.
   *
   * @param threshold {number} the clarity threshold
   */
  set clarityThreshold(threshold) {
    if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
      throw new Error("clarityThreshold must be a number in the range (0, 1]");
    }
    this._clarityThreshold = threshold;
  }
  /**
   * Sets the minimum detectable volume, as an absolute number between 0 and
   * `maxInputAmplitude`, inclusive, to consider in a sample when detecting the
   * pitch. If a sample fails to meet this minimum volume, `findPitch` will
   * return a clarity of 0.
   *
   * Volume is calculated as the RMS (root mean square) of the input samples.
   *
   * @param volume {number} the minimum volume as an absolute amplitude value
   */
  set minVolumeAbsolute(volume) {
    if (!Number.isFinite(volume) || volume < 0 || volume > this._maxInputAmplitude) {
      throw new Error(
        `minVolumeAbsolute must be a number in the range [0, ${this._maxInputAmplitude}]`
      );
    }
    this._minVolumeAbsolute = volume;
  }
  /**
   * Sets the minimum volume using a decibel measurement. Must be less than or
   * equal to 0: 0 indicates the loudest possible sound (see
   * `maxInputAmplitude`), -10 is a sound with a tenth of the volume of the
   * loudest possible sound, etc.
   *
   * Volume is calculated as the RMS (root mean square) of the input samples.
   *
   * @param db {number} the minimum volume in decibels, with 0 being the loudest
   * sound
   */
  set minVolumeDecibels(db) {
    if (!Number.isFinite(db) || db > 0) {
      throw new Error("minVolumeDecibels must be a number <= 0");
    }
    this._minVolumeAbsolute = this._maxInputAmplitude * 10 ** (db / 10);
  }
  /**
   * Sets the maximum amplitude of an input reading. Must be greater than 0.
   *
   * @param amplitude {number} the maximum amplitude (absolute value) of an input reading
   */
  set maxInputAmplitude(amplitude) {
    if (!Number.isFinite(amplitude) || amplitude <= 0) {
      throw new Error("maxInputAmplitude must be a number > 0");
    }
    this._maxInputAmplitude = amplitude;
  }
  /**
   * Returns the pitch detected using McLeod Pitch Method (MPM) along with a
   * measure of its clarity.
   *
   * The clarity is a value between 0 and 1 (potentially inclusive) that
   * represents how "clear" the pitch was. A clarity value of 1 indicates that
   * the pitch was very distinct, while lower clarity values indicate less
   * definite pitches.
   *
   * @param input {ArrayLike<number>} the time-domain input data
   * @param sampleRate {number} the sample rate at which the input data was
   * collected
   * @returns {[number, number]} the detected pitch, in Hz, followed by the
   * clarity. If a pitch cannot be determined from the input, such as if the
   * volume is too low (see `minVolumeAbsolute` and `minVolumeDecibels`), this
   * will be `[0, 0]`.
   */
  findPitch(input, sampleRate) {
    if (this._belowMinimumVolume(input)) return [0, 0];
    this._nsdf(input);
    const keyMaximumIndices = getKeyMaximumIndices(this._nsdfBuffer);
    if (keyMaximumIndices.length === 0) {
      return [0, 0];
    }
    const nMax = Math.max(...keyMaximumIndices.map((i) => this._nsdfBuffer[i]));
    const resultIndex = keyMaximumIndices.find(
      (i) => this._nsdfBuffer[i] >= this._clarityThreshold * nMax
    );
    const [refinedResultIndex, clarity] = refineResultIndex(
      // @ts-expect-error resultIndex is guaranteed to be defined
      resultIndex,
      this._nsdfBuffer
    );
    return [sampleRate / refinedResultIndex, Math.min(clarity, 1)];
  }
  /**
   * Returns whether the input audio data is below the minimum volume allowed by
   * the pitch detector.
   *
   * @private
   * @param input {ArrayLike<number>}
   * @returns {boolean}
   */
  _belowMinimumVolume(input) {
    if (this._minVolumeAbsolute === 0) return false;
    let squareSum = 0;
    for (let i = 0; i < input.length; i++) {
      squareSum += input[i] ** 2;
    }
    return Math.sqrt(squareSum / input.length) < this._minVolumeAbsolute;
  }
  /**
   * Computes the NSDF of the input and stores it in the internal buffer. This
   * is equation (9) in the McLeod pitch method paper.
   *
   * @private
   * @param input {ArrayLike<number>}
   */
  _nsdf(input) {
    this._autocorrelator.autocorrelate(input, this._nsdfBuffer);
    let m = 2 * this._nsdfBuffer[0];
    let i;
    for (i = 0; i < this._nsdfBuffer.length && m > 0; i++) {
      this._nsdfBuffer[i] = 2 * this._nsdfBuffer[i] / m;
      m -= input[i] ** 2 + input[input.length - i - 1] ** 2;
    }
    for (; i < this._nsdfBuffer.length; i++) {
      this._nsdfBuffer[i] = 0;
    }
  }
};
function ceilPow2(v) {
  v--;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  v |= v >> 16;
  v++;
  return v;
}

// js/utils/pitch-detector.ts
var PitchDetector2 = class _PitchDetector {
  constructor(config = {}) {
    this.config = {
      bufferSize: config.bufferSize || 2048,
      sampleRate: config.sampleRate || 44100,
      minClarity: config.minClarity || 0.75,
      minFrequency: config.minFrequency || 70,
      // Below E2 (guitar low E)
      maxFrequency: config.maxFrequency || 1600
      // Above G6 (violin high range)
    };
    this.detector = PitchDetector.forFloat32Array(this.config.bufferSize);
    this.detector.minVolumeDecibels = -40;
  }
  /**
   * Detect pitch from audio buffer
   * @param buffer - Float32Array of audio samples
   * @param sampleRate - Sample rate of the audio (optional, uses config default)
   * @returns PitchResult with frequency, MIDI note, and clarity
   */
  detectPitch(buffer, sampleRate) {
    const rate = sampleRate || this.config.sampleRate;
    const [frequency, clarity] = this.detector.findPitch(buffer, rate);
    const isValid = this.isValidDetection(frequency, clarity);
    if (!isValid) {
      return {
        frequency: 0,
        midi: 0,
        cents: 0,
        clarity: clarity || 0,
        detected: false
      };
    }
    const midi2 = frequencyToMidi(frequency);
    const cents = getCentsFromMidi(frequency, midi2);
    return {
      frequency,
      midi: midi2,
      cents,
      clarity: clarity || 0,
      detected: true
    };
  }
  /**
   * Check if detected pitch is valid based on clarity and frequency range
   */
  isValidDetection(frequency, clarity) {
    if (!frequency || frequency <= 0) return false;
    if (!clarity || clarity < this.config.minClarity) return false;
    if (frequency < this.config.minFrequency) return false;
    if (frequency > this.config.maxFrequency) return false;
    return true;
  }
  /**
   * Update detector configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    if (config.bufferSize && config.bufferSize !== this.config.bufferSize) {
      this.detector = PitchDetector.forFloat32Array(this.config.bufferSize);
      this.detector.minVolumeDecibels = -40;
    }
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Set minimum clarity threshold
   */
  setMinClarity(clarity) {
    this.config.minClarity = Math.max(0, Math.min(1, clarity));
  }
  /**
   * Set frequency range for detection
   */
  setFrequencyRange(min, max) {
    this.config.minFrequency = min;
    this.config.maxFrequency = max;
  }
  /**
   * Create detector optimized for specific instrument
   */
  static forInstrument(instrument) {
    const configs = {
      guitar: {
        bufferSize: 2048,
        minClarity: 0.75,
        minFrequency: 70,
        // E2
        maxFrequency: 1400
        // E6
      },
      violin: {
        bufferSize: 2048,
        minClarity: 0.8,
        minFrequency: 180,
        // Below G3
        maxFrequency: 1600
        // Above G6
      },
      voice: {
        bufferSize: 2048,
        minClarity: 0.85,
        minFrequency: 80,
        // E2
        maxFrequency: 1200
        // D6
      }
    };
    return new _PitchDetector(configs[instrument]);
  }
};

// js/input/audio-manager.ts
var AudioManager = class {
  // Min time between note detections
  constructor(config = {}) {
    this.audioContext = null;
    this.microphone = null;
    this.analyser = null;
    this.pitchDetector = null;
    this.animationFrameId = null;
    this.stream = null;
    this.isListening = false;
    this.buffer = null;
    // Debouncing for note detection
    this.lastDetectedMidi = null;
    this.lastDetectedTime = 0;
    this.noteDebounceMs = 100;
    this.config = {
      bufferSize: config.bufferSize || 2048,
      smoothing: config.smoothing || 0.8,
      minClarity: config.minClarity || 0.75,
      minFrequency: config.minFrequency || 70,
      maxFrequency: config.maxFrequency || 1600
    };
    this.listeners = {
      pitchDetected: [],
      audioLevel: [],
      error: [],
      statusChange: []
    };
  }
  /**
   * Initialize audio context and request microphone access
   * @param deviceId - Optional specific device ID to use
   */
  async init(deviceId) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.emitError("Microphone access is not supported in this browser. Try Chrome or Edge.");
        return false;
      }
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.setupAudioContextErrorHandlers();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      const audioConstraints = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 44100
      };
      if (deviceId) {
        audioConstraints.deviceId = { exact: deviceId };
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.bufferSize * 2;
      this.analyser.smoothingTimeConstant = this.config.smoothing;
      this.microphone.connect(this.analyser);
      this.buffer = new Float32Array(this.config.bufferSize);
      this.pitchDetector = new PitchDetector2({
        bufferSize: this.config.bufferSize,
        sampleRate: this.audioContext.sampleRate,
        minClarity: this.config.minClarity,
        minFrequency: this.config.minFrequency,
        maxFrequency: this.config.maxFrequency
      });
      console.log("Audio Manager initialized successfully");
      console.log("Sample rate:", this.audioContext.sampleRate);
      console.log("Buffer size:", this.config.bufferSize);
      console.log("Audio context state:", this.audioContext.state);
      this.emitStatusChange({ listening: false, microphoneActive: true });
      return true;
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      this.emitError("Failed to access microphone. Please check your browser permissions.", error);
      return false;
    }
  }
  /**
   * Setup error handlers for AudioContext
   */
  setupAudioContextErrorHandlers() {
    if (!this.audioContext) return;
    this.audioContext.addEventListener("statechange", () => {
      console.log("AudioContext state changed to:", this.audioContext?.state);
      if (this.audioContext?.state === "suspended") {
        console.warn("AudioContext suspended, attempting to resume...");
        this.audioContext.resume().catch((err) => {
          console.error("Failed to resume AudioContext:", err);
        });
      } else if (this.audioContext?.state === "closed") {
        console.error("AudioContext closed unexpectedly");
        this.emitError("Audio system closed unexpectedly. Please reconnect your microphone.");
      }
    });
  }
  /**
   * Start listening for pitch
   */
  startListening() {
    if (!this.audioContext || !this.analyser || !this.pitchDetector || !this.buffer) {
      console.error("Audio Manager not initialized");
      return;
    }
    if (this.isListening) {
      console.warn("Already listening");
      return;
    }
    this.isListening = true;
    this.emitStatusChange({ listening: true, microphoneActive: true });
    this.detectPitchLoop();
    console.log("Started listening for pitch");
  }
  /**
   * Stop listening for pitch
   */
  stopListening() {
    if (!this.isListening) return;
    this.isListening = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emitStatusChange({ listening: false, microphoneActive: this.stream !== null });
    console.log("Stopped listening for pitch");
  }
  /**
   * Main pitch detection loop
   */
  detectPitchLoop() {
    if (!this.isListening || !this.analyser || !this.pitchDetector || !this.buffer || !this.audioContext) {
      return;
    }
    if (this.audioContext.state === "suspended") {
      console.warn("AudioContext suspended during pitch detection, attempting resume...");
      this.audioContext.resume().then(() => {
        console.log("AudioContext resumed successfully");
      }).catch((err) => {
        console.error("Failed to resume AudioContext:", err);
        this.stopListening();
        this.emitError("Audio system paused. Please restart your practice session.");
      });
      return;
    }
    if (this.audioContext.state === "closed") {
      console.error("AudioContext closed during pitch detection");
      this.stopListening();
      this.emitError("Audio system closed. Please reconnect your microphone.");
      return;
    }
    try {
      this.analyser.getFloatTimeDomainData(this.buffer);
      const level = this.calculateRMS(this.buffer);
      this.emitAudioLevel(level);
      const result = this.pitchDetector.detectPitch(this.buffer, this.audioContext.sampleRate);
      if (result.detected) {
        const now = Date.now();
        if (result.midi !== this.lastDetectedMidi || now - this.lastDetectedTime > this.noteDebounceMs) {
          this.emitPitchDetected({
            frequency: result.frequency,
            midi: result.midi,
            cents: result.cents,
            clarity: result.clarity,
            noteName: midiToNoteName2(result.midi),
            timestamp: now
          });
          this.lastDetectedMidi = result.midi;
          this.lastDetectedTime = now;
        }
      }
    } catch (error) {
      console.error("Error in pitch detection loop:", error);
    }
    if (this.isListening) {
      this.animationFrameId = requestAnimationFrame(() => this.detectPitchLoop());
    }
  }
  /**
   * Calculate RMS (Root Mean Square) for audio level
   */
  calculateRMS(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }
  /**
   * Disconnect microphone and clean up resources
   */
  disconnect() {
    this.stopListening();
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.pitchDetector = null;
    this.buffer = null;
    this.emitStatusChange({ listening: false, microphoneActive: false });
    console.log("Audio Manager disconnected");
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    if (this.pitchDetector) {
      this.pitchDetector.updateConfig({
        minClarity: this.config.minClarity,
        minFrequency: this.config.minFrequency,
        maxFrequency: this.config.maxFrequency
      });
    }
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = this.config.smoothing;
    }
  }
  /**
   * Set note debounce time
   */
  setDebounceTime(ms) {
    this.noteDebounceMs = Math.max(0, ms);
  }
  /**
   * Register an event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      console.warn("Unknown event type:", event);
    }
  }
  /**
   * Remove an event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index4 = this.listeners[event].indexOf(callback);
      if (index4 > -1) {
        this.listeners[event].splice(index4, 1);
      }
    }
  }
  /**
   * Emit pitch detected event
   */
  emitPitchDetected(data) {
    this.listeners.pitchDetected.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in pitchDetected listener:", error);
      }
    });
  }
  /**
   * Emit audio level event
   */
  emitAudioLevel(level) {
    this.listeners.audioLevel.forEach((callback) => {
      try {
        callback({ level, timestamp: Date.now() });
      } catch (error) {
        console.error("Error in audioLevel listener:", error);
      }
    });
  }
  /**
   * Emit error event
   */
  emitError(message, error) {
    this.listeners.error.forEach((callback) => {
      try {
        callback({ message, error });
      } catch (err) {
        console.error("Error in error listener:", err);
      }
    });
  }
  /**
   * Emit status change event
   */
  emitStatusChange(status) {
    this.listeners.statusChange.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error("Error in statusChange listener:", error);
      }
    });
  }
  /**
   * Get current audio level (0-1)
   */
  getCurrentLevel() {
    if (!this.buffer) return 0;
    return this.calculateRMS(this.buffer);
  }
  /**
   * Check if microphone is active
   */
  isMicrophoneActive() {
    return this.stream !== null && this.audioContext !== null;
  }
  /**
   * Check if currently listening
   */
  isCurrentlyListening() {
    return this.isListening;
  }
  /**
   * Get audio context sample rate
   */
  getSampleRate() {
    return this.audioContext?.sampleRate || 44100;
  }
  /**
   * Simulate frequency detection (for testing without microphone)
   */
  simulateFrequency(frequency) {
    const midi2 = Math.round(12 * Math.log2(frequency / 440) + 69);
    this.emitPitchDetected({
      frequency,
      midi: midi2,
      cents: 0,
      clarity: 1,
      noteName: midiToNoteName2(midi2),
      timestamp: Date.now()
    });
  }
  /**
   * Get available audio input devices
   */
  static async getAudioInputDevices() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "audioinput");
    } catch (error) {
      console.error("Failed to enumerate audio devices:", error);
      return [];
    }
  }
  /**
   * Get the currently active audio input device
   */
  getActiveDevice() {
    if (!this.stream) return null;
    const audioTrack = this.stream.getAudioTracks()[0];
    if (!audioTrack) return null;
    return {
      deviceId: audioTrack.getSettings().deviceId || "",
      groupId: audioTrack.getSettings().groupId || "",
      kind: "audioinput",
      label: audioTrack.label,
      toJSON: () => ({})
    };
  }
  /**
   * Check if microphone access is supported
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
};
if (typeof window !== "undefined") {
  window.AudioManager = AudioManager;
}

// js/notation/staff-renderer.ts
var StaffRenderer = class {
  constructor(containerId) {
    this.renderer = null;
    this.context = null;
    this.currentNote = null;
    this.clef = "treble";
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("Container not found:", containerId);
      return;
    }
    this.init();
  }
  /**
   * Initialize VexFlow renderer
   */
  init() {
    try {
      if (typeof Vex === "undefined") {
        console.error("VexFlow not loaded");
        return;
      }
      if (!this.container) return;
      this.container.innerHTML = "";
      const VF = Vex.Flow;
      this.renderer = new VF.Renderer(
        this.container,
        VF.Renderer.Backends.SVG
      );
      this.renderer.resize(500, 200);
      this.context = this.renderer.getContext();
      console.log("StaffRenderer initialized");
    } catch (error) {
      console.error("Failed to initialize StaffRenderer:", error);
    }
  }
  /**
   * Set the clef type
   * @param clef - 'treble' or 'bass'
   */
  setClef(clef) {
    this.clef = clef;
  }
  /**
   * Render a single note on the staff
   * @param vexflowNote - Note in VexFlow format (e.g., "c/4")
   * @param options - Rendering options
   */
  renderNote(vexflowNote, options = {}) {
    if (!this.context) {
      console.error("Renderer not initialized");
      return;
    }
    try {
      const VF = Vex.Flow;
      if (!this.container) return;
      this.context.clear();
      this.container.innerHTML = "";
      this.renderer = new VF.Renderer(
        this.container,
        VF.Renderer.Backends.SVG
      );
      this.renderer.resize(500, 200);
      this.context = this.renderer.getContext();
      const stave = new VF.Stave(10, 20, 400);
      stave.addClef(this.clef);
      stave.setContext(this.context).draw();
      const note2 = new VF.StaveNote({
        keys: [vexflowNote],
        duration: "w",
        // Whole note
        clef: this.clef
      });
      const voice = new VF.Voice({
        num_beats: 4,
        beat_value: 4
      });
      voice.addTickable(note2);
      new VF.Formatter().joinVoices([voice]).format([voice], 350);
      voice.draw(this.context, stave);
      this.currentNote = vexflowNote;
      if (options.highlight) {
        this.highlightNote();
      }
    } catch (error) {
      console.error("Failed to render note:", error);
      this.showError("Unable to display note");
    }
  }
  /**
   * Render multiple notes on the staff
   * @param notes - Array of VexFlow notes
   */
  renderNotes(notes2) {
    if (!this.context) {
      console.error("Renderer not initialized");
      return;
    }
    try {
      const VF = Vex.Flow;
      if (!this.container) return;
      this.context.clear();
      this.container.innerHTML = "";
      this.renderer = new VF.Renderer(
        this.container,
        VF.Renderer.Backends.SVG
      );
      this.renderer.resize(700, 200);
      this.context = this.renderer.getContext();
      const stave = new VF.Stave(10, 20, 650);
      stave.addClef(this.clef);
      stave.setContext(this.context).draw();
      const staveNotes = notes2.map((note2) => {
        return new VF.StaveNote({
          keys: [note2],
          duration: "q",
          // Quarter note
          clef: this.clef
        });
      });
      const voice = new VF.Voice({
        num_beats: staveNotes.length,
        beat_value: 4
      });
      voice.addTickables(staveNotes);
      new VF.Formatter().joinVoices([voice]).format([voice], 600);
      voice.draw(this.context, stave);
    } catch (error) {
      console.error("Failed to render notes:", error);
      this.showError("Unable to display notes");
    }
  }
  /**
   * Render a scale on the staff
   * @param midiNotes - Array of MIDI note numbers
   */
  renderScale(midiNotes) {
    const vexflowNotes = midiNotes.map((midi2) => MusicTheory.midiToVexflow(midi2, this.clef)).filter((note2) => note2 !== null);
    if (vexflowNotes.length > 0) {
      this.renderNotes(vexflowNotes);
    }
  }
  /**
   * Highlight the current note (visual feedback)
   */
  highlightNote() {
    if (!this.container) return;
    const svg = this.container.querySelector("svg");
    if (svg) {
      const noteheads = svg.querySelectorAll(".vf-notehead");
      noteheads.forEach((notehead) => {
        notehead.style.fill = "#3b82f6";
      });
    }
  }
  /**
   * Show feedback for correct/incorrect note
   * @param isCorrect - Whether the note was correct
   */
  showFeedback(isCorrect) {
    if (!this.container) return;
    const svg = this.container.querySelector("svg");
    if (!svg) return;
    const noteheads = svg.querySelectorAll(".vf-notehead");
    const color = isCorrect ? "#10b981" : "#ef4444";
    noteheads.forEach((notehead) => {
      const element = notehead;
      element.style.fill = color;
      element.style.transition = "fill 0.3s ease";
    });
    setTimeout(() => {
      noteheads.forEach((notehead) => {
        notehead.style.fill = "";
      });
    }, 500);
  }
  /**
   * Show error message
   * @param message - Error message to display
   */
  showError(message) {
    if (!this.container) return;
    this.container.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--text-secondary);
                font-size: 1rem;
            ">
                ${message}
            </div>
        `;
  }
  /**
   * Show welcome message
   */
  showWelcome() {
    if (!this.container) return;
    this.container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--text-secondary);
                text-align: center;
                padding: 2rem;
            ">
                <p style="font-size: 3rem; margin-bottom: 0.5rem;">\u{1F3B9}</p>
                <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">
                    Ready to Practice
                </p>
                <p style="font-size: 0.95rem;">
                    Click "Start Practice" to begin
                </p>
            </div>
        `;
  }
  /**
   * Clear the staff
   */
  clear() {
    if (this.context) {
      this.context.clear();
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
    this.currentNote = null;
  }
  /**
   * Get the current note
   * @returns Current VexFlow note
   */
  getCurrentNote() {
    return this.currentNote;
  }
};
if (typeof window !== "undefined") {
  window.StaffRenderer = StaffRenderer;
}

// js/notation/falling-notes.ts
var FallingNotesRenderer = class {
  constructor(containerId) {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.notes = [];
    this.currentTargetNote = null;
    this.isAnimating = false;
    // Configuration
    this.config = {
      noteWidth: 80,
      noteHeight: 20,
      fallSpeed: 2,
      // pixels per frame
      hitZoneY: 350,
      // Y position of hit zone
      hitZoneHeight: 40,
      colors: {
        note: "#3b82f6",
        hitZone: "rgba(59, 130, 246, 0.2)",
        hitZoneBorder: "#3b82f6",
        correct: "#10b981",
        incorrect: "#ef4444"
      }
    };
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("Container not found:", containerId);
      return;
    }
    this.init();
  }
  /**
   * Initialize canvas
   */
  init() {
    try {
      this.canvas = document.createElement("canvas");
      this.canvas.width = 600;
      this.canvas.height = 400;
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      if (!this.container) return;
      this.container.innerHTML = "";
      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      console.log("FallingNotesRenderer initialized");
    } catch (error) {
      console.error("Failed to initialize FallingNotesRenderer:", error);
    }
  }
  /**
   * Add a new falling note
   * @param midiNote - MIDI note number
   * @param noteName - Note name for display
   */
  addNote(midiNote, noteName) {
    if (!this.canvas) return;
    const note2 = {
      midiNote,
      noteName,
      x: (this.canvas.width - this.config.noteWidth) / 2,
      y: 0,
      width: this.config.noteWidth,
      height: this.config.noteHeight,
      color: this.config.colors.note,
      hit: false,
      missed: false
    };
    this.notes.push(note2);
    this.currentTargetNote = note2;
    if (!this.isAnimating) {
      this.startAnimation();
    }
  }
  /**
   * Start the animation loop
   */
  startAnimation() {
    this.isAnimating = true;
    this.animate();
  }
  /**
   * Stop the animation loop
   */
  stopAnimation() {
    this.isAnimating = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  /**
   * Animation loop
   */
  animate() {
    if (!this.isAnimating || !this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawHitZone();
    this.notes = this.notes.filter((note2) => {
      note2.y += this.config.fallSpeed;
      if (note2.y > this.config.hitZoneY + this.config.hitZoneHeight && !note2.hit) {
        note2.missed = true;
        note2.color = this.config.colors.incorrect;
      }
      this.drawNote(note2);
      return note2.y < this.canvas.height + 50;
    });
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  /**
   * Draw the hit zone
   */
  drawHitZone() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const y = this.config.hitZoneY;
    const height = this.config.hitZoneHeight;
    ctx.fillStyle = this.config.colors.hitZone;
    ctx.fillRect(0, y, this.canvas.width, height);
    ctx.strokeStyle = this.config.colors.hitZoneBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, y, this.canvas.width, height);
    ctx.fillStyle = this.config.colors.hitZoneBorder;
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Play here", this.canvas.width / 2, y + height / 2 + 5);
  }
  /**
   * Draw a note
   * @param note - Note object
   */
  drawNote(note2) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = note2.color;
    ctx.fillRect(note2.x, note2.y, note2.width, note2.height);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(note2.x, note2.y, note2.width, note2.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(note2.noteName, note2.x + note2.width / 2, note2.y + note2.height / 2);
  }
  /**
   * Check if a played note matches the target
   * @param playedMidi - MIDI note that was played
   * @returns True if correct
   */
  checkNote(playedMidi) {
    if (!this.currentTargetNote || this.currentTargetNote.hit) {
      return false;
    }
    const note2 = this.currentTargetNote;
    const inHitZone = note2.y >= this.config.hitZoneY - 20 && note2.y <= this.config.hitZoneY + this.config.hitZoneHeight + 20;
    if (inHitZone && note2.midiNote === playedMidi) {
      note2.hit = true;
      note2.color = this.config.colors.correct;
      this.currentTargetNote = null;
      return true;
    } else if (inHitZone) {
      note2.color = this.config.colors.incorrect;
      return false;
    }
    return false;
  }
  /**
   * Set the falling speed
   * @param speed - Pixels per frame
   */
  setSpeed(speed) {
    this.config.fallSpeed = speed;
  }
  /**
   * Clear all notes
   */
  clear() {
    this.notes = [];
    this.currentTargetNote = null;
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  /**
   * Show welcome message
   */
  showWelcome() {
    if (!this.ctx || !this.canvas) return;
    this.clear();
    this.stopAnimation();
    const ctx = this.ctx;
    ctx.fillStyle = "var(--text-secondary)";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("\u{1F3B9}", this.canvas.width / 2, this.canvas.height / 2 - 40);
    ctx.font = "18px sans-serif";
    ctx.fillText("Falling Notes Mode", this.canvas.width / 2, this.canvas.height / 2 + 20);
    ctx.font = "14px sans-serif";
    ctx.fillText(
      "Notes will fall from top - play them when they reach the hit zone",
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    );
  }
  /**
   * Destroy the renderer
   */
  destroy() {
    this.stopAnimation();
    this.notes = [];
    this.currentTargetNote = null;
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
};
if (typeof window !== "undefined") {
  window.FallingNotesRenderer = FallingNotesRenderer;
}

// js/utils/storage.ts
var KEYS = {
  SESSIONS: "music_practice_sessions",
  SETTINGS: "music_practice_settings",
  STATS: "music_practice_stats"
};
function isLocalStorageAvailable() {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}
function saveSession(sessionData) {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available");
    return;
  }
  try {
    const sessions = getSessions();
    const newSession = {
      ...sessionData,
      timestamp: Date.now(),
      id: generateId()
    };
    sessions.push(newSession);
    if (sessions.length > 100) {
      sessions.shift();
    }
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
    updateStats(sessionData);
  } catch (error) {
    console.error("Error saving session:", error);
  }
}
function getSessions() {
  if (!isLocalStorageAvailable()) {
    return [];
  }
  try {
    const data = localStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading sessions:", error);
    return [];
  }
}
function getSessionsByInstrument(instrumentId) {
  return getSessions().filter((session) => session.instrument === instrumentId);
}
function updateStats(sessionData) {
  if (!isLocalStorageAvailable()) {
    return;
  }
  try {
    const stats = getStats();
    stats.totalSessions++;
    stats.totalCorrect += sessionData.correct || 0;
    stats.totalIncorrect += sessionData.incorrect || 0;
    stats.totalNotes += (sessionData.correct || 0) + (sessionData.incorrect || 0);
    if (sessionData.avgResponseTime) {
      const totalTime = stats.avgResponseTime * (stats.totalSessions - 1) + sessionData.avgResponseTime;
      stats.avgResponseTime = totalTime / stats.totalSessions;
    }
    if ((sessionData.bestStreak || 0) > stats.bestStreak) {
      stats.bestStreak = sessionData.bestStreak || 0;
    }
    const module = sessionData.module || "sightReading";
    if (!stats.byModule[module]) {
      stats.byModule[module] = {
        sessions: 0,
        correct: 0,
        incorrect: 0
      };
    }
    stats.byModule[module].sessions++;
    stats.byModule[module].correct += sessionData.correct || 0;
    stats.byModule[module].incorrect += sessionData.incorrect || 0;
    stats.lastPracticeDate = Date.now();
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}
function getStats() {
  if (!isLocalStorageAvailable()) {
    return getDefaultStats();
  }
  try {
    const data = localStorage.getItem(KEYS.STATS);
    return data ? JSON.parse(data) : getDefaultStats();
  } catch (error) {
    console.error("Error loading stats:", error);
    return getDefaultStats();
  }
}
function getDefaultStats() {
  return {
    totalSessions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalNotes: 0,
    avgResponseTime: 0,
    bestStreak: 0,
    lastPracticeDate: null,
    byModule: {}
  };
}
function saveSettings(settings) {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available");
    return;
  }
  try {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}
function getSettings() {
  if (!isLocalStorageAvailable()) {
    return getDefaultSettings();
  }
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch (error) {
    console.error("Error loading settings:", error);
    return getDefaultSettings();
  }
}
function getDefaultSettings() {
  return {
    theme: "light",
    clef: "treble",
    range: "c4-c5",
    fallingNotesMode: false,
    allowOctaveError: true,
    midiDeviceId: null,
    virtualKeyboard: false,
    instrument: "piano",
    pitchTolerance: 50
  };
}
function clearAll() {
  if (!isLocalStorageAvailable()) {
    return;
  }
  try {
    localStorage.removeItem(KEYS.SESSIONS);
    localStorage.removeItem(KEYS.STATS);
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}
function clearAllIncludingSettings() {
  if (!isLocalStorageAvailable()) {
    return;
  }
  try {
    localStorage.removeItem(KEYS.SESSIONS);
    localStorage.removeItem(KEYS.STATS);
    localStorage.removeItem(KEYS.SETTINGS);
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}
function exportData() {
  return JSON.stringify({
    sessions: getSessions(),
    stats: getStats(),
    settings: getSettings(),
    exportDate: Date.now()
  }, null, 2);
}
function importData(jsonData) {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage not available");
    return false;
  }
  try {
    const data = JSON.parse(jsonData);
    if (data.sessions) {
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data.sessions));
    }
    if (data.stats) {
      localStorage.setItem(KEYS.STATS, JSON.stringify(data.stats));
    }
    if (data.settings) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
}
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
var Storage = {
  KEYS,
  saveSession,
  getSessions,
  getSessionsByInstrument,
  updateStats,
  getStats,
  getDefaultStats,
  saveSettings,
  getSettings,
  getDefaultSettings,
  clearAll,
  clearAllIncludingSettings,
  exportData,
  importData,
  generateId
};
if (typeof window !== "undefined") {
  window.Storage = Storage;
}

// js/utils/instrument-config.ts
var InstrumentType = {
  PIANO: "piano",
  VIOLIN: "violin",
  GUITAR: "guitar"
};
var InputMethod = {
  MIDI: "midi",
  MICROPHONE: "microphone"
};
var Clef = {
  TREBLE: "treble",
  BASS: "bass"
};
var INSTRUMENTS = {
  [InstrumentType.PIANO]: {
    id: InstrumentType.PIANO,
    name: "Piano",
    displayName: "Piano/Keyboard",
    emoji: "\u{1F3B9}",
    inputType: InputMethod.MIDI,
    // Range settings (MIDI note numbers)
    range: {
      min: 21,
      // A0
      max: 108,
      // C8
      default: {
        min: 48,
        // C3
        max: 84
        // C6
      }
    },
    // Clef settings
    clefs: [Clef.TREBLE, Clef.BASS],
    defaultClef: Clef.TREBLE,
    // Input capabilities
    polyphonic: true,
    // Can detect multiple simultaneous notes
    requiresSustain: false,
    // Validation settings
    validation: {
      exactMatch: true,
      // MIDI requires exact note match
      pitchTolerance: 0,
      // No tolerance for MIDI
      octaveFlexible: false,
      // Can enable for practice mode
      minDuration: 0
      // No minimum duration required
    },
    // Practice settings
    practice: {
      defaultNoteCount: 20,
      adaptiveDifficulty: true,
      supportedModes: ["sight-reading", "scales", "chords", "arpeggios", "key-signatures"]
    },
    // UI settings
    ui: {
      showVirtualKeyboard: true,
      showMidiStatus: true,
      showPitchAccuracy: false
    }
  },
  [InstrumentType.VIOLIN]: {
    id: InstrumentType.VIOLIN,
    name: "Violin",
    displayName: "Violin",
    emoji: "\u{1F3BB}",
    inputType: InputMethod.MICROPHONE,
    // Range settings (MIDI note numbers)
    range: {
      min: 55,
      // G3
      max: 91,
      // G6 (extended range)
      default: {
        min: 60,
        // C4 (first position, beginner friendly)
        max: 72
        // C5 (one octave, first position only)
      }
    },
    // Clef settings
    clefs: [Clef.TREBLE],
    defaultClef: Clef.TREBLE,
    // Input capabilities
    polyphonic: false,
    // Monophonic pitch detection
    requiresSustain: true,
    // String tuning (open strings in scientific pitch notation)
    tuning: [
      { note: "G3", midi: 55, frequency: 196 },
      { note: "D4", midi: 62, frequency: 293.66 },
      { note: "A4", midi: 69, frequency: 440 },
      { note: "E5", midi: 76, frequency: 659.26 }
    ],
    // Validation settings
    validation: {
      exactMatch: false,
      pitchTolerance: 50,
      // ±50 cents for beginners
      pitchToleranceAdvanced: 20,
      // ±20 cents for advanced
      octaveFlexible: false,
      minDuration: 500,
      // 500ms minimum note sustain
      minClarity: 0.8
      // 80% pitch clarity threshold
    },
    // Practice settings
    practice: {
      defaultNoteCount: 15,
      adaptiveDifficulty: true,
      supportedModes: ["sight-reading", "scales", "arpeggios", "intonation", "key-signatures"],
      calibrationRequired: true,
      // Require A4 calibration
      tuningCheckRecommended: true
    },
    // UI settings
    ui: {
      showVirtualKeyboard: false,
      showMidiStatus: false,
      showPitchAccuracy: true,
      showMicrophoneLevel: true,
      showTuningReference: true,
      showCentsDeviation: true
    },
    // Audio processing settings
    audio: {
      bufferSize: 2048,
      // ~46ms at 44.1kHz
      noiseGate: -40,
      // dB threshold
      minFrequency: 180,
      // Hz (below G3)
      maxFrequency: 1600
      // Hz (above G6)
    }
  },
  [InstrumentType.GUITAR]: {
    id: InstrumentType.GUITAR,
    name: "Guitar",
    displayName: "Guitar",
    emoji: "\u{1F3B8}",
    inputType: InputMethod.MICROPHONE,
    // Range settings (MIDI note numbers)
    range: {
      min: 40,
      // E2
      max: 88,
      // E6 (24th fret on high E)
      default: {
        min: 40,
        // E2
        max: 76
        // E5 (12th fret on high E)
      }
    },
    // Clef settings
    clefs: [Clef.TREBLE],
    defaultClef: Clef.TREBLE,
    // Input capabilities
    polyphonic: false,
    // Monophonic for POC (polyphonic future)
    requiresSustain: true,
    // Standard tuning (EADGBE in scientific pitch notation)
    tuning: [
      { note: "E2", midi: 40, frequency: 82.41, string: 6 },
      { note: "A2", midi: 45, frequency: 110, string: 5 },
      { note: "D3", midi: 50, frequency: 146.83, string: 4 },
      { note: "G3", midi: 55, frequency: 196, string: 3 },
      { note: "B3", midi: 59, frequency: 246.94, string: 2 },
      { note: "E4", midi: 64, frequency: 329.63, string: 1 }
    ],
    // Validation settings
    validation: {
      exactMatch: false,
      pitchTolerance: 50,
      // ±50 cents (guitar can be slightly out of tune)
      pitchToleranceAdvanced: 30,
      // ±30 cents for advanced
      octaveFlexible: false,
      minDuration: 400,
      // 400ms minimum (pluck sustain)
      minClarity: 0.75
      // 75% clarity (guitar harmonics can confuse)
    },
    // Practice settings
    practice: {
      defaultNoteCount: 15,
      adaptiveDifficulty: true,
      supportedModes: ["sight-reading", "scales", "arpeggios", "key-signatures"],
      calibrationRequired: false,
      tuningCheckRecommended: true,
      fretIndependent: true
      // Focus on pitch, not fret position
    },
    // UI settings
    ui: {
      showVirtualKeyboard: false,
      showMidiStatus: false,
      showPitchAccuracy: true,
      showMicrophoneLevel: true,
      showTuningReference: true,
      showCentsDeviation: true,
      showFretboardReference: false
      // Future feature
    },
    // Audio processing settings
    audio: {
      bufferSize: 2048,
      // ~46ms at 44.1kHz
      noiseGate: -35,
      // dB threshold (slightly higher due to picking noise)
      minFrequency: 70,
      // Hz (below E2)
      maxFrequency: 1400
      // Hz (above E6 fundamental)
    }
  }
};
function getInstrument(instrumentId) {
  const instrument = INSTRUMENTS[instrumentId];
  if (!instrument) {
    console.warn(`Unknown instrument: ${instrumentId}, defaulting to piano`);
    return INSTRUMENTS[InstrumentType.PIANO];
  }
  return instrument;
}
function requiresMicrophone(instrumentId) {
  const instrument = getInstrument(instrumentId);
  return instrument.inputType === InputMethod.MICROPHONE;
}
function requiresMIDI(instrumentId) {
  const instrument = getInstrument(instrumentId);
  return instrument.inputType === InputMethod.MIDI;
}
function getNoteRange(instrumentId, useDefault = true) {
  const instrument = getInstrument(instrumentId);
  return useDefault ? instrument.range.default : {
    min: instrument.range.min,
    max: instrument.range.max
  };
}
function getPitchTolerance(instrumentId, advanced = false) {
  const instrument = getInstrument(instrumentId);
  if (advanced && instrument.validation.pitchToleranceAdvanced !== void 0) {
    return instrument.validation.pitchToleranceAdvanced;
  }
  return instrument.validation.pitchTolerance;
}

// js/utils/audio-tone.ts
var AudioToneGenerator = class {
  constructor() {
    this.audioContext = null;
    this.currentOscillator = null;
    this.currentGain = null;
  }
  /**
   * Initialize audio context if not already initialized
   */
  initAudioContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch((err) => {
        console.error("Failed to resume tone generator AudioContext:", err);
      });
    }
  }
  /**
   * Play a sine wave tone at the specified frequency
   * @param frequency - Frequency in Hz
   * @param duration - Duration in milliseconds (default: 1000ms)
   * @param volume - Volume level 0-1 (default: 0.3)
   */
  playTone(frequency, duration = 1e3, volume = 0.3) {
    try {
      this.stopTone();
      this.initAudioContext();
      if (!this.audioContext || this.audioContext.state === "closed") {
        console.error("Failed to create audio context");
        return;
      }
      this.currentOscillator = this.audioContext.createOscillator();
      this.currentGain = this.audioContext.createGain();
      this.currentOscillator.type = "sine";
      this.currentOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      const now = this.audioContext.currentTime;
      const fadeTime = 0.02;
      this.currentGain.gain.setValueAtTime(0, now);
      this.currentGain.gain.linearRampToValueAtTime(volume, now + fadeTime);
      this.currentGain.gain.setValueAtTime(volume, now + duration / 1e3 - fadeTime);
      this.currentGain.gain.linearRampToValueAtTime(0, now + duration / 1e3);
      this.currentOscillator.connect(this.currentGain);
      this.currentGain.connect(this.audioContext.destination);
      this.currentOscillator.start(now);
      this.currentOscillator.stop(now + duration / 1e3);
      this.currentOscillator.onended = () => {
        this.cleanup();
      };
    } catch (error) {
      console.error("Error playing tone:", error);
      this.cleanup();
    }
  }
  /**
   * Stop the currently playing tone
   */
  stopTone() {
    if (this.currentOscillator) {
      try {
        this.currentOscillator.stop();
      } catch (e) {
      }
      this.cleanup();
    }
  }
  /**
   * Clean up oscillator and gain nodes
   */
  cleanup() {
    if (this.currentOscillator) {
      this.currentOscillator.disconnect();
      this.currentOscillator = null;
    }
    if (this.currentGain) {
      this.currentGain.disconnect();
      this.currentGain = null;
    }
  }
  /**
   * Check if audio context is supported
   */
  static isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }
  /**
   * Close the audio context and release resources
   */
  dispose() {
    this.stopTone();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
};

// js/modules/sight-reading.ts
var SightReadingModule = class {
  constructor(midiManager, staffRenderer, fallingNotesRenderer, audioManager = null, instrument = "piano") {
    // Session state
    this.isActive = false;
    this.currentNote = null;
    this.currentTargetMidi = null;
    this.startTime = null;
    this.responseTimes = [];
    // Event handler references for cleanup
    this.midiNoteOnHandler = null;
    this.audioPitchHandler = null;
    this.midiManager = midiManager;
    this.audioManager = audioManager;
    this.staffRenderer = staffRenderer;
    this.fallingNotesRenderer = fallingNotesRenderer;
    this.currentInstrument = instrument;
    this.toneGenerator = new AudioToneGenerator();
    this.stats = {
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      totalTime: 0,
      attempts: []
    };
    const instrumentConfig = getInstrument(this.currentInstrument);
    this.settings = {
      clef: instrumentConfig.defaultClef,
      range: "c4-c5",
      // Will be overridden by instrument range in generateNewNote()
      fallingNotesMode: false,
      allowOctaveError: instrumentConfig.validation.octaveFlexible
    };
    this.ui = {
      correctCount: document.getElementById("correctCount"),
      incorrectCount: document.getElementById("incorrectCount"),
      streakCount: document.getElementById("streakCount"),
      avgTime: document.getElementById("avgTime"),
      feedbackMessage: document.getElementById("feedbackMessage"),
      startBtn: document.getElementById("startSessionBtn"),
      stopBtn: document.getElementById("stopSessionBtn"),
      nextBtn: document.getElementById("nextNoteBtn"),
      playReferenceBtn: document.getElementById("playReferenceBtn")
    };
    this.initEventListeners();
  }
  /**
   * Initialize event listeners
   */
  initEventListeners() {
    if (this.midiManager && requiresMIDI(this.currentInstrument)) {
      this.midiNoteOnHandler = (data) => {
        if (this.isActive && this.currentTargetMidi !== null) {
          this.handleMidiInput(data.note);
        }
      };
      this.midiManager.on("noteOn", this.midiNoteOnHandler);
    }
    if (this.audioManager && requiresMicrophone(this.currentInstrument)) {
      this.audioPitchHandler = (data) => {
        if (this.isActive && this.currentTargetMidi !== null) {
          this.handleMicrophoneInput(data);
        }
      };
      this.audioManager.on("pitchDetected", this.audioPitchHandler);
    }
    if (this.ui.startBtn) {
      this.ui.startBtn.addEventListener("click", () => this.startSession());
    }
    if (this.ui.stopBtn) {
      this.ui.stopBtn.addEventListener("click", () => this.stopSession());
    }
    if (this.ui.nextBtn) {
      this.ui.nextBtn.addEventListener("click", () => this.nextNote());
    }
    if (this.ui.playReferenceBtn) {
      this.ui.playReferenceBtn.addEventListener("click", () => this.playReferenceTone());
    }
    const clefSelect = document.getElementById("clefSelect");
    if (clefSelect) {
      clefSelect.addEventListener("change", (e) => {
        const target = e.target;
        this.settings.clef = target.value;
        this.staffRenderer.setClef(target.value);
        if (this.isActive) {
          this.generateNewNote();
        }
      });
    }
    const rangeSelect = document.getElementById("rangeSelect");
    if (rangeSelect) {
      rangeSelect.addEventListener("change", (e) => {
        const target = e.target;
        this.settings.range = target.value;
        if (this.isActive) {
          this.generateNewNote();
        }
      });
    }
    const fallingNotesToggle = document.getElementById("fallingNotesToggle");
    if (fallingNotesToggle) {
      fallingNotesToggle.addEventListener("change", (e) => {
        const target = e.target;
        this.settings.fallingNotesMode = target.checked;
        this.toggleRenderMode();
      });
    }
  }
  /**
   * Start practice session
   */
  startSession() {
    this.isActive = true;
    this.resetStats();
    this.updateUI();
    if (this.ui.startBtn) this.ui.startBtn.classList.add("hidden");
    if (this.ui.stopBtn) this.ui.stopBtn.classList.remove("hidden");
    if (this.audioManager && requiresMicrophone(this.currentInstrument)) {
      this.audioManager.startListening();
    }
    this.generateNewNote();
    getInstrument(this.currentInstrument);
    const inputHint = requiresMicrophone(this.currentInstrument) ? "Play the note on your instrument" : "Play the note shown above";
    this.showFeedback(inputHint, "info");
  }
  /**
   * Stop practice session
   */
  stopSession() {
    this.isActive = false;
    if (this.audioManager && requiresMicrophone(this.currentInstrument)) {
      this.audioManager.stopListening();
    }
    if (this.ui.startBtn) this.ui.startBtn.classList.remove("hidden");
    if (this.ui.stopBtn) this.ui.stopBtn.classList.add("hidden");
    this.saveSession();
    this.showSessionSummary();
    if (this.settings.fallingNotesMode) {
      this.fallingNotesRenderer.clear();
      this.fallingNotesRenderer.stopAnimation();
    } else {
      this.staffRenderer.clear();
    }
  }
  /**
   * Generate a new note
   */
  generateNewNote() {
    const instrumentRange = getNoteRange(this.currentInstrument);
    const rangeString = `${MusicTheory.midiToNoteName(instrumentRange.min).toLowerCase()}-${MusicTheory.midiToNoteName(instrumentRange.max).toLowerCase()}`;
    const noteData = MusicTheory.generateRandomNote(
      rangeString,
      this.settings.clef,
      true
      // naturals only
    );
    if (!noteData) {
      console.error("Failed to generate note for instrument:", this.currentInstrument);
      return;
    }
    this.currentNote = noteData;
    this.currentTargetMidi = noteData.midiNote;
    this.startTime = Date.now();
    if (this.settings.fallingNotesMode) {
      this.fallingNotesRenderer.addNote(
        noteData.midiNote,
        MusicTheory.midiToNoteName(noteData.midiNote)
      );
    } else {
      this.staffRenderer.renderNote(noteData.vexflowNote);
    }
  }
  /**
   * Handle note input from MIDI
   */
  handleMidiInput(midiNote) {
    if (this.currentTargetMidi === null || this.startTime === null) return;
    const validation = MusicTheory.validateNote(
      midiNote,
      this.currentTargetMidi,
      {
        allowOctaveError: this.settings.allowOctaveError
      }
    );
    const responseTime = Date.now() - this.startTime;
    this.responseTimes.push(responseTime);
    this.stats.attempts.push({
      targetNote: this.currentTargetMidi,
      playedNote: midiNote,
      correct: validation.isCorrect,
      responseTime,
      timestamp: Date.now()
    });
    if (validation.isCorrect) {
      this.handleCorrectNote(validation.message, responseTime);
    } else {
      this.handleIncorrectNote(validation.message);
    }
  }
  /**
   * Handle pitch input from microphone
   */
  handleMicrophoneInput(data) {
    if (this.currentTargetMidi === null || this.startTime === null) return;
    const toleranceCents = getPitchTolerance(this.currentInstrument);
    const validation = validatePitchWithCents(
      data.frequency,
      this.currentTargetMidi,
      toleranceCents
    );
    if (validation.isCorrect) {
      const responseTime = Date.now() - this.startTime;
      this.responseTimes.push(responseTime);
      this.stats.attempts.push({
        targetNote: this.currentTargetMidi,
        playedNote: data.midi,
        correct: true,
        responseTime,
        timestamp: Date.now()
      });
      const feedbackMessage = validation.centsOff !== void 0 && Math.abs(validation.centsOff) > 5 ? `\u2713 Correct! ${validation.message}` : "\u2713 Perfect pitch!";
      this.handleCorrectNote(feedbackMessage, responseTime);
    }
  }
  /**
   * Handle correct note
   * @param message - Feedback message
   * @param responseTime - Response time in ms
   */
  handleCorrectNote(message, responseTime) {
    this.stats.correct++;
    this.stats.streak++;
    if (this.stats.streak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.streak;
    }
    this.showFeedback(
      `\u2713 ${message} (${(responseTime / 1e3).toFixed(2)}s)`,
      "correct"
    );
    if (this.settings.fallingNotesMode) ; else {
      this.staffRenderer.showFeedback(true);
    }
    this.playFeedbackSound(true);
    this.updateUI();
    setTimeout(() => {
      if (this.isActive) {
        this.generateNewNote();
      }
    }, 1e3);
  }
  /**
   * Handle incorrect note
   * @param message - Feedback message
   */
  handleIncorrectNote(message) {
    this.stats.incorrect++;
    this.stats.streak = 0;
    this.showFeedback(`\u2717 ${message}`, "incorrect");
    if (this.settings.fallingNotesMode) ; else {
      this.staffRenderer.showFeedback(false);
    }
    this.playFeedbackSound(false);
    this.updateUI();
  }
  /**
   * Move to next note (manual)
   */
  nextNote() {
    if (this.isActive) {
      if (this.currentNote && this.startTime !== null) {
        this.stats.attempts.push({
          targetNote: this.currentNote.midiNote,
          playedNote: null,
          correct: false,
          skipped: true,
          responseTime: Date.now() - this.startTime,
          timestamp: Date.now()
        });
      }
      this.generateNewNote();
      this.showFeedback("Play the note shown above", "info");
    }
  }
  /**
   * Play reference tone for the current note
   */
  playReferenceTone() {
    if (this.currentTargetMidi === null) {
      this.showFeedback("Start practice session first to hear note references", "info");
      console.warn("No current note to play");
      return;
    }
    const wasListening = this.audioManager?.isCurrentlyListening() || false;
    if (wasListening && this.audioManager) {
      this.audioManager.stopListening();
    }
    const frequency = 440 * Math.pow(2, (this.currentTargetMidi - 69) / 12);
    this.toneGenerator.playTone(frequency, 1e3, 0.3);
    this.showFeedback("\u{1F50A} Playing reference tone...", "info");
    setTimeout(() => {
      if (wasListening && this.audioManager && this.isActive) {
        this.audioManager.startListening();
      }
      if (this.isActive) {
        const inputHint = requiresMicrophone(this.currentInstrument) ? "Play the note on your instrument" : "Play the note shown above";
        this.showFeedback(inputHint, "info");
      }
    }, 1200);
  }
  /**
   * Toggle between staff and falling notes rendering
   */
  toggleRenderMode() {
    const staffDisplay = document.getElementById("staffDisplay");
    const fallingDisplay = document.getElementById("fallingNotesDisplay");
    if (this.settings.fallingNotesMode) {
      if (staffDisplay) staffDisplay.classList.add("hidden");
      if (fallingDisplay) fallingDisplay.classList.remove("hidden");
      this.fallingNotesRenderer.showWelcome();
    } else {
      if (fallingDisplay) fallingDisplay.classList.add("hidden");
      if (staffDisplay) staffDisplay.classList.remove("hidden");
      this.staffRenderer.showWelcome();
    }
    if (this.isActive && this.currentNote) {
      this.generateNewNote();
    }
  }
  /**
   * Show feedback message
   * @param message - Message to display
   * @param type - 'correct', 'incorrect', or 'info'
   */
  showFeedback(message, type = "info") {
    if (this.ui.feedbackMessage) {
      this.ui.feedbackMessage.textContent = message;
      this.ui.feedbackMessage.className = "feedback-message";
      if (type === "correct") {
        this.ui.feedbackMessage.classList.add("correct");
      } else if (type === "incorrect") {
        this.ui.feedbackMessage.classList.add("incorrect");
      }
    }
  }
  /**
   * Update UI elements with current stats
   */
  updateUI() {
    if (this.ui.correctCount) {
      this.ui.correctCount.textContent = this.stats.correct.toString();
    }
    if (this.ui.incorrectCount) {
      this.ui.incorrectCount.textContent = this.stats.incorrect.toString();
    }
    if (this.ui.streakCount) {
      this.ui.streakCount.textContent = this.stats.streak.toString();
    }
    if (this.ui.avgTime && this.responseTimes.length > 0) {
      const avgTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
      this.ui.avgTime.textContent = (avgTime / 1e3).toFixed(2) + "s";
    }
  }
  /**
   * Reset session stats
   */
  resetStats() {
    this.stats = {
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      totalTime: 0,
      attempts: []
    };
    this.responseTimes = [];
    this.updateUI();
  }
  /**
   * Save session to storage
   */
  saveSession() {
    const sessionData = {
      module: "sightReading",
      correct: this.stats.correct,
      incorrect: this.stats.incorrect,
      bestStreak: this.stats.bestStreak,
      avgResponseTime: this.responseTimes.length > 0 ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 0,
      attempts: this.stats.attempts,
      settings: { ...this.settings }
    };
    Storage.saveSession(sessionData);
  }
  /**
   * Show session summary
   */
  showSessionSummary() {
    const total = this.stats.correct + this.stats.incorrect;
    const accuracy = total > 0 ? (this.stats.correct / total * 100).toFixed(1) : "0";
    const avgTime = this.responseTimes.length > 0 ? (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length / 1e3).toFixed(2) : "0";
    this.showFeedback(
      `Session Complete! Accuracy: ${accuracy}% | Avg Time: ${avgTime}s | Best Streak: ${this.stats.bestStreak}`,
      "info"
    );
  }
  /**
   * Play feedback sound
   * @param isCorrect - Whether the note was correct
   */
  playFeedbackSound(isCorrect) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = isCorrect ? 800 : 400;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
    }
  }
  /**
   * Get whether session is active
   */
  get active() {
    return this.isActive;
  }
};
if (typeof window !== "undefined") {
  window.SightReadingModule = SightReadingModule;
}

// js/app.ts
var MusicPracticeApp = class {
  constructor() {
    this.midiManager = null;
    this.audioManager = null;
    this.staffRenderer = null;
    this.fallingNotesRenderer = null;
    this.sightReadingModule = null;
    this.currentModule = "sightReading";
    this.currentInstrument = InstrumentType.PIANO;
    this.ui = {
      instrumentSelect: document.getElementById("instrumentSelect"),
      midiStatus: document.getElementById("midiStatus"),
      microphoneStatus: document.getElementById("microphoneStatus"),
      midiDeviceSelect: document.getElementById("midiDeviceSelect"),
      audioDeviceSelect: document.getElementById("audioDeviceSelect"),
      connectMidiBtn: document.getElementById("connectMidiBtn"),
      connectMicrophoneBtn: document.getElementById("connectMicrophoneBtn"),
      virtualKeyboardToggle: document.getElementById("virtualKeyboardToggle"),
      virtualKeyboard: document.getElementById("virtualKeyboard"),
      themeToggle: document.getElementById("themeToggle"),
      moduleButtons: document.querySelectorAll(".nav-btn")
    };
    this.init();
  }
  /**
   * Initialize the application
   */
  async init() {
    console.log("Initializing InstrumentPractice Pro...");
    this.loadSettings();
    await this.initInputMethods();
    this.initRenderers();
    this.initModules();
    this.setupEventListeners();
    this.showWelcome();
    console.log("InstrumentPractice Pro initialized successfully");
  }
  /**
   * Initialize input methods (MIDI and/or Microphone) based on instrument
   */
  async initInputMethods() {
    getInstrument(this.currentInstrument);
    if (requiresMIDI(this.currentInstrument)) {
      await this.initMidi();
    }
    if (requiresMicrophone(this.currentInstrument)) {
      await this.initAudio();
    }
    this.updateInputUIVisibility();
  }
  /**
   * Initialize MIDI manager
   */
  async initMidi() {
    this.midiManager = new MidiManager();
    this.midiManager.on("deviceChange", (data) => {
      this.handleMidiDeviceChange(data);
    });
    this.midiManager.on("error", (data) => {
      this.showError(data.message);
    });
    const success = await this.midiManager.init();
    if (success) {
      this.updateMidiStatus(true);
      this.updateDeviceList();
    } else {
      this.updateMidiStatus(false);
      this.showMidiWarning();
    }
  }
  /**
   * Initialize Audio manager (microphone)
   * Note: Does not automatically request permission - user must click "Connect Microphone"
   */
  async initAudio() {
    const instrument = getInstrument(this.currentInstrument);
    this.audioManager = new AudioManager({
      minClarity: instrument.validation.minClarity || 0.75,
      minFrequency: instrument.audio?.minFrequency || 70,
      maxFrequency: instrument.audio?.maxFrequency || 1600,
      bufferSize: instrument.audio?.bufferSize || 2048
    });
    this.audioManager.on("pitchDetected", (data) => {
      this.updatePitchDisplay(data);
    });
    this.audioManager.on("audioLevel", (data) => {
      this.updateAudioLevel(data.level);
    });
    this.audioManager.on("statusChange", (data) => {
      this.handleAudioStatusChange(data);
    });
    this.audioManager.on("error", (data) => {
      this.showError(data.message);
    });
    await this.updateAudioDeviceList();
    console.log("Audio Manager ready (waiting for user to connect microphone)");
  }
  /**
   * Initialize notation renderers
   */
  initRenderers() {
    this.staffRenderer = new StaffRenderer("staffDisplay");
    this.fallingNotesRenderer = new FallingNotesRenderer("fallingNotesDisplay");
  }
  /**
   * Initialize practice modules
   */
  initModules() {
    if (!this.staffRenderer || !this.fallingNotesRenderer) {
      console.error("Cannot initialize modules: renderers not ready");
      return;
    }
    this.sightReadingModule = new SightReadingModule(
      this.midiManager,
      this.staffRenderer,
      this.fallingNotesRenderer,
      this.audioManager,
      this.currentInstrument
    );
  }
  /**
   * Setup UI event listeners
   */
  setupEventListeners() {
    if (this.ui.instrumentSelect) {
      this.ui.instrumentSelect.addEventListener("change", async (e) => {
        const target = e.target;
        await this.switchInstrument(target.value);
      });
    }
    if (this.ui.themeToggle) {
      this.ui.themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }
    if (this.ui.connectMicrophoneBtn) {
      this.ui.connectMicrophoneBtn.addEventListener("click", async () => {
        if (this.ui.audioDeviceSelect) {
          this.ui.audioDeviceSelect.value = "";
        }
        await this.reconnectMicrophone();
      });
    }
    if (this.ui.audioDeviceSelect) {
      this.ui.audioDeviceSelect.addEventListener("change", async (e) => {
        const target = e.target;
        if (target.value && this.audioManager) {
          await this.reconnectMicrophone(target.value);
        }
      });
    }
    if (this.ui.midiDeviceSelect) {
      this.ui.midiDeviceSelect.addEventListener("change", (e) => {
        const target = e.target;
        if (target.value && this.midiManager) {
          this.midiManager.connectDevice(target.value);
        }
      });
    }
    if (this.ui.connectMidiBtn) {
      this.ui.connectMidiBtn.addEventListener("click", () => {
        this.reconnectMidi();
      });
    }
    if (this.ui.virtualKeyboardToggle) {
      this.ui.virtualKeyboardToggle.addEventListener("change", (e) => {
        const target = e.target;
        this.toggleVirtualKeyboard(target.checked);
      });
    }
    this.ui.moduleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const module = target.dataset.module;
        if (module) {
          this.switchModule(module);
        }
      });
    });
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcut(e);
    });
  }
  /**
   * Handle MIDI device connection changes
   */
  handleMidiDeviceChange(data) {
    console.log("MIDI device change:", data);
    if (data.connected && data.device) {
      this.updateMidiStatus(true, data.device.name || "Unknown Device");
    } else {
      this.updateMidiStatus(false);
    }
    this.updateDeviceList();
  }
  /**
   * Handle audio status changes (microphone)
   */
  handleAudioStatusChange(data) {
    console.log("Audio status change:", data);
    this.updateMicrophoneStatus(data.microphoneActive, data.listening);
  }
  /**
   * Update UI visibility based on selected instrument
   */
  updateInputUIVisibility() {
    const usesMidi = requiresMIDI(this.currentInstrument);
    const usesMic = requiresMicrophone(this.currentInstrument);
    const midiSection = document.getElementById("midiSection");
    if (midiSection) {
      midiSection.style.display = usesMidi ? "block" : "none";
    }
    const microphoneSection = document.getElementById("microphoneSection");
    if (microphoneSection) {
      microphoneSection.style.display = usesMic ? "block" : "none";
    }
  }
  /**
   * Update MIDI status indicator
   */
  updateMidiStatus(connected, deviceName = null) {
    if (!this.ui.midiStatus) return;
    const statusText = this.ui.midiStatus.querySelector(".status-text");
    if (connected) {
      this.ui.midiStatus.classList.add("connected");
      if (statusText) {
        statusText.textContent = deviceName || "MIDI Connected";
      }
    } else {
      this.ui.midiStatus.classList.remove("connected");
      if (statusText) {
        statusText.textContent = "No MIDI";
      }
    }
  }
  /**
   * Update microphone status indicator
   */
  updateMicrophoneStatus(active, listening = false) {
    if (!this.ui.microphoneStatus) return;
    const statusText = this.ui.microphoneStatus.querySelector(".status-text");
    if (active) {
      this.ui.microphoneStatus.classList.add("connected");
      if (statusText) {
        statusText.textContent = listening ? "Listening..." : "Microphone Ready";
      }
    } else {
      this.ui.microphoneStatus.classList.remove("connected");
      if (statusText) {
        statusText.textContent = "No Microphone";
      }
    }
  }
  /**
   * Update pitch display in UI
   */
  updatePitchDisplay(data) {
    const pitchValue = document.getElementById("detectedPitch");
    const pitchCents = document.getElementById("detectedCents");
    if (pitchValue) {
      pitchValue.textContent = data.noteName;
    }
    if (pitchCents) {
      const centsOff = Math.round(data.cents);
      const sign = centsOff >= 0 ? "+" : "";
      pitchCents.textContent = `${sign}${centsOff}\xA2`;
      if (Math.abs(centsOff) <= 5) {
        pitchCents.style.color = "#4caf50";
      } else if (Math.abs(centsOff) <= 20) {
        pitchCents.style.color = "#ff9800";
      } else {
        pitchCents.style.color = "#f44336";
      }
    }
  }
  /**
   * Update audio level bar
   */
  updateAudioLevel(level) {
    const levelBar = document.getElementById("audioLevelBar");
    if (levelBar) {
      const percentage = Math.min(100, level * 500);
      levelBar.style.width = `${percentage}%`;
      if (percentage < 10) {
        levelBar.style.backgroundColor = "#f44336";
      } else if (percentage < 30) {
        levelBar.style.backgroundColor = "#ff9800";
      } else {
        levelBar.style.backgroundColor = "#4caf50";
      }
    }
  }
  /**
   * Update MIDI device dropdown list
   */
  updateDeviceList() {
    if (!this.ui.midiDeviceSelect || !this.midiManager) return;
    const devices = this.midiManager.getInputDevices();
    this.ui.midiDeviceSelect.innerHTML = "";
    if (devices.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No device connected";
      this.ui.midiDeviceSelect.appendChild(option);
    } else {
      devices.forEach((device) => {
        const option = document.createElement("option");
        option.value = device.id;
        option.textContent = device.name;
        const connectedDevice = this.midiManager.getConnectedDevice();
        if (connectedDevice && connectedDevice.id === device.id) {
          option.selected = true;
        }
        this.ui.midiDeviceSelect.appendChild(option);
      });
    }
  }
  /**
   * Reconnect MIDI
   */
  async reconnectMidi() {
    if (!this.midiManager) return;
    await this.midiManager.init();
    this.updateDeviceList();
  }
  /**
   * Reconnect microphone
   * @param deviceId - Optional specific device ID to use
   */
  async reconnectMicrophone(deviceId) {
    if (!this.audioManager) {
      console.error("Audio manager not initialized");
      return;
    }
    this.audioManager.disconnect();
    console.log("Connecting to microphone:", deviceId || "default");
    const success = await this.audioManager.init(deviceId);
    if (success) {
      this.updateMicrophoneStatus(true);
      console.log("Microphone connected successfully");
      Storage.saveSettings({ audioDeviceId: deviceId || null });
      await this.updateAudioDeviceList();
    } else {
      this.updateMicrophoneStatus(false);
      this.showMicrophoneWarning();
    }
  }
  /**
   * Update audio device dropdown list
   */
  async updateAudioDeviceList() {
    if (!this.ui.audioDeviceSelect) return;
    try {
      const devices = await AudioManager.getAudioInputDevices();
      const settings = Storage.getSettings();
      const savedDeviceId = settings.audioDeviceId;
      this.ui.audioDeviceSelect.innerHTML = "";
      if (devices.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No microphones found";
        this.ui.audioDeviceSelect.appendChild(option);
      } else {
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select microphone...";
        this.ui.audioDeviceSelect.appendChild(defaultOption);
        devices.forEach((device) => {
          const option = document.createElement("option");
          option.value = device.deviceId;
          option.textContent = device.label || `Microphone ${device.deviceId.substring(0, 8)}`;
          if (this.audioManager) {
            const activeDevice = this.audioManager.getActiveDevice();
            if (activeDevice && activeDevice.deviceId === device.deviceId) {
              option.selected = true;
            }
          } else if (savedDeviceId && savedDeviceId === device.deviceId) {
            option.selected = true;
          }
          this.ui.audioDeviceSelect.appendChild(option);
        });
      }
      console.log("Audio device list updated:", devices.length, "devices found");
    } catch (error) {
      console.error("Failed to update audio device list:", error);
    }
  }
  /**
   * Switch instrument
   */
  async switchInstrument(instrumentId) {
    console.log("Switching to instrument:", instrumentId);
    if (this.sightReadingModule && this.sightReadingModule.active) {
      this.sightReadingModule.stopSession();
    }
    this.currentInstrument = instrumentId;
    if (this.midiManager) {
      this.midiManager.disconnectDevice();
    }
    if (this.audioManager) {
      this.audioManager.disconnect();
      this.audioManager = null;
    }
    await this.initInputMethods();
    this.initModules();
    Storage.saveSettings({ instrument: instrumentId });
    console.log("Switched to instrument:", instrumentId);
  }
  /**
   * Show MIDI warning
   */
  showMidiWarning() {
    console.warn("MIDI not available. Virtual keyboard or manual testing required.");
  }
  /**
   * Show microphone warning
   */
  showMicrophoneWarning() {
    console.warn("Microphone not available. Please check browser permissions.");
    this.showError("Microphone access denied. Please allow microphone access in your browser settings.");
  }
  /**
   * Show microphone connected message
   */
  showMicrophoneConnected() {
    console.log("Microphone connected and ready!");
  }
  /**
   * Toggle theme (light/dark)
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    const themeIcon = this.ui.themeToggle?.querySelector(".theme-icon");
    if (themeIcon) {
      themeIcon.textContent = newTheme === "dark" ? "\u2600\uFE0F" : "\u{1F319}";
    }
    Storage.saveSettings({ theme: newTheme });
  }
  /**
   * Toggle virtual keyboard
   * @param show - Whether to show keyboard
   */
  toggleVirtualKeyboard(show) {
    if (!this.ui.virtualKeyboard) return;
    if (show) {
      this.ui.virtualKeyboard.classList.remove("hidden");
      this.createVirtualKeyboard();
    } else {
      this.ui.virtualKeyboard.classList.add("hidden");
    }
    Storage.saveSettings({ virtualKeyboard: show });
  }
  /**
   * Create virtual keyboard
   */
  createVirtualKeyboard() {
    if (!this.ui.virtualKeyboard) return;
    const container = this.ui.virtualKeyboard.querySelector(".keyboard-container");
    if (!container || container.children.length > 0) return;
    const whiteKeys = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    const blackKeys = ["C#4", "D#4", null, "F#4", "G#4", "A#4", null];
    whiteKeys.forEach((note2, index4) => {
      const whiteKey = document.createElement("div");
      whiteKey.className = "key white";
      whiteKey.dataset.note = note2;
      const label = document.createElement("span");
      label.className = "key-label";
      label.textContent = note2;
      whiteKey.appendChild(label);
      whiteKey.addEventListener("mousedown", () => {
        this.playVirtualNote(note2);
        whiteKey.classList.add("active");
      });
      whiteKey.addEventListener("mouseup", () => {
        whiteKey.classList.remove("active");
      });
      container.appendChild(whiteKey);
      if (index4 < blackKeys.length && blackKeys[index4]) {
        const blackKeyNote = blackKeys[index4];
        const blackKey = document.createElement("div");
        blackKey.className = "key black";
        blackKey.dataset.note = blackKeyNote;
        blackKey.addEventListener("mousedown", () => {
          this.playVirtualNote(blackKeyNote);
          blackKey.classList.add("active");
        });
        blackKey.addEventListener("mouseup", () => {
          blackKey.classList.remove("active");
        });
        container.appendChild(blackKey);
      }
    });
  }
  /**
   * Play a virtual note (simulate MIDI input)
   * @param noteName - Note name (e.g., "C4")
   */
  playVirtualNote(noteName) {
    if (!this.midiManager) return;
    const midiNote = MusicTheory.noteNameToMidi(noteName);
    if (midiNote !== -1) {
      this.midiManager.simulateNote(midiNote);
    }
  }
  /**
   * Switch between modules
   * @param moduleName - Module to switch to
   */
  switchModule(moduleName) {
    this.ui.moduleButtons.forEach((btn) => {
      if (btn.dataset.module === moduleName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    const modules = document.querySelectorAll(".module");
    modules.forEach((module) => {
      if (module.id === `${moduleName}Module`) {
        module.classList.add("active");
      } else {
        module.classList.remove("active");
      }
    });
    this.currentModule = moduleName;
  }
  /**
   * Handle keyboard shortcuts
   * @param e - Keyboard event
   */
  handleKeyboardShortcut(e) {
    if (e.code === "Space") {
      e.preventDefault();
      if (this.currentModule === "sightReading" && this.sightReadingModule) {
        if (this.sightReadingModule.active) {
          this.sightReadingModule.nextNote();
        } else {
          this.sightReadingModule.startSession();
        }
      }
    }
    if (e.code === "Escape") {
      if (this.currentModule === "sightReading" && this.sightReadingModule && this.sightReadingModule.active) {
        this.sightReadingModule.stopSession();
      }
    }
  }
  /**
   * Show welcome screen
   */
  showWelcome() {
    if (this.staffRenderer) {
      this.staffRenderer.showWelcome();
    }
  }
  /**
   * Show error message
   * @param message - Error message
   */
  showError(message) {
    console.error(message);
  }
  /**
   * Load saved settings
   */
  loadSettings() {
    const settings = Storage.getSettings();
    if (settings.instrument) {
      this.currentInstrument = settings.instrument;
      if (this.ui.instrumentSelect) {
        this.ui.instrumentSelect.value = this.currentInstrument;
      }
    }
    if (settings.theme) {
      document.documentElement.setAttribute("data-theme", settings.theme);
      const themeIcon = this.ui.themeToggle?.querySelector(".theme-icon");
      if (themeIcon) {
        themeIcon.textContent = settings.theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}";
      }
    }
    if (settings.virtualKeyboard && this.ui.virtualKeyboardToggle) {
      this.ui.virtualKeyboardToggle.checked = true;
      this.toggleVirtualKeyboard(true);
    }
    if (settings.audioDeviceId && requiresMicrophone(this.currentInstrument) && this.audioManager) {
      setTimeout(() => {
        this.reconnectMicrophone(settings.audioDeviceId || void 0);
      }, 500);
    }
  }
};
document.addEventListener("DOMContentLoaded", () => {
  window.app = new MusicPracticeApp();
});

export { MusicPracticeApp };
//# sourceMappingURL=app.js.map
//# sourceMappingURL=app.js.map