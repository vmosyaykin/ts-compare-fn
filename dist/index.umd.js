/*!
 * ts-compare-fn v1.0.2
 * (c) Vladimir Mosyaykin
 * Released under the MIT License.
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tsCompareFn = {}));
})(this, (function (exports) { 'use strict';

    function compareFn(...params) {
        const defaultLocale = 'en-u-co-eor-kn';
        let options = params[params.length - 1];
        if (!options || !isLocaleOptions(options)) {
            options = {};
        }
        const resolvedOptions = {
            ...(options && isLocaleOptions(options) ? options : {}),
            collator: options.collator ??
                new Intl.Collator(options.locale ?? defaultLocale),
        };
        const comparators = [];
        for (const param of params) {
            if (isSortOption(param)) {
                const isAscPath = isAscOption(param);
                comparators.push({
                    dir: isAscPath ? 1 : -1,
                    path: isAscPath
                        ? param
                        : param.substring(1),
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
                    dir: param.order === 'desc' || param.order === -1
                        ? -1
                        : isAscPath
                            ? 1
                            : -1,
                    ...resolvedOptions,
                    ...param,
                    path: (isAscPath
                        ? param.path
                        : param.path.substring(1)),
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
                const instanceOfDate = a instanceof Date || b instanceof Date;
                if (defaultValue !== undefined &&
                    defaultValue !== null &&
                    type === typeof defaultValue &&
                    instanceOfDate === defaultValue instanceof Date) {
                    a = a ?? defaultValue;
                    b = b ?? defaultValue;
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
    function isGetter(sort) {
        return typeof sort === 'function';
    }
    function isSortPathConfig(sort) {
        return typeof sort === 'object' && 'path' in sort;
    }
    function isSortGetterConfig(sort) {
        return typeof sort === 'object' && 'get' in sort;
    }
    function isLocaleOptions(sort) {
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

    exports.compareFn = compareFn;

}));
//# sourceMappingURL=index.umd.js.map
