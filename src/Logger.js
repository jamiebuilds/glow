// @flow
import { Env } from './Env';
import { type LangMessage, langMessageToString } from './Lang';
import { LOG_LEVELS, STDOUT_WIDTH } from './constants';
import chalk from 'chalk';

export type LoggerOptions = {
  env: Env
};

export type LogKind = $Keys<typeof LOG_LEVELS>;

type FormatOptions = {
  prefix?: string | null,
  emoji?: string,
  style?: string => string,
  status?: boolean,
  title?: boolean
};

type LogOptions = {
  emoji?: string,
  title?: boolean,
  status?: boolean,
  prefix?: boolean
};

function toFormatOptions(logOptions: LogOptions, formatOptions: FormatOptions) {
  return {
    emoji: logOptions.emoji || formatOptions.emoji,
    prefix: logOptions.prefix !== false ? formatOptions.prefix : null,
    style: formatOptions.style,
    title: logOptions.title || formatOptions.title,
    status: logOptions.status || formatOptions.status
  };
}

type Stream = 'stdout' | 'stderr';

export class Logger {
  env: Env;

  constructor(opts: LoggerOptions) {
    this.env = opts.env;
  }

  write(
    stream: 'stdout' | 'stderr',
    kind: LogKind,
    message: string,
    opts: FormatOptions = {}
  ) {
    let logLevel = LOG_LEVELS[kind];
    let str = message;

    if (logLevel > this.env.logLevel) {
      return;
    }

    let prefix = opts.prefix ? `${opts.prefix} ` : '';
    let fullPrefix =
      opts.emoji && !this.env.interface ? `${opts.emoji}  ${prefix}` : prefix;

    str = opts.style ? opts.style(str) : str;
    str =
      fullPrefix == ''
        ? str
        : str
            .split('\n')
            .map(line => `${fullPrefix}${line}`)
            .join('\n');

    if (this.env.interface) {
      if (opts.title) {
        this.env.interface.setTitle(str);
      } else if (opts.status) {
        this.env.interface.setStatus(str);
      } else {
        // this.env.interface.writeLog(str);
      }
    } else {
      if (stream === 'stdout') {
        console.log(str);
      } else {
        console.error(str);
      }
    }
  }

  title(message: LangMessage, opts: LogOptions = {}) {
    this.write(
      'stderr',
      'info',
      langMessageToString(message),
      toFormatOptions(opts, {
        style: chalk.bold.magenta,
        title: true
      })
    );
  }

  info(message: LangMessage, opts: LogOptions = {}) {
    this.write(
      'stderr',
      'info',
      langMessageToString(message),
      toFormatOptions(opts, {
        prefix: chalk.cyan('info')
      })
    );
  }

  success(message: LangMessage, opts: LogOptions = {}) {
    this.write(
      'stderr',
      'info',
      langMessageToString(message),
      toFormatOptions(opts, {
        prefix: chalk.green('success')
      })
    );
  }

  debug(message: LangMessage, opts: LogOptions = {}) {
    this.write(
      'stderr',
      'debug',
      langMessageToString(message),
      toFormatOptions(opts, {
        prefix: chalk.magenta('debug')
      })
    );
  }

  warn(message: LangMessage, opts: LogOptions = {}) {
    this.write(
      'stderr',
      'warn',
      langMessageToString(message),
      toFormatOptions(opts, {
        prefix: chalk.yellow('warn')
      })
    );
  }

  error(message: LangMessage, opts: LogOptions = {}) {
    this.write(
      'stderr',
      'error',
      langMessageToString(message),
      toFormatOptions(opts, {
        prefix: chalk.yellow('red')
      })
    );
  }

  line() {
    this.write(
      'stderr',
      'output',
      '\n' + chalk.gray('─'.repeat(STDOUT_WIDTH)) + '\n'
    );
  }
}
