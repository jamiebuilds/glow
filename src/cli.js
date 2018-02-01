// @flow
import meow from 'meow';
import chalk from 'chalk';
import { Lang } from './Lang';
import glow from './';

export default async function main(cwd: string, argv: Array<string>) {
  let cli = meow({
    argv,
    // prettier-ignore
    help: `
      ${chalk.bold.underline(Lang.get('helpUsage'))}

        ${chalk.magenta.bold('glow <...globs> <...flags>')}

      ${chalk.bold.underline(Lang.get('helpFlags'))}

        ${chalk.magenta('--watch, -w')}         ${chalk.cyan(Lang.get('helpFlagsWatch'))}
        ${chalk.magenta('--interactive, -i')}   ${chalk.cyan(Lang.get('helpFlagsInteractive'))}
        ${chalk.magenta('--beep, -b')}          ${chalk.cyan(Lang.get('helpFlagsBeep'))}
        ${chalk.magenta('--quiet')}             ${chalk.cyan(Lang.get('helpFlagsQuiet'))}
        ${chalk.magenta('--debug')}             ${chalk.cyan(Lang.get('helpFlagsDebug'))}

      ${chalk.bold.underline(Lang.get('helpExamples'))}

        ${chalk.cyan(Lang.get('helpExamplesBasic'))}
        ${chalk.magenta('$ glow')}

        ${chalk.cyan(Lang.get('helpExamplesWatch'))}
        ${chalk.magenta('$ glow --watch')}
        ${chalk.magenta('$ glow -w')}

        ${chalk.cyan(Lang.get('helpExamplesFile'))}
        ${chalk.magenta('$ glow src/utils/math.js')}

        ${chalk.cyan(Lang.get('helpExamplesDirectory'))}
        ${chalk.magenta('$ glow src/components')}

        ${chalk.cyan(Lang.get('helpExamplesGlob'))}
        ${chalk.magenta('$ glow "src/**/*.test.js"')}

        ${chalk.cyan(Lang.get('helpExamplesMultiGlob'))}
        ${chalk.magenta('$ glow "src/**/*.test.js" "!src/utils/**"')}
    `.trimRight(),
    flags: {
      watch: {
        type: 'boolean',
        alias: 'w',
        default: false
      },
      interactive: {
        type: 'boolean',
        alias: 'i',
        default: false
      },
      beep: {
        type: 'boolean',
        alias: 'b',
        default: false
      },
      quiet: {
        type: 'boolean'
      },
      debug: {
        type: 'boolean'
      },
      version: {
        type: 'boolean',
        alias: ['v', 'V']
      },
      help: {
        type: 'boolean',
        alias: ['h', 'H']
      }
    }
  });

  let filters = cli.input;
  let { watch, interactive, beep, quiet, debug } = cli.flags;

  let status = await glow({
    cwd,
    filters,
    watch,
    interactive,
    beep,
    quiet,
    debug
  });

  if (status.errors.length !== 0) {
    process.exit(1);
  }
}
