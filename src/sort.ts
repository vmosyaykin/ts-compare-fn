type SortablePortion<Type> = Pick<
    Type,
    Extract<
        keyof Type,
        keyof {
            [Property in keyof Type as Type[Property] extends
                | number
                | (string | void)
                | boolean
                ? Property extends `-${string}`
                    ? never
                    : Property
                : never]: true;
        }
    >
>;

type SortableField<Type> = keyof SortablePortion<Type> & string;
type AscSortOption<Type> = SortableField<Type>;
type DescSortOption<Type> = `-${SortableField<Type>}`;
type SortOption<Type> = AscSortOption<Type> | DescSortOption<Type>;

const isAscSortOption = <Type>(
    sortOption: SortOption<Type>
): sortOption is AscSortOption<Type> => !sortOption.startsWith('-');

export function createSortFn<Type>(
    ...sortOrder: Array<SortOption<Type>>
): (a: Type, b: Type) => 0 | 1 | -1 {
    return (a, b) => {
        for (const sortOption of sortOrder) {
            const greaterReturnValue = isAscSortOption<Type>(sortOption)
                ? 1
                : -1;
            const lessReturnValue = isAscSortOption<Type>(sortOption) ? -1 : 1;
            const field = isAscSortOption<Type>(sortOption)
                ? sortOption
                : (sortOption.substring(1) as AscSortOption<Type>);

            const aFieldValue = a[field];
            const bFieldValue = b[field];

            if (aFieldValue === bFieldValue) {
                continue;
            }

            const fieldType =
                aFieldValue === undefined || aFieldValue === null
                    ? typeof bFieldValue
                    : typeof aFieldValue;

            switch (fieldType) {
                case 'boolean':
                    if (aFieldValue && !bFieldValue) {
                        return greaterReturnValue;
                    }

                    if (!aFieldValue && bFieldValue) {
                        return lessReturnValue;
                    }
                    break;
                case 'number':
                    if (
                        Math.abs(
                            ((aFieldValue as unknown as number) || 0) -
                                ((bFieldValue as unknown as number) || 0)
                        ) < Number.EPSILON
                    ) {
                        continue;
                    }

                    if (aFieldValue > bFieldValue) {
                        return greaterReturnValue;
                    }

                    if (aFieldValue < bFieldValue) {
                        return lessReturnValue;
                    }
                    break;
                case 'string':
                case 'undefined':
                    const compareResult = compareStrings(
                        aFieldValue as unknown as string,
                        bFieldValue as unknown as string
                    );
                    if (compareResult === 1) {
                        return greaterReturnValue;
                    }
                    if (compareResult === -1) {
                        return lessReturnValue;
                    }
                    break;
            }
        }

        return 0;
    };
}

export function compareStrings(a?: string, b?: string): 0 | 1 | -1 {
    const aNormalized = (a || '').toLowerCase().normalize('NFD');
    const bNormalized = (b || '').toLowerCase().normalize('NFD');

    if (aNormalized > bNormalized) return 1;
    if (aNormalized < bNormalized) return -1;
    return 0;
}
