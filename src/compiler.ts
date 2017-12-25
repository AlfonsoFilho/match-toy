import { parse } from './grammar.gen';
import { Pattern } from './types';

export const compile = (source: string): Pattern =>
  (parse(source, {}) as Pattern);
