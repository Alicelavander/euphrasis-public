<script setup>
import { useStore } from '../../store'
const store = useStore()
</script>

<template>
  <v-row class="mt-lg-15 mt-md-10 mb-5 justify-center">
    <h3> How accurately is your music preference articulated? </h3>
  </v-row>
  <v-row class="my-5 mx-15 justify-center">
    <v-col cols="6">
      <v-row class="justify-center">
        <iframe
          :src="'https://www.youtube.com/embed/' + videoId"
          width="350"
          height="250"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          class="mb-5">
        </iframe>
      </v-row>
      <v-row class="justify-center">
        <audio controls :src="audioPath" class="mx-auto my-5"></audio>
      </v-row>
    </v-col>
    <v-col class="justify-center" cols="6">
      <v-sheet max-width="400">
        {{ paragraph }}
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

import { useDisplay } from 'vuetify'

export default {
  data: () => ({
    index: 0,
    store: useStore(),
    videoId: "",
    audioPath: "",
    paragraph: "Generating analysis...",

    cols: 0,
  }),
  mounted: async function() {
    this.loadData();

    this.store.$subscribe((mutation, state) => {
      this.loadData();
    })

    const { width } = useDisplay()
    // this.cols = width.value < 1500 ? 4 : 4;
    this.cols = 4;
  },
  methods: {
    async loadData() {
      //楽曲探索
      const mr_response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Respond in json, with key 'music'. Please suggest one (no more or no less) song into 'music', in the format of title + artist, based on the following information. Dictionary positiveWords is a list of words the user prefered as a key and its frequency/weight as the corresponding value. Dictionary negativeWords is also a list of words the user disliked as a key and its frequency/weight as the corresponding value. positiveWords: " + JSON.stringify(this.store.confirmedWords) + ", negativeWords: " + JSON.stringify(this.store.negativeWords),
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const mr_result = await mr_response.choices[0].message.content
      console.log(mr_result)
      const music = JSON.parse(mr_result).music;

      const yt_response = await fetch("https://www.googleapis.com/youtube/v3/search?key="+process.env.GOOGLE_API_KEY+"&type=video&q="+music);
      const yt_result = await yt_response.json()
      const yt_json = JSON.stringify(yt_result);
      console.log(JSON.parse(yt_json).items[0]);
      this.videoId = JSON.parse(yt_json).items[0].id.videoId;

      //パラグラフ生成
      const pg_response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Respond in second person. Write a short & concise paragraph that best describes the music preference & music taste of an audience with the following information. Dictionary positiveWords is a list of words the user prefered as a key and its frequency/weight as the corresponding value. Dictionary negativeWords is also a list of words the user disliked as a key and its frequency/weight as the corresponding value. positiveWords: " + JSON.stringify(this.store.confirmedWords) + ", negativeWords: " + JSON.stringify(this.store.negativeWords),
              }
            ]
          }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const pg_result = await pg_response.choices[0].message.content;
      console.log(pg_result)
      this.paragraph = pg_result;
      // this.paragraph = "loading..."

      //楽曲生成
      const mg_prompt = this.store.getWordsDataInArray(this.store.confirmedWords).map(item => item[0]);
      console.log("working with prompt: " + mg_prompt)
      const mg_data = { "inputs": mg_prompt };

      const mg_response = await fetch("https://api-inference.huggingface.co/models/facebook/musicgen-small", {
        headers: { 
          Authorization: process.env.HUGGINGFACE_KEY,
          'Content-Type': 'application/json'
          },
        method: "POST",
        body: JSON.stringify(mg_data),
      });
      const mg_result = await mg_response.blob();
      const url = URL.createObjectURL(mg_result);
      this.audioPath = url;
      console.log("audio generated. " + url);
    }
  }
}
</script>