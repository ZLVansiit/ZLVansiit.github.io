// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './style.css'
import CustomCommentSystem from './components/CustomCommentSystem.vue'
import FriendLinkApply from './components/FriendLinkApply.vue'
import FriendLinkList from './components/FriendLinkList.vue'
import FriendLinkSiteInfo from './components/FriendLinkSiteInfo.vue'
import FriendLinkRss from './components/FriendLinkRss.vue'
import MomentsFeed from './components/MomentsFeed.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    app.component('CustomCommentSystem', CustomCommentSystem)
    app.component('FriendLinkApply', FriendLinkApply)
    app.component('FriendLinkList', FriendLinkList)
    app.component('FriendLinkSiteInfo', FriendLinkSiteInfo)
    app.component('FriendLinkRss', FriendLinkRss)
    app.component('MomentsFeed', MomentsFeed)
  }
}
