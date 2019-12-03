# Dockerize a Feathers application

A Feathers application can be [dockerized like any other Node.js application](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/).

## Create an app

```sh
$ mkdir feathers-app
$ cd feathers-app/
$ feathers generate app
```

## Set the host

Ensure the web app listen to all network (i.e. outside the container) by setting the host to '0.0.0.0' in api/config/default.json:

```
{
  "host": "0.0.0.0",
  "port": 3030,
  "public": "../public/",
  "paginate": {
    "default": 10,
    "max": 50
  },
  ...
```

### Dockerfile

Add the following `Dockerfile` to the project directory:

```
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3030

CMD ["npm", "run", "start"]
```

## Build the image

```sh
$ docker build -t my-feathers-image .
```

## Start the container

```sh
$ docker run -d -p 3030:3030 --name my-feathers-container my-feathers-image 
```
