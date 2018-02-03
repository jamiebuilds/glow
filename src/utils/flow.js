// @flow
import spawn from 'spawndamnit';
import { Env } from '../Env';
import findUp from 'find-up';
import * as path from 'path';
import type { FlowStatus, FlowConfig } from '../types';
import { Lang } from '../Lang';

async function flow(path: string, cwd: string, args: Array<string>) {
  return await spawn(path, args, { cwd });
}

async function getStdout(path: string, rootDir: string, args: Array<string>) {
  let stdout;
  try {
    let res = await flow(path, rootDir, args);
    stdout = res.stdout;
  } catch (err) {
    if (err instanceof spawn.ChildProcessError) {
      stdout = err.stdout;
    } else {
      throw err;
    }
  }
  return stdout.toString();
}

async function getJSON(path: string, rootDir: string, args: Array<string>) {
  let stdout = await getStdout(path, rootDir, [...args, '--json']);
  return JSON.parse(stdout);
}

export async function getFlowConfigPath(cwd: string) {
  return await findUp('.flowconfig', { cwd });
}

export function getFlowRootDir(flowConfigPath: string) {
  return path.dirname(flowConfigPath);
}

export function getPossibleFlowBinPaths(flowRootDir: string): Array<string> {
  return [path.join(flowRootDir, 'node_modules', '.bin', 'flow'), 'flow'];
}

export async function getFlowConfig(flowRootDir: string): Promise<?FlowConfig> {
  for (const path of getPossibleFlowBinPaths(flowRootDir)) {
    try {
      return await getJSON(path, flowRootDir, ['version']);
    } catch (e) {}
  }
  return null;
}

export async function status(env: Env): Promise<FlowStatus> {
  return await getJSON(env.flowBinPath, env.flowRootDir, ['status']);
}
