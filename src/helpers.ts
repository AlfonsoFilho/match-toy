
export const is = (obj: any, type: string | string[]): boolean => {

  const check = (o: any, t: string) => Object.prototype.toString.call(o) === `[object ${t}]`;

  if (typeof type === 'string') {
    return check(obj, type);
  }

  if (Array.isArray(type)) {
    return type.some((typeItem) => check(obj, typeItem));
  }

  return false;
};

export const reverse = (arr: any[] = []) => ([] as any).concat(arr).reverse();

export const contains = (value: any, arr: any[]) => (Array as any).prototype.includes.call(arr, value);
