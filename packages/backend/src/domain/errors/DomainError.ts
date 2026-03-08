export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class InvalidValueError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_VALUE');
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, 'NOT_FOUND');
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Invalid status transition from '${from}' to '${to}'`, 'INVALID_STATUS_TRANSITION');
  }
}
