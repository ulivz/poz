/// <reference types="node" />

export * from 'fs';

export function isFile(path: string): null | boolean;

export function isDirectory(path: string): null | boolean;

export function isDirEmpty(path: string): boolean;

export function unlinkSync(path: string): boolean;

export function getFileTree(dirname: string, depth: number): Promise<string[]>;

export interface FileTreeObject {
  baseDir: string;
  nodes: FileTreeNode[]
}

export class FileTreeNode {
  fullPath: string;
  baseDir: string;
  path: string;
  label: string;
  isFile: boolean;
  isDirectory: boolean;
  content: string | FileTreeNode[];
  nodes?: FileTreeNode[];
}
