// Type definitions for POZLogger
// Definitions by: ulivz https://www.github.com/ulivz

import chalk from '../node_modules/chalk/types/index.d.ts'

// ***************************************************
// POZ Error
// ***************************************************
export interface POZLogger<T> extends chalk {
  echo(...args: T[]): void;

  // Common style
  // need to wrapped by 'console.log'
  errorItemStyle(message: T): string;
  packageNameStyle(message: T): string;
  redSnowStyle(message: T): string;
  whiteSnowStyle(message: T): string;
  boldYellow(message: T): string;
  boldGreen(message: T): string;
  boldRed(message: T): string;
  boldMagenta(message: T): string;
  successStyle(message: T): string;
  warnStyle(message: T): string;
  errorStyle(message: T): string;
  infoStyle(message: T): string;
  debugStyle(message: T): string;

  // Style for prompt message,
  // need to wrapped by 'console.log'
  promptsLogger: {
    successStyle(message: T): string;
    warnStyle(message: T): string;
    errorStyle(message: T): string;
    infoStyle(message: T): string;
  }

  // Can used without wrapped by 'console.log'
  wrap(message: T): void;
  success(message: T): void;
  error(message: T): void;
  warn(message: T): void;
  info(message: T): void;
  redSnow(message: T): void;
  snow(message: T): void;
  debug(message: T): void;

  // A text-table extended table logger
  table(data: { [key: string]: T }): void;
  table(data: Array<T[]>): void;
}
