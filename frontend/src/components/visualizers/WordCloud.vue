<script setup>
import { useStore } from '../../store'
const store = useStore();

const props = defineProps(['dict'])

console.log(store.getWordsAndFrequencyInArray(props.dict).length)
</script>

<template>
  <!-- <div v-if="store.getWordsAndFrequencyInArray(props.dict).length == 0">
    Go listen to music first
  </div> -->
  <vue-word-cloud
    style="
      height: 30vh;
      width: 30vw;
    "
    :words="store.getWordsAndFrequencyInArray(props.dict)"
    :color="([, weight]) => weight > 4 ? 'DeepPink' : weight > 2 ? 'RoyalBlue' : 'Indigo'"
    font-family="Roboto"
    :spacing="0.5"
  />
</template>

<script>
import VueWordCloud from 'vuewordcloud';

export default {
  components: {
    [VueWordCloud.name]: VueWordCloud,
  },
};
</script>