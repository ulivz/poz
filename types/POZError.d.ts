// Type definitions for POZError
// Definitions by: ulivz https://www.github.com/ulivz

/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/fs-extra/index.d.ts" />
/// <reference path="../node_modules/@types/vinyl/index.d.ts" />
/// <reference path="../node_modules/@types/inquirer/index.d.ts" />

// ***************************************************
// POZ Error
// ***************************************************
interface POZErrorConstructor {
  new(message: string, code: string): POZError;
  prototype: POZError;
}

interface POZError<T> {
  message: string;
  // 'code' should be named like a constant
  code: string;
  name: 'POZError';
}

/**
 * A method allow to define '%s' in your error message metadata
 * error config refer to 'src/error/config_error.json'
 */
interface getError {
  (type: string, key: string, ...args: string[]): POZError
}

interface getPackageValidateError {
  (key: string, ...args: string[]): POZError
}
