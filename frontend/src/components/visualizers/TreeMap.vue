<script setup>
import { useStore } from '../../store'

const props = defineProps(['dict'])

const store = useStore()
</script>

<template>
  <!-- <div v-if="store.getWordsDataInArray(props.dict).length == 0">
    Go listen to music first
  </div> -->
  <div ref="graph"></div>
</template>

<script>
import Plotly from "plotly.js-dist-min";
import { useStore } from '../../store'

export default {
  data: () => ({
      store: useStore(),
      props: ['dict'],
  }),
  mounted: function() {
    const graph = this.$refs.graph;

    var wordsData = this.store.getWordsDataInArray(this.dict);
    var words = wordsData.map(item => item[0]);
    var values = wordsData.map(item => item[1]);
    var parents = wordsData.map(item => item[2]);

    const data = [{
      type: "treemap",
      labels: words,
      values: values,
      parents: parents,
    }]

    var layout = {
    autosize: true,
    width: 1050,
    height: 950,
    margin: {
      l: 50,
      r: 50,
      b: 100,
      t: 100,
      pad: 5,
    },
    font: {
      size: 24,
    }
  };

    Plotly.newPlot(graph, data, layout)
  }
};
</script>