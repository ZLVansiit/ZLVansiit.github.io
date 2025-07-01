
<div class="links-container">
  <div class="links-intro">
    <h2>🌐 友情链接</h2>
    <p>欢迎与我交换友链！请确保您的网站内容原创且符合中国大陆法律，已开启HTTPS并有持续更新~</p>
    <p>精选优质网站，探索更多精彩内容</p>
  </div>

  <div class="links-grid">
    <!-- 单个友链卡片 -->
    <div class="link-card">
      <img class="link-avatar" src="https://vansiit.cc/img/logo.svg" alt="vansiit">
      <div class="link-info">
        <a href="https://vansiit.cc" target="_blank" class="link-name">技术博客</a>
        <p class="link-desc">专注Web技术与开源项目</p>
      </div>
    </div>

  </div>
</div>

<style>
  /* 核心样式 */
  .links-container {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 20px;
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 1.5rem;
  }

  .link-card {
    display: flex;
    align-items: center;
    padding: 15px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
  }

  .link-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.12);
  }

  .link-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 15px;
    object-fit: cover;
  }

  .link-name {
    font-weight: 600;
    color: #2bbc8a;
    text-decoration: none;
    font-size: 1.1rem;
  }

  .link-name:hover {
    color: #d480aa;
    text-decoration: underline;
  }

  .link-desc {
    color: #666;
    font-size: 0.9rem;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 响应式适配 */
  @media (max-width: 600px) {
    .links-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
