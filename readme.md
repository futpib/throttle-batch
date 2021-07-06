# throttle-batch

> Throttle, but do not discard calls, instead batch them and run all at once

## Example

```js
import throttleBatch from 'throttle-batch';

const f = throttleBatch(numbers => console.log(numbers), 100);

f(0);
// → [0]

f(1);
f(2);
f(3);

// After 100ms:
// → [1, 2, 3]
```

## Install

```
yarn add throttle-batch
```
