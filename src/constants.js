// @flow
import readPkgUp from 'read-pkg-up';

export const GLOW_PKG_JSON = readPkgUp.sync({
  cwd: __dirname,
  normalize: false
}).pkg;

export const GLOW_VERSION: string = GLOW_PKG_JSON.version;

export const STDOUT_WIDTH: number =
  process.stdout && typeof process.stdout.columns === 'number'
    ? process.stdout.columns
    : 80;

export const STDOUT_HEIGHT: number =
  process.stdout && typeof process.stdout.rows === 'number'
    ? process.stdout.rows
    : 100;

export const LOG_LEVELS = {
  output: 0,
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};
