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
type Sort<Type extends object> = SortConfig<Type> | SortPath<Type>;
export declare function createSortFn<Type extends object>(...params: [Sort<Type>, ...Sort<Type>[], ComparatorOptions]): (a: Type, b: Type) => number;
export declare function createSortFn<Type extends object>(...params: [Sort<Type>, ...Sort<Type>[]]): (a: Type, b: Type) => number;
type NoSpecialChars<Key extends string | undefined> = Key extends `-${string}` ? never : `${Key}`;
type Path<Object, Leaf, Index extends string = string> = Object extends object ? {
    [Key in keyof Object]: Key extends Index ? Object[Key] extends Leaf ? NoSpecialChars<Key> : Object[Key] extends unknown[] ? `${Key}.${Path<Object[Key], Leaf, TupleKeys<Object[Key]>> | 'length'}` : Object[Key] extends object ? `${Key}.${Path<Object[Key], Leaf>}` : never : never;
}[keyof Object & Index] : never;
type TupleKeys<T extends unknown[]> = Exclude<keyof T, keyof unknown[]> & string;
type TypeAtPath<Object, Path extends string> = Path extends `${infer Key}.${infer Rest}` ? Key extends keyof Object ? TypeAtPath<Object[Key], Rest> : never : Path extends keyof Object ? Object[Path] : never;
type SortablePath<Type> = Path<Type, SortableValue>;
type AscPath<Type> = SortablePath<Type>;
type DescPath<Type> = `-${SortablePath<Type>}`;
type SortPath<Type> = AscPath<Type> | DescPath<Type>;
type Collator = {
    compare: (x: string, y: string) => number;
};
export {};
//# sourceMappingURL=index.d.ts.map