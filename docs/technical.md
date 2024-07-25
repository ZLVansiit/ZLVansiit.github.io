---
title: technical
prev: false
next: false
head:
- - meta
  - name: description
    content: Z.L Vansiit's blog - Technical
- - meta
  - name: keywords
    content: Technical Vansiit
---

<script setup>
import { useData } from 'vitepress'

const { site } = useData()

</script>

<div v-for="(item, index) in site.themeConfig.sidebar[0].items.reverse()" style="line-height:40px">
  <a :href="item.link" :class="$style.a"> {{item.text}} </a>
  <span :class="$style.span">{{item.link.split('/').slice(1, 4).join('-')}}</span>
</div>

<style module>
.a {
  cursor: pointer;
  text-decoration:none;
}
.span{
  float: right;
}
</style>
