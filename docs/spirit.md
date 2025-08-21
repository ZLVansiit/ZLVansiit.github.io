---
title: Spirit
prev: false
next: false

<script setup>
import { useData } from 'vitepress'

const { site } = useData()

</script>



<div v-for="(item, index) in site.themeConfig.sidebar[1].items" style="line-height:40px">
  <a :href="item.link" :class="$style.a"> {{item.text}} </a>
  <span :class="$style.span">{{item.link.split('/').slice(1, 4).join('-')}}</span>
</div>

<div v-for="(item, index) in $frontmatter.tags" style="line-height:40px">
  <span>{{item}}</span>
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
