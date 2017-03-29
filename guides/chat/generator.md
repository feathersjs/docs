# The Feathers CLI

The Feathers command line (also refered to as the Feathers generator) provides a command line interface for generating a new Feathers application, services, hooks and Express middleware.

## What just happened?

The Feathers generator just created a basic setup for our Feathers application. 

- `.package.json`
- `.eslintrc.json` the [ESLint](http://eslint.org/) configuration used to check the applications code styl
- `.gitignore` a standard [gitignore](https://git-scm.com/docs/gitignore) file
- `.npmignore` a standardn [npm ignore](https://docs.npmjs.com/misc/developers) file
- `config/` the configuration files
  - `config/default.json` the default applicatoin configuration
  - `config/default.json` the default applicatoin configuration
- `src/` the application source files
  - `src/index.js`
  - `src/app.js`
  - `src/app.hooks.js`
  - `src/hooks` the folder where all generated [hooks](../api/hooks.md) will be place in
    - `src/hooks/logger` an application hook that does some standard logging
  - `src/middleware`
    - `src/middleware/index.js`
  - `src/services`
    - `src/services/index.js`
