/// <reference types="node" />

export * from 'fs';

export function exists(path: string): boolean;

export function isFile(path: string): null | boolean;

export function isDirectory(path: string): null | boolean;

export function isDirEmpty(path: string): boolean;
