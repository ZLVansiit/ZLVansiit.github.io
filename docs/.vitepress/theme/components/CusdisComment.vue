<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const containerRef = ref<HTMLElement | null>(null)
const loaded = ref(false)

let observer: IntersectionObserver | null = null

function loadCusdis() {
  if (loaded.value) return
  loaded.value = true

  // 清空旧内容（SPA 切换安全）
  if (containerRef.value) {
    containerRef.value.innerHTML = ''
  }

  const script = document.createElement('script')
  script.src = 'https://cusdis.com/js/cusdis.es.js'
  script.async = true
  script.defer = true
  script.id = 'cusdis_script'
  document.body.appendChild(script)
}

onMounted(() => {
  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadCusdis()
          observer?.disconnect()
        }
      },
      {
        rootMargin: '200px', // 提前加载
      }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section class="vp-comments" ref="containerRef">
    <h2 class="vp-comments-title">评论</h2>

    <div
        v-if="loaded"
        id="cusdis_thread"
        data-host="https://cusdis.com"
        data-app-id="20c62207-4689-4d4f-9702-fe99b144741a"
        :data-page-id="route.path"
        :data-page-url="`https://vansiit.cc${route.path}`"
        :data-page-title="route.data.title"
    />

    <!-- 占位骨架 -->
    <div v-else class="vp-comments-skeleton">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </section>
</template>
