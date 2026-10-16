import type { ClockPort } from '@hex/domain';
export declare class FixedClock implements ClockPort {
    private current;
    constructor(current: Date);
    now(): Date;
    advance(ms: number): void;
}
//# sourceMappingURL=fixed-clock.adapter.d.ts.map