<script setup>
import { useStore } from '../../store'

const props = defineProps(['dict'])

const store = useStore()
</script>

<template>
  <div class="ml-15 mt-15 ma-5">
    <v-card>
      <v-tabs
        v-model="tab"
        align-tabs="center"
        color="deep-purple-accent-4"
      >
        <v-tab :value="1">Individual</v-tab>
        <v-tab :value="2">Category</v-tab>
        <v-tab :value="3">????</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item
          v-for="n in 3"
          :key="n"
          :value="n"
        >
          <v-container fluid>
            <!-- <div v-if="store.getWordsDataInArray(props.dict).length == 0">
              Go listen to music first
            </div> -->
            <v-virtual-scroll :items="data[n-1]" height="75vh">
              <template v-slot:default="{ item }">
                <v-row class="mx-auto justify-center align-center">
                  <div class="text-h5 font-weight-black">
                    <strong v-if="item[3] == 1" class=" text-amber-darken-1" >{{ item[3] }}</strong>
                    <strong v-else-if="item[3] == 2" class="text-blue-grey-lighten-1" >{{ item[3] }}</strong>
                    <strong v-else-if="item[3] == 3" class="text-brown-darken-1" >{{ item[3] }}</strong>
                    <div v-else class="text-h6 font-weight-bold">{{ item[3] }}</div>
                  </div>
                  <v-card
                    class="ma-5"
                    variant="outlined"
                    :width="550"
                  >
                    <template v-slot:prepend>
                      <v-icon :color="colors[item[2]] != undefined ? colors[item[2]] : colors['others']" icon="mdi-music"></v-icon>
                    </template>

                    <template v-slot:title>
                      <div v-if="item[1] > 2" class="text-h4">{{ item[0] }}</div>
                      <div v-if="item[1] == 2" class="text-h5">{{ item[0] }}</div>
                      <div v-if="item[1] == 1" class="text-h6">{{ item[0] }}</div>
                    </template>

                    <template v-slot:subtitle>{{ item[2] }}, selected {{ item[1] }} times</template>

                    <template v-slot:append>
                      <v-btn
                        :icon="item[4] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                        @click="item[4] = !item[4]"
                        variant="text"
                      ></v-btn>
                    </template>

                    <v-expand-transition>
                      <div v-show="item[4]">
                        <v-divider></v-divider>

                        <v-card-text>
                          I'm a thing. But, like most politicians, he promised more than he could deliver. You won't have time for sleeping, soldier, not with all the bed making you'll be doing. Then we'll go with that data file! Hey, you add a one and two zeros to that or we walk! You're going to do his laundry? I've got to find a way to escape.
                        </v-card-text>
                      </div>
                    </v-expand-transition>
                  </v-card>
                </v-row>
              </template>
            </v-virtual-scroll>
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </div>
</template>

<script>
import { useStore } from '../../store'

export default {
  data: () => ({
      tab: null,

      store: useStore(),
      props: ['dict'],
      colors: {
        "genre": "red",
        "artist": "blue",
        "instrument": "green",
        "mood": "pink",
        "technique": "purple",
        "style": "blue",
        "sound": "orange",
        "equipment": "pink",
        "others": "grey",
      },

      data: []
  }),
  mounted: function() {
    let wordList = this.store.getWordsDataInArray(this.dict).filter(item => item[1] != 0).sort((a, b) => b[1] - a[1]).slice(0, 7);
    for (let i = 1; i <= wordList.length; i++) {
      wordList[i-1].push(i);
      wordList[i-1].push(false);
    }
    this.data.push(wordList);

    const categories = this.store.getWordsDataInArray(this.dict).filter(item => item[1] == 0).map(item => item[0]);
    console.log(categories);
    console.log(this.colors);

  }
};
</script>