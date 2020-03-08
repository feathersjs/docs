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
      }, 'frameworks.md', 'security.md', 'migrating.md'],
      '/help/': [{
        title: 'Help',
        collapsable: false,
        children: [
          '/help/',
          '/help/faq.md'
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
        title: 'General',
        collapsable: false,
        children: [
          'general/scaling.md'
        ]
      }, {
        title: 'Authentication',
        collapsable: false,
        children: [
          'authentication/anonymous.md',
          'authentication/auth0.md',
          'authentication/facebook.md',
          'authentication/google.md',
          'authentication/stateless.md',
          'authentication/revoke-jwt.md'
        ]
      }, {
        title: 'Express',
        collapsable: false,
        children: [
          'express/file-uploading.md',
          'express/view-engine.md'
        ]
      }, {
        title: 'Deployment',
        collapsable: false,
        children: [
          'deploy/docker.md'
        ]
      }]
    },
    nav: [
      { text: 'Guides', link: '/guides/' },
      { text: 'API', link: '/api/' },
      { text: 'Cookbook', link: '/cookbook/' },
      { text: 'Help', link: '/help/' },
      {
        text: 'Ecosystem',
        items: [{
          text: 'Awesome Feathersjs',
          link: 'https://github.com/feathersjs/awesome-feathersjs'
        }, {
          text: 'YouTube Playlist',
          link: 'https://www.youtube.com/playlist?list=PLwSdIiqnDlf_lb5y1liQK2OW5daXYgKOe'
        }, {
          text: 'Feathers VueX',
          link: 'https://vuex.feathersjs.com/'
        }, {
          text: 'Common Hooks',
          link: 'https://hooks-common.feathersjs.com/'
        }, {
          text: 'Other versions',
          items: [{
            text: 'Crow (v4)',
            link: 'https://crow.docs.feathersjs.com/'
          }, {
            text: 'Buzzard (v3)',
            link: 'https://buzzard.docs.feathersjs.com/'
          }]
        }]
      }
    ]
  }
};
