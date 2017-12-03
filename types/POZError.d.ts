// Type definitions for POZError
// Definitions by: ulivz https://www.github.com/ulivz

// ***************************************************
// POZ Error
// ***************************************************
interface POZErrorConstructor {
  new(message: string, code: string): POZError;
  prototype: POZError;
}

export interface POZError {
  message: string;
  // 'code' should be named like a constant
  code: string;
  name: 'POZError';
}

/**
 * A method allow to define '%s' in your error message metadata
 * error config refer to 'src/error/config_error.json'
 */
export interface getError {
  (type: string, key: string, ...args: string[]): POZError
}

export interface getPackageValidateError {
  (key: string, ...args: string[]): POZError
}
