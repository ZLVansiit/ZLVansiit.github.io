
<div class="friend-links-container">
<style>
  .friend-links-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 20px;
  }
  .friend-links-section {
    margin-bottom: 3rem;
  }
  .section-title {
    font-size: 1.8rem;
    border-left: 4px solid #4CAF50;
    padding-left: 15px;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
  }
  .friend-card {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .friend-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }
  .card-header {
    padding: 20px;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    color: white;
  }
  .card-body {
    padding: 20px;
    flex-grow: 1;
  }
  .friend-name {
    font-size: 1.3rem;
    margin: 0 0 10px;
    font-weight: 600;
  }
  .friend-desc {
    color: #555;
    line-height: 1.6;
    font-size: 0.95rem;
  }
  .friend-link {
    display: inline-block;
    margin-top: 15px;
    padding: 8px 20px;
    background: #f5f7fa;
    border-radius: 30px;
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    border: 1px solid #e3e9f1;
  }
  .friend-link:hover {
    background: #3498db;
    color: white;
    box-shadow: 0 4px 10px rgba(52,152,219,0.3);
  }
  @media (max-width: 768px) {
    .links-grid {
      grid-template-columns: 1fr;
    }
    .section-title {
      font-size: 1.5rem;
    }
  }
</style>

## 🌐 友情链接
> 精选优质网站，探索更多精彩内容

### 🧩 技术社区
<div class="links-grid">
  <div class="friend-card">
    <div class="card-header">
      <h3 class="friend-name">GitHub</h3>
    </div>
    <div class="card-body">
      <p class="friend-desc">全球最大的代码托管平台，开源项目聚集地</p>
      <a href="https://github.com" class="friend-link" target="_blank">访问网站</a>
    </div>
  </div>

  <div class="friend-card">
    <div class="card-header">
      <h3 class="friend-name">Stack Overflow</h3>
    </div>
    <div class="card-body">
      <p class="friend-desc">程序员问答社区，解决编码难题的首选平台</p>
      <a href="https://stackoverflow.com" class="friend-link" target="_blank">访问网站</a>
    </div>
  </div>
</div>

### 🎨 设计资源
<div class="links-grid">
  <div class="friend-card">
    <div class="card-header">
      <h3 class="friend-name">Dribbble</h3>
    </div>
    <div class="card-body">
      <p class="friend-desc">设计师作品展示平台，汇集全球创意灵感</p>
      <a href="https://dribbble.com" class="friend-link" target="_blank">访问网站</a>
    </div>
  </div>

  <div class="friend-card">
    <div class="card-header">
      <h3 class="friend-name">Behance</h3>
    </div>
    <div class="card-body">
      <p class="friend-desc">Adobe旗下创意作品平台，设计项目展示</p>
      <a href="https://behance.net" class="friend-link" target="_blank">访问网站</a>
    </div>
  </div>
</div>

### 📚 学习平台
<div class="links-grid">
  <div class="friend-card">
    <div class="card-header">
      <h3 class="friend-name">Coursera</h3>
    </div>
    <div class="card-body">
      <p class="friend-desc">全球顶尖大学课程，在线学习专业知识</p>
      <a href="https://coursera.org" class="friend-link" target="_blank">访问网站</a>
    </div>
  </div>

  <div class="friend-card">
    <div class="card-header">
      <h3 class="friend-name">MDN Web Docs</h3>
    </div>
    <div class="card-body">
      <p class="friend-desc">最权威的Web开发文档，由Mozilla维护</p>
      <a href="https://developer.mozilla.org" class="friend-link" target="_blank">访问网站</a>
    </div>
  </div>
</div>
</div>
