<script setup>
import MusicCard from '../template/MusicCard.vue'

import { useStore } from '../../store'
const store = useStore()
</script>

<template>
  <v-row class="justify-center">
    <v-dialog width="auto">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" rounded x-large prepend-icon="mdi-plus" color="primary" height="50" class="ma-5 mb-md-5 mb-lg-10">
          Add Words
        </v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card
          title="Listen to Music"
          width="700"
        >
          <v-row class="align-center justify-center my-10 mx-15">
            <v-text-field
              hide-details
              single-line
              label="Add YouTube video to list by URL"
              variant="solo"
              v-model="moreYouTube"
              class="mx-5"
            >
              <template v-slot:append-inner>
                <v-btn
                  icon="mdi-music-note-plus"
                  size="large"
                  variant="text"
                  @click="addVideo"
                />  
              </template>
            </v-text-field>
          </v-row>
          <v-row class="justify-center">
            <MusicCard
              v-if="store.queryResults.length != 0"
              @remove-music="removeMusic"
              :key="store.queryResults[0].id"
            />
          </v-row>
          
          <template v-slot:actions>
            <v-btn
              class="ml-auto"
              text="done"
              @click="isActive.value = false"
            ></v-btn>
          </template>
        </v-card>
      </template>
    </v-dialog>
  </v-row>
</template>

<script>
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

export default {
  data: () => ({
    first: true,

    audioLink: "",
    audioFile: null,
    status: "",

    moreYouTube: "",

    index: 0,

    store: useStore(),
  }),
  methods: {
    removeMusic() {
      this.store.queryResults.shift();
      if(this.store.queryResults.length < 2){
        this.loadMore();
      }
    },
    addVideo() {
      this.store.insertMusicQuery(this.moreYouTube.substring(32));
      this.moreYouTube = "";
    },
    async submit() {
      this.first = false;

      this.status = "Analyzing given music..."

      //music captioning
      var mc_response = null;
      if(this.audioLink == ""){
        const formData = new FormData();
        formData.append('file', this.audioFile);
        mc_response = await fetch("http://localhost:8000/music-caps", {
          method: "POST",
          body: formData
        });
      } else {
        mc_response = await fetch("http://localhost:8000/yt-music-caps?s=" + this.audioLink, {
          method: "POST",
        });
      }

      const mc_result = await mc_response.json()
      const mc_json = JSON.stringify(mc_result);
      console.log(JSON.parse(mc_json).result.text)

      //pickup keywords from caption
      const kw_response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Respond in json, with key 'len' and 'keywords'. 'len' is an integer that shows how many words the 'keywords' list contain. 'keywords' is a list of words or phrases, which are musical terms & any related terminology from the following description: " + JSON.parse(mc_json).result.text + ". Keep out any general concept terms like 'tempo' and words that talk about quality, but add other words that are as technical as possible & unique to the specific music. Additionally, predict the genre of the music from the description and add to the 'keywords' list.",
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
      const kw_result = await kw_response.choices[0].message.content
      console.log(kw_result)
      console.log(JSON.parse(kw_result).keywords.toString())

      let words = []
      for(let i = 0; i < JSON.parse(kw_result).len; i++){
        words.push(JSON.parse(kw_result).keywords[i]);
      }

      this.store.addWords(words, this.store.positiveWords, "initial input");

      this.status = "Searching for related music..."

      const mr_response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Respond in json, with key 'len' and 'musics'. 'len' is an integer that shows how many musics the 'musics' list contain. Please suggest multiple songs into the 'musics' list, in the format of title + artist, from the following list of words: " + words.toString(),
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
      const musics = JSON.parse(mr_result).musics;

      this.getYouTubeLinks(musics);

      this.status = '';
    },
    async loadMore() {
      this.loading = true

      const mr_response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Respond in json, with key 'len' and 'musics'. 'len' is an integer that shows how many musics the 'musics' list contain. Please suggest multiple songs into the 'musics' list, in the format of title + artist, based on the following information. Dictionary positiveWords is a list of words the user prefered as a key and its frequency/weight as the corresponding value. Dictionary negativeWords is also a list of words the user disliked as a key and its frequency/weight as the corresponding value. positiveWords: " + JSON.stringify(this.store.positiveWords) + ", negativeWords: " + JSON.stringify(this.store.negativeWords),
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
      const musics = JSON.parse(mr_result).musics;

      this.getYouTubeLinks(musics);

      this.loading = false;
    },
    async getYouTubeLinks(musics) {
      for(let i = 0; i < musics.length; i++){
        console.log(musics[i]);
        const yt_response = await fetch("https://www.googleapis.com/youtube/v3/search?key="+process.env.GOOGLE_API_KEY+"&type=video&q="+musics[i]);
        const yt_result = await yt_response.json()
        const yt_json = JSON.stringify(yt_result);
        console.log(JSON.parse(yt_json).items[0]);
        this.store.addMusicQuery(JSON.parse(yt_json).items[0].id.videoId);
      }
    }
  }
}
</script>