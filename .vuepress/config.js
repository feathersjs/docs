module.exports = {
  title: 'FeathersJS',
  description: 'A REST and real-time API layer for modern applications',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  thirdPartyComponents: {
    fontAwesomeIcons:{
        regular:['lightbulb'],  // Regular font awesome icon keys here
        solid:[ 'thumbs-up']    // Solid font awesome icon keys here
    }
  },
  themeConfig: {
    algolia: {
      apiKey: '2835d290e600f7fb583e2b61a74032ba',
      indexName: 'feathersjs'
    },
    logo: '/img/feathers-logo-wide.png',
    repo: 'feathersjs/feathers',
    docsRepo: 'feathersjs/docs',
    docsBranch: 'dove',
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
        children: [
          'koa.md',
          'express.md',
          'socketio.md',
          'channels.md'
        ]
      }, {
        title: 'Schema',
        children: [
          'schema/',
          'schema/schema.md',
          'schema/resolvers.md',
          'schema/hooks.md'
        ]
      }, {
        title: 'Client',
        children: [
          'client.md',
          'client/rest.md',
          'client/socketio.md'
        ]
      }, {
        title: 'Authentication',
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
          'authentication/apiKey.md',
          'authentication/auth0.md',
          'authentication/facebook.md',
          'authentication/google.md',
          'authentication/firebase.md',
          'authentication/_discord.md',
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
