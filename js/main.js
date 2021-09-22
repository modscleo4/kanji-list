'use strict';

import * as Vue from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.12/vue.esm-browser.min.js';

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Install the service worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.error('ServiceWorker registration failed: ', err);
        });
    });
}

window.addEventListener('appinstalled', () => {
    console.log('A2HS installed');
});

let app;

let kanaList = {};
fetch ('https://modscleo4.github.io/kana-list/js/kana-list.json').then(response => response.json()).then(data => kanaList = [...data.gojuuon, ...data.youon, ...data.sokuon]);

/**
 * @type {{shougakkou: {kanji: String, radical: String, grade: String, furigana: String[], translation: String}, chuugakkou: {kanji: String, radical: String, grade: String, furigana: String[], translation: String}[]}}
 */
let kanjiTable = {};
fetch('./js/kanji-list.json').then(response => response.json()).then(data => kanjiTable = data).then(() => {
    app = Vue.createApp({
        data: () => ({
            sidebarOpened: false,
            search: '',
            standalone: window.matchMedia('(display-mode: standalone)').matches,
            config: {
                get theme() {
                    return localStorage.getItem('theme') ?? 'system';
                },

                set theme(val) {
                    localStorage.setItem('theme', val);
                    document.querySelector('html').setAttribute('theme', val);
                },

                get onyomiHiragana() {
                    return (localStorage.getItem('onyomiHiragana') ?? 'false') === 'true';
                },

                set onyomiHiragana(val) {
                    localStorage.setItem('onyomiHiragana', val);
                },
            },
            popupKanji: {
                kanji: null,
                radical: null,
                grade: null,
                furigana: {
                    kunyomi: [],
                    onyomi: [],
                },
                translation: null,
            },
        }),

        computed: {
            kanjisFiltered: function () {
                const kanjis = [...kanjiTable.shougakkou, ...kanjiTable.chuugakkou];

                return kanjis.filter(kanji => kanji.furigana.kunyomi.some(f => f.includes(this.search.toLowerCase())) || kanji.furigana.onyomi.some(f => f.includes(this.search.toLowerCase())));
            },
        },

        methods: {
            furiganas: function ({kunyomi, onyomi}) {
                if (!this.config.onyomiHiragana) {
                    onyomi = onyomi.map(v => this.hiragana2Katakana(v));
                }

                const f = [];
                for (let i = 0; i < Math.max(kunyomi.length, onyomi.length); i++) {
                    f.push({kunyomi: kunyomi[i] || null, onyomi: onyomi[i] || null});
                }

                return f;
            },

            hiragana2Katakana: function(hiragana) {
                let ret = '';
                for (const kana of hiragana) {
                    ret += kanaList.find(v => v.hiragana === kana)?.katakana || kana;
                }

                return ret;
            }
        },
    }).mount('#app');
});
