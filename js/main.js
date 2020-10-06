'use strict';

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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
                const f = [];
                for (let i = 0; i < Math.max(kunyomi.length, onyomi.length); i++) {
                    f.push({kunyomi: kunyomi[i] || null, onyomi: onyomi[i] || null});
                }

                return f;
            }
        },
    }).mount('#app');
});
