# OAuth Authentication

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-oauth.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-oauth)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication-oauth/CHANGELOG.md)

```
$ npm install @feathersjs/authentication-oauth --save
```

`@feathersjs/authentication-oauth` allows to authenticate with over 180 oAuth providers (Google, Facebook, GitHub etc.) using [grant](https://github.com/simov/grant), an oAuth middleware module for NodeJS.

## Configuration

The following settings are available:

- `redirect`: The URL of the frontend to redirect to with the access token (or error message). The [authentication client](./client.md) handles those redirects automatically. If not set, the authentication result will be sent as JSON instead.
- `defaults`: Default [grant configuration](https://github.com/simov/grant#configuration) used for all strategies
- `<strategy-name>` (e.g. `twitter`): The [grant configuration](https://github.com/simov/grant#configuration) used for a specific strategy.
- For both `defaults` and specific strategies, the following options are set automatically and normally do not need to be customized:
  - `host`: Set to `host` from the configuration
  - `protocol`: `http` for development, `https` for production (when `NODE_ENV=production`)
  - `transport`: Set to `session`, see [grant response data](https://github.com/simov/grant#response-data)

> __Pro tip:__ Removing the `redirect` setting is a good way to troubleshoot oAuth authentication errors.

Standard oAuth authentication can be configured with those options in `config/default.json` like this:

```json
{
  "authentication": {
    "oauth": {
      "redirect": "/frontend",
      "google": {
        "key": "...",
        "secret": "...",
        "custom_params": {"access_type": "offline"}
      },
      "twitter": {
        "key": "...",
        "secret": "..."
      }
    }
  }
}
```

> __Note:__ All oAuth strategies will by default always look for configuration under `authentication.oauth.<name>`. If `authentication.oauth` is not set in the configuration, oAuth authentication will be disabled.

## Flow

There are two ways to initiate oAuth authentication:

1) Through the browser (most common)
    - User clicks on link to oAuth URL (`oauth/connect/<provider>`)
    - Gets redirected to provider and authorizes the application
    - Callback to the [OauthStrategy](#oauthstrategy) which
        - Gets the users profile
        - Finds or creates the entity for that profile
    - Create an access token for the entity (see [AuthenticationService](./service.md))
    - Redirect to the `redirect` URL including the generated access token
    - The frontend (e.g. [authentication client](./client.md)) uses the returned access token to authenticate the entity

2) With an existing access token, e.g. obtained through the Facebook mobile SDK
    - Authenticate normally with `{ strategy: '<name>', access_token: 'oauth access token' }`
    - Calls the [OauthStrategy](#oauthstrategy) which
        - Gets the users profile
        - Finds or creates the entity for that profile
    - Returns the authentication result


## Setup (Express)

- `authService`: The name of the authentication service
- `linkStrategy` (default: `'jwt'`): The name of the strategy to use for account linking
- `expressSession` (default: `require('express-session')()`): The [Express session](https://github.com/expressjs/session) middleware to use. Uses in-memory sessions by default but may need to be customized to a persistent storage when using multiple instances of the application.

## URLs, redirects, linking

- `http(s)://<host>/oauth/connect/<provider>` to initiate the oAuth flow
- `http(s)://<host>/oauth/connect/<provider>/callback` as the callback path that should be set in the oAuth application settings
- `http(s)://<host>/oauth/connect/<provider>/authenticate` as the internal redirect

```html
<a href="/oauth/connect/github">Login with GitHub</a>
```

To link an existing account, you can add the current access token to the oAuth flow query using the `feathers_token` query parameter:

```html
<a href="/oauth/connect/github?feathers_token=<your access token>">
  Login with GitHub
</a>
```

## OAuthStrategy

### entityId

`oauthStrategy.entityId -> string` returns the name of the id property of the entity.

### getEntityQuery(profile, params)

`oauthStrategy.getEntityQuery(profile, params) -> Promise` returns the entity lookup query to find the entity for a profile. By default returns

```js
{
  [`${this.name}Id`]: profile.sub || profile.id
}
```

### getEntityData(profile, entity, params)

`oauthStrategy.getEntityData(profile, existing, params) -> Promise`  returns the data to either create a new or update an existing entity. `entity` is either the existing entity or `null` when creating a new entity.

### getProfile(data, params)

`oauthStrategy.getProfile(data, params) -> Promise` returns the user profile information from the oAuth provider that was used for the login. `data` is the oAuth callback information which normally contains e.g. the oAuth access token.

### getRedirect (data)

`oauthStrategy.getRedirect(data) -> Promise` returns the URL to redirect to after a successful oAuth login and entity lookup or creation. By default it redirects to `authentication.oauth.redirect` from the configuration with `#access_token=<access token for entity>` added to the end of the URL. The `access_token` hash is e.g. used by the [authentication client](./client.md) to log the user in after a successful oAuth login. The default redirects do work cross domain.

### getCurrentEntity(params)

`oauthStrategy.getCurrentEntity(params) -> Promise` returns the currently linked entity for the given `params`. It will either use the entity authenticated by `params.authentication` or return `null`.

### findEntity(profile, params)

`oauthStrategy.findEntity(profile, params) -> Promise` finds an entity for a given oAuth profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### createEntity(profile, params)

Create a new entity for the given oAuth profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### updateEntity(entity, profile, params)

Update an existing entity with the given profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### authenticate(authentication, params)

## Customizing the strategy
