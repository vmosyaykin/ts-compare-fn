type SortablePrimitive = number | boolean | string | bigint | undefined | null;
type SortableObject = Date;
type SortableValue = SortablePrimitive | SortableObject;

type ComparatorOptions = {
    defaultString?: string;
    defaultNumber?: number;
    transform?: (value: SortableValue) => SortableValue;
    locale?: string;
    collator?: Collator;
};

type SortConfig<Type extends object> = {
    [Path in SortablePath<Type>]: {
        path: Path;
        direction?: 'asc' | 'desc' | -1 | 1;
        transform?: (value: TypeAtPath<Type, Path>) => SortableValue;
    } & Omit<ComparatorOptions, 'transform'>;
}[SortablePath<Type>];

type Sort<Type extends object> = SortConfig<Type> | SortOption<Type>;

export function createSortFn<Type extends object>(
    ...params: [Sort<Type>, ...Sort<Type>[], ComparatorOptions]
): (a: Type, b: Type) => number;
export function createSortFn<Type extends object>(
    ...params: [Sort<Type>, ...Sort<Type>[]]
): (a: Type, b: Type) => number;
export function createSortFn<Type extends object>(
    ...params: (Sort<Type> | ComparatorOptions)[]
): (a: Type, b: Type) => number {
    const defaultLocale = 'en-u-co-eor-kn';

    let options = params[params.length - 1];

    if (!options || !isComparatorOptions(options)) {
        options = {};
    }

    if (!options.collator) {
        options.collator = new Intl.Collator(options.locale ?? defaultLocale);
    }

    const comparators: Comparator<Type>[] = [];

    for (const param of params) {
        if (isSortOption(param)) {
            comparators.push({
                dir: isAscOption(param) ? 1 : -1,
                path: isAscOption(param)
                    ? param
                    : (param.substring(1) as AscOption<Type>),
                ...(options as typeof options & { collator: Collator }),
            });
        }

        if (isSortConfig(param)) {
            if (param.locale && !param.collator) {
                param.collator = new Intl.Collator(param.locale);
            }

            comparators.push({
                dir:
                    param.direction === 'desc' || param.direction === -1
                        ? -1
                        : 1,
                ...(options as typeof options & { collator: Collator }),
                ...param,
            });
        }
    }

    return (aObject, bObject) => {
        for (const comparator of comparators) {
            const {
                dir,
                path,
                collator,
                defaultNumber,
                defaultString,
                transform,
            } = comparator;

            let a = getByPath(aObject, path);
            let b = getByPath(bObject, path);

            if (transform) {
                a = transform(a);
                b = transform(b);
            }

            if (a === null) a = undefined;
            if (b === null) b = undefined;

            if (Object.is(a, b)) continue;

            if (
                typeof a !== typeof b &&
                a instanceof Date !== b instanceof Date &&
                a !== undefined &&
                b !== undefined
            ) {
                throw new Error(`Cannot compare ${typeof a} and ${typeof b}`);
            }

            const type = a ? typeof a : typeof b;

            if (type === 'number') {
                a = a ?? defaultNumber;
                b = b ?? defaultNumber;
            }

            if (type === 'string') {
                a = a ?? defaultString;
                b = b ?? defaultString;
            }

            if (a === undefined) return dir;
            if (b === undefined) return -dir;

            if (
                (typeof a === 'number' && typeof b === 'number') ||
                (typeof a === 'bigint' && typeof b === 'bigint') ||
                (a instanceof Date && b instanceof Date)
            ) {
                if (Number.isNaN(a)) return dir;
                if (Number.isNaN(b)) return -dir;

                if (a > b) return dir;
                if (a < b) return -dir;

                continue;
            }

            if (typeof a === 'string' && typeof b === 'string') {
                const compareResult = collator.compare(a, b);
                if (compareResult) return dir * compareResult;

                continue;
            }

            if (typeof a === 'boolean' && typeof b === 'boolean') {
                return a ? dir : -dir;
            }
        }

        return 0;
    };
}

type NoSpecialChars<Key extends string | undefined> = Key extends
    | `-${string}`
    | `${string}.${string}`
    ? never
    : `${Key}`;

type Path<Object, Leaf, Index extends string = string> = Object extends object
    ? {
          [Key in keyof Object]: Key extends Index
              ? Object[Key] extends Leaf
                  ? NoSpecialChars<Key>
                  : Object[Key] extends unknown[]
                    ? `${Key}.${Path<Object[Key], Leaf, TupleIndex<Object[Key]>> | 'length'}`
                    : Object[Key] extends object
                      ? `${Key}.${Path<Object[Key], Leaf>}`
                      : never
              : never;
      }[keyof Object & Index]
    : never;

type TupleIndex<T extends unknown[]> = Exclude<keyof T, keyof unknown[]> &
    string;

type TypeAtPath<
    Object,
    Path extends string,
> = Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof Object
        ? TypeAtPath<Object[Key], Rest>
        : never
    : Path extends keyof Object
      ? Object[Path]
      : never;

type SortablePath<Type> = Path<Type, SortableValue>;

type AscOption<Type> = SortablePath<Type>;
type DescOption<Type> = `-${SortablePath<Type>}`;
type SortOption<Type> = AscOption<Type> | DescOption<Type>;

function isAscOption<Type>(
    sortPath: SortOption<Type>
): sortPath is AscOption<Type> {
    return !sortPath.startsWith('-');
}

function isSortOption<Type extends object>(
    sort: Sort<Type> | ComparatorOptions
): sort is SortOption<Type> {
    return typeof sort === 'string';
}

function isSortConfig<Type extends object>(
    sort: Sort<Type> | ComparatorOptions
): sort is SortConfig<Type> {
    return typeof sort === 'object' && 'path' in sort;
}

function isComparatorOptions<Type extends object>(
    sort: Sort<Type> | ComparatorOptions
): sort is ComparatorOptions {
    return typeof sort === 'object' && !('path' in sort);
}

type Collator = { compare: (x: string, y: string) => number };
type Comparator<Type extends object> = {
    dir: 1 | -1;
    path: SortablePath<Type>;
    collator: Collator;
} & ComparatorOptions;

function getByPath<Type extends object>(obj: Type, path: SortablePath<Type>) {
    const parts = path.split('.');

    let result: unknown = obj;

    for (const part of parts) {
        if (typeof result !== 'object' || result === null) {
            throw new Error(`Invalid path: ${path}`);
        }

        result = result[part as keyof object];
    }

    return result as SortableValue;
}
