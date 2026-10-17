import type { ClockPort } from '@hex/domain';

export class SystemClock implements ClockPort {
  now(): Date {
    return new Date();
  }
}
