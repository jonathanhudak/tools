"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  AbcNotation: () => AbcNotation,
  Array: () => Array,
  Chord: () => Chord,
  ChordDictionary: () => ChordDictionary,
  ChordType: () => ChordType,
  Collection: () => Collection,
  Core: () => Core,
  DurationValue: () => DurationValue,
  Interval: () => Interval,
  Key: () => Key,
  Midi: () => Midi,
  Mode: () => Mode,
  Note: () => Note,
  PcSet: () => PcSet,
  Pcset: () => Pcset,
  Progression: () => Progression,
  Range: () => Range,
  RhythmPattern: () => RhythmPattern,
  RomanNumeral: () => RomanNumeral,
  Scale: () => Scale,
  ScaleDictionary: () => ScaleDictionary,
  ScaleType: () => ScaleType,
  TimeSignature: () => TimeSignature,
  Tonal: () => Tonal,
  VoiceLeading: () => VoiceLeading,
  Voicing: () => Voicing,
  VoicingDictionary: () => VoicingDictionary
});
module.exports = __toCommonJS(index_exports);
var AbcNotation = __toESM(require("@tonaljs/abc-notation"));
var Array = __toESM(require("@tonaljs/array"));
var Chord = __toESM(require("@tonaljs/chord"));
var ChordType = __toESM(require("@tonaljs/chord-type"));
var Collection = __toESM(require("@tonaljs/collection"));
var DurationValue = __toESM(require("@tonaljs/duration-value"));
var Interval = __toESM(require("@tonaljs/interval"));
var Key = __toESM(require("@tonaljs/key"));
var Midi = __toESM(require("@tonaljs/midi"));
var Mode = __toESM(require("@tonaljs/mode"));
var Note = __toESM(require("@tonaljs/note"));
var Pcset = __toESM(require("@tonaljs/pcset"));
var Progression = __toESM(require("@tonaljs/progression"));
var Range = __toESM(require("@tonaljs/range"));
var RhythmPattern = __toESM(require("@tonaljs/rhythm-pattern"));
var RomanNumeral = __toESM(require("@tonaljs/roman-numeral"));
var Scale = __toESM(require("@tonaljs/scale"));
var ScaleType = __toESM(require("@tonaljs/scale-type"));
var TimeSignature = __toESM(require("@tonaljs/time-signature"));
var VoiceLeading = __toESM(require("@tonaljs/voice-leading"));
var Voicing = __toESM(require("@tonaljs/voicing"));
var VoicingDictionary = __toESM(require("@tonaljs/voicing-dictionary"));
__reExport(index_exports, require("@tonaljs/core"), module.exports);
var Core = __toESM(require("@tonaljs/core"));
var Tonal = Core;
var PcSet = Pcset;
var ChordDictionary = ChordType;
var ScaleDictionary = ScaleType;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbcNotation,
  Array,
  Chord,
  ChordDictionary,
  ChordType,
  Collection,
  Core,
  DurationValue,
  Interval,
  Key,
  Midi,
  Mode,
  Note,
  PcSet,
  Pcset,
  Progression,
  Range,
  RhythmPattern,
  RomanNumeral,
  Scale,
  ScaleDictionary,
  ScaleType,
  TimeSignature,
  Tonal,
  VoiceLeading,
  Voicing,
  VoicingDictionary,
  ...require("@tonaljs/core")
});
//# sourceMappingURL=index.js.map