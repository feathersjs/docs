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
        title: 'The Feathers guide',
        collapsable: false,
        children: [
          'basics/setup.md',
          'basics/starting.md',
          'basics/generator.md',
          'basics/services.md',
          'basics/hooks.md',
          'basics/authentication.md',
          'basics/frontend.md',
          'basics/testing.md'
        ]
      }, 'frameworks.md', 'migrating.md'],
      '/faq/': [{
        title: 'FAQ',
        collapsable: false,
        children: [
          'help.md',
          '/faq/'
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
        title: 'Databases',
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
      }]
    },
    nav: [
      { text: 'Guides', link: '/guides/' },
      { text: 'API', link: '/api/' },
      { text: 'Cookbook', link: '/cookbook/' },
      { text: 'FAQ', link: '/faq/' },
      {
        text: 'Ecosystem',
        items: [{
          text: 'Awesome Feathersjs',
          link: 'https://github.com/feathersjs/awesome-feathersjs'
        }, {
          text: 'Previous versions',
          items: [{
            text: 'Buzzard (v3)',
            link: 'https://buzzard.docs.feathersjs.com/'
          }, {
            text: 'Auk (v2)',
            link: 'https://auk.docs.feathersjs.com/'
          }, {
            text: 'Legacy (v1)',
            link: 'https://legacy.docs.feathersjs.com/'
          }]
        }]
      }
    ]
  },
  plugins: [
    '@vuepress/last-updated',
    [ '@dovyp/vuepress-plugin-clipboard-copy', true ],
    'tabs'
  ]
};
