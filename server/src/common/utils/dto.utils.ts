import { Transform, TransformFnParams } from 'class-transformer';

export function EmptyStringToNull() {
  return Transform(({ value }: TransformFnParams): any => {
    if (value === '') return null;
    return value;
  });
}
