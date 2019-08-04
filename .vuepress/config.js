module.exports = {
  title: 'FeathersJS',
  description: 'A REST and real-time API layer for modern applications',
  themeConfig: {
    logo: '/img/feathers-logo-wide.png',
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
        collapsable: false,
        children: [
          'application.md',
          'services.md',
          'hooks.md',
          'events.md',
          'errors.md',
          'configuration.md'
        ]
      }, {
        title: 'Transports',
        collapsable: false,
        children: [
          'express.md',
          'socketio.md',
          'primus.md',
          'channels.md'
        ]
      }, {
        title: 'Client',
        collapsable: false,
        children: [
          'client.md',
          'client/rest.md',
          'client/socketio.md',
          'client/primus.md'
        ]
      }, {
        title: 'Authentication',
        collapsable: false,
        children: [
          'authentication/',
          'authentication/service.md',
          'authentication/strategy.md',
          'authentication/hook.md',
          'authentication/jwt.md',
          'authentication/local.md',
          'authentication/oauth.md',
          'authentication/client.md'
        ]
      }, {
        title: 'Database',
        collapsable: false,
        children: [
          'databases/adapters.md',
          'databases/common.md',
          'databases/querying.md'
        ],
      }],
      '/cookbook/': [{
        title: 'Authentication',
        children: [
          'authentication/anonymous.md'
        ]
      }, {
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
        link: 'https://github.com/feathersjs/awesome-feathersjs'
      }
    ]
  },
  plugins: ['@vuepress/last-updated', 'tabs']
};
