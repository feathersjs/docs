# Quick Start

You can quickly scaffold your first real-time API by following these few simple steps:

Install Yeoman and the Feathers generator.

> `npm install -g yo generator-feathers`

Create a directory for your new app.

> `mkdir my-new-app; cd my-new-app/`

Generate your app and follow the prompts.

`yo feathers`

Start your brand new app! 💥

`npm start`

---

> **ProTip:** Based on the database you chose you may have to start the database before you run `npm start` otherwise you will get a connection error.

## What's next?

In just a couple minutes we created a real-time API that is accessible via REST and websockets! Based on the options you chose it connected to your database, already provides CORs, authentication, sane rate limiting, pagination, logging, error handling, and a few other goodies.

This is a great start! Let's take this a bit further and [build your first real application](your-first-app/readme.md).
