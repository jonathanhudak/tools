/** Time comes through a port so the core stays deterministic and testable. */
export interface ClockPort {
  now(): Date;
}
