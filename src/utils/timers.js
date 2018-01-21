// @flow
export opaque type Time = number;

export function now(): Time {
  return Date.now();
}

export function seconds(start: Time, end: Time) {
  let seconds = (Date.now() - start) / 1000;
  let rounded = Math.round(seconds * 100) / 100;
  return rounded;
}
