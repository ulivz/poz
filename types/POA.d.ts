// Type definitions for POA 1.0
// Definitions by: ulivz https://www.github.com/ulivz

/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/vinyl/index.d.ts" />
/////// <reference path="../node_modules/@types/inquirer/index.d.ts" />

import inquirer = require('inquirer');

export class POAContext<T> {
  set(key: string, val: T): POAContext

  assign(key: { key: string, value: T }): POAContext

  get(key: string): T
}

interface POAEventEmitterConstructor {
  new(): POAEventEmitter;
  prototype: POAEventEmitter;
}

export class POAEventEmitter extends NodeJS.EventEmitter {
  renderSuccess(file: File): void

  renderFailure(error: Error, file: File): void

  printTree(): Promise<void>

  transformIgnore(file: File): void

  initLifeCycle(): void
}

type POARenderFunction = (template: string, context: { key: string, value: any }) => string
type POAPresetsIgnore = { key: string, value: string } | string | string[]

/**
 * POA Environment
 */
export class POAENV {
  constructor()

  POA_TEMPLATE_DIRECTORY_NAME: string
  POA_PACKAGE_INDEX_FILE_NAME: string

  POA_RENDER_ENGINE: POARenderFunction

  get POA_ENV(): string | null

  get isTest(): boolean

  get isDebug(): boolean

  get isDev(): boolean

  get isProduction(): boolean
}

/**
 * POA Presets
 */
interface POAPresets {
  reproduce?: {
    target?: string;
    ignore?: POAPresetsIgnore;
    rename?: { key: string, value: string };
  },
  transform?: {
    engine?: POARenderFunction;
    ignore?: POAPresetsIgnore;
  }
}

/**
 * POA Main
 */
export class POA extends POAEventEmitter {
  env: POAENV
  presets: POAPresets
  context: POAContext
  cwd: string
  POAPackageDirectory: string
  POATemplateDirectory: string

  initContext(POAPackageDirectory: string): void

  set(key: { key: string, value: any }): void
  set(key: string, value: string): void

  parsePresets(presets: POAPresets): void

  run(): Promise<void>

}

/**
 * POA config
 */
export interface POAConfig {
  prompts(): inquirer.Question;
  presets?(): POAPresets
  onStart?(): void
  onPromptStart?(): void
  onPromptEnd?(): void
  onReproduceStart?(): void
  onReproduceEnd?(): void
  onExit?(): void
}

/**
 * POA config construct function
 */
export function POAConfigFunction(context: POAContext, POA: POA): POAConfig
