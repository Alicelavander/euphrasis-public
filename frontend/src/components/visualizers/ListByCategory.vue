<script setup>
import { useStore } from '../../store'

const props = defineProps(['dict'])

const store = useStore()
</script>

<template>
  <!-- <div v-if="store.getWordsDataInArray(props.dict).length == 0">
    Go listen to music first
  </div> -->
  <v-row class="my-10 justify-center">
    <div v-for="(datum, index) in data" :key="index">
      <v-card class="ma-5" elevation="2" :width="width" variant="outlined" :color="colors[index]">
        <v-card-title class="text-overline pt-5"> {{ index }} </v-card-title>
        <v-row class="flex-wrap pa-3">
          <div v-for="keyword in datum">
            <v-menu
              location="top start"
              origin="top start"
              transition="scale-transition"
              v-model="keyword.menu"
            >
              <template v-slot:activator="{ props }">
                <v-btn v-if="keyword.frequency > 4" v-bind="props" variant="text" class="my-2" size="x-large">
                  <div class="text-h2"> {{ keyword.word }} </div>
                </v-btn>
                <v-btn v-else v-bind="props" variant="text" class="my-2" @click="loadExplanation(keyword.word)">
                  <div v-if="keyword.frequency > 3" class="text-h3"> {{ keyword.word }} </div>
                  <div v-else-if="keyword.frequency > 2" class="text-h4"> {{ keyword.word }} </div>
                  <div v-else-if="keyword.frequency > 1" class="text-h5"> {{ keyword.word }} </div>
                  <div v-else class="text-h6"> {{ keyword.word }} </div>
                </v-btn>
              </template>

              <v-card max-width="350" prepend-icon="mdi-music" class="pa-2">
                <template v-slot:title>
                  <span class="font-weight-black"> {{ keyword.word }} </span>
                </template>

                <v-card-text class="mt-1">
                  {{ keyword.explanation }}
                </v-card-text>

                <v-card variant="text" subtitle="Word retrieved from:">
                  <v-row class="flex-wrap mx-3 mb-2">
                    <div v-for="source in keyword.sources">
                      <v-chip v-if="source == 'initial input'" class="ma-1" color="grey" text-color="white"> {{ source }} </v-chip>
                      <v-chip v-else class="ma-1" color="primary" text-color="white" :href="'https://www.youtube.com/watch?v=' + source" target="_blank" > YouTube video </v-chip>
                    </div>
                  </v-row>
                </v-card>

                <template v-slot:actions>
                  <v-btn
                    append-icon="mdi-plus"
                    @click="confirmWord(keyword.word)"
                    text="Save word"
                    class="ma-0"
                    color="deep-purple-accent-4"
                  />
                  <v-btn
                    append-icon="mdi-delete"
                    @click="deleteWord(keyword.word)"
                    text="Delete word"
                    class="ma-0"
                    color="red-accent-4"
                  />
                </template>
              </v-card>
            </v-menu>
          </div>
        </v-row>
      </v-card>
    </div>
  </v-row>
</template>

<script>
import { useStore } from '../../store'
import { useDisplay } from 'vuetify'

export default {
  data: () => ({
    store: useStore(),
    props: ['dict'],

    data: [],
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
    this.data = this.store.getWordsByCategory(this.dict)

    this.store.$subscribe((mutation, state) => {
      this.data = this.store.getWordsByCategory(this.dict)
    })

    const { width } = useDisplay()
    console.log(width.value)
    if(width.value > 1500) {
      this.width = 600
    } else {
      this.width = 350
    }
  },
  methods: {
    confirmWord: function(word) {
      this.store.confirmedWords[word] = this.dict[word];
      delete this.dict[word];
      this.data = this.store.getWordsByCategory(this.dict)
    },
    deleteWord: function(word) {
      this.store.deletedWords.push(word)
      delete this.dict[word];
      this.data = this.store.getWordsByCategory(this.dict)
    },
    loadExplanation: async function(word) {
      console.log("triggered")
      // const explanation = await this.store.generateExplanation(word);
      // this.dict[word].explanation = explanation;
      // this.data = this.store.getWordsByCategory(this.dict)
    },
  },
};
</script>