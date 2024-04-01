---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Z.L Vansiit's blog"
  # text: "Z.L Vansiit's blog"
  # tagline: My great project tagline
  image: 
    src: /img/logo.svg
    alt: Ballcat Logo
  actions:
    - theme: brand
      text: Get Started
      link: /technical
    - theme: alt
      text: View on GitHub
      link: https://github.com/ZLVansiit/ZLVansiit.github.io

features:
  - icon:
        dark: /public/icon/icons002d2.png
        light: /public/icon/icons002.png
    title: 从无知到有知
    details: Java，Redis，架构，SpringBoot，算法，MySQL，工具，重构... 吾生也有涯 ，而知也无涯。
    link: /technical
  - icon:
        dark: /public/icon/icons003d.png
        light: /public/icon/icons003.png
    title: 精神自旋
    details: 内在感知，心智自转。接纳、理解、思考，直到生命的终点
    link: /spirit
  - icon:
        dark: /public/icon/icons001.png
        light: /public/icon/icons001d.png
    title: 放情于天地外
    details: 天高地海，once in a life，总有些景色、艺术、音乐、电影、运动、文学、科技、物理学、“道”让你心潮澎湃
    link: /hobby
---
<style module>
:root {
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #fe8834, #8741ff);
}
</style>
