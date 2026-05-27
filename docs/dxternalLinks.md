---
title: 友链
prev: false
next: false
comment: false
---

<div class="links-micro">
  <h2>🌐 友情链接</h2>
  <p>欢迎与我交换友链！请确保您的网站内容原创且符合中国大陆法律，已开启HTTPS并有持续更新~</p>

  <div class="link-grid">
  <div class="link-item">
    <a class="link-title" href="https://meet-blog.buyixiao.xyz/?ref=https%3A%2F%2Fvansiit.cc" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://meet-blog.buyixiao.xyz/favicon.svg" alt="" width="20" height="20" />
      <span class="link-name">Meet Blog 博客星图</span>
    </a>
    <p>博客导航星图，收录优质站点，随机发现新站。</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://blog.debuginn.com/" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://webp.debuginn.com/20250929bC0ReU.jpg" alt="" width="20" height="20" />
      <span class="link-name">Debug客栈</span>
    </a>
    <p>永远相信美好的事情即将发生</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://prologue.dev" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://prologue.dev/static/favicons/avatar.png" alt="" width="20" height="20" />
      <span class="link-name">Prologue</span>
    </a>
    <p>对当下的反思和批判</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://cnb.cool/Blog_Bazaar/" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://s41.ax1x.com/2026/05/23/pm9EXnS.png" alt="" width="20" height="20" />
      <span class="link-name">博客集市</span>
    </a>
    <p>来这里摆摊，让更多人认识你！</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://wangxinyang.top" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://wangxinyang.top/upload/%E3%80%90%E5%93%B2%E9%A3%8E%E5%A3%81%E7%BA%B8%E3%80%91%E6%8F%92%E7%94%BB%E9%A3%8E%E6%A0%BC-%E8%8A%B1%E6%9C%B5%E5%85%83%E7%B4%A0-PHSR.png" alt="" width="20" height="20" />
      <span class="link-name">wangxinyang</span>
    </a>
    <p>个人博客 / 学习交流 / 生活日常</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://blog.zhheo.com/" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://img.zhheo.com/i/67d8fb5f563ff.webp" alt="" width="20" height="20" />
      <span class="link-name">张洪Heo</span>
    </a>
    <p>分享设计与科技生活</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://innei.in/" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://innei.in/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F41265413%3Fv%3D4&w=96&q=75" alt="" width="20" height="20" />
      <span class="link-name">静かな森</span>
    </a>
    <p>致虚极，守静笃。</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://ursb.me/blog/" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://airing.ursb.me/image/favicon.ico" alt="" width="20" height="20" />
      <span class="link-name">Airing's Blog</span>
    </a>
    <p>应无所住而生其心</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://www.qingfengnb.cn" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="hhttps://img.qingfengnb.cn/LightPicture/2025/07/bec6eb9625656d60.jpg" alt="" width="20" height="20" />
      <span class="link-name">轻风blog</span>
    </a>
    <p>茫茫人海，多么幸运才能遇见你！</p>
  </div>

  <div class="link-item">
    <a class="link-title" href="https://styunlen.cn/" target="_blank" rel="noopener noreferrer">
      <img class="link-icon" src="https://styunlen.cn/wp-content/uploads/2020/08/cropped-window-wolsion-3.png" alt="" width="20" height="20" />
      <span class="link-name">九仞之行</span>
    </a>
    <p>严于律己，宽以待人，深自警省，讷言敏行</p>
  </div>

  </div>

  <ClientOnly>
    <FriendLinkList />
  </ClientOnly>

  <ClientOnly>
    <FriendLinkSiteInfo />
  </ClientOnly>

  <ClientOnly>
    <FriendLinkApply />
  </ClientOnly>
</div>

<style>
a {
  text-decoration: none; /* 去除所有a标签下划线 */
}
a:link, a:visited, a:hover, a:active {
  text-decoration: none; /* 所有状态均无下划线 */
}
  .links-micro {
    max-width: 800px;
    margin: 1rem auto;
  }
  .link-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 8px;
  }
  .link-grid .link-item {
    margin-bottom: 0;
    min-width: 0;
  }
  .link-item {
    padding: 12px;
    margin-bottom: 8px;
    border: 1px solid #f0f0f0; /* 极细边框 */
    border-radius: 4px;
    transition: background 0.2s;
  }
  .link-item:hover {
    background: #f9f9f9; /* 悬停微背景色 */
  }
  .link-item .link-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
    font-weight: bold;
    color: #2980b9;
  }
  .link-item .link-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }
  .link-item .link-name {
    line-height: 1.2;
    white-space: normal;
    word-break: break-word;
  }
  @media (max-width: 640px) {
    .link-grid {
      grid-template-columns: 1fr;
    }
  }
  .link-item p {
    margin: 5px 0 0;
    color: #666;
    font-size: 0.9em;
  }
  .link-item .link-extra {
    font-size: 0.85em;
    color: #888;
  }
  .link-item .link-extra a {
    font-weight: normal;
  }
</style>
