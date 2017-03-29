# feathers-authentication-management
Sign up verification, forgotten password reset, and other capabilities for local authentication.

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-authentication-management.png?style=social&label=Star)](https://github.com/feathersjs/feathers-authentication-management/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-management.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-management)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-authentication-management/blob/master/CHANGELOG.md)


## Summary

### Multiple communication channels:

Traditionally users have been authenticated using their `username` or `email`.
However that landscape is changing.

Teens are more involved with cellphone SMS, whatsapp, facebook, QQ and wechat then they are with email.
Seniors may not know how to create an email account or check email, but they have smart phones
and perhaps whatsapp or wechat accounts.

A more flexible design would maintain multiple communication channels for a user
-- username, email address, phone number, handles for whatsapp, facebook, QQ, wechat --
which each uniquely identify the user.
The user could then sign in using any of their unique identifiers.
The user could also indicate how they prefer to be contacted.
Some may prefer to get password resets via long tokens sent by email;
others may prefer short numeric tokens sent by SMS or wechat.

`feathers-authentication` and `feathers-authentication-management`
provide much of the infrastructure necessary to implement such a scenario. 

### Capabilities:

- Checking that values for fields like username, email, cellphone are unique within `users` items.
- Hooks for adding a new user.
- Send another sign up verification notification, routing through user's selected transport.
- Process a sign up or identity change verification from a URL response.
- Process a sign up or identity change verification using a short token.
- Send a forgotten password reset notification, routing through user's preferred transport.
- Process a forgotten password reset from a URL response.
- Process a forgotten password reset using a short token.
- Process password change.
- Process an identity change such as a new email addr, or cellphone.

## Details

Refer to [authentication management](../authentication/management.md).