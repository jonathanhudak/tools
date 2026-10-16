export type DomainErrorCode = 'INVALID_NODE_ID' | 'UNSUPPORTED_NODE_TYPE' | 'INVALID_NAME' | 'INVALID_FILE_KEY';

export interface DomainError {
  readonly code: DomainErrorCode;
  readonly message: string;
}

export const domainError = (code: DomainErrorCode, message: string): DomainError => ({ code, message });
