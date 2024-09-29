import { compareFn } from './index';

describe('compareFn - compare by path', () => {
    it('should compare by specified property', () => {
        const users = [
            { name: 'Alice', id: 4, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'David', id: 1, admin: false },
        ];

        users.sort(compareFn('id'));
        expect(users).toEqual([
            { name: 'David', id: 1, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Alice', id: 4, admin: true },
        ]);

        users.sort(compareFn('admin'));
        expect(users).toEqual([
            { name: 'David', id: 1, admin: false },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'Alice', id: 4, admin: true },
        ]);

        users.sort(compareFn('name'));
        expect(users).toEqual([
            { name: 'Alice', id: 4, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'David', id: 1, admin: false },
        ]);
    });

    it('should compare by specified property in reverse order', () => {
        const users = [
            { name: 'Alice', id: 4, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'David', id: 1, admin: false },
        ];

        users.sort(compareFn('-id'));
        expect(users).toEqual([
            { name: 'Alice', id: 4, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'David', id: 1, admin: false },
        ]);

        users.sort(compareFn('-admin'));
        expect(users).toEqual([
            { name: 'Alice', id: 4, admin: true },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'David', id: 1, admin: false },
        ]);

        users.sort(compareFn('-name'));
        expect(users).toEqual([
            { name: 'David', id: 1, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Alice', id: 4, admin: true },
        ]);
    });

    it('should compare by nested property', () => {
        const users = [
            { name: 'Alice', address: { city: 'Zagreb' } },
            { name: 'Bob', address: { city: 'Yerevan' } },
            { name: 'Charlie', address: { city: 'Xalapa' } },
            { name: 'David', address: { city: 'Wellington' } },
        ];

        users.sort(compareFn('address.city'));
        expect(users).toEqual([
            { name: 'David', address: { city: 'Wellington' } },
            { name: 'Charlie', address: { city: 'Xalapa' } },
            { name: 'Bob', address: { city: 'Yerevan' } },
            { name: 'Alice', address: { city: 'Zagreb' } },
        ]);
    });

    it('should compare by tuple element', () => {
        const users: {
            name: string;
            emails: [string, string];
        }[] = [
            { name: 'Alice', emails: ['alice@ltd.test', 'xoxo-aly@mail.test'] },
            { name: 'Bob', emails: ['robert@ltd.test', 'bob@mail.test'] },
            { name: 'Charlie', emails: ['charles@ltd.test', 'chuck@m.test'] },
        ];

        users.sort(compareFn('emails.0'));
        expect(users).toEqual([
            { name: 'Alice', emails: ['alice@ltd.test', 'xoxo-aly@mail.test'] },
            { name: 'Charlie', emails: ['charles@ltd.test', 'chuck@m.test'] },
            { name: 'Bob', emails: ['robert@ltd.test', 'bob@mail.test'] },
        ]);

        users.sort(compareFn('emails.1'));
        expect(users).toEqual([
            { name: 'Bob', emails: ['robert@ltd.test', 'bob@mail.test'] },
            { name: 'Charlie', emails: ['charles@ltd.test', 'chuck@m.test'] },
            { name: 'Alice', emails: ['alice@ltd.test', 'xoxo-aly@mail.test'] },
        ]);
    });

    it('should compare by tuple nested property', () => {
        type Position = { company: string; years: number };
        const candidates: { positions: [Position, ...Position[]] }[] = [
            { positions: [{ company: 'Amazon', years: 5 }] },
            { positions: [{ company: 'Google', years: 2 }] },
            { positions: [{ company: 'Facebook', years: 3 }] },
        ];

        candidates.sort(compareFn('positions.0.years'));
        expect(candidates).toEqual([
            { positions: [{ company: 'Google', years: 2 }] },
            { positions: [{ company: 'Facebook', years: 3 }] },
            { positions: [{ company: 'Amazon', years: 5 }] },
        ]);

        candidates.sort(compareFn('positions.0.company'));
        expect(candidates).toEqual([
            { positions: [{ company: 'Amazon', years: 5 }] },
            { positions: [{ company: 'Facebook', years: 3 }] },
            { positions: [{ company: 'Google', years: 2 }] },
        ]);
    });

    it('should compare by array length', () => {
        const pets = [
            { name: 'Cat', favorites: [] },
            { name: 'Dog', favorites: ['banana', 'bread', 'cheese'] },
            { name: 'Fish', favorites: ['krill'] },
            { name: 'Hamster', favorites: ['grapes', 'broccoli'] },
        ];

        pets.sort(compareFn('favorites.length'));
        expect(pets).toEqual([
            { name: 'Cat', favorites: [] },
            { name: 'Fish', favorites: ['krill'] },
            { name: 'Hamster', favorites: ['grapes', 'broccoli'] },
            { name: 'Dog', favorites: ['banana', 'bread', 'cheese'] },
        ]);
    });

    it('should handle nested optional properties', () => {
        const users = [
            { name: 'Alice' },
            { name: 'Bob', address: { city: 'Zagreb' } },
            { name: 'Charlie', address: { city: 'Yerevan' } },
            { name: 'David', address: { city: 'Xalapa' } },
        ];

        users.sort(compareFn('address.city'));
        expect(users).toEqual([
            { name: 'David', address: { city: 'Xalapa' } },
            { name: 'Charlie', address: { city: 'Yerevan' } },
            { name: 'Bob', address: { city: 'Zagreb' } },
            { name: 'Alice' },
        ]);
    });
});

describe('compareFn - compare by path config', () => {
    it('should compare by specified property and order', () => {
        const users = [
            { name: 'Alice', id: 4 },
            { name: 'Bob', id: 3 },
            { name: 'Charlie', id: 2 },
            { name: 'David', id: 1 },
        ];

        users.sort(compareFn({ path: 'id' }));
        expect(users).toEqual([
            { name: 'David', id: 1 },
            { name: 'Charlie', id: 2 },
            { name: 'Bob', id: 3 },
            { name: 'Alice', id: 4 },
        ]);

        users.sort(compareFn({ path: 'id', order: 'desc' }));
        expect(users).toEqual([
            { name: 'Alice', id: 4 },
            { name: 'Bob', id: 3 },
            { name: 'Charlie', id: 2 },
            { name: 'David', id: 1 },
        ]);
    });
});

describe('compareFn - compare by getter', () => {
    it('should compare by getter function', () => {
        const users = [
            { name: 'Alice', birthday: '1990-12-01' },
            { name: 'Bob', birthday: 20995200000 }, // 1970-09-01
            { name: 'Charlie', birthday: '1980-10-01' },
            { name: 'David', birthday: new Date('2000-01-01') },
        ];

        const getAge = (birthday: Date | string | number) =>
            Math.floor(
                (Date.now() - new Date(birthday).getTime()) /
                    (1000 * 60 * 60 * 24 * 365.25)
            );

        users.sort(compareFn((user) => getAge(user.birthday)));
        expect(users).toEqual([
            { name: 'David', birthday: new Date('2000-01-01') },
            { name: 'Alice', birthday: '1990-12-01' },
            { name: 'Charlie', birthday: '1980-10-01' },
            { name: 'Bob', birthday: 20995200000 },
        ]);
    });

    it('should compare by getter config and order', () => {
        const users = [
            { name: 'Alice', birthday: '1990-12-01' },
            { name: 'Bob', birthday: 20995200000 }, // 1970-09-01
            { name: 'Charlie', birthday: '1980-10-01' },
            { name: 'David', birthday: new Date('2000-01-01') },
        ];

        const getAge = (birthday: Date | string | number) =>
            Math.floor(
                (Date.now() - new Date(birthday).getTime()) /
                    (1000 * 60 * 60 * 24 * 365.25)
            );

        users.sort(compareFn({ get: (user) => getAge(user.birthday) }));
        expect(users).toEqual([
            { name: 'David', birthday: new Date('2000-01-01') },
            { name: 'Alice', birthday: '1990-12-01' },
            { name: 'Charlie', birthday: '1980-10-01' },
            { name: 'Bob', birthday: 20995200000 },
        ]);

        users.sort(
            compareFn({
                get: (user) => getAge(user.birthday),
                order: 'desc',
            })
        );
        expect(users).toEqual([
            { name: 'Bob', birthday: 20995200000 },
            { name: 'Charlie', birthday: '1980-10-01' },
            { name: 'Alice', birthday: '1990-12-01' },
            { name: 'David', birthday: new Date('2000-01-01') },
        ]);
    });
});

describe('compareFn - secondary sorting', () => {
    it('should compare by multiple properties', () => {
        const users = [
            { name: 'Alice', id: 4, admin: true },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'David', id: 1, admin: false },
        ];

        users.sort(compareFn('admin', 'id'));
        expect(users).toEqual([
            { name: 'David', id: 1, admin: false },
            { name: 'Bob', id: 3, admin: false },
            { name: 'Charlie', id: 2, admin: true },
            { name: 'Alice', id: 4, admin: true },
        ]);
    });

    it('should allow mixing paths and getters', () => {
        const users = [
            { id: 1, name: 'Bob', surname: 'Smith', age: 20 },
            { id: 2, name: 'Bob', surname: 'J. Jones', age: 50 },
            { id: 3, name: 'Bob J.', surname: 'Jones', age: 30 },
            { id: 4, name: 'Bob', surname: 'Black', age: 40 },
        ];

        users.sort(
            compareFn(
                { get: ({ name, surname }) => `${name} ${surname}` },
                'age'
            )
        );
        expect(users).toEqual([
            { id: 4, name: 'Bob', surname: 'Black', age: 40 },
            { id: 3, name: 'Bob J.', surname: 'Jones', age: 30 },
            { id: 2, name: 'Bob', surname: 'J. Jones', age: 50 },
            { id: 1, name: 'Bob', surname: 'Smith', age: 20 },
        ]);
    });
});

describe('compareFn - options', () => {
    it('should use custom locale if provided', () => {
        const users = [
            { name: 'Zlice', id: 1 },
            { name: 'Alice', id: 2 },
            { name: 'Ålice', id: 3 },
        ];

        users.sort(compareFn('name', { locale: 'sv' }));
        expect(users).toEqual([
            { name: 'Alice', id: 2 },
            { name: 'Zlice', id: 1 },
            { name: 'Ålice', id: 3 },
        ]);

        users.sort(compareFn('name'));
        expect(users).toEqual([
            { name: 'Alice', id: 2 },
            { name: 'Ålice', id: 3 },
            { name: 'Zlice', id: 1 },
        ]);

        users.sort(compareFn({ path: 'name', order: -1, locale: 'sv' }));
        expect(users).toEqual([
            { name: 'Ålice', id: 3 },
            { name: 'Zlice', id: 1 },
            { name: 'Alice', id: 2 },
        ]);
    });

    it('should use custom collator if provided', () => {
        const users = [
            { name: 'Zlice', id: 1 },
            { name: 'Alice', id: 2 },
            { name: 'Ålice', id: 3 },
        ];

        users.sort(compareFn('name', { collator: new Intl.Collator('sv') }));
        expect(users).toEqual([
            { name: 'Alice', id: 2 },
            { name: 'Zlice', id: 1 },
            { name: 'Ålice', id: 3 },
        ]);

        users.sort(compareFn('name'));
        expect(users).toEqual([
            { name: 'Alice', id: 2 },
            { name: 'Ålice', id: 3 },
            { name: 'Zlice', id: 1 },
        ]);

        users.sort(
            compareFn({ path: 'name', collator: new Intl.Collator('sv') })
        );
        expect(users).toEqual([
            { name: 'Alice', id: 2 },
            { name: 'Zlice', id: 1 },
            { name: 'Ålice', id: 3 },
        ]);
    });

    it('should use custom default number and string values', () => {
        const users = [
            { name: 'Alice Jones', id: 2 },
            { name: 'Bob' },
            { id: 3 },
        ];

        users.sort(compareFn('id', { defaultValue: 4 }));
        expect(users).toEqual([
            { name: 'Alice Jones', id: 2 },
            { id: 3 },
            { name: 'Bob' },
        ]);

        users.sort(compareFn('name', { defaultValue: 'Aaron' }));
        expect(users).toEqual([
            { id: 3 },
            { name: 'Alice Jones', id: 2 },
            { name: 'Bob' },
        ]);

        users.sort(compareFn({ path: 'id', defaultValue: 4 }));
        expect(users).toEqual([
            { name: 'Alice Jones', id: 2 },
            { id: 3 },
            { name: 'Bob' },
        ]);

        users.sort(compareFn({ path: 'name', defaultValue: 'Aaron' }));
        expect(users).toEqual([
            { id: 3 },
            { name: 'Alice Jones', id: 2 },
            { name: 'Bob' },
        ]);
    });
});
