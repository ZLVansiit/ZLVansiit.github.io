<template>
  <!-- 实况图标：外虚线圆 + 中细实线 + 内粗实线环 -->
  <svg
    class="live-photo-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="1.15"
      stroke-dasharray="1.25 2.15"
      stroke-linecap="round"
    />
    <circle cx="12" cy="12" r="6.55" stroke="currentColor" stroke-width="1" />
    <circle cx="12" cy="12" r="3.05" stroke="currentColor" stroke-width="2.85" />
  </svg>
</template>

<style scoped>
.live-photo-icon {
  display: block;
  width: 1em;
  height: 1em;
}
</style>
