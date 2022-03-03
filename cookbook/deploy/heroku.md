# Deploying to Heroku

A Feathers application can be deployed to Heroku like any other Node.js application

## Create an app

```sh
mkdir feathers-app
cd feathers-app/
feathers generate app
```

### Pick your deployment method

On Heroku you'll want to create a new app. Once you've done that you'll be taken to the "Deploy" tab. Pick your deployment method and follow the instructions. Heroku has made this process very straightforward.

### Connecting to Postgres DB

Some recent updates to the `pg` npm package have made connecting to a Postgres DB with feathers slightly more difficult, but not impossible.

After setting up the Postgres DB in your Heroku Dashboard, you might run into an issue with the app throwing a 'Self signed certificate" error.

To fixe it, the connection object that gets passed to `knex` needs to look like the following:

```
{ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
```

I use Objection with Knex to connect, so in my objection.js file I have this if statement after grabbing the postgres connection:

```
if(process.env.NODE_ENV === 'production') {
  connection = { connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } }
}
```
