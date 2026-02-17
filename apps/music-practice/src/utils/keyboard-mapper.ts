export const mapScaleDegreesToKeys = (
  startNote: number,
  scalePattern: number[]
): number[] => {
  return scalePattern.map(degree => startNote + degree)
}

export const mapChordToKeys = (
  rootNote: number,
  chordIntervals: number[]
): number[] => {
  return chordIntervals.map(interval => rootNote + interval)
}

export const noteToKeyIndex = (note: number): number => {
  // A0 = 0, C1 = 3, etc.
  return Math.max(0, Math.min(87, note))
}
