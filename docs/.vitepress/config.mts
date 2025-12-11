import { defineConfig } from 'vitepress'
import emailSVGString from './theme/svgs/email'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  markdown: {
    lineNumbers: true, // 显示代码块行号
  },
  title: "Vansiit's blog",
  description: "开发 | vansiit，Web & Front-end Engineer | vansiit的个人博客呀",
  head: [
    // 基础SEO meta标签
    ['meta', { name: 'keywords', content: 'Java,Spring Boot,架构,算法,MySQL,Redis,技术博客,vansiit,前端开发,后端开发' }],
    ['meta', { name: 'author', content: 'Z.L Vansiit' }],
    ['meta', { name: 'robots', content: 'index,follow' }],

    // Open Graph meta标签
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Z.L Vansiit\'s blog' }],
    ['meta', { property: 'og:title', content: 'Z.L Vansiit\'s blog' }],
    ['meta', { property: 'og:description', content: '开发 | vansiit，Web & Front-end Engineer | vansiit的个人博客呀' }],
    ['meta', { property: 'og:url', content: 'https://vansiit.cc' }],
    ['meta', { property: 'og:image', content: 'https://vansiit.cc/img/logo.svg' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],

    // Twitter Card meta标签
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Z.L Vansiit\'s blog' }],
    ['meta', { name: 'twitter:description', content: '开发 | vansiit，Web & Front-end Engineer | vansiit的个人博客呀' }],
    ['meta', { name: 'twitter:image', content: 'https://vansiit.cc/img/logo.svg' }],

    // 移动端优化
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }],

    // PWA相关
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#0085a1' }],

    // 性能优化
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'dns-prefetch', href: '//www.google-analytics.com' }],

    // IndexNow 验证
    ['link', { rel: 'indexnow', href: '/OI53y5QpB6tqIjRLJ5Yf2.txt' }],

    // 结构化数据 - 网站信息
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Z.L Vansiit\'s blog',
      description: '开发 | vansiit，Web & Front-end Engineer | vansiit的个人博客呀',
      url: 'https://vansiit.cc',
      author: {
        '@type': 'Person',
        name: 'Z.L Vansiit',
        email: 'vansiit@163.com',
        url: 'https://vansiit.cc'
      },
      publisher: {
        '@type': 'Person',
        name: 'Z.L Vansiit'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://vansiit.cc/?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    })],

    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-341DFSJ9B1' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-341DFSJ9B1');`
    ],
    // Umami Cloud 配置
    ['script', {
      src: 'https://cloud.umami.is/script.js',
      'data-website-id': 'c4e155a2-479b-4f10-a6a7-21a40322f777'
    }],
    ['meta', {
      name: 'msvalidate.01',
      content: 'E05ABB64BECAFCC799E9521FCAF19CAB'
    }],
    ['meta', {
      name: 'baidu-site-verification',
      content: 'codeva-vE7R0LNAfC'
    }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    siteTitle: 'Z.L Vansiit\'s blog',
    logo: '/logo.svg',

    nav: [
      {text: 'Home', link: '/'},
      {text: '归档', link: '/archive'},
      /*{text: '书签', link: '/bookmark'},*/
      {text: '关于', link: '/about'},
      {text: '友链', link: '/dxternalLinks'}
    ],
    sidebar: [
      {
        text: '从无知到有知',
        collapsed: false,
        link: '/technical',
        items: [
          {text: 'MapStruct使用和详解，看这篇就够了', link: '/2023/05/25/mapstruct', tag: 'Java'},
          {text: 'NanoId是什么？还在用UUID吗', link: '/2023/06/12/NanoId', tag: 'Java'},
          {text: '使用NanoID替换整型ID', link: '/2023/06/12/NanoID-mapping', tag: 'Java,架构'},
          {text: 'APP扫码登录：不只有原理，直接上代码', link: '/2023/06/15/scan-qrcode-login', tag: 'Java,架构,源码'},
          {text: '负载均衡之平滑加权轮询算法', link: '/2023/06/15/weighted-round-robin', tag: 'Java,算法,Nginx'},
          {text: 'utf8和utf8mb4的区别 - MySQL字符集和比较规则', link: '/2023/12/02/mysql-character-set', tag: 'Java,Mysql'},
          {text: 'git常用命令大全', link: '/2024/03/21/git-common-commands', tag: 'Java,Mysql'},
          {text: 'Java虚拟线程和Go协程的对比', link: '/2025/02/08/virtual-thread', tag: 'Java,JDK'},
          {text: '人工智能（AI）的现状、问题、瓶颈、未来趋势', link: '/2025/02/08/ai', tag: 'AI'},
          {text: '国外支付平台及国际化APP支付对接建议', link: '/2025/02/08/pay', tag: '运营,出海'},
          {text: 'Java 对接 PayPal 详细文档', link: '/2025/02/08/paypal', tag: 'pay,出海'},
          {text: 'Java 对接 Google Pay 详细文档', link: '/2025/02/08/googlepay', tag: 'pay,出海'},
          {text: 'Java 项目升级遇到的那些事儿', link: '/2025/05/21/project-upgrade', tag: 'Java,JDK'},
        ]
      },
      {
        text: '精神自旋',
        collapsed: false,
        link: '/spirit',
        items: [
            {text: '从物理学的大一统理论想到的', link: '/2024/03/29/grand-unification-theory', tag: '物理学'},
            {text: '供奉释迦牟尼、李白、耶稣、姜子牙的高台教到底是什么', link: '/2024/09/21/Caodaism', tag: '无聊的知识'},
            /*{text: '中东局势', link: '/2024/09/21/middle-east', tag: '无聊的知识'},*/
            {text: '春节真的是中国的传统节日吗？', link: '/2025/01/05/chunjie', tag: '无聊的知识'},
            {text: '星期天到底是怎么来的？', link: '/2025/09/08/week', tag: '无聊的知识'},
            {text: '为什么英文字母 W 读作 double u？', link: '/2025/12/03/double-u', tag: '无聊的知识'},
            {text: '读诗《有人问我公理和正义的问题》有感', link: '/2025/12/10/gongli_zhengyi', tag: '诗歌'},
        ]
      },
      {
        text: '非虚构写作',
        collapsed: false,
        link: '/non-fiction',
        items: [
          {text: '突然想起来初中同桌的一些事', link: '/2025/01/06/shudong', tag: '非虚构'},
          {text: '那个长头发大胡子的老师出家了', link: '/2025/08/19/teacher', tag: '非虚构'},

          /*{text: '山里娃', link: '/2025/01/07/shanliren', tag: '非虚构'},*/
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ZLVansiit'},
      {
        icon: {
          svg: emailSVGString,
        },
        link: "mailto:vansiit@163.com",
      },
    ],

    footer: {
      message: 'Power by vitepress',
      copyright: 'copyright @ 2024-present Z.L Vansiit'
    },

    // 设置搜索框的样式
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  sitemap: {
    hostname: 'https://vansiit.cc',
    lastmodDateOnly: false
  },

  // 动态生成页面meta标签
  transformHead: ({ pageData }) => {
    const head = []

    // 动态设置页面标题
    if (pageData.frontmatter.title) {
      head.push(['meta', { property: 'og:title', content: pageData.frontmatter.title }])
      head.push(['meta', { name: 'twitter:title', content: pageData.frontmatter.title }])
    }

    // 动态设置页面描述
    if (pageData.frontmatter.description) {
      head.push(['meta', { property: 'og:description', content: pageData.frontmatter.description }])
      head.push(['meta', { name: 'twitter:description', content: pageData.frontmatter.description }])
      head.push(['meta', { name: 'description', content: pageData.frontmatter.description }])
    }

    // 动态设置canonical URL
    const canonicalUrl = `https://vansiit.cc${pageData.relativePath.replace(/\.md$/, '.html')}`
    head.push(['link', { rel: 'canonical', href: canonicalUrl }])
    head.push(['meta', { property: 'og:url', content: canonicalUrl }])

    // 为博客文章添加结构化数据
    if (pageData.relativePath.match(/^\d{4}\/\d{2}\/\d{2}\/.*\.md$/)) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: pageData.frontmatter.title || pageData.title,
        description: pageData.frontmatter.description || pageData.description,
        author: {
          '@type': 'Person',
          name: 'Z.L Vansiit',
          email: 'vansiit@163.com'
        },
        publisher: {
          '@type': 'Person',
          name: 'Z.L Vansiit'
        },
        datePublished: pageData.frontmatter.date || new Date().toISOString(),
        dateModified: pageData.lastUpdated || new Date().toISOString(),
        url: canonicalUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      }

      if (pageData.frontmatter.keywords) {
        articleSchema.keywords = pageData.frontmatter.keywords
      }

      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(articleSchema)])
    }
    return head
  },

})
