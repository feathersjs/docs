# Seeding Services

It is common to populate the database with mock data while
developing and testing applications. This process is known
as *seeding*, and the
[`feathers-seeder`](https://github.com/thosakwe/feathers-seeder)
plugin makes this easy. `feathers-seeder` seeds your *services*,
so you can seed any database in the exact same way.

First, install the plugin.

```
$ npm install --save feathers-seeder
```

Next, modify your `src/app.js` to look somewhat like this:

```js
const feathers = require('feathers');
const seeder = require('feathers-seeder');
const seederConfig = require('./seeder-config');

const app = feathers();

app
  .configure(seeder(seederConfig));

module.exports = app;
```

Create a `src/seeder-config.js` file:

```js
module.exports = {
  services: [
    {
      path: 'users',
      template: {
        name: '{{name.firstName}} {{name.lastName}}',
        password: '{{internet.password}}'
      }
    }
  ]
};
```

Lastly, in your `src/server.js`:

```js
app.seed().then(() => {
  const server = app.listen(app.get('port'));
  // ...
}).catch(err => {
  // ...
});
```

`feathers-seeder` expects your configuration object to have
a `services` array, where you can provide a template (which
will be filled by
[@marak/Faker.js](https://github.com/marak/Faker.js/)) that
will be inserted into your service.

The configuration options are described in depth
[here](https://github.com/thosakwe/feathers-seeder#configuration).

# Seeding Nested Services

A common scenario is having a service that relies directly on another
service. `feathers-seeder` allows you to include a `callback` function
inside your configuration, so that you can interact with the instances
you create.

For example, if you had a service called `apartments`, and another
called `apartments/:apartmentId/tenants`:

```js
export default const seederConfig = {
  services: [
    {
      count: 25, // Create 25 apartments
      path: 'apartments',
      template: {
        city: '{{address.city}}',
        zip: '{{address.zipCode}}'
      },

      callback(apartment, seed) {
        // Create 10 tenants for each apartment
        return seed({
          count: 10,
          path: 'apartments/:apartmentId/tenants',
          template: {
            name: '{{name.firstName}} {{name.lastName}}',
            email: '{{internet.email}}'
          },
          params: {
            apartmentId: apartment._id
          }
        });
      }

    }
  ]
};
```

Keep in mind, your callback function *must* return a `Promise`.

Again, all configuration options are listed
[here](https://github.com/thosakwe/feathers-seeder#configuration).
Happy seeding!
