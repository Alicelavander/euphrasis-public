<script setup>
import ViewWords from './parts/ViewWords.vue';
import SearchMusic from './parts/SearchMusic.vue';
import ConfirmedWords from './parts/ConfirmedWords.vue';
import Results from './parts/Results.vue';
import WordCloud from './visualizers/WordCloud.vue';
import Welcome from './parts/Welcome.vue';


import { useStore } from '../store'
const store = useStore()

import { useDisplay } from 'vuetify'
const { height } = useDisplay()
</script>

<template>
  <v-main>
    <h1 class="ma-10"> Euphrasis </h1>
    <v-row v-if="store.queryResults.length != 0 || store.getWordsDataInArray(store.positiveWords).length != 0" class="align-center">
      <v-col cols="4">
        <v-row>
          <SearchMusic />
        </v-row>
        <v-row v-if="height < 850" style="overflow-y: scroll; height: 75vh">
          <ViewWords />
        </v-row>
        <v-row v-else style="overflow-y: scroll; height: 85vh">
          <ViewWords />
        </v-row>
      </v-col>
      <v-divider vertical />
      <v-col cols="8">
        <div v-if="store.getWordsDataInArray(store.confirmedWords).length != 0">
          <v-row class="justify-center">
            <ConfirmedWords />
          </v-row>
          <v-divider />
          <v-row class="justify-center">
            <Results />
          </v-row>
        </div>
        <div v-else>
          <v-row class="justify-center align-center">
            Start by browsing word definitions in the left panel!
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-row v-else class="justify-center align-center" style="height: 85vh">
      <Welcome/>
    </v-row>
  </v-main>
</template>

<script>
export default {
  data: () => ({
    store: useStore(),
  }),
}
</script>