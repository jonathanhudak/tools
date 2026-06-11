// VexFlow type declarations.
// VexFlow 4 is loaded from a CDN <script> tag and ships no usable types for
// that global; this alias is the single sanctioned `any` for that boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VexFlowAPI = any;
declare const Vex: VexFlowAPI;
declare module 'vexflow' {
  export = Vex;
}
