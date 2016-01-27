# Bundled Hooks

When it makes sense to do so, some plugins include their own hooks. The following plugins come bundled with useful hooks:

- `feathers-hooks` (see below)
- [`feathers-mongoose`](/databases/mongoose.md)
- [`feathers-authentication`](/authorization/bundled-hooks.md)


You can import the hooks from a plugin like this:
```js
import {hooks} from 'feathers-hooks';
// Or like this
import {hooks as mongooseHooks} from 'feathers-mongoose';
```
Each hook will then be available at `hooks.hookName()`

## Hooks bundled with `feathers-hooks`

The `feathers-hooks` plugin includes the following hooks.

### `removeFields(fields)`
