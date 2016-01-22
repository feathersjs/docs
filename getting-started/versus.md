# Feathers vs.

## Feathers vs. Meteor

Feathers vs Meteor
"Once you go Meteor, you don't go back. And not in a good way."

Meteor has amassed a large community and a lot of venture backed funding. Our biggest complaint is that because of this funding, there is some serious lock in. Meteor has it's own package system, how you use npm modules can be inconsistent and it is a large codebase. There is also the risk that when investors start pushing for a return on their investment, it could negatively impact the community.

From a feature standpoint Feathers is pretty similar to Meteor. You get real-time API's from both. However, we let you use the defacto npm for managing dependencies, we let you choose whether you want to use Webpack, Gulp, Grunt, or any other tool for managing assets, and Feathers is completely client agnostic without any additional overhead. Everything is open, flexible and pluggable. You use only what you need.

## Feathers vs. Sails

"If you love JSON config files, Sails is for you."

From a feature standpoint Feathers and Sails are probably the closest. Both provide real-time REST API's, multiple db support, and are client agnostic. Both frameworks also use Express, but Feathers supports Express 4, while Sails only supports Express 3.

Even though the features are very similar, Feathers achieves this with MUCH less code, which means less stuff to break and maintain making it easy to continuously upgrade to the latest version of Express. We also don't assume how you want to manage your assets by letting you use your build tool of choice. Feathers provides lightweight services and hooks instead of a full-blown ORM, and we let you write code instead of long config files to define relationships and security policies.

## Feathers vs. Express

"I like Express because I love flexibility and boilerplate!"

Express is awesome! It does much of the heavy lifting behind Feathers; routing, content-negotiation, middleware support, etc. In fact, you can simply replace Express with Feathers in any existing application and start adding new microservices.

Feathers eliminates a lot of the common boilerplate and gives you helpful plug-ins to make implementing common features easier, while also providing some convention. This includes stuff like managing permissions, CRUD for multiple databases, and real-time APIs using web sockets. Just like Express, Feathers gives you just enough to build your web app quickly but gets out of your way when you need to customize something.
