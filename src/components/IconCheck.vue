<template>
  <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox"
       :width="size"
       :height="size"
       fill="none"
  >
    <path d="M27 9L13 23L6 16" stroke="#55C260" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts" setup>
import {withDefaults} from 'vue';

interface Props {
  size?: number;
  stroke?: string;
  viewBox?: string;
  fill?: string;
  enable?: boolean;
}

withDefaults(defineProps<Props>(), {
  size: 24,
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
  fill: 'none',
  enable: false,
});
</script>

<style lang="scss">

</style>