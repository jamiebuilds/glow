// @flow
import { Env } from './Env';
import {
  type FlowStatusError,
  type FlowExtra,
  type FlowMessagePart,
  type FlowMessagePartBlame,
  type FlowMessagePartComment,
  type FlowMessagePartBlameCommentLike,
  type FlowSourceLocation,
  type BabelCodeFrameOpts
} from './types';
import chalk from 'chalk';
import { toBabelSourceLocation } from './utils/locations';
import { codeFrameColumns } from '@babel/code-frame';
import { readFileWithCache } from './utils/fs';

export type PrinterOptions = {
  env: Env
};

export class Printer {
  env: Env;

  constructor(opts: PrinterOptions) {
    this.env = opts.env;
  }

  indent(str: string, amount: number = 2) {
    let pad = ' '.repeat(amount);
    return str
      .split('\n')
      .map(line => pad + line)
      .join('\n');
  }

  async printError(error: FlowStatusError): Promise<string> {
    let res = [];

    for (let message of error.message) {
      res.push(await this._printMessagePart(message));
    }

    if (error.extra) {
      for (let message of error.extra) {
        res.push(await this._printExtra(message));
      }
    }

    return res.join('\n\n');
  }

  async _printExtra(message: FlowExtra) {
    let res = [];

    for (let messagePart of message.message) {
      res.push(
        await this._printMessagePart(messagePart, {
          linesAbove: 1,
          linesBelow: 1
        })
      );
    }

    if (message.children) {
      for (let child of message.children) {
        res.push(await this._printExtra(child));
      }
    }

    return this.indent(res.join('\n\n'), 4);
  }

  async _printMessagePart(
    messagePart: FlowMessagePart,
    opts: BabelCodeFrameOpts = {}
  ) {
    if (messagePart.type === 'Blame' && messagePart.context !== null) {
      return await this._printBlameMessagePart(messagePart, opts);
    } else if (
      messagePart.type === 'Comment' ||
      (messagePart.type === 'Blame' && messagePart.context === null)
    ) {
      return await this._printCommentMessagePart(messagePart);
    } else {
      this.env.logger.warn(
        (`messagePart.type = ${String(
          messagePart.type
        )} isn't implemented`: any)
      );
    }
  }

  async _printBlameMessagePart(
    messagePart: FlowMessagePartBlame,
    opts: BabelCodeFrameOpts = {}
  ) {
    return await this._printLocation(messagePart.loc, {
      message: messagePart.descr,
      ...opts
    });
  }

  async _printCommentMessagePart(
    messagePart: FlowMessagePartComment | FlowMessagePartBlameCommentLike
  ) {
    return chalk.red.bold(messagePart.descr);
  }

  async _printLocation(loc: FlowSourceLocation, opts: BabelCodeFrameOpts = {}) {
    if (loc.type === 'SourceFile' || loc.type === 'LibFile') {
      return await this._printFileLocation(loc, opts);
    } else {
      this.env.logger.warn(
        (`loc.type = ${String(loc.type)} isn't implemented`: any)
      );
    }
  }

  async _printFileLocation(
    loc: FlowSourceLocation,
    opts: BabelCodeFrameOpts = {}
  ) {
    let link = chalk.dim.underline(`${loc.source}:${loc.start.line}`);
    let fileContents = await readFileWithCache(new Map(), loc.source);
    let babelLoc = toBabelSourceLocation(loc);
    let codeFrame = codeFrameColumns(fileContents, babelLoc, {
      highlightCode: true,
      ...opts
    });
    return `${link}\n${codeFrame}`;
  }
}
