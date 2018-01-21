// @flow
import blessed from 'blessed';
import EventEmitter from 'events';
import { Env } from './Env';
import { type GlowResult } from './types';
import { STDOUT_HEIGHT } from './constants';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import beep from 'beeper';

export type InterfaceOptions = {
  env: Env
};

export class Interface extends EventEmitter {
  env: Env;

  screen: Object;
  title: Object;
  status: Object;
  topLine: Object;
  bottomLine: Object;
  output: Object;
  filters: Object;

  _results: Array<GlowResult>;
  _currentIndex: number;
  _filters: string;

  constructor(opts: InterfaceOptions) {
    super();

    this.env = opts.env;
    this._results = [];
    this._currentIndex = 0;

    this.screen = blessed.screen({
      smartCSR: true,
      doubleWidth: true
    });

    this.title = blessed.box({
      top: 0,
      left: 0,
      height: 1,
      width: '100%',
      style: {
        bold: true
      }
    });

    this.status = blessed.box({
      top: 1,
      left: 0,
      height: 1,
      width: '100%',
      content: '(idle)'
    });

    this.topLine = blessed.line({
      orientation: 'horizontal',
      top: 2,
      left: 0,
      height: 1,
      width: '100%'
    });

    this.output = blessed.box({
      top: 3,
      left: 0,
      width: '100%',
      height: '100%-5',
      input: true,
      mouse: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        bg: 'white',
        fg: 'blue'
      }
    });

    this.bottomLine = blessed.line({
      orientation: 'horizontal',
      bottom: 1,
      left: 0,
      height: 1,
      width: '100%'
    });

    this.filters = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1
    });

    this.screen.append(this.title);
    this.screen.append(this.status);
    this.screen.append(this.topLine);
    this.screen.append(this.output);
    this.screen.append(this.bottomLine);
    this.screen.append(this.filters);

    this.screen.key(['escape', 'C-c'], () => {
      this.emit('close');
    });

    this.screen.on('keypress', (char, meta) => {
      let filters = this._filters;

      if (
        meta.name === 'enter' ||
        meta.name === 'return' ||
        meta.ctrl === true
      ) {
        return;
      } else if (meta.name === 'left' || meta.name === 'up') {
        this._prevResult();
        return;
      } else if (meta.name === 'right' || meta.name === 'down') {
        this._nextResult();
        return;
      } else if (meta.name === 'backspace') {
        filters = filters.slice(0, -1);
      } else if (meta.name === 'delete') {
        filters = '';
      } else if (char) {
        filters = filters + char;
      }

      this.setFilters(filters);

      filters = filters.split(/, */);
      filters = filters.filter(filter => filter !== '');

      this.env.setFilters(filters);
    });

    this.screen.render();
    this.setFilters(this.env.filters.join(', '));
  }

  setOutput(output: string) {
    this.output.setContent(output);
    this.screen.render();
  }

  setTitle(title: string) {
    this.title.setContent(title);
    this.screen.render();
  }

  setStatus(status: string) {
    this.status.setContent(status);
    this.screen.render();
  }

  setFilters(filters: string) {
    this._filters = filters;
    let value = this._filters !== '' ? this._filters : '(none)';
    this.filters.setContent(`Filters: ${value}`);
    this.screen.render();
  }

  setResults(results: Array<GlowResult>) {
    let prevResults = this._results;

    this._results = results;
    this._setCurrentIndex(0);

    let prevHadErrors = prevResults.length !== 0;
    let currHasErrors = results.length !== 0;

    if (prevHadErrors !== currHasErrors) {
      this.beep();
    }
  }

  _nextResult() {
    let nextIndex = this._currentIndex + 1;
    if (nextIndex < this._results.length) {
      this._setCurrentIndex(nextIndex);
    } else {
      this.beep();
    }
  }

  _prevResult() {
    let prevIndex = this._currentIndex - 1;
    if (prevIndex >= 0) {
      this._setCurrentIndex(prevIndex);
    } else {
      this.beep();
    }
  }

  _setCurrentIndex(index: number) {
    this._currentIndex = index;

    if (!this._results.length) {
      this.setOutput('');
      return;
    }

    let startPad = 10;
    let sectionPad = 4;
    let startPadding = ' '.repeat(startPad);
    let sectionPadding = '\n'.repeat(sectionPad);

    let sections = this._results
      .map((result, index) => {
        return result.message
          .split('\n')
          .map(str => {
            if (this._currentIndex === index) {
              return startPadding + str;
            } else {
              return startPadding + chalk.gray(stripAnsi(str));
            }
          })
          .join('\n');
      })
      .map(str => {
        return sectionPadding + str;
      });

    let lastSectionHeight =
      sections[sections.length - 1].split('\n').length - 1;

    let topPad = 4;
    let bottomPad = Math.max(
      STDOUT_HEIGHT - lastSectionHeight - topPad,
      topPad
    );
    let scrollPosition = topPad;

    sections.find((section, index) => {
      let isCurrent = index === this._currentIndex;
      if (!isCurrent) scrollPosition += section.split('\n').length - 1;
      return isCurrent;
    });

    scrollPosition = Math.max(scrollPosition - topPad, 0);

    let output =
      '\n'.repeat(topPad - sectionPad) +
      sections.join('') +
      '\n'.repeat(bottomPad);

    this.output.resetScroll();
    this.setOutput(output);
    this.output.scrollTo(scrollPosition);
    this.output.setScroll(scrollPosition);
    this.screen.render();
  }

  beep() {
    beep();
  }
}
