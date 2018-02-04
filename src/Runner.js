// @flow
import EventEmitter from 'events';
import { Env } from './Env';
import { Interface } from './Interface';
import * as flow from './utils/flow';
import * as fs from './utils/fs';
import debounce from 'lodash.debounce';
import { type GlowResult, type FlowStatus } from './types';
import multimatch from 'multimatch';
import * as path from 'path';

export type RunnerOptions = {
  env: Env
};

export class Runner extends EventEmitter {
  env: Env;
  interface: Interface;
  running: boolean;
  changed: boolean;
  status: FlowStatus;

  _currentResults: Array<GlowResult>;

  constructor(opts: RunnerOptions) {
    super();
    this.env = opts.env;
    this.running = false;
    this.changed = false;
  }

  async start() {
    if (this.env.watch) {
      let watcher = fs.watchDirectory(this.env.flowRootDir);
      watcher.on(
        'change',
        debounce(() => {
          this.changed = true;
          this.emit('change');
        }, 200)
      );
    }

    this.env.on('filter', () => {
      this.render();
    });

    await this.run();
  }

  async run() {
    this.changed = false;
    this.running = true;
    await this.update();
    this.running = false;
    if (this.env.watch) {
      await this.waitForNextChange();
      await this.run();
    }
  }

  async waitForNextChange() {
    if (this.changed) return;
    return new Promise(resolve => {
      this.once('change', resolve);
    });
  }

  async update() {
    this.env.logger.info(this.env.lang.get('gettingFlowStatus'), {
      status: true
    });

    if (this.env.interface) {
      this.env.interface.setOutput('');
    }

    this.status = await flow.status(this.env);
    let results: Array<GlowResult> = [];
    if (this.status.errors) {
      let errors = this.status.errors;
      for (let error of errors) {
        results.push({
          error,
          message: await this.env.printer.printError(error)
        });
      }
    } else if (this.status.exit) {
      let exit = this.status.exit;
      results.push({
        message: exit.msg
      });
    }

    this._currentResults = results;
    this.render();
  }

  render() {
    let results = this._currentResults || [];
    let filters = this.env.filters.map(filter => {
      let negated = filter.indexOf('!') === 0;
      let value = negated ? filter.slice(1) : filter;
      return (negated ? '!' : '') + path.join('**', '*' + value + '*');
    });

    if (filters.length) {
      filters.unshift('**');
    }

    if (!results.length) {
      if (this.env.interface) {
        this.env.interface.setResults(results);
      }
      this.env.logger.success(this.env.lang.get('flowDidntFindAnyErrors'), {
        status: true
      });
      return;
    }

    let filteredResults;

    if (filters.length) {
      filteredResults = results.filter(result => {
        if (!result.error) {
          return true;
        }
        return result.error.message.find(messagePart => {
          if (messagePart.loc && messagePart.loc.source) {
            return multimatch(messagePart.loc.source, filters).length;
          } else {
            return false;
          }
        });
      });
    } else {
      filteredResults = results;
    }

    let message = this.env.lang.get(
      results.length === 1 ? 'foundError' : 'foundErrors',
      results.length
    );

    if (filteredResults.length !== results.length) {
      message = this.env.lang.get(
        'foundErrorsWithFilters',
        (message: any),
        filteredResults.length
      );
    }

    this.env.logger.success(message, { status: true });

    if (this.env.interface) {
      this.env.interface.setResults(filteredResults);
    } else {
      for (let result of filteredResults) {
        this.env.logger.line();
        this.env.logger.info((result.message: any), {
          prefix: false
        });
      }
      this.env.logger.line();
    }
  }
}
