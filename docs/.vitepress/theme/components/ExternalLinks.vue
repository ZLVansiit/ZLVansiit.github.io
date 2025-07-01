<template>
  <div class="link-card">
    <h3>友情链接</h3>
    <ul>
      <li v-for="(link, index) in links" :key="index">
        <a :href="link.url" target="_blank">{{ link.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
const links = [
  { name: "Vue 官方", url: "https://vuejs.org" },
  { name: "Vite 文档", url: "https://vitejs.dev" }
]
</script>

<style scoped>
.link-card {
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 8px;
}
</style>
