// CANARY: a port declared outside packages/domain/src/ports.
export interface MisplacedPort {
  ping(): Promise<void>;
}
