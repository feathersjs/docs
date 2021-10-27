<template>
  <div
    class="theme-container"
    :class="pageClasses"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar" />

    <div class="sidebar-mask" @click="toggleSidebar(false)"></div>

    <Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
      <slot name="sidebar-top" slot="top" />
      <slot name="sidebar-bottom" slot="bottom" />
    </Sidebar>

    <Home v-if="$page.frontmatter.home" />

    <Page v-else :sidebar-items="sidebarItems">
      <slot name="page-top" slot="top" />
      <slot name="page-bottom" slot="bottom" />
    </Page>
  </div>
</template>

<script>
import Home from "@theme/components/Home.vue";
import Navbar from "@theme/components/Navbar.vue";
import Page from "@theme/components/Page.vue";
import Sidebar from "@theme/components/Sidebar.vue";
import { resolveSidebarItems } from "../util";

export default {
  components: { Home, Page, Sidebar, Navbar },

  data() {
    return {
      isSidebarOpen: false
    };
  },

  computed: {
    shouldShowNavbar() {
      const { themeConfig } = this.$site;
      const { frontmatter } = this.$page;
      if (frontmatter.navbar === false || themeConfig.navbar === false) {
        return false;
      }
      return (
        this.$title ||
        themeConfig.logo ||
        themeConfig.repo ||
        themeConfig.nav ||
        this.$themeLocaleConfig.nav
      );
    },

    shouldShowSidebar() {
      const { frontmatter } = this.$page;
      return (
        !frontmatter.home &&
        frontmatter.sidebar !== false &&
        this.sidebarItems.length
      );
    },

    sidebarItems() {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      );
    },

    pageClasses() {
      const userPageClass = this.$page.frontmatter.pageClass;
      return [
        {
          "no-navbar": !this.shouldShowNavbar,
          "sidebar-open": this.isSidebarOpen,
          "no-sidebar": !this.shouldShowSidebar
        },
        userPageClass
      ];
    }
  },

  mounted() {
    this.$router.afterEach(() => {
      this.isSidebarOpen = false;
    });
  },

  methods: {
    toggleSidebar(to) {
      this.isSidebarOpen = typeof to === "boolean" ? to : !this.isSidebarOpen;
    },

    // side swipe
    onTouchStart(e) {
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
    },

    onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true);
        } else {
          this.toggleSidebar(false);
        }
      }
    }
  }
};
</script>

<!-- Dark mode : Based on idea from @matiaslopezd, https://github.com/feathersjs/docs/issues/1378 -->
<style>
body.dark,
body.dark #app,
body.dark .navbar,
body.dark .sidebar,
body.dark .links {
  background: rgb(13, 22, 28) !important;
  color: rgb(255, 255, 255);
}

body.dark .navbar {
  border-bottom: 1px solid rgba(128, 128, 128, 0.35);
}

body.dark .home-link img {
  filter: invert(1) brightness(2);
}

body.dark img {
  filter: invert(1) brightness(2);
}

body.dark div[class*="language-"] {
  background-color: rgb(44, 62, 80);
}

body.dark .content code {
  background-color: rgb(44, 62, 80);
  color: rgb(193, 193, 193);
}

body.dark .language-text code {
  color: rgb(177, 177, 177) !important;
}

body.dark .tabs-component-panels,
.tabs-component-tabs li {
  background: rgba(0, 0, 0, 0);
  /*border: none;*/
}

body.dark .tabs-component-panels {
  border-top: 1px solid rgb(255, 255, 255);
}

body.dark a.sidebar-link {
  color: rgb(128, 128, 128);
}

body.dark code {
  color: rgb(220, 220, 220) !important;
}

body.dark a.nav-link.router-link-active {
  color: rgb(233, 21, 181);
}

body.dark .search-box input {
  filter: invert(1);
}

body.dark ul.nav-dropdown {
  background: rgb(13, 22, 28) !important;
}

body.dark tr:nth-child(2n) {
  background: rgba(0, 0, 0, 0);
}

body.dark blockquote {
  background: rgb(44, 62, 80);
}

body.dark blockquote,
body.dark blockquote p {
  color: rgb(255, 255, 255);
}

body.dark blockquote a code,
body.dark blockquote p code {
  background: #1c3042 !important;
}

body.dark a.sidebar-link:hover {
  color: #d513a5 !important;
}

#app,
.navbar,
.sidebar,
.links,
.home-link img,
div[class*="language-"],
.content code,
.language-text code,
.tabs-component-panels,
.tabs-component-tabs li,
.tabs-component-panels,
code,
a.nav-link.router-link-active,
.search-box input,
ul.nav-dropdown,
tr:nth-child(2n),
blockquote,
blockquote,
blockquote p {
  transition: all 0.5s ease;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: rgb(218, 216, 216);
  /*  color: #fff;*/
  text-align: center;
  border-radius: 6px;
  padding: 0 7px 0 7px;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
}

.tooltip .tooltiptext {
  top: 25px;
  right: 0%;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
