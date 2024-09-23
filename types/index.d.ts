type SortConfig<Type extends object> = SortOption<Type> | SortPathConfig<Type> | Getter<Type> | SortGetterConfig<Type>;
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
        LocaleOptions & {
            defaultValue?: TypeAtPath<Type, Path>;
        }
    ];
}[SortablePath<Type>];
export declare function compareFn<Type extends object>(...params: SortOptionAndLocaleOptionsTuple<Type>): (a: Type, b: Type) => number;
export declare function compareFn<Type extends object>(...params: [
    SortConfig<Type>,
    SortConfig<Type>,
    ...SortConfig<Type>[],
    LocaleOptions
]): (a: Type, b: Type) => number;
export declare function compareFn<Type extends object>(...params: [SortConfig<Type>, ...SortConfig<Type>[]]): (a: Type, b: Type) => number;
type NoSpecialChars<Key extends string | undefined> = Key extends `-${string}` | `${string}.${string}` ? never : `${Key}`;
type Path<Object, Leaf, Index extends string = string> = Object extends object ? {
    [Key in keyof Required<Object>]: Key extends Index ? Required<Object>[Key] extends Leaf ? NoSpecialChars<Key> : Required<Object>[Key] extends unknown[] ? `${Key}.${Path<Required<Object>[Key], Leaf, TupleIndex<Required<Object>[Key]>> | 'length'}` : Required<Object>[Key] extends object ? `${Key}.${Path<Required<Object>[Key], Leaf>}` : never : never;
}[keyof Required<Object> & Index] : never;
type TupleIndex<Tuple extends unknown[]> = Exclude<keyof Tuple, keyof unknown[]> & string;
type Nullishable<Type> = Type | null | undefined;
type SortablePath<Type> = Path<Type, Nullishable<number>> | Path<Type, Nullishable<bigint>> | Path<Type, Nullishable<Date>> | Path<Type, Nullishable<string>> | Path<Type, Nullishable<boolean>>;
type TypeAtPath<Object, Path extends string> = Path extends `${infer Key}.${infer Rest}` ? Key extends keyof Object ? TypeAtPath<Object[Key], Rest> : never : Path extends keyof Object ? Object[Path] : never;
type AscOption<Type> = SortablePath<Type>;
type DescOption<Type> = `-${SortablePath<Type>}`;
type SortOption<Type> = AscOption<Type> | DescOption<Type>;
type Getter<Type extends object> = ((object: Type) => Nullishable<number>) | ((object: Type) => Nullishable<bigint>) | ((object: Type) => Nullishable<Date>) | ((object: Type) => Nullishable<string>) | ((object: Type) => Nullishable<boolean>);
type Collator = {
    compare: (x: string, y: string) => number;
};
export {};
//# sourceMappingURL=index.d.ts.map