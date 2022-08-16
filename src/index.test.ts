import type { TestInterface } from 'ava';
import anyTest from 'ava';
import sinon from 'sinon';

import throttleBatch from '.';

const test = anyTest as TestInterface<{
	clock: sinon.SinonFakeTimers;
}>;

test.beforeEach(t => {
	const clock = sinon.useFakeTimers();

	Object.assign(t.context, {
		clock,
	});
});

test.afterEach(t => {
	t.context.clock.restore();
});

test.serial('one batch', async t => {
	const { clock } = t.context;

	const spy = sinon.spy();

	const f = throttleBatch<[number]>((xs: number[]) => {
		spy(xs);
	});

	f(1);
	t.true(spy.calledOnceWith([ 1 ]));
	f(2);
	f(3);
	f(4);
	t.true(spy.calledOnce);

	clock.tick(1);

	t.true(spy.calledTwice);
	t.deepEqual(spy.secondCall.firstArg, [ 2, 3, 4 ]);
});

test.serial('two batches', async t => {
	const { clock } = t.context;

	const spy = sinon.spy();

	const f = throttleBatch<[number]>(spy, 10);

	f(1);

	t.true(spy.calledOnce);

	f(2);
	f(3);

	t.true(spy.calledOnce);

	clock.tick(9);

	t.true(spy.calledOnce);

	clock.tick(1);

	t.true(spy.calledTwice);
	t.deepEqual(spy.secondCall.firstArg, [ 2, 3 ]);

	f(4);
	f(5);

	clock.tick(9);

	t.true(spy.calledTwice);

	clock.tick(1);

	t.true(spy.calledThrice);
});

test.serial('regular calls', async t => {
	const { clock } = t.context;

	const spy = sinon.spy();

	const f = throttleBatch<[number]>(spy, 2);

	for (const i of Array.from({ length: 8 }).fill(undefined).map((_, i) => i)) {
		f(i);
		clock.tick(1);
	}

	clock.tick(1);

	t.is(spy.callCount, 4);
	t.deepEqual(spy.firstCall.firstArg, [ 0 ]);
	t.deepEqual(spy.secondCall.firstArg, [ 1, 2, 3 ]);
	t.deepEqual(spy.thirdCall.firstArg, [ 4, 5, 6 ]);
	t.deepEqual(spy.lastCall.firstArg, [ 7 ]);
});
