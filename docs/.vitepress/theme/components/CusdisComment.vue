<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

function loadCusdis() {
  const existing = document.getElementById('cusdis_script')
  if (existing) return

  const script = document.createElement('script')
  script.src = 'https://cusdis.com/js/cusdis.es.js'
  script.async = true
  script.defer = true
  script.id = 'cusdis_script'
  document.body.appendChild(script)
}

onMounted(loadCusdis)

// 切换路由时刷新评论
watch(
    () => route.path,
    () => {
      const el = document.querySelector('#cusdis_thread')
      if (el) el.innerHTML = ''
      loadCusdis()
    }
)
</script>

<template>
  <section style="margin-top: 48px">
    <div
        id="cusdis_thread"
        data-host="https://cusdis.com"
        data-app-id="20c62207-4689-4d4f-9702-fe99b144741a"
        :data-page-id="route.path"
        :data-page-url="`https://vansiit.cc${route.path}`"
        :data-page-title="route.data.title"
    />
  </section>
</template>
