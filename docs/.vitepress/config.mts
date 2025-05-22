import { defineConfig } from 'vitepress'
import emailSVGString from "./theme/svgs/email"


// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    lineNumbers: true, // 显示代码块行号
  },
  lang: 'en-US',
  title: "Vansiit's blog",
  description: "Z.L Vansiit's blog",
  head: [
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
    ]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    siteTitle: 'Z.L Vansiit\'s blog',
    logo: '/logo.svg',
    vssueConfig: {
      platform: 'github',
      owner: 'vansiit',
      repo: 'NAME_OF_REPO',
      clientId: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
    },
    nav: [
      {text: 'Home', link: '/'},
      {text: '归档', link: '/archive'},
      /*{text: '书签', link: '/bookmark'},*/
      {text: '关于', link: '/about'}
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
        ]
      },
      {
        text: '非虚构写作',
        collapsed: false,
        link: '/non-fiction',
        items: [
          {text: '突然想起来初中同桌的一些事', link: '/2025/01/06/shudong', tag: '非虚构'},
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

  /*plugins: [
    backToTopPlugin(),
    readingTimePlugin({

    })
  ]*/

  sitemap: {
    hostname: 'https://vansiit.cc'
  },

})
