<!-- .vitepress/theme/Layout.vue -->
<template>
  <Layout>
    <template #doc-after>
      <ClientOnly>
        <BeautifulCusdis v-if="$frontmatter.comment !== false" />
      </ClientOnly>
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>
