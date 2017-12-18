// Type definitions for POZ 1.0
// Definitions by: ulivz https://www.github.com/ulivz

import inquirer from '../node_modules/@types/inquirer/index.d.ts';
import {EventEmitter} from "events"
import {POZUtils} from "./POZUtils";
import VinylFile from 'vinyl'
import {POZPackageManager, POZPackageConstructor} from "./POZPackageManager";

// ***************************************************
// POZ Main
// ***************************************************
export interface POZConstructor {
  new(): POZ;
  prototype: POZ;
  PackageManager: POZPackageManager;
  POZPackage: POZPackageConstructor;
}

export interface POZ extends EventEmitter {
  // A POZ environment singleton object
  // Used to store the current operating environment-related information, as well as some POZ presets
  env: POZENV;
  // Value of process.cwd()
  // Attention: it's not a getter, running process.chdir() will not change its value
  cwd: string;
  // The core object that a POZ package can access, will be passed in as first parameter to config function in 'poz.js'
  // store some of the current environment information,
  // as well as the ansower gotten by running prompts
  context: POZContext;
  // Exposed utils
  utils: POZUtils;
  destConfig: POZDestConfig;
  POZPackageDirectory: string;
  POZTemplateDirectory: string;
  POZPackageConfig: POZConfig;
  POZDestDirectoryTree: POZDirectory;
  POZTemplateDirectoryTree: POZDirectory;
  initContext(POZPackageDirectory: string): void;
  initLifeCycle(): void;
  set(key: { [key: string]: any }): void;
  set(key: string, value: string): void;
  handleRenderSuccess(file: VinylFile): void;
  handleRenderFailure(error: Error, file: VinylFile): void
  printTree(): void;
  prompt(): void;
  handlePromptsAnswers(answers: { [key: string]: string }): void;
  setupDestConfig(): void;
  dest(): void;
  start(): Promise<void>;
}


// ***************************************************
// POZ Context
// ***************************************************
interface POZContextConstructor {
  new(): POZContext;
  prototype: POZContext;
}

interface POZContext<T> {
  set(key: string, val: T): POZContext;
  assign(key: { key: string, value: T }): POZContext;
  get(key: string): T;
  $cwd: string;
  $env: POZENV;
  $dirname: string;
  $gituser: string;
  $gitemail: string;
  $POZPackageDirectory: string;
  $POZTemplateDirectory: string;
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
  POZ_TEMPLATE_DIRECTORY_NAME: string;
  POZ_PACKAGE_INDEX_FILE_NAME: string;
  POZ_RENDER_ENGINE: POZRenderFunction;
  POZ_LIFE_CYCLE: string[];
  POZ_ENV: string | null;
  isTest: boolean;
  isDebug: boolean;
  isDev: boolean;
  isProduction: boolean;
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
// POZ config
// ***************************************************
type POZDestConfigFunction = () => POZDestConfig;
export interface POZConfig {
  // Base Config
  prompts(): inquirer.Question;
  dest?: string | POZDestConfig | POZDestConfigFunction | boolean;
  // Life Cycle
  onStart?(): void;
  onPromptStart?(): void;
  onPromptEnd?(): void;
  onReproduceStart?(): void;
  onReproduceEnd?(): void;
  onExit?(): void;
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
