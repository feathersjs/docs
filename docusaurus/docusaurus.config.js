// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Feathers',
  tagline: 'A framework for real-time applications and REST APIs ',
  url: 'https://docs.feathersjs.com/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'feathersjs', // Usually your GitHub org/user name.
  projectName: 'feathersjs/docs', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/feathershq/handbook',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/feathershq/handbook',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: '',
        logo: {
          alt: 'My Site Logo',
          src: 'img/Feathers-logo-2021-Black.png',
          srcDark: 'img/Feathers-logo-2021-white.png',
        },
        items: [
          {
            type: 'search',
            position: 'right',
          },
          
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'Guides',
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'API',
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'Cookbook',
          },
          {
            type: 'doc',
            docId: 'help/gethelp',
            position: 'right',
            label: 'Help',
          },
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'Ecosystem',
          },
          
          {
            type: 'doc',
            docId: 'intro',
            position: 'right',
            label: 'GitHub',
          },
         
          
        ],
        
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Links',
            items: [
              {
                label: 'Feathers Cloud',
                href: 'https://feathers.cloud/',
              },
              {
                label: 'Feathers Docs',
                href: 'https://docs.feathersjs.com/',
              },
          
              {
                label: 'Feathers Blog',
                href: 'https://blog.feathersjs.com/',
              },
              {
                label: 'Feathers Swag',
                href: 'https://shop.feathersjs.com/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Feathers Cloud Github',
                href: 'https://github.com/feathershq',
              },
              {
                label: 'FeathersJS Github',
                href: 'https://github.com/feathersjs',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/jTsfMndA',
              },
              {
                label: 'Feathers Twitter',
                href: 'https://twitter.com/feathersjs',
              },
              
            ],
          },
          {
            title: 'Contact',
            items: [
              
              {
                label: 'Email',
                href: 'mailto:hello@feathers.cloud',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Feathers Cloud, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;

module.exports = {
  title: 'My site',
  // ...
  themes: ['@docusaurus/theme-search-algolia'],
  themeConfig: {
    // ...
    algolia: {
      // The application ID provided by Algolia
      appId: 'H377D39UCJ',

      // Public API key: it is safe to commit it
      apiKey: '179267c690107a3ab927fa2c904e1ea8',

      indexName: 'feathers_docs',

      // Optional: see doc section below
      contextualSearch: false,

      // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
      externalUrlRegex: 'external\\.com|domain\\.com',

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',

      //... other Algolia params
    },
  },
};
