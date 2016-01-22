# Feathers vs. Sails

From a feature standpoint Feathers and Sails are probably the closest. Both provide real-time REST API's, multiple db support, and are client agnostic. Both frameworks also use Express, but Feathers supports Express 4, while Sails only supports Express 3.

Even though the features are very similar, Feathers achieves this with MUCH less code, which means less stuff to break and maintain making it easy to continuously upgrade to the latest version of Express. We also don't assume how you want to manage your assets by letting you use your build tool of choice. Feathers provides lightweight services and hooks instead of a full-blown ORM, and we let you write code instead of long config files to define relationships and security policies.