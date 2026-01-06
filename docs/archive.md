---
title: archive
prev: false
next: false
comment: false
---

<script setup>
import { useData } from 'vitepress'

const { site } = useData()

</script>

## 从无知到有知
<div v-for="(item, index) in site.themeConfig.sidebar[0].items.reverse()" style="line-height:40px">
  <a :href="item.link" :class="$style.a"> {{item.text}} </a>
  <span :class="$style.span">{{item.link.split('/').slice(1, 4).join('-')}}</span>
</div>

## 精神自旋
<div v-for="(item, index) in site.themeConfig.sidebar[1].items" style="line-height:40px">
  <a :href="item.link" :class="$style.a"> {{item.text}} </a>
  <span :class="$style.span">{{item.link.split('/').slice(1, 4).join('-')}}</span>
</div>

## 非虚构写作
<div v-for="(item, index) in site.themeConfig.sidebar[2].items" style="line-height:40px">
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
