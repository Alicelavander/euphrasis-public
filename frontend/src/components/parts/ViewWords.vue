<script setup>
import { useStore } from '../../store'
import WordCloud from '../visualizers/WordCloud.vue'
import TreeMap from '../visualizers/TreeMap.vue'
import FancyList from '../visualizers/FancyList.vue'
import ListByCategory from '../visualizers/ListByCategory.vue'

const store = useStore()
</script>

<template>
  <ListByCategory :dict="store.positiveWords" />
</template>

<script>
export default {
  data: () => ({
      store: useStore(),
  }),
};
</script>