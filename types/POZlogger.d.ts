// Type definitions for POZLogger
// Definitions by: ulivz https://www.github.com/ulivz

import chalk from '../node_modules/chalk/types/index.d.ts'

// ***************************************************
// POZ Error
// ***************************************************
interface POZLogger<T> extends chalk {
  echo(...args: any[]): void;

  // Common style
  // need to wrapped by 'console.log'
  errorItemStyle(message: string): string;
  packageNameStyle(message: string): string;
  redSnowStyle(message: string): string;
  whiteSnowStyle(message: string): string;
  boldYellow(message: string): string;
  boldGreen(message: string): string;
  boldRed(message: string): string;
  boldMagenta(message: string): string;
  successStyle(message: string): string;
  warnStyle(message: string): string;
  errorStyle(message: string): string;
  infoStyle(message: string): string;
  debugStyle(message: string): string;

  // Style for prompt message,
  // need to wrapped by 'console.log'
  promptsLogger: {
    successStyle(message: string): string;
    warnStyle(message: string): string;
    errorStyle(message: string): string;
    infoStyle(message: string): string;
  }

  // Can used without wrapped by 'console.log'
  wrap(message: string): void;
  success(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  redSnow(message: string): void;
  snow(message: string): void;
  debug(message: string): void;

  // A text-table extended table logger
  table(data: { [key: string]: string }): void;
  table(data: Array<string[]>): void;
}

/**
 * A method allow to define '%s' in your error message metadata
 * error config refer to 'src/error/config_error.json'
 */
interface getError {
  (type: string, key: string, ...args: string[]): POZLogger
}

interface getPackageValidateError {
  (key: string, ...args: string[]): POZLogger
}
