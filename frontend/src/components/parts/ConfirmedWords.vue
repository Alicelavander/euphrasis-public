<script setup>
import { useStore } from '../../store'

const store = useStore()
</script>

<template>
  <v-row class="mx-16 justify-center">
    <h3 class="mx-16"> Your word-level music preference representation </h3>
  </v-row>
  <v-row class="mx-15 mb-10 justify-center">
    <v-card class="mx-15 mt-5 mb-lg-10 mb-md-0" variant="outlined" :width="width">
      <v-row class="mx-auto justify-center pa-md-5 pa-lg-15">
        <div v-for="item in data" :key="item[0]">
          <v-menu
            location="top start"
            origin="top start"
            transition="scale-transition"
            v-model="item[4]"
          >

            <template v-slot:activator="{ props }" >
              <v-btn v-if="item[1] > 4" v-bind="props" variant="text" class="my-2" size="x-large" :color="colors[item[2]]">
                <div class="text-h2"> {{ item[0] }} </div>
              </v-btn>
              <v-btn v-else v-bind="props" variant="text" class="my-2" @click="loadExplanation(item[0])" :color="colors[item[2]]">
                <div v-if="item[1] > 3" class="text-h3"> {{ item[0] }} </div>
                <div v-else-if="item[1] > 2" class="text-h4"> {{ item[0] }} </div>
                <div v-else-if="item[1] > 1" class="text-h5"> {{ item[0] }} </div>
                <div v-else class="text-h6"> {{ item[0] }} </div>
              </v-btn>
            </template>

            <v-card max-width="350" prepend-icon="mdi-music" class="pa-2">
              <template v-slot:title>
                <span class="font-weight-black"> {{ item[0] }} </span>
              </template>

              <v-card-text class="mt-1">
                Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
              </v-card-text>

              <audio controls class="my-2 mx-3"></audio>
            </v-card>
          </v-menu>
        </div>
      </v-row>
    </v-card>
  </v-row>
</template>

<script>
import { useDisplay } from 'vuetify'

export default {
  data: () => ({
    store: useStore(),
    data: null,
    colors: {
      "genre": "red",
      "instrument": "green",
      "mood": "blue",
      "sound": "orange",
      "technique": "purple",
      "others": "black",
    },

    width: 0,
  }),
  mounted: function() {
    this.loadData();

    this.store.$subscribe((mutation, state) => {
      this.loadData();
    })

    const { width } = useDisplay()
    if(width.value > 1500) {
      this.width = 1000
    } else {
      this.width = "auto"
    }
  },
  methods: {
    loadData: function() {
      this.data = this.store.getWordsDataInArray(this.store.confirmedWords).sort((a, b) => b[1] - a[1]);
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].push(false);
      }
    },
  },
};
</script>