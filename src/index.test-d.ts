import { compareFn } from './index';
import { expectAssignable, expectNotAssignable } from 'tsd-lite';

type User = {
    name: string;
    surname?: string;
    id: number;
    balance: bigint;
    birthday: Date;
    loggedIn: boolean;

    '-hidden': string;
    'dot.ted': string;
    unique: symbol;

    phones: { home: string; work: string };
    nicknames: string[];
    emails: [string, ...string[]];
};

type SortParam<Type extends object> = Parameters<typeof compareFn<Type>>[0];

expectAssignable<SortParam<User>>('name');
expectAssignable<SortParam<User>>('id');
expectAssignable<SortParam<User>>('balance');
expectAssignable<SortParam<User>>('birthday');
expectAssignable<SortParam<User>>('loggedIn');

expectAssignable<SortParam<User>>('-name');
expectAssignable<SortParam<User>>('-id');
expectAssignable<SortParam<User>>('-balance');
expectAssignable<SortParam<User>>('-birthday');
expectAssignable<SortParam<User>>('-loggedIn');

expectAssignable<SortParam<User>>('surname');
expectAssignable<SortParam<User>>('-surname');

expectNotAssignable<SortParam<User>>('unique');
expectNotAssignable<SortParam<User>>('-hidden');
expectNotAssignable<SortParam<User>>('dot.ted');
expectNotAssignable<SortParam<User>>('random');

expectAssignable<SortParam<User>>('phones.home');
expectAssignable<SortParam<User>>('phones.work');
expectAssignable<SortParam<User>>('nicknames.length');
expectAssignable<SortParam<User>>('emails.0');

expectNotAssignable<SortParam<User>>('phones');
expectNotAssignable<SortParam<User>>('nicknames');
expectNotAssignable<SortParam<User>>('nicknames.0');
expectNotAssignable<SortParam<User>>('emails.1');
