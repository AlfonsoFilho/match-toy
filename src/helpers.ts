
export const is = (obj: any, type: string): boolean => Object.prototype.toString.call(obj) === `[object ${type}]`;

export const reverse = (arr: any[] = []) => ([] as any).concat(arr).reverse();

export const contains = (value: any, arr: any[]) => (Array as any).prototype.includes.call(arr, value);
