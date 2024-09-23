type ComparatorOptions = {
    defaultString?: string;
    defaultNumber?: number;
    locale?: string;
    collator?: Collator;
};
type SortConfig<Type extends object> = {
    [Path in SortablePath<Type>]: {
        path: Path;
        direction?: 'asc' | 'desc' | -1 | 1;
        transform?: ((value: TypeAtPath<Type, Path>) => Nullishable<number>) | ((value: TypeAtPath<Type, Path>) => Nullishable<bigint>) | ((value: TypeAtPath<Type, Path>) => Nullishable<Date>) | ((value: TypeAtPath<Type, Path>) => Nullishable<string>) | ((value: TypeAtPath<Type, Path>) => Nullishable<boolean>);
    } & ComparatorOptions;
}[SortablePath<Type>];
type Sort<Type extends object> = SortConfig<Type> | SortOption<Type>;
export declare function createSortFn<Type extends object>(...params: [Sort<Type>, ...Sort<Type>[], ComparatorOptions]): (a: Type, b: Type) => number;
export declare function createSortFn<Type extends object>(...params: [Sort<Type>, ...Sort<Type>[]]): (a: Type, b: Type) => number;
type NoSpecialChars<Key extends string | undefined> = Key extends `-${string}` | `${string}.${string}` ? never : `${Key}`;
type Path<Object, Leaf, Index extends string = string> = Object extends object ? {
    [Key in keyof Object]: Key extends Index ? Object[Key] extends Leaf ? NoSpecialChars<Key> : Object[Key] extends unknown[] ? `${Key}.${Path<Object[Key], Leaf, TupleIndex<Object[Key]>> | 'length'}` : Object[Key] extends object ? `${Key}.${Path<Object[Key], Leaf>}` : never : never;
}[keyof Object & Index] : never;
type TupleIndex<Tuple extends unknown[]> = Exclude<keyof Tuple, keyof unknown[]> & string;
type TypeAtPath<Object, Path extends string> = Path extends `${infer Key}.${infer Rest}` ? Key extends keyof Object ? TypeAtPath<Object[Key], Rest> : never : Path extends keyof Object ? Object[Path] : never;
type Nullishable<Type> = Type | null | undefined;
type SortablePath<Type> = Path<Type, Nullishable<number>> | Path<Type, Nullishable<bigint>> | Path<Type, Nullishable<Date>> | Path<Type, Nullishable<string>> | Path<Type, Nullishable<boolean>>;
type AscOption<Type> = SortablePath<Type>;
type DescOption<Type> = `-${SortablePath<Type>}`;
type SortOption<Type> = AscOption<Type> | DescOption<Type>;
type Collator = {
    compare: (x: string, y: string) => number;
};
export {};
//# sourceMappingURL=index.d.ts.map