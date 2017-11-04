import * as parser from './lang.gen.js';

export const compile = (source: string) =>
  parser.parse(source);
