---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Z.L Vansiit's blog
  text:
  tagline: |
    技术博客 | 生活随笔 | 唠嗑扯淡
  image:
    src: /img/logo.svg
    alt: Ballcat Logo
  actions:
    - theme: brand
      text: Get Started
      link: /technical
#    - theme: alt
#      text: View on GitHub
#      link: https://github.com/ZLVansiit/ZLVansiit.github.io

features:
  - icon:
        dark: /icon/icons002d2.png
        light: /icon/icons002.png
    title: 从无知到有知
    details: Java，Redis，架构，SpringBoot，算法，MySQL，工具，重构...
    link: /technical
  - icon:
        dark: /icon/icons003d.png
        light: /icon/icons003.png
    title: 精神自旋
    details: 内在感知，心智自转。
    link: /spirit
  - icon:
        dark: /icon/icons001.png
        light: /icon/icons001d.png
    title: 非虚构写作
    details: 天高地海
    link: /non-fiction
---

<style module>
:root {
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #fe8834, #8741ff);
    --vp-home-hero-image-background-image: linear-gradient(-45deg, #8741ff 50%, #fe8834 50%)
}
</style>
