// @flow
import { type GlowOptions } from './types';
import { Env } from './Env';
import { Runner } from './Runner';
import * as flow from './utils/flow';
import * as timers from './utils/timers';
import { GLOW_VERSION } from './constants';
import onExit from 'signal-exit';

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
  let flowBinPath = flow.getFlowBinPath(flowRootDir);

  let env = new Env({
    ...opts,
    flowConfigPath,
    flowRootDir,
    flowBinPath
  });

  let flowVersion = await flow.version(env);

  env.logger.title(env.lang.get('title', GLOW_VERSION, flowVersion), {
    emoji: '🕵️‍♀️'
  });

  let runner = new Runner({ env });

  await runner.start();
}
