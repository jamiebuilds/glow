// @flow
import spawn from 'spawndamnit';
import { Env } from '../Env';
import findUp from 'find-up';
import * as path from 'path';
import { type FlowStatus } from '../types';

async function flow(env: Env, args: Array<string>) {
  return await spawn(env.flowBinPath, args, { cwd: env.flowRootDir });
}

async function getStdout(env: Env, args: Array<string>) {
  let stdout;
  try {
    let res = await flow(env, args);
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

async function getJSON(env: Env, args: Array<string>) {
  let stdout = await getStdout(env, [...args, '--json']);
  return JSON.parse(stdout);
}

export async function getFlowConfigPath(cwd: string) {
  return await findUp('.flowconfig', { cwd });
}

export function getFlowRootDir(flowConfigPath: string) {
  return path.dirname(flowConfigPath);
}

export function getFlowBinPath(flowRootDir: string) {
  return path.join(flowRootDir, 'node_modules', '.bin', 'flow');
}

export async function version(env: Env): Promise<string> {
  let res = await getJSON(env, ['version']);
  return res.semver;
}

export async function status(env: Env): Promise<FlowStatus> {
  return await getJSON(env, ['status']);
}
