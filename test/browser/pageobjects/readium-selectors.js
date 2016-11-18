"use strict";

const Selectors = {

    epubContentIframe: '#epubContentIframe',

    fullscreen: '#buttFullScreenToggle',

    navbar: {
        main: '#app-navbar',
        leftSideButtons: '.btn-group.navbar-left > button',
        rightSideButtons: '.btn-group.navbar-right > button',
    },

    pageTurners: {
        left: '#left-page-btn',
        right: '#right-page-btn',
    },

    readingArea: '#reading-area',

    settings: {
        toggle: '#settbutt1',

        close: '#closeSettingsCross',
        save: '#buttSave',

        layout: {
            tab: '#tab-butt-layout',

            pageWidth: '#column-max-width-input',

            displayFormat: {
                doublePage: '#double-page-radio',
                singlePage: '#single-page-radio',
            },

            scrollMode: {
                continuous: '#scroll-continuous-option',
                document: '#scroll-doc-radio',
            }

        },

        style: {
            tab: '#tab-butt-style',

            fontSize: '#font-size-input',
            preview: 'div.preview-text',
            textAndBackground: {
                arabianNights: 'button.night-theme',
            },
        },
    },

    toc: {
        toggle: '#tocButt',

        body: '#readium-toc-body',
    },
};

Object.freeze( Selectors );

module.exports = Selectors;
