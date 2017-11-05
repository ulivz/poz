import {exec} from './child_process'

export function npmInstall() {
  return exec('npm install')
}

export function yarnInstall() {
  return exec('yarn install')
}
