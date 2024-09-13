import { compareStrings } from './sort';

test('compareStrings should correctly case-insensitively compare two strings', () => {
    expect(compareStrings('abc', 'abc')).toBe(0);
    expect(compareStrings('abc', 'ABC')).toBe(0);

    expect(compareStrings('abc', 'xyz')).toBeLessThan(0);
    expect(compareStrings('xyz', 'abc')).toBeGreaterThan(0);
});

test('compareStrings should correctly handle unicode characters', () => {
    expect(compareStrings('ё', 'е')).toBeGreaterThan(0);
    expect(compareStrings('ё', 'ж')).toBeLessThan(0);

    expect(compareStrings('o', 'ô')).toBeLessThan(0);
    expect(compareStrings('p', 'ô')).toBeGreaterThan(0);
});
