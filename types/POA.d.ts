// Type definitions for POA 1.0
// Definitions by: ulivz https://www.github.com/ulivz

/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/vinyl/index.d.ts" />

namespace POA {

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

  /**
   * POA Environment
   */
  export class POAENV {
    constructor()

    POA_TEMPLATE_DIRECTORY_NAME: string
    POA_PACKAGE_INDEX_FILE_NAME: string

    POA_RENDER_ENGINE(template: string, context: { key: string, value: any }): string

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
    reproduce: {
      target: string;
      ignore: { key: string, value: string } | string | string[]
      rename: { key: string, value: string }
    }
  }

  /**
   * POA Main
   */
  export class POA extends POAEventEmitter {
    env: POAENV
    presets: POAPresets
    context: POAContext

    initContext(POAPackageDirectory: string): void

    set(key: { key: string, value: any }): void
    set(key: string, value: string): void

    parsePresets(presets: POAPresets): void

    run(): Promise<void>

  }

  export function POAConfig(context: POAContext,)
}
