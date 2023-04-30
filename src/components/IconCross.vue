<template>
  <svg :width="size" :height="size" viewBox="0 0 16 16">
    <path stroke="currentColor" d="M12 4L4 12"  stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
    <path stroke="currentColor" d="M4 4L12 12" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

</template>

<script lang="ts" setup>
import { withDefaults } from 'vue';
interface Props {
  size?: number|string;
}
withDefaults(defineProps<Props>(), {
  size: 32,
});
</script>