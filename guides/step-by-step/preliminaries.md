# Installing the examples

## Install Node

[Node](https://nodejs.org/en/) is a server platform which runs JavaScript.
Its lightweight and efficient.
It has the largest ecosystem of open source libraries in the world.

- [Default install.](https://nodejs.org/en/)
- [Specfic versions.](https://nodejs.org/en/download/)

## Install git

[git](https://git-scm.com/) is the version control system most frequently used in open source.
There are many resources available for installing it.

- [Linux.](https://www.atlassian.com/git/tutorials/install-git/linux)
- [Mac OSX.](https://www.atlassian.com/git/tutorials/install-git/mac-os-x)
- [Windows.](https://www.atlassian.com/git/tutorials/install-git/windows)

## Install the examples

Linux and Windows:
```text
cd the/folder/above/which/you/want/the/guide/to/reside
git clone https://github.com/feathersjs/feathers-docs
```

> **Alternative install.** If you don't already have git installed on your machine,
you may prefer to download the repository as a zip file.
Point your browser at
`https://github.com/feathersjs/feathers-docs/archive/master.zip`
to start the download.

## Install dependencies
```text
cd ./feathers-docs
npm install
```

## Reading the guide

You can read this guide by pointing your browser to the
[Feathers documentation](https://docs.feathersjs.com/guides/step-by-step/readme.html).
You can also read the guide by serving static files from this repo.

If you do not have a static server already installed, you may install
[http-server](https://www.npmjs.com/package/http-server)
globally with `npm install http-server -g`
and start serving the guide with:
```text
cd feathers-docs
http-server
```

Then point your browser at `http://localhost:8080/_book`.

## Recreating the examples used in the guides

Each guide is divided into sections, each section backed by working examples in `examples/`.
The code samples in the guides are extracts from those examples.
Code snippets may be ambiguous, misleading or confusing.
Working examples reduce these problems,
as well as letting you learn more by modifying them yourself.

One example may continue with changes from a previous example.
In such cases, a recap of the differences between the 2 examples may be shown
to help in understanding the changes.

The guides go into details about how each example was created.
You can recreate the process yourself if that helps your learning process.
Create a folder called, say, `copy-an-introduction` with a subfolder `examples/`.
You can run the same commands as mentioned in the guide
and (hopefully!) get the same results.

## Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Readme&body=Comment:Readme)
