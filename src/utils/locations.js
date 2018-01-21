// @flow
import { type FlowSourceLocation, type BabelSourceLocation } from '../types';

export function toBabelSourceLocation(
  flowLoc: FlowSourceLocation
): BabelSourceLocation {
  return {
    start: {
      line: flowLoc.start.line,
      column: flowLoc.start.column
    },
    end: {
      line: flowLoc.end.line,
      column: flowLoc.end.column + 1
    }
  };
}
