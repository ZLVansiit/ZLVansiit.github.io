<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { page } = useData()
</script>

<template>
  <DefaultTheme.Layout>
    <ClientOnly>
    <template #doc-after>
      <BeautifulCusdis v-if="page.frontmatter.comment !== false" />
    </template>
    </ClientOnly>
  </DefaultTheme.Layout>
</template>
