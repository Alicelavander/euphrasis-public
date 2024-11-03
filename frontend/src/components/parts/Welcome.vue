<script setup>
import { useStore } from '../../store'
const store = useStore()
</script>

<template>
  <v-sheet 
    class="w-50 align-center justify-center" 
    floating
  >
    <v-row class="my-5 justify-center">
      <v-file-input 
        label="Upload Audio" 
        hide-details
        variant="solo"
        v-model="audioFile"
      />
    </v-row>
    <v-row class="my-5 justify-center">
      or
    </v-row>
    <v-row  class="my-5 justify-center">
      <v-text-field
        hide-details
        single-line
        label="Enter YouTube URL"
        variant="solo"
        v-model="audioLink"
      />
    </v-row>
    <v-row class="my-5 justify-center">
      <v-btn text="Search" size="large" variant="text" @click="submit"/>
    </v-row>
    <v-row class="ma-15 mx-auto justify-center">
    <p class="mx-5"> {{ status }} </p>
    <v-progress-circular
      v-if="status != ''"
      color="primary"
      indeterminate
    ></v-progress-circular>
  </v-row>
  </v-sheet>
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

    store: useStore(),
  }),
  methods: {
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
    async getYouTubeLinks(musics) {
      for(let i = 0; i < musics.length; i++){
        console.log(musics[i]);
        const yt_response = await fetch("https://www.googleapis.com/youtube/v3/search?key="+process.env.GOOGLE_API_KEY+"&type=video&q="+musics[i]);
        const yt_result = await yt_response.json()
        const yt_json = JSON.stringify(yt_result);
        console.log(JSON.parse(yt_json).items[0]);
        this.store.addMusicQuery(JSON.parse(yt_json).items[0].id.videoId);
      }
    },
  }
}
</script>