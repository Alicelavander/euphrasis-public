<script setup>
  import { useStore } from '../../store'

  const store = useStore()
  const query = store.queryResults[0];
</script>

<template>
  <v-card class="py-5 mb-10" elevation="2" width="400">
    <v-row class="mt-3 mb-2 justify-center">
      <iframe :src="'https://www.youtube.com/embed/'+query.videoId" width="350" height="250" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </v-row>
    <v-card-actions class="flex-wrap mx-1">
      <v-row class="mt-0 justify-center">
        <v-btn 
        @click="removeMusic(store.negativeWords)"
        icon="mdi-emoticon-sad"
        color="red" 
        size="x-large"/>
        <v-btn
        @click="removeMusic"
        icon="mdi-emoticon-neutral"
        color="grey" 
        size="x-large"/>
        <v-btn
        @click="removeMusic(store.positiveWords)"
        icon="mdi-emoticon"
        color="green" 
        size="x-large"/>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import OpenAI from 'openai';

export default {
  data: () => ({
    store: useStore(),
  }),
  methods: {
    removeMusic(dict){
      const query = this.store.queryResults[0];
      if (dict != undefined) this.generateAndAddKeywords(dict);
      this.$emit('remove-music');
    },
    generateAndAddKeywords: async function(dict){
      const query = this.store.queryResults[0];

      //music captioning
      const mc_response = await fetch("http://localhost:8000/yt-music-caps?s=https://www.youtube.com/watch?v=" + query.videoId, {
        method: "POST",
      });
      const mc_result = await mc_response.json()
      const mc_json = JSON.stringify(mc_result)
      const caption = JSON.parse(mc_json).result.text

      //pickup keywords from caption
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_KEY,
        dangerouslyAllowBrowser: true,
      });
      const kw_response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": "Respond in json, with key 'len' and 'keywords'. 'len' is an integer that shows how many words the 'keywords' list contain. 'keywords' is a list of words or phrases, which are musical terms & any related terminology from the following description: " + caption + ". Keep out any general concept terms like 'tempo', and add words that are as technical as possible. Additionally, predict the genre of the music from the description and add to the 'keywords' list.",
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
      console.log(JSON.parse(kw_result).len)
      for(let i = 0; i < JSON.parse(kw_result).len; i++){
        query.keywords.push({
          word: JSON.parse(kw_result).keywords[i],
          menu: false
        })
      }

      this.store.addWords(query.keywords.map(item => item['word']), dict, query.videoId);
    },
  }
}
</script>