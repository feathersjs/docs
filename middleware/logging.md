# Logging

Just like Express, Feathers does not include a logger. It's left up to you how you want to log things and which logger you want to use. However, a Feathers app created using the generator comes with a basic one that uses [winston](https://github.com/winstonjs/winston) underneath.

A couple other options are [bunyan](https://github.com/trentm/node-bunyan) and [morgan](https://github.com/expressjs/morgan).

For production it is recommended that you use an error reporting service. [Sentry](https://getsentry.com/) is an amazing one and has a [simple Express middleware](https://getsentry.com/for/express/) that you can easily drop in to your Feathers app.

---
> **ProTip:** Because Feathers extends Express you can use any Express compatible logging middleware with Feathers.
---
