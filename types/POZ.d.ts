// Type definitions for POZ 1.0
// Definitions by: ulivz https://www.github.com/ulivz

/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/fs-extra/index.d.ts" />
/// <reference path="../node_modules/@types/vinyl/index.d.ts" />
/// <reference path="../node_modules/@types/inquirer/index.d.ts" />

import inquirer = require('inquirer');

// ***************************************************
// POZ Context
// ***************************************************
interface POZContextConstructor {
  new(): POZContext;
  prototype: POZContext;
}

interface POZContext<T> {
  set(key: string, val: T): POZContext
  assign(key: { key: string, value: T }): POZContext
  get(key: string): T
}

// ***************************************************
// POZ EventEmitter
// ***************************************************
interface POZEventEmitterConstructor {
  new(): POZEventEmitter;
  prototype: POZEventEmitter;
}

interface POZEventEmitter extends NodeJS.EventEmitter {
  printTree(): Promise<void>
  initLifeCycle(): void
  renderSuccess(file: File): void
  renderFailure(error: Error, file: File): void
  transformIgnore(file: File): void
}

type POZDestConfigIgnoreFunction = () => boolean
type POZRenderFunction = (template: string, context: { key: string, value: any }) => string
type POZDestConfigIgnore = { key: string, value: boolean | POZDestConfigIgnoreFunction } | string | string[]


// ***************************************************
// POZ Environment
// ***************************************************
export interface POZENVConstructor {
  new(): POZENV;
  prototype: POZENV;
}

export interface POZENV {
  POZ_TEMPLATE_DIRECTORY_NAME: string
  POZ_PACKAGE_INDEX_FILE_NAME: string
  POZ_RENDER_ENGINE: POZRenderFunction
  POZ_ENV: string | null
  isTest: boolean
  isDebug: boolean
  isDev: boolean
  isProduction: boolean
}


// ***************************************************
// POZ Dest Options
// ***************************************************
export interface POZDestConfig {
  dest?: string;
  ignore?: POZDestConfigIgnore | null;
  render?: POZRenderFunction;
  rename?: { key: string, value: string } | null;
}


// ***************************************************
// POZ Main
// ***************************************************
export interface POZConstructor {
  new(): POZ;
  prototype: POZ;
}

export interface POZ extends POZEventEmitter {
  env: POZENV;
  cwd: string;
  context: POZContext;
  destConfig: POZDestConfig;
  POZPackageDirectory: string;
  POZTemplateDirectory: string;
  POZPackageConfig: POZConfig;
  POZDestDirectoryTree: POZDirectory;
  POZTemplateDirectoryTree: POZDirectory;
  initContext(POZPackageDirectory: string): void;
  set(key: { key: string, value: any }): void;
  set(key: string, value: string): void;
  parsePresets(presets: POZDestConfig): void;
  run(): Promise<void>;
}


// ***************************************************
//
// ***************************************************
interface POZPackageManageConstructorr {
  new(): POZPackageManager;
  prototype: POZPackageManager;
}

interface POZPackageManager {
  // root working directory
  rootDir: string;
  pmConfigPath: string;
  pmPkgResourcesDir: string;
  userPmConfigPath: string;
  pmConfig: POZPmConfig;
  initEnv(): Promise<void>;
  getPkgs(): Promise<POZPackage[]>;
  parsePkgName(pkgName: string): void;
  savePkg(pkgName: string): Promise<void>;
  removePkg(pkgName: string): Promise<void>;
  update(pkgName: string): Promise<void>;
  checkUpdate(): Promise<POZPackageUpdateInfo[] | null>;
}

interface POZPmConfig {
  __VERSION__: string;
  pkgMap: { [key: string]: POZPackage }
}

interface POZPackage {
  downloadURL: string;
  // POZ package full path
  path: string;
  // package.json
  pkg?: {
    author: string;
    name: string;
    version: string;
    description: string;
  }
}

interface POZPackageUpdateInfo {
  downloadURL: string;
  currentVersion: string;
  newVersion: string;
}


// ***************************************************
// POZ config
// ***************************************************
type POZDestConfigFunction = () => POZDestConfig;
export interface POZConfig {
  // Base Config
  prompts(): inquirer.Question;
  dest?: string | POZDestConfig | POZDestConfigFunction;
  // Life Cycle
  onStart?(): void
  onPromptStart?(): void
  onPromptEnd?(): void
  onReproduceStart?(): void
  onReproduceEnd?(): void
  onExit?(): void
}


// ***************************************************
// POZ config construct function
// ***************************************************
export function POZConfigFunction(context: POZContext, POZ: POZ): POZConfig


// ***************************************************
// POZ File System
// ***************************************************

interface POZFileTreeNodeConstructor {
  new(): POZFileTreeNode
  prototype: POZFileTreeNode
}

interface POZFileTreeNode {
  path: string;
  cwd: string;
  relative: string;
  label: string;
  basename: string;
  stem: string;
  extname: string;
}

interface POZFileConstructor {
  new(): POZFile;
  prototype: POZFile;
}

interface POZFileContentsTransformer {
  (file: File): void;
}

interface POZFile extends POZFileTreeNode {
  isFile: boolean;
  contents: string;
  dest(target: string, transformer: POZFileContentsTransformer): NodeJS.WritableStream;
}

interface POZDirectoryConstructor {
  new(): POZFileTreeNode;
  prototype: POZFileTreeNode;
}

interface POZDirectory extends POZFileTreeNode {
  isDirectory: boolean;
  nodes: Array<POZDirectory | POZFile>;
  childNodes: Array<POZDirectory | POZFile>;
  // A flag used to record whether this node's children has been get from calling 'traverse'
  isTraversed: boolean;
  // Traverse
  traverse(): Promise<void>;
  recursiveTraverse(): Promise<void>;
  // Util
  children(): Array<POZDirectory | POZFile>;
  siblings(): Array<POZDirectory | POZFile>;
  // Find
  findByPath(path: string): POZDirectory | POZFile;
  findByRelative(relative: string): POZDirectory | POZFile;
  findByBasename(nodeName: string): POZDirectory | POZFile;
}
