// Type definitions for POA 1.0
// Definitions by: ulivz https://www.github.com/ulivz

/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/vinyl/index.d.ts" />
/// <reference path="../node_modules/@types/inquirer/index.d.ts" />

import inquirer = require('inquirer');

/**
 * POA Context
 */
interface POAContextConstructor {
  new(): POAContext;
  prototype: POAContext;
}

interface POAContext<T> {
  set(key: string, val: T): POAContext
  assign(key: { key: string, value: T }): POAContext
  get(key: string): T
}

/**
 * POA EventEmitter
 */
interface POAEventEmitterConstructor {
  new(): POAEventEmitter;
  prototype: POAEventEmitter;
}

interface POAEventEmitter extends NodeJS.EventEmitter {
  printTree(): Promise<void>
  initLifeCycle(): void
  renderSuccess(file: File): void
  renderFailure(error: Error, file: File): void
  transformIgnore(file: File): void
}

type POADestConfigIgnoreFunction = () => boolean
type POARenderFunction = (template: string, context: { key: string, value: any }) => string
type POADestConfigIgnore = { key: string, value: boolean | POADestConfigIgnoreFunction } | string | string[]

/**
 * POA Environment
 */
export interface POAENVConstructor {
  new(): POAENV;
  prototype: POAENV;
}

export interface POAENV {
  POA_TEMPLATE_DIRECTORY_NAME: string
  POA_PACKAGE_INDEX_FILE_NAME: string
  POA_RENDER_ENGINE: POARenderFunction
  POA_ENV: string | null
  isTest: boolean
  isDebug: boolean
  isDev: boolean
  isProduction: boolean
}

/**
 * POA Dest Options
 */
export interface POADestConfig {
  dest?: string;
  ignore?: POADestConfigIgnore | null;
  render?: POARenderFunction;
  rename?: { key: string, value: string } | null;
}

/**
 * POA Main
 */
export interface POAConstructor {
  new(): POA;
  prototype: POA;
}

export interface POA extends POAEventEmitter {
  env: POAENV
  destConfig: POADestConfig
  context: POAContext
  cwd: string
  POAPackageDirectory: string
  POATemplateDirectory: string
  initContext(POAPackageDirectory: string): void
  set(key: { key: string, value: any }): void
  set(key: string, value: string): void
  parsePresets(presets: POADestConfig): void
  run(): Promise<void>
}

/**
 * POA config
 */
type POADestConfigFunction = () => POADestConfig;
export interface POAConfig {
  // Base Config
  prompts(): inquirer.Question;
  dest?: string | POADestConfig | POADestConfigFunction;
  // Life Cycle
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
