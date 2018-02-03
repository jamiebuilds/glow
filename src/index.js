// @flow
import { type GlowOptions } from './types';
import { Env } from './Env';
import { Runner } from './Runner';
import * as flow from './utils/flow';
import * as timers from './utils/timers';
import { GLOW_VERSION } from './constants';
import onExit from 'signal-exit';
import chalk from 'chalk';
import { Lang } from './Lang';

export default async function glow(opts: GlowOptions) {
  let cwd = opts.cwd;
  let start = timers.now();

  onExit(() => {
    let end = timers.now();
    let seconds = timers.seconds(start, end);
    env.logger.info(env.lang.get('doneIn', seconds));
  });

  let flowConfigPath = await flow.getFlowConfigPath(cwd);
  let flowRootDir = flow.getFlowRootDir(flowConfigPath);
  let flowConfig = await flow.getFlowConfig(flowRootDir);

  if (!flowConfig) {
    const message = Lang.get(
      'noFlowBinary',
      flow.getPossibleFlowBinPaths(flowRootDir).join(', ')
    );
    console.error(chalk.red.bold(message));
    process.exit(1);
    throw new Error(message);
  }

  const env = new Env({
    ...opts,
    flowConfigPath,
    flowRootDir,
    flowBinPath: flowConfig.binary
  });

  env.logger.title(env.lang.get('title', GLOW_VERSION, flowConfig.semver), {
    emoji: '🕵️‍♀️'
  });

  let runner = new Runner({ env });

  await runner.start();

  return runner.status;
}
