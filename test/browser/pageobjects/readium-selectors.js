"use strict";

const Selectors = {

    // The EPUB content <iframe> changes depending on user settings.  The Auto
    // scroll mode uses a viewer <iframe> with id attribute "epubContentIframe".
    // In Document scroll mode, the <iframe> has no id attribute, but a class name of
    // "iframe-fixed".  For now, just target using the "iframe" tag name.
    // For Continuous scroll mode, see scrolledContentFrame selector.
    epubContentIframe: 'iframe',

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
