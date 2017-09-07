# Elasticsearch

[feathers-elasticsearch](https://github.com/feathersjs/feathers-elasticsearch/) is a database adapter for [Elasticsearch](https://www.elastic.co/products/elasticsearch). This adapter is not using any ORM, it is dealing with the database directly through the elasticsearch.js [Client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html).


```bash
$ npm install --save elasticsearch feathers-elasticsearch
```

## Getting Started

The following bare-bones example will create a `messages` endpoint and connect to a local `messages` type in the `test` index in your Elasticsearch database:

```js
const elasticsearch = require('elasticsearch');
const feathers = require('feathers');
const service = require('feathers-elasticsearch');

app.use('/messages', service({
  Model: new elasticsearch.Client({
    host: 'localhost:9200',
    apiVersion: '5.0'
  }),
  elasticsearch: {
    index: 'test',
    type: 'messages'
  }
}));
```

## Options

The following options can be passed when creating a new Elasticsearch service:

- `Model` (**required**) - The Elasticsearch client instance.
- `elasticsearch` (**required**) - Configuration object for elasticsearch requests. The required properties are `index` and `type`. Apart from that you can specify anything that can be passed to all requests going to Elasticsearch. Another recognised property is [`refresh`](https://www.elastic.co/guide/en/elasticsearch/guide/2.x/near-real-time.html#refresh-api) which is set to `false` by default. Anything else use at your own risk.
- `id` (default: '_id') [optional] - The id property of your documents in this service.
- `meta` (default: '_meta') [optional] - The meta property of your documents in this service. The meta field is an object containing elasticsearch specific information, e.g. _score, _type, _index, and so forth.
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](pagination.md)).

## Complete Example

Here's an example of a Feathers server that uses `feathers-elasticsearch`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const service = require('feathers-elasticsearch');
const elasticsearch = require('elasticsearch');

const messageService = service({
  Model: new elasticsearch.Client({
    host: 'localhost:9200',
    apiVersion: '5.0'
  }),
  paginate: {
    default: 10,
    max: 50
  },
  elasticsearch: {
    index: 'test',
    type: 'messages'
  }
});

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/messages', messageService)
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

You can run this example by using `npm start` and going to [localhost:3030/messages](http://localhost:3030/messages).
You should see an empty array. That's because you don't have any messages yet but you now have full CRUD for your new message service!

## Supported Elasticsearch specific queries

On top of the standard, cross-adapter [queries](querying.md), feathers-elasticsearch also supports Elasticsearch specific queries.

### $all
[The simplest query `match_all`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-all-query.html). Find all documents.

```js
query: {
  $all: true
}
```

### $prefix
[Term level query `prefix`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html). Find all documents which have given field containing terms with a specified prefix (not analyzed).

```js
query: {
  user: {
    $prefix: 'bo'
  }
}
```

### $match
[Full text query `match`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html). Find all documents which have given given fields matching the specified value (analysed).

```js
query: {
  bio: {
    $match: 'javascript'
  }
}
```

### $phrase
[Full text query `match_phrase`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query-phrase.html). Find all documents which have given given fields matching the specified phrase (analysed).

```js
query: {
  bio: {
    $phrase: 'I like JavaScript'
  }
}
```

### $phrase_prefix

[Full text query `match_phrase_prefix`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query-phrase-prefix.html). Find all documents which have given given fields matching the specified phrase prefix (analysed).

```js
query: {
  bio: {
    $phrase_prefix: 'I like JavaS'
  }
}
```

### $child
[Joining query `has_child`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-has-child-query.html).
Find all documents which have children matching the query. The `$child` query is essentially a full-blown query of its own. The `$child` query requires `$type` property.


```js
query: {
  $child: {
    $type: 'blog_tag',
    tag: 'something'
  }
}
```

### $parent
[Joining query `has_parent`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-has-parent-query.html).
Find all documents which have parent matching the query. The `$parent` query is essentially a full-blown query of its own. The `$parent` query requires `$type` property.


```js
query: {
  $parent: {
    $type: 'blog',
    title: {
      $match: 'javascript'
    }
  }
}
```

### $and
This operator does not translate directly to any Elasticsearch query, but it provides support for [Elasticsearch array datatype](https://www.elastic.co/guide/en/elasticsearch/reference/current/array.html).
Find all documents which match all of the given criteria. As any field in Elasticsearch can contain an array, therefore sometimes it is important to match more than one value per field.


```js
query: {
  $and: [
    { notes: { $match: 'javascript' } },
    { notes: { $match: 'project' } }
  ]
}
```

There is also a shorthand version of `$and` for equality. For instance:

```js
query: {
  $and: [
    { tags: 'javascript' },
    { tags: 'react' }
  ]
}
```

Can be also expressed as:

```js
query: {
  tags: ['javascript', 'react']
}
```

### $sqs
[simple_query_string](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html). A query that uses the SimpleQueryParser to parse its context. Optional `$operator` which is set to `or` by default but can be set to `and` if required.

```js
query: {
  $sqs: {
    $fields: [
      'title^5',
      'description'
    ],
    $query: '+like +javascript',
    $operator: 'and'
  }
}
```
This can also be expressed in an URL as the following:
```http
http://localhost:3030/users?$sqs[$fields][]=title^5&$sqs[$fields][]=description&$sqs[$query]=+like +javascript&$sqs[$operator]=and
```

## Parent-child relationship
Elasticsearch supports [parent-child relationship](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-parent-field.html), however it is not exactly the same as in relational databases. feathers-elasticsearch supports all CRUD operations for Elasticsearch types with parent mapping, and does that with the Elasticsearch constrains. Therefore:

- each operation concering a single document (create, get, patch, update, remove) is required to provide parent id
- creating documents in bulk (providing a list of documents) is the same as many single document operations, so parent id is required as well
- to avoid any doubts, each query based operation (find, bulk patch, bulk remove) cannot have the parent id

### How to specify parent id
Parent id should be provided as part of the data for the create operations (single and bulk):

```javascript
parentService.create({
  _id: 123,
  title: 'JavaScript: The Good Parts'
});

childService.create({
  _id: 1000
  tag: 'javascript',
  _parent: 123
})
```
Please note, that name of the parent property (`_parent` by default) is configurable through the service options, so that you can set it to whatever suits you.

For all other operations (get, patch, update, remove), the parent id should be provided as part of the query:

```javascript
childService.remove(
  1000,
  { query: { _parent: 123 } }
);
```

## Supported Elasticsearch versions

feathers-elasticsearch is currently tested on Elasticsearch 2.4, 5.0, 5.1, 5.2, 5.3, 5.4 and 5.5 Please note, event though the lowest version supported is 2.4, that does not mean it wouldn't work fine on anything lower than 2.4.

## Quirks

### Updating and deleting by query

Elasticsearch is special in many ways. For example, the ["update by query"](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update-by-query.html) API is still considered experimental and so is the ["delete by query"](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-delete-by-query.html) API introduced in Elasticsearch 5.0.

Just to clarify - update in Elasticsearch is an equivalent to `patch` in feathers. I will use `patch` from now on, to set focus on the feathers side of the fence.

Considering the above, our implementation of path / remove by query uses combo of find and bulk patch / remove, which in turn means for you:

- Standard pagination is taken into account for patching / removing by query, so you have no guarantee that all existing documents matching your query will be patched / removed.
- The operation is a bit slower than it could potentially be, because of the two-step process involved.

Considering, however that elasticsearch is mainly used to dump data in it and search through it, I presume that should not be a great problem.

### Search visibility

Please be aware that search visibility of the changes (creates, updates, patches, removals) is going to be delayed due to Elasticsearch [`index.refresh_interval`](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html) setting. You may force refresh after each operation by setting the service option `elasticsearch.refresh` as decribed above but it is highly discouraged due to Elasticsearch performance implications.

### Full-text search

Currently feathers-elasticsearch supports most important full-text queries in their default form. Elasticsearch search allows additional parameters to be passed to each of those queries for fine-tuning. Those parameters can change behaviour and affect peformance of the queries therefore I believe they should not be exposed to the client. I am considering ways of adding them safely to the queries while retaining flexibility.

### Performance considerations

None of the data mutating operations in Elasticsearch v2.4 (create, update, patch, remove) returns the full resulting document, therefore I had to resolve to using get as well in order to return complete data. This solution is of course adding a bit of an overhead, although it is also compliant with the standard behaviour expected of a feathers database adapter.

The conceptual solution for that is quite simple. This behaviour will be configurable through a `lean` switch allowing to get rid of those additional gets should they be not needed for your application. This feature will be added soon as well.
