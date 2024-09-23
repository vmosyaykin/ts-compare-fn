/*!
 * ts-compare-fn v0.0.0
 * (c) Vladimir Mosyaykin
 * Released under the MIT License.
 */

function createSortFn(...params) {
    const defaultLocale = 'en-u-co-eor-kn';
    let options = params[params.length - 1];
    if (!options || !isComparatorOptions(options)) {
        options = {};
    }
    if (!options.collator) {
        options.collator = new Intl.Collator(options.locale ?? defaultLocale);
    }
    const comparators = [];
    for (const param of params) {
        if (isSortOption(param)) {
            comparators.push({
                dir: isAscOption(param) ? 1 : -1,
                path: isAscOption(param)
                    ? param
                    : param.substring(1),
                ...options,
            });
        }
        if (isSortConfig(param)) {
            if (param.locale && !param.collator) {
                param.collator = new Intl.Collator(param.locale);
            }
            comparators.push({
                dir: param.direction === 'desc' || param.direction === -1
                    ? -1
                    : 1,
                ...options,
                ...param,
            });
        }
    }
    return (aObject, bObject) => {
        for (const comparator of comparators) {
            const { dir, path, collator, defaultNumber, defaultString, transform, } = comparator;
            let a = getByPath(aObject, path);
            let b = getByPath(bObject, path);
            if (transform) {
                a = transform(a);
                b = transform(b);
            }
            if (a === null)
                a = undefined;
            if (b === null)
                b = undefined;
            if (Object.is(a, b))
                continue;
            if (typeof a !== typeof b &&
                a instanceof Date !== b instanceof Date &&
                a !== undefined &&
                b !== undefined) {
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
            if (a === undefined)
                return dir;
            if (b === undefined)
                return -dir;
            if ((typeof a === 'number' && typeof b === 'number') ||
                (typeof a === 'bigint' && typeof b === 'bigint') ||
                (a instanceof Date && b instanceof Date)) {
                if (Number.isNaN(a))
                    return dir;
                if (Number.isNaN(b))
                    return -dir;
                if (a > b)
                    return dir;
                if (a < b)
                    return -dir;
                continue;
            }
            if (typeof a === 'string' && typeof b === 'string') {
                const compareResult = collator.compare(a, b);
                if (compareResult)
                    return dir * compareResult;
                continue;
            }
            if (typeof a === 'boolean' && typeof b === 'boolean') {
                return a ? dir : -dir;
            }
        }
        return 0;
    };
}
function isAscOption(sortPath) {
    return !sortPath.startsWith('-');
}
function isSortOption(sort) {
    return typeof sort === 'string';
}
function isSortConfig(sort) {
    return typeof sort === 'object' && 'path' in sort;
}
function isComparatorOptions(sort) {
    return typeof sort === 'object' && !('path' in sort);
}
function getByPath(obj, path) {
    const parts = path.split('.');
    let result = obj;
    for (const part of parts) {
        if (typeof result !== 'object' || result === null) {
            throw new Error(`Invalid path: ${path}`);
        }
        result = result[part];
    }
    return result;
}

export { createSortFn };
//# sourceMappingURL=index.mjs.map
