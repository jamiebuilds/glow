// @flow
import { format } from 'util';

export const messages = {
  en: {
    title: 'Glow v%s (flow-bin v%s)',
    description: 'CLI interface for working through Flow errors',
    doneIn: 'Done in %ds.',
    helpUsage: 'Usage',
    helpFlags: 'Flags',
    helpFlagsWatch: '...',
    helpFlagsInteractive: '...',
    helpFlagsBeep: 'Emit a beep when Flow errors are detected',
    helpFlagsQuiet: 'Silence any stdout output unrelated to Flow status',
    helpFlagsDebug: '...',
    helpFormatters: 'Formatters',
    helpFormattersPretty: 'Format in an easy to read way (Default)',
    helpExamples: 'Examples',
    helpExamplesBasic: 'Display errors for current Flow project:',
    helpExamplesWatch: 'Start Glow in interactive mode and watch for changes:',
    helpExamplesFile: 'Display errors for a single file:',
    helpExamplesDirectory: 'Display errors for files inside a directory:',
    helpExamplesGlob: 'Display errors that match a glob:',
    helpExamplesMultiGlob: 'Display errors that match multiple globs:',
    gettingFlowStatus: 'Getting Flow status...',
    flowDidntFindAnyErrors: "Flow didn't find any errors. Nice work!",
    foundError: 'Found %d error.',
    foundErrors: 'Found %d errors.',
    foundErrorsWithFilters: '%s (Filters match %d)'
  }
};

export type Language = $Keys<typeof messages>;
export type Message = $Keys<typeof messages.en>;
export type MessageParts = Array<string | number>;

export opaque type LangMessage = string;

export function langMessageToString(message: LangMessage): string {
  return message;
}

let instance = null;

export class Lang {
  language: Language;

  constructor(language: Language) {
    this.language = language;
  }

  get(message: Message, ...parts: MessageParts): LangMessage {
    return format(messages[this.language][message], ...parts);
  }

  static get(message: Message, ...parts: MessageParts): string {
    if (!instance) instance = new Lang('en');
    return instance.get(message, ...parts);
  }
}
