# Extending Services

TODO: Update these old docs. Originally found here: http://feathersjs.com/learn/validation/

`feathers-mongodb` uses the ES5 inheritance library Uberproto. This allows us to extend the original object returned by the call to mongodb(options) and overwrite the existing implementation of create to process the Todo data and then pass it to the original (_super) method. This way we can also easily add our own methods to the service.

```js
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  create: function(data, params, callback) {
    // We want to make sure that `complete` is always set
    // and also only use the `text` and `complete` properties
    var newData = {
      text: data.text,
      complete: data.complete === 'true' || !!data.complete
    };
    // Call the original method with the new data
    this._super(newData, params, callback);
  },

  // Add another method
  addDefaultTodo: function(callback) {
    this.create({
      text: 'The default todo',
      complete: false
    }, {}, callback);
  }
});
```
