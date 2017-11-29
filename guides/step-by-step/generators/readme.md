# Generators

We've been writing code "by hand" in order to understand how basic Feathers works.
We will now start using Feathers generators since we have the background to understand what they produce.

## Generators help eliminate boilerplate.

We've seen that Feathers, even when coded "by hand",
eliminates the majority of the boilerplate typically in a CRUD project.
Generators will eliminate even more.

> **Generators.**
Feathers generators produce very little code because Feathers is so succinct.
You can easily understand the generated code because its no different from what we've been
coding "by hand" so far.
Some other frameworks make things “seem” easy by generating thousands of lines of code for you
and, in the process, making it almost impossible to implement anything not supported out of the box
by their generators.

### Generators structure your app.

The generated modules are structured as recommended by the Feathers team.

### Generators handle database specifics.

The generators will generate code for different databases
so you don't have to investigate how to do so.

## Install the generators

You can install the Feathers generators with

`npm install -g feathers-cli`

## What's next?

Now that we installed the Feathers command line tool we can [generate the application](./gen-app.md).
