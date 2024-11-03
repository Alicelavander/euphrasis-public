import { defineStore } from 'pinia'
import OpenAI from 'openai';
import ConfirmedWords from './components/parts/ConfirmedWords.vue';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

export const useStore = defineStore('store', {
  state: () => {
    return {
      queryResults: [
        // {
        //   id: 0,
        //   videoId: "801XBLGqlyA",
        //   caption: "loading...",
        //   keywords: [
        //     {
        //       word: "electronic instrumental",
        //       menu: false
        //     },
        //     {
        //       word: "synthesiser arrangements",
        //       menu: false
        //     },
        //     {
        //       word: "electronic beats",
        //       menu: false
        //     },
        //     {
        //       word: "Dj mixer",
        //       menu: false
        //     },
        //     {
        //       word: "vocal riff",
        //       menu: false
        //     },
        //     {
        //       word: "psychedelic",
        //       menu: false
        //     },
        //     {
        //       word: "hypnotic",
        //       menu: false
        //     },
        //     {
        //       word: "trippy",
        //       menu: false
        //     },
        //     {
        //       word: "trance",
        //       menu: false
        //     },
        //     {
        //       word: "dance groove",
        //       menu: false
        //     },
        //     {
        //       word: "Techno Pop",
        //       menu: false
        //     },
        //     {
        //       word: "EDM",
        //       menu: false
        //     },
        //   ],
        // },
        // {
        //   id: 1,
        //   videoId: "ddtRC7cSZZo",
        //   caption: "loading...",
        //   keywords: [
        //     {
        //       word: "R&B",
        //       menu: false
        //     },
        //     {
        //       word: "passionate male vocal",
        //       menu: false
        //     },
        //     {
        //       word: "harmonizing vocals",
        //       menu: false
        //     },
        //     {
        //       word: "punchy kick",
        //       menu: false
        //     },
        //     {
        //       word: "shimmering hi hats",
        //       menu: false
        //     },
        //     {
        //       word: "synth lead melody",
        //       menu: false
        //     },
        //     {
        //       word: "wooden percussion",
        //       menu: false
        //     },
        //     {
        //       word: "energetic",
        //       menu: false
        //     },
        //   ],
        // },
        // {
        //   id: 2,
        //   videoId: "OfzFnhs3sIY",
        //   caption: "loading...",
        //   keywords: [
        //     {
        //       word: "pop song",
        //       menu: false
        //     },
        //     {
        //       word: "female vocal",
        //       menu: false
        //     },
        //     {
        //       word: "4 on the floor",
        //       menu: false
        //     },
        //     {
        //       word: "kick pattern",
        //       menu: false
        //     },
        //     {
        //       word: "hi hats",
        //       menu: false
        //     },
        //     {
        //       word: "groovy",
        //       menu: false
        //     },
        //     {
        //       word: "synth keys",
        //       menu: false
        //     },
        //     {
        //       word: "melody",
        //       menu: false
        //     },
        //     {
        //       word: "wooden percussion",
        //       menu: false
        //     },
        //     {
        //       word: "weird",
        //       menu: false
        //     },
        //     {
        //       word: "hypnotic",
        //       menu: false
        //     },
        //   ],
        // },
        // {
        //   id: 3,
        //   videoId: "WAoLJ8GbA4Y",
        //   caption: "loading...",
        //   keywords: [
        //     {
        //       word: "Lorem",
        //       menu: false
        //     },
        //     {
        //       word: "ipsum dolor",
        //       menu: false
        //     },
        //     {
        //       word: "sit",
        //       menu: false
        //     },
        //     {
        //       word: "amet",
        //       menu: false
        //     },
        //     {
        //       word: "consectetur",
        //       menu: false
        //     },
        //     {
        //       word: "adipiscing elit",
        //       menu: false
        //     },
        //     {
        //       word: "Donec",
        //       menu: false
        //     },
        //     {
        //       word: "eget nibh",
        //       menu: false
        //     },
        //     {
        //       word: "condimentum",
        //       menu: false
        //     },
        //   ],
        // },
      ],

      positiveWords: {},
      negativeWords: {},

      confirmedWords: {},
      deletedWords: [],
    }
  },
  actions: {
    addWords(words, dict, source) {
      words.forEach(async (original_word) => {
        // const positiveWords =this.getWordsDataInArray(this.positiveWords).filter(item => item[1] != 0).map((word) => word[0]).join(", ");
        // const negativeWords =this.getWordsDataInArray(this.negativeWords).filter(item => item[1] != 0).map((word) => word[0]).join(", ");
        // const confirmedWords =this.getWordsDataInArray(this.confirmedWords).filter(item => item[1] != 0).map((word) => word[0]).join(", ");
        // const deletedWords = this.deletedWords.join(", ");
        // const allWords = positiveWords + ", " + negativeWords + ", " + confirmedWords + ", " + deletedWords;
        // console.log(allWords)

        //これが微妙
        const word_response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": "Respond in one word without period. If possible, convert the word '" + original_word + "' into a word that is more concise (for example, 'pop song' → 'pop', 'male vocalist' → 'male vocal'). Changing the meaning fo the word is strictly prohibited (for example, 'rock' → 'genre', 'energetic' → 'happy' are not allowed). If you can't convert the word, respond with the original word '" + original_word + "'.",
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
        const word_result = await word_response.choices[0].message.content.toLowerCase();

        console.log("original: " + original_word);
        console.log("result: " + word_result);

        const word = word_result;

        let oppositeDict = dict == this.positiveWords ? this.negativeWords : this.positiveWords;

        if(!(word in this.deletedWords)) {
          if(word in this.confirmedWords) {
            this.confirmedWords[word].frequency++;
            this.confirmedWords[word].sources.push(source);
            console.log("word '" + word + "' was confirmed before.")
          } else if(word in oppositeDict) {
            if(oppositeDict[word].frequency > 1) {
              oppositeDict[word].frequency--;
              console.log("deducted weight of '" + word + "' from opposite dictionary.")
            } else {
              delete oppositeDict[word];
              console.log("word '" + word + "' was deleted from opposite dictionary.")
            }
          } else if(word in dict) {
            if(dict[word].category != "") {
              dict[word].frequency++;
              dict[word].sources.push(source);
            }
            console.log("word '" + word + "' was added before.")
          } else {
            const cat_response = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  "role": "user",
                  "content": [
                    {
                      "type": "text",
                      "text": "Respond in one word without period. What is the category of the word " + word + "? choose from the following: genre, instrument, mood, sound, technique, others.",
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
            const cat_result = await cat_response.choices[0].message.content.toLowerCase();

            const exp_response = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  "role": "user",
                  "content": [
                    {
                      "type": "text",
                      "text": "Concisely explain the meaning of the word '" + word + "' in the context of music & song characteristics.",
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
            const exp_result = await exp_response.choices[0].message.content;
            // const exp_result = "loading..."
            
            dict[word] = {
              frequency: 1,
              category: cat_result,
              sources: [],
              explanation: exp_result,
            };
            dict[word].sources.push(source);

            if(!(cat_result in dict)){
              dict[cat_result] = {
                frequency: 0,
                category: ""
              };
            }

            console.log("word '" + word + "' newly added.")
          }
        } else {
          console.log("word '" + word + "' was deleted before.");
        }
      })
      console.log(dict)
    },
    getWordsAndFrequencyInArray(dict) {
      let array = []
      for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
          array.push( [ key, dict[key].frequency ] );
        }
      }
      return array;
    },
    getWordsDataInArray(dict) {
      let array = []
      for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
          array.push( [ key, dict[key].frequency, dict[key].category, dict[key].sources ] );
        }
      }
      return array;
    },
    getWordsByCategory(dict) {
      let res = {}
      for (var key in dict) {
        if (dict.hasOwnProperty(key) && dict[key].category != "") {
          if(!(dict[key].category in res)){
            res[dict[key].category] = []
          }
            res[dict[key].category].push({
            word: key,
            frequency: dict[key].frequency,
            sources: dict[key].sources,
            explanation: dict[key].explanation,
            });
            res[dict[key].category].sort((a, b) => b.frequency - a.frequency);
        }
      }
      return res;
    },
    addMusicQuery(videoId) {
      this.queryResults.push({
        id: this.queryResults.length,
        videoId: videoId,
        // caption: "loading...",
        keywords: [],
      });
    },
    insertMusicQuery(videoId) {
      this.queryResults.unshift({
        id: this.queryResults.length,
        videoId: videoId,
        // caption: "loading...",
        keywords: [],
      });
    },
  },
  persist: true,
})
