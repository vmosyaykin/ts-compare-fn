type SortConfig<Type extends object> =
    | SortOption<Type>
    | SortPathConfig<Type>
    | Getter<Type>
    | SortGetterConfig<Type>;

type LocaleOptions = {
    locale?: string;
    collator?: Collator;
};

type SortPathConfig<Type extends object> = {
    [Path in SortablePath<Type>]: {
        path: Path | `-${Path}`;
        order?: 'asc' | 'desc' | -1 | 1;
        defaultValue?: TypeAtPath<Type, Path>;
    } & LocaleOptions;
}[SortablePath<Type>];

type SortGetterConfig<Type extends object> = {
    get: Getter<Type>;
    order?: 'asc' | 'desc' | -1 | 1;
} & LocaleOptions;

type SortOptionAndLocaleOptionsTuple<Type extends object> = {
    [Path in SortablePath<Type>]: [
        Path | `-${Path}`,
        LocaleOptions & { defaultValue?: TypeAtPath<Type, Path> },
    ];
}[SortablePath<Type>];

export function compareFn<Type extends object>(
    ...params: SortOptionAndLocaleOptionsTuple<Type>
): (a: Type, b: Type) => number;
export function compareFn<Type extends object>(
    ...params: [
        SortConfig<Type>,
        SortConfig<Type>,
        ...SortConfig<Type>[],
        LocaleOptions,
    ]
): (a: Type, b: Type) => number;
export function compareFn<Type extends object>(
    ...params: [SortConfig<Type>, ...SortConfig<Type>[]]
): (a: Type, b: Type) => number;
export function compareFn<Type extends object>(
    ...params: (SortConfig<Type> | LocaleOptions)[]
): (a: Type, b: Type) => number {
    const defaultLocale = 'en-u-co-eor-kn';

    let options = params[params.length - 1];

    if (!options || !isLocaleOptions(options)) {
        options = {};
    }

    const resolvedOptions = {
        ...(options && isLocaleOptions(options) ? options : {}),
        collator:
            options.collator ??
            new Intl.Collator(options.locale ?? defaultLocale),
    };

    const comparators: Comparator<Type>[] = [];

    for (const param of params) {
        if (isSortOption(param)) {
            const isAscPath = isAscOption(param);

            comparators.push({
                dir: isAscPath ? 1 : -1,
                path: isAscPath
                    ? param
                    : (param.substring(1) as AscOption<Type>),
                ...resolvedOptions,
            });
        }

        if (isGetter(param)) {
            comparators.push({
                dir: 1,
                get: param,
                ...resolvedOptions,
            });
        }

        if (isSortPathConfig(param)) {
            const isAscPath = isAscOption(param.path);

            if (param.locale && !param.collator) {
                param.collator = new Intl.Collator(param.locale);
            }

            comparators.push({
                dir:
                    param.order === 'desc' || param.order === -1
                        ? -1
                        : isAscPath
                          ? 1
                          : -1,
                ...resolvedOptions,
                ...param,
                path: (isAscPath
                    ? param.path
                    : param.path.substring(1)) as AscOption<Type>,
            });
        }

        if (isSortGetterConfig(param)) {
            if (param.locale && !param.collator) {
                param.collator = new Intl.Collator(param.locale);
            }

            comparators.push({
                dir: param.order === 'desc' || param.order === -1 ? -1 : 1,
                ...resolvedOptions,
                ...param,
            });
        }
    }

    return (aObject, bObject) => {
        for (const comparator of comparators) {
            const { dir, path, collator, defaultValue, get } = comparator;

            let a, b;

            if (path) {
                a = getByPath(aObject, path);
                b = getByPath(bObject, path);
            }

            if (get) {
                a = get(aObject);
                b = get(bObject);
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
            const instanceOfDate = a instanceof Date || b instanceof Date;

            if (
                defaultValue !== undefined &&
                defaultValue !== null &&
                type === typeof defaultValue &&
                instanceOfDate === defaultValue instanceof Date
            ) {
                a = a ?? defaultValue;
                b = b ?? defaultValue;
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
          [Key in keyof Required<Object>]: Key extends Index
              ? Required<Object>[Key] extends Leaf
                  ? NoSpecialChars<Key>
                  : Required<Object>[Key] extends unknown[]
                    ? `${Key}.${Path<Required<Object>[Key], Leaf, TupleIndex<Required<Object>[Key]>> | 'length'}`
                    : Required<Object>[Key] extends object
                      ? `${Key}.${Path<Required<Object>[Key], Leaf>}`
                      : never
              : never;
      }[keyof Required<Object> & Index]
    : never;

type TupleIndex<Tuple extends unknown[]> = Exclude<
    keyof Tuple,
    keyof unknown[]
> &
    string;

type Nullishable<Type> = Type | null | undefined;
type SortablePath<Type> =
    | Path<Type, Nullishable<number>>
    | Path<Type, Nullishable<bigint>>
    | Path<Type, Nullishable<Date>>
    | Path<Type, Nullishable<string>>
    | Path<Type, Nullishable<boolean>>;

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

type AscOption<Type> = SortablePath<Type>;
type DescOption<Type> = `-${SortablePath<Type>}`;
type SortOption<Type> = AscOption<Type> | DescOption<Type>;

type Getter<Type extends object> =
    | ((object: Type) => Nullishable<number>)
    | ((object: Type) => Nullishable<bigint>)
    | ((object: Type) => Nullishable<Date>)
    | ((object: Type) => Nullishable<string>)
    | ((object: Type) => Nullishable<boolean>);

function isAscOption<Type>(
    sortPath: SortOption<Type>
): sortPath is AscOption<Type> {
    return !sortPath.startsWith('-');
}

function isSortOption<Type extends object>(
    sort: SortConfig<Type> | LocaleOptions
): sort is SortOption<Type> {
    return typeof sort === 'string';
}

function isGetter<Type extends object>(
    sort: SortConfig<Type> | LocaleOptions
): sort is Getter<Type> {
    return typeof sort === 'function';
}

function isSortPathConfig<Type extends object>(
    sort: SortConfig<Type> | LocaleOptions
): sort is SortPathConfig<Type> {
    return typeof sort === 'object' && 'path' in sort;
}

function isSortGetterConfig<Type extends object>(
    sort: SortConfig<Type> | LocaleOptions
): sort is SortGetterConfig<Type> {
    return typeof sort === 'object' && 'get' in sort;
}

function isLocaleOptions<Type extends object>(
    sort: SortConfig<Type> | LocaleOptions
): sort is LocaleOptions {
    return typeof sort === 'object' && !('path' in sort);
}

type Sortable = string | number | bigint | boolean | Date | null | undefined;

type Collator = { compare: (x: string, y: string) => number };
type Comparator<Type extends object> = {
    dir: 1 | -1;
    path?: SortablePath<Type> | undefined;
    get?: (object: Type) => Sortable | undefined;
    collator: Collator;
    defaultValue?: unknown;
} & LocaleOptions;

function getByPath<Type extends object>(obj: Type, path: SortablePath<Type>) {
    const parts = path.split('.');

    let result: unknown = obj;

    for (const part of parts) {
        if (typeof result !== 'object' || result === null) {
            throw new Error(`Invalid path: ${path}`);
        }

        result = result[part as keyof object];
    }

    return result as Sortable;
}
