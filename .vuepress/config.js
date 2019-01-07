module.exports = {
  title: 'FeathersJS',
  description: 'A REST and real-time API layer for modern applications',
  themeConfig: {
    repo: 'feathersjs/feathers',
    docsRepo: 'feathersjs/docs',
    docsBranch: 'master',
    editLinks: true,
    sidebarDepth: 2,
    sidebar: {
      '/guides/': [{
        title: 'The basics',
        collapsable: false,
        children: [
          'basics/',
          'basics/setup.md',
          'basics/starting.md',
          'basics/services.md',
          'basics/hooks.md',
          'basics/rest.md',
          'basics/databases.md',
          'basics/real-time.md',
          'basics/clients.md',
          'basics/generator.md'
        ]
      }, {
        title: 'A chat application',
        collapsable: false,
        children: [
          'chat/',
          'chat/creating.md',
          'chat/service.md',
          'chat/authentication.md',
          'chat/processing.md',
          'chat/frontend.md',
          'chat/testing.md'
        ]
      }],
      '/api/': [{
        title: 'Core',
        children: [
          'application.md',
          'services.md',
          'hooks.md',
          'events.md',
          'channels.md',
          'errors.md',
          'configuration.md'
        ]
      }, {
        title: 'Transports',
        children: [
          'express.md',
          'socketio.md',
          'primus.md'
        ]
      }, {
        title: 'Client',
        children: [
          'client.md',
          'client/rest.md',
          'client/socketio.md',
          'client/primus.md'
        ]
      }, {
        title: 'Authentication',
        children: [
          'authentication/server.md',
          'authentication/client.md',
          'authentication/local.md',
          'authentication/jwt.md',
          'authentication/oauth1.md',
          'authentication/oauth2.md'
        ]
      }, {
        title: 'Database',
        children: [
          'databases/adapters.md',
          'databases/common.md',
          'databases/querying.md'
        ],
      }],
      '/cookbook/': [{
        title: 'Express',
        children: [
          'express/file-uploading.md'
        ]
      }],
      '/': [
        '/guides/',
        '/api/',
        '/faq/',
        'migrating.md'
      ]
    },
    nav: [
      { text: 'Guides', link: '/guides/' },
      { text: 'API', link: '/api/' },
      { text: 'Cookbook', link: '/cookbook/' },
      { text: 'FAQ', link: '/faq/' },
      {
        text: 'Ecosystem',
        items: [
          {
            text: 'Core', items: [
              { text: 'CLI', link: 'https://cli.feathersjs.com' },
              { text: 'Common hooks', link: 'https://hooks.feathersjs.com' }
            ]
          },
          {
            text: 'Databases', items: [
              { text: 'Memory', link: 'https://github.com/feathersjs-ecosystem/feathers-memory' },
              { text: 'LocalStorage', link: 'https://github.com/feathersjs-ecosystem/feathers-localstorage' },
              { text: 'NeDB', link: 'https://github.com/feathersjs-ecosystem/feathers-nedb' },
              { text: 'MongoDB', link: 'https://github.com/feathersjs-ecosystem/feathers-mongodb' },
              { text: 'Mongoose', link: 'https://github.com/feathersjs-ecosystem/feathers-mongoose' },
              { text: 'Knex', link: 'https://github.com/feathersjs-ecosystem/feathers-knex' },
              { text: 'Sequelize', link: 'https://github.com/feathersjs-ecosystem/feathers-sequelize' }
            ]
          }
        ]
      }
    ]
  },
  plugins: ['@vuepress/last-updated']
}