import { Transform, TransformFnParams } from 'class-transformer';

export function StringOrNull() {
  return Transform(({ value }: TransformFnParams): string | null => {
    return typeof value === 'string' ? value : null;
  });
}

export function DateOrNull() {
  return Transform(({ value }: TransformFnParams): Date | null => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value; // Already a valid Date object
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date : null;
    }

    return null;
  });
}

export function DateStringOrNull() {
  return Transform(({ value }: TransformFnParams): string | null => {
    let date: Date | null = null;

    if (value instanceof Date && !isNaN(value.getTime())) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      const parsedDate = new Date(value);
      date = !isNaN(parsedDate.getTime()) ? parsedDate : null;
    }

    return date ? date.toISOString() : null;
  });
}

export function EmptyStringToNull() {
  return Transform(({ value }: TransformFnParams): any => {
    if (value === '') return null;
    return value;
  });
}
