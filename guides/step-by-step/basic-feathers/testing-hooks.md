# Testing Hooks

## Self contained hooks

Testing hooks that do not depend on services or other hooks is straight forward.
Create a `context` object, call the inner hook function, and check the returned `context`.

Here is part of the mocha test for `disableMultiItemChange`.

```javascript
import { assert } from 'chai';
import { disableMultiItemChange } from '../../src/services';

var hookBefore;

['update', 'patch', 'remove'].forEach(method => {
  describe(`services disableMultiItemChange - ${method}`, () => {
    beforeEach(() => {
      hookBefore = {
        type: 'before',
        method,
        params: { provider: 'rest' },
        data: { first: 'John', last: 'Doe' },
        id: null
      };
    });

    it('allows non null id', () => {
      hookBefore.id = 1;

      const result = disableMultiItemChange()(hookBefore);
      assert.equal(result, undefined);
    });

    it('throws on null id', () => {
      hookBefore.id = null;

      assert.throws(() => { disableMultiItemChange()(hookBefore); });
    });

    it('throws if after hook', () => {
      hookBefore.id = 1;
      hookBefore.type = 'after';

      assert.throws(() => { disableMultiItemChange()(hookBefore); });
    });
  });
});
```

Here is part of the mocha test for `pluck`.

```javascript
import { assert } from 'chai';
import hooks from '../../src/services';

var hookBefore;
var hookAfter;
var hookFindPaginate;
var hookFind;

describe('services pluck', () => {
  describe('plucks fields', () => {
    beforeEach(() => {
      hookBefore = {
        type: 'before',
        method: 'create',
        params: { provider: 'rest' },
        data: { first: 'John', last: 'Doe' } };
      hookAfter = {
        type: 'after',
        method: 'create',
        params: { provider: 'rest' },
        result: { first: 'Jane', last: 'Doe' } };
      hookFindPaginate = {
        type: 'after',
        method: 'find',
        params: { provider: 'rest' },
        result: {
          total: 2,
          data: [
            { first: 'John', last: 'Doe' },
            { first: 'Jane', last: 'Doe' }
          ]
        } };
      hookFind = {
        type: 'after',
        method: 'find',
        params: { provider: 'rest' },
        result: [
          { first: 'John', last: 'Doe' },
          { first: 'Jane', last: 'Doe' }
        ]
      };
    });

    it('updates hook before::create', () => {
      hooks.pluck('last')(hookBefore);
      assert.deepEqual(hookBefore.data, { last: 'Doe' });
    });

    it('updates hook after::find with pagination', () => {
      hooks.pluck('first')(hookFindPaginate);
      assert.deepEqual(hookFindPaginate.result.data, [
        { first: 'John' },
        { first: 'Jane' }
      ]);
    });

    it('updates hook after::find with no pagination', () => {
      hooks.pluck('first')(hookFind);
      assert.deepEqual(hookFind.result, [
        { first: 'John' },
        { first: 'Jane' }
      ]);
    });

    it('updates hook after', () => {
      hooks.pluck('first')(hookAfter);
      assert.deepEqual(hookAfter.result, { first: 'Jane' });
    });

    it('does not update when called internally on server', () => {
      hookAfter.params.provider = '';
      hooks.pluck('last')(hookAfter);
      assert.deepEqual(hookAfter.result, { first: 'Jane', last: 'Doe' });
    });

    it('does not throw if field is missing', () => {
      const hook = {
        type: 'before',
        method: 'create',
        params: { provider: 'rest' },
        data: { first: 'John', last: 'Doe' } };
      hooks.pluck('last', 'xx')(hook);
      assert.deepEqual(hook.data, { last: 'Doe' });
    });

    it('does not throw if field is undefined', () => {
      const hook = {
        type: 'before',
        method: 'create',
        params: { provider: 'rest' },
        data: { first: undefined, last: undefined } };
      hooks.pluck('first')(hook);
      assert.deepEqual(hook.data, {}); // todo note this
    });

    it('does not throw if field is null', () => {
      const hook = {
        type: 'before',
        method: 'create',
        params: { provider: 'rest' },
        data: { first: null, last: null } };
      hooks.pluck('last')(hook);
      assert.deepEqual(hook.data, { last: null });
    });
  });
});
```

## Hooks requiring a Feathers app

Some hooks call services, or they depend on other hooks running.
Its just easiest in such cases to create a Feathers app and a memory-backed service
than to try to mock them out.

Here is part of the mocha test for `stashBefore`.

```javascript
const assert = require('chai').assert;
const feathers = require('feathers');
const memory = require('feathers-memory');
const feathersHooks = require('feathers-hooks');
const { stashBefore } = require('../../src/services');

const startId = 6;
const storeInit = {
  '0': { name: 'Jane Doe', key: 'a', id: 0 },
  '1': { name: 'Jack Doe', key: 'a', id: 1 },
  '2': { name: 'John Doe', key: 'a', id: 2 },
  '3': { name: 'Rick Doe', key: 'b', id: 3 },
  '4': { name: 'Dick Doe', key: 'b', id: 4 },
  '5': { name: 'Dork Doe', key: 'b', id: 5 }
};
let store;
let finalParams;

function services () {
  const app = this;
  app.configure(users);
}

function users () {
  const app = this;
  store = clone(storeInit);

  app.use('users', memory({
    store,
    startId
  }));

  app.service('users').before({
    all: [
      stashBefore(),
      context => {
        finalParams = context.params;
      }
    ]
  });
}

describe('services stash-before', () => {
  let app;
  let users;

  beforeEach(() => {
    finalParams = null;

    app = feathers()
      .configure(feathersHooks())
      .configure(services);

    users = app.service('users');
  });

  ['get', 'update', 'patch', 'remove'].forEach(method => {
    it(`stashes on ${method}`, () => {
      return users[method](0, {})
        .then(() => {
          assert.deepEqual(finalParams.before, storeInit[0]);
        });
    });
  });

  ['create', 'find'].forEach(method => {
    it(`throws on ${method}`, done => {
      users[method]({})
        .then(() => {
          assert(false, 'unexpectedly successful');
          done();
        })
        .catch(() => {
          done();
        });
    });
  });
});

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}
```

 
### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-docs/issues/new?title=Comment:Step-Basic-Testing-Hooks&body=Comment:Step-Basic-Testing-Hooks)
