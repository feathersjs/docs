# OAuth Authentication

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-oauth.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-oauth)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication-oauth/CHANGELOG.md)

## Configuration

## Express oAuth

## Account linking

## OAuthStrategy

### getProfile(data, params)

Returns the oAuth profile for the oAuth callback data.

### getCurrentEntity(params)

Returns the currently linked entity for the given `params`. It will either use the entity from `params.authentication` or return `null`.

### findEntity(profile, params)

Find an entity for a given oAuth profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### createEntity(profile, params)

Create a new entity for the given oAuth profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### updateEntity(entity, profile, params)

Update an existing entity with the given profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### authenticate(authentication, params)

## Customizing the strategy
