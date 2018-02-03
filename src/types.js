// @flow
export type GlowOptions = {
  cwd: string,
  filters?: Array<string>,
  watch?: boolean,
  interactive?: boolean,
  beep?: boolean,
  debug?: boolean,
  color?: boolean,
  quiet?: boolean
};

export type FlowLocation = {
  line: number,
  column: number,
  offset: number
};

export type FlowSourceLocation = {
  source: string,
  type: 'SourceFile' | 'LibFile',
  start: FlowLocation,
  end: FlowLocation
};

export type BabelLocation = {
  line: number,
  column: number
};

export type BabelSourceLocation = {
  start: BabelLocation,
  end: BabelLocation
};

export type BabelCodeFrameOpts = {
  highlightCode?: boolean,
  linesAbove?: number,
  linesBelow?: number,
  forceColor?: boolean,
  message?: string
};

export type FlowMessagePartBlame = {
  type: 'Blame',
  context: string,
  descr: string,
  loc: FlowSourceLocation,
  path: string,
  line: number,
  endline: number,
  start: number,
  end: number
};

export type FlowMessagePartBlameCommentLike = {
  type: 'Blame',
  context: null,
  descr: string,
  path: '',
  line: 0,
  endline: 0,
  start: 1,
  end: 0
};

export type FlowMessagePartComment = {
  type: 'Comment',
  context: null,
  descr: string,
  path: '',
  line: number,
  endline: number,
  start: number,
  end: number
};

export type FlowMessagePart =
  | FlowMessagePartBlame
  | FlowMessagePartBlameCommentLike
  | FlowMessagePartComment;

export type FlowExtra = {
  message: Array<FlowMessagePart>,
  children: Array<FlowExtra>
};

export type FlowStatusError = {
  kind: 'infer' | string,
  level: 'error' | string,
  supressions: Array<{}>,
  message: Array<FlowMessagePart>,
  extra?: Array<FlowExtra>
};

export type FlowStatus = {
  flowVersion: string,
  errors: Array<FlowStatusError>
};

export type GlowResult = {
  error: FlowStatusError,
  message: string
};

export type FlowConfig = {
  semver: string,
  binary: string,
  build_id: string
};
