// Type definitions for POZPackageManager 1.0
// Definitions by: ulivz https://www.github.com/ulivz

/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/fs-extra/index.d.ts" />
/// <reference path="../node_modules/@types/vinyl/index.d.ts" />
/// <reference path="../node_modules/@types/inquirer/index.d.ts" />

// ***************************************************
// POZ Package Manager
// ***************************************************
import {POZENV} from "./POZ";

interface POZPackageManageConstructorr {
  new(): POZPackageManager;
  prototype: POZPackageManager;
}

interface POZPackageManager {
  env: POZENV;
  // cache directory
  cacheDir: string;
  // cache config
  cachePackages: POZCacheConfig;


  rootDir: string;
  pmConfigPath: string;
  pmPkgResourcesDir: string;
  userPmConfigPath: string;
  pmConfig: POZCacheConfig;
  initEnv(): Promise<void>;
  getPkgs(): Promise<POZPackage[]>;
  parsePkgName(pkgName: string): void;
  savePkg(pkgName: string): Promise<void>;
  removePkg(pkgName: string): Promise<void>;
  update(pkgName: string): Promise<void>;
  checkUpdate(): Promise<POZPackageUpdateInfo[] | null>;
}

interface POZCacheConfig {
  __VERSION__: string;
  pkgMap: { [key: string]: POZPackage }
}

interface POZPackage {
  requestName: string;
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
