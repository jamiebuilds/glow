// @flow
import { type GlowOptions } from './types';
import { Logger } from './Logger';
import { Printer } from './Printer';
import { Interface } from './Interface';
import { LOG_LEVELS } from './constants';
import { Lang } from './Lang';
import EventEmitter from 'events';

export type EnvOptions = GlowOptions & {
  flowConfigPath: string,
  flowRootDir: string,
  flowBinPath: string
};

export class Env extends EventEmitter {
  cwd: string;
  filters: Array<string>;
  watch: boolean;
  interactive: boolean;
  logLevel: number;

  flowConfigPath: string;
  flowRootDir: string;
  flowBinPath: string;

  lang: Lang;

  logger: Logger;
  printer: Printer;
  interface: Interface | null;

  constructor(opts: EnvOptions) {
    super();

    this.cwd = opts.cwd;
    this.filters = opts.filters || [];
    this.watch = opts.watch || false;
    this.interactive = opts.interactive || this.watch;
    this.logLevel = opts.debug
      ? LOG_LEVELS.debug
      : opts.quiet ? LOG_LEVELS.error : LOG_LEVELS.info;

    this.flowConfigPath = opts.flowConfigPath;
    this.flowRootDir = opts.flowRootDir;
    this.flowBinPath = opts.flowBinPath;

    this.lang = new Lang('en');
    this.logger = new Logger({ env: this });
    this.printer = new Printer({ env: this });

    if (this.interactive) {
      this.interface = new Interface({ env: this });
      this.interface.on('close', () => {
        process.exit(0);
      });
    } else {
      this.interface = null;
    }
  }

  setFilters(filters: Array<string>) {
    this.filters = filters;
    this.emit('filter', this.filters);
  }
}
