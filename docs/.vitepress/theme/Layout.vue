<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { page } = useData()
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-after>
      <CusdisComment v-if="page.frontmatter.comment !== false" />
    </template>
  </DefaultTheme.Layout>
</template>
