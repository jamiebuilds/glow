// @flow
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import promisify from 'util.promisify';

const readFile = promisify(fs.readFile);

export type Watcher = fs.FSWatcher;

export function watchDirectory(dirName: string) {
  return chokidar.watch(dirName, {
    recursive: true,
    encoding: 'utf8',
    persistent: true
  });
}

export async function readFileWithCache(
  fileCache: Map<string, string>,
  filePath: string
) {
  let fileContents = fileCache.get(filePath);
  if (!fileContents) {
    fileContents = await readFile(filePath, 'utf8');
    fileCache.set(filePath, fileContents);
  }
  return fileContents;
}
