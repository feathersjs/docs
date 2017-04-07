# Add the populate hook

When we obtain a teams record, we want to add the team's users to the team record.
This requires a hook and therefore we generate the scaffolding for a hook using:

![Generate hook](../assets/gen-hook.jpg)

The generator will add some new modules and modify some existing ones.
You can see all the changes here:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/02-gen4-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/02-gen4-side.html)


## New modules

The directory has changed:

![Compare gen3 and gen4 folders](../assets/gen3-4-dir.jpg)

## The teams service

We saw the `users` service being added previously.
The `teams` service has been added in exactly the same way.
There is nothing new.
The boilerplate differs only in the names of the services.

> **Generators.**
The feathers generators are great for roughing out a project,
creating something in its approximate, but not finished, form.
The generators will write most of the boilerplate you need,
while you concentrate on the unique needs of the project.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Step-Generators-Service&body=Comment:Step-Generators-Service)
