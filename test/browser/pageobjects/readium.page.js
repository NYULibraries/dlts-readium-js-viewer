"use strict";

let Page = require('./page');

const SELECTORS = {

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
        },

        style: {
            tab: '#tab-butt-style',

            arabianNights: 'button.night-theme',
            fontSize: '#font-size-input',
            preview: 'div.preview-text',
        },
    },

    toc: {
        toggle: '#tocButt',

        body: '#readium-toc-body',
    },
};

const BOOK_COVER_IMAGE_TYPE_SVG = 'svg';
const BOOK_COVER_IMAGE_TYPE_IMG = 'img';

let ReadiumPage = Object.create( Page, {

    bookCoverImageImg: { get:
        function() {
            let contentIframeElement = browser.element( SELECTORS.epubContentIframe );

            let bookCoverImage = getBookCoverImage( contentIframeElement.value, BOOK_COVER_IMAGE_TYPE_IMG );

            return bookCoverImage;
        }
    },

    bookCoverImageImgEnclosingElementWidth: { get:
        function() {
            let contentIframeElement = browser.element( SELECTORS.epubContentIframe );

            browser.frame( contentIframeElement.value );

            let width = browser.execute( function() {
                // Switching to ES5 syntax, just in case.
                return window.getComputedStyle(
                    document.getElementsByTagName( 'img' )[ 0 ].parentElement
                ).width;
            } );

            browser.frameParent();

            return parseInt( width.value.replace( /px$/, '' ) );
        }
    },

    bookCoverImageSvg: { get:
        function() {
            let contentIframeElement = browser.element( SELECTORS.epubContentIframe );

            let bookCoverImage = getBookCoverImage( contentIframeElement.value, BOOK_COVER_IMAGE_TYPE_SVG );

            return bookCoverImage;
        }
    },

    clearLocalStorage: { value:
        function() {
            browser.execute( function() {
                localStorage.clear();
            } );
        }
    },

    clickFullscreenToggle: { value:
        function() {
            // This does not seem to work with Firefox (geckodriver) right now.
            // Firefox goes fullscreen but all-black, pauses, then shrinks back
            // to the original size and view.
            clickElement( SELECTORS.fullscreen );
        }
    },

    clickPageTurnerLeft: { value:
        function() {
            // browser.moveToObject() doesn't work yet for Firefox.
            // https://github.com/mozilla/geckodriver/issues/159
            browser.moveToObject( SELECTORS.pageTurners.left );
            clickElement( SELECTORS.pageTurners.left );
        }
    },

    clickPageTurnerRight: { value:
        function() {
            // browser.moveToObject() doesn't work yet for Firefox.
            // https://github.com/mozilla/geckodriver/issues/159
            browser.moveToObject( SELECTORS.pageTurners.right );
            clickElement( SELECTORS.pageTurners.right );
        }
    },

    clickSettingsButton: { value:
        function() {
            // TODO:
            // browser.moveToObject() doesn't work yet for Firefox.
            // https://github.com/mozilla/geckodriver/issues/159
            // browser.moveToObject( SELECTORS.settings.toggle );
            clickElement( SELECTORS.settings.toggle );
        }
    },

    clickSettingsArabianNightsButton: { value:
        function() {
            clickElement( SELECTORS.settings.style.arabianNights );
        }
    },

    clickSettingsCloseButton: { value:
        function() {
            clickElement( SELECTORS.settings.close );
        }
    },

    clickSettingsLayoutTab: { value:
        function() {
            clickElement( SELECTORS.settings.layout.tab );
        }
    },

    clickSettingsSaveButton: { value:
        function() {
            clickElement( SELECTORS.settings.save );
        }
    },

    clickSettingsStyleTab: { value:
        function() {
            clickElement( SELECTORS.settings.style.tab );
        }
    },

    clickToc: { value:
         function() {
             // TODO:
             // browser.moveToObject() doesn't work yet for Firefox.
             // https://github.com/mozilla/geckodriver/issues/159
             // browser.moveToObject( SELECTORS.toc.toggle );
             clickElement( SELECTORS.toc.toggle );
         }
    },

    epubContentIframe: { get:
        function() {
            let contentIframeElement = browser.element( SELECTORS.epubContentIframe );

            browser.frame( contentIframeElement.value );

            let bodyElement = browser.element( 'body' );
            let backgroundColor = bodyElement.getCssProperty( 'background-color' ).parsed.hex;
            let color           = bodyElement.getCssProperty( 'color' ).parsed.hex;

            let fontSize = browser.execute( function() {
                return document.querySelector( 'html' ).style.fontSize;
            } ).value;

            browser.frameParent();

            return {
                contentIframeElement,
                backgroundColor,
                color,
                fontSize,
            };
        }
    },

    isExistingInContentIframe: { value:
        function( selector, matchText ) {
            // Element with text selectors (ex. "span=Spreadable Media") and XPath selectors
            // (ex. //span[normalize-space() = "Spreadable Media"]) do not seem to be working
            // on our test EPUB.  This appears to be because the chapter files
            // are XHTML, with .xthml extensions, which seems to throw Selenium
            // into "XML mode", where namespace prefixes are necessary for matching
            // tags using XPath:
            // http://stackoverflow.com/questions/32232299/selenium-cannot-find-xpath-when-xmlns-attribute-is-included
            //
            // Selenium output shows that WebdriverIO is using
            //
            //    By.XPath '//span[normalize-space() = "Spreadable Media"]'
            //
            // ...which fails, whereas selector
            //
            //    '//*[normalize-space() = "Spreadable Media"]'
            //
            // ...succeeds.
            //
            // Tried using namespace specified in the xhtml file:
            //
            //     '//span[namespace-uri()="http://www.w3.org/1999/xhtml"][normalize-space() = "Spreadable Media"]'
            //
            // ...but without success.
            //
            // Simply changing the file extension from .xhtml to .html makes this
            // bug go away.  We don't have this option for our EPUBs, though.
            //
            // The workaround we use here is to overload this method with an
            // optional matchText param.  When matchText is specified, fetch an
            // array of all tags of the type specified by selector, and then check
            // for a match in the array elements.
            //
            // Example: use `readium.isExistingInContentIframe( 'span', 'Spreadable Media' )`
            //     instead of `readium.isExistingInContentIframe( 'span=Spreadable Media' )`

            let isExistingResult;

            let contentIframeElement = browser.element( SELECTORS.epubContentIframe );

            browser.frame( contentIframeElement.value );

            let text = browser.getText( selector );

            if ( matchText ) {
                isExistingResult = text.includes( matchText );
            } else {
                isExistingResult = ( text !== '' );
            }

            browser.frameParent();

            return isExistingResult;
        }
    },

    isFullscreen : { get:
        function() {
            let fullscreenEnabled = browser.execute( function() {
                if ( document.mozFullscreenElement || document.webkitFullscreenElement ) {
                    return true;
                } else {
                    return false;
                }
            } ).value;

            return fullscreenEnabled;
        }
    },

    navbar: { get:
        function() {
            let element = browser.element( SELECTORS.navbar.main );

            let navbarCss = getNavbarCss( element );

            let navbarRight = getNavbarRightCss();

            let navbarLeftButtons = browser.elements( SELECTORS.navbar.leftSideButtons ).value;
            let navbarLeftVisibleButtonIds = getVisibleElementIds( navbarLeftButtons );
            let leftSideVisibleButtons = getVisibleButtons( navbarLeftVisibleButtonIds );

            let navbarRightButtons = browser.elements( SELECTORS.navbar.rightSideButtons  ).value;
            let navbarRightVisibleButtonIds = getVisibleElementIds( navbarRightButtons );
            let rightSideVisibleButtons = getVisibleButtons( navbarRightVisibleButtonIds );

            let navbar = {
                element,
                leftSideVisibleButtons,
                navbarRight,
                selector : SELECTORS.navbar.main,
                rightSideVisibleButtons,
            };

            Object.assign( navbar, navbarCss );

            return navbar;
        }
    },

    open: { value: function( path ) {
        Page.open.call( this, path );

        browser.waitForExist( SELECTORS.epubContentIframe );
    } },

    readingArea: { get:
        function() {
            let element = browser.element( SELECTORS.readingArea );

            return {
                top: element.getCssProperty( 'top' ).value
            };
        }
    },

    setFontSizeSliderValue: { value:
        function( value ) {
            browser.waitForVisible( SELECTORS.settings.style.fontSize );

            browser.execute( function( selector, newValue ) {
                $( selector ).val( newValue );

                // Trigger change event so that the preview window text changes.
                $( selector  ).change();
            }, SELECTORS.settings.style.fontSize , value );
        }
    },

    stylePreview: { get:
        function() {
            browser.waitForVisible( SELECTORS.settings.style.preview );

            let element = browser.element( SELECTORS.settings.style.preview );

            let backgroundColor = element.getCssProperty( 'background-color' ).parsed.hex;
            let color           = element.getCssProperty( 'color' ).parsed.hex;
            let fontSize        = element.getCssProperty( 'font-size' ).value;

            return {
                element,
                backgroundColor,
                color,
                fontSize,
            }
        }
    },

    toc: { get:
        function() {
            let element = browser.element( SELECTORS.toc.body );

            return {
                element,
                display: element.getCssProperty( 'display' ).value,
            }
        }
    },

    vh: { get:
        function() {
            let contentIframeElement = browser.element( SELECTORS.epubContentIframe );

            browser.frame( contentIframeElement.value );

            let vh = browser.getViewportSize().height / 100;

            browser.frameParent();

            return vh;
        }
    },
} );

function clickElement( selector ) {
    browser.waitForVisible( selector );
    browser.click( selector );
}

function getBookCoverImage( frameId, bookCoverImageType ) {
    let bookCoverImage = {};

    browser.frame( frameId );

    // OA Book covers are <svg>, Connected Youth book covers are <img>
    // We use different fixes for each.

    if ( bookCoverImageType === BOOK_COVER_IMAGE_TYPE_SVG ) {
        bookCoverImage.position = browser.element( 'svg' )
            .getCssProperty( 'position' )
            .value;
    } else if ( bookCoverImageType === BOOK_COVER_IMAGE_TYPE_IMG ) {
        let bookCoverImageElement = browser.element( '.cover img' );

        if ( bookCoverImageElement ) {
            bookCoverImage.height    = bookCoverImageElement.getCssProperty( 'height' ).value;
            bookCoverImage.maxHeight = bookCoverImageElement.getCssProperty( 'max-height' ).value;
            bookCoverImage.maxWidth  = bookCoverImageElement.getCssProperty( 'max-width' ).value;
            bookCoverImage.width     = bookCoverImageElement.getCssProperty( 'width' ).value;
        }
    } else {
        console.log( 'Should never get here.' );
    }

    browser.frameParent();

    return bookCoverImage;
}

function getNavbarCss( navbarElement ) {
    let backgroundColor = navbarElement.getCssProperty( 'background-color' ).parsed.hex;

    // Build the convenient testing string.
    // Need this for the dimensional/spatial information in (for example) "rgb(51,51,51)0px1px5px0px"
    let boxShadowUnparsedValue = navbarElement.getCssProperty( 'box-shadow' ).value;
    let boxShadowParseOffsetAndRadiusRegex =
            /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)(\d+px)(\d+px)(\d+px)\d+px$/;
    let boxShadowOffsetAndRadiusParts = boxShadowParseOffsetAndRadiusRegex
        .exec( boxShadowUnparsedValue );
    let boxShadow = boxShadowOffsetAndRadiusParts[ 1 ] +
                    ' '                                +
                    boxShadowOffsetAndRadiusParts[ 2 ] +
                    ' '                                +
                    boxShadowOffsetAndRadiusParts[ 3 ] +
                    ' '                                +
                    navbarElement.getCssProperty( 'box-shadow' ).parsed.hex.substring( 0, 4 );

    // Our plugin sets "border-radius", but Firefox currently uses the broken-out
    // properties.
    let borderBottomLeftRadius  = navbarElement.getCssProperty( 'border-bottom-left-radius' ).value;
    let borderBottomRightRadius = navbarElement.getCssProperty( 'border-bottom-right-radius' ).value;
    let borderTopLeftRadius     = navbarElement.getCssProperty( 'border-top-left-radius' ).value;
    let borderTopRightRadius    = navbarElement.getCssProperty( 'border-top-right-radius' ).value;

    let minHeight       = navbarElement.getCssProperty( 'min-height' ).value;
    let marginBottom    = navbarElement.getCssProperty( 'margin-bottom' ).value;

    return {
        backgroundColor,
        boxShadow,
        borderBottomLeftRadius,
        borderBottomRightRadius,
        borderTopLeftRadius,
        borderTopRightRadius,
        minHeight,
        marginBottom,
    }
}

function getNavbarRightCss() {
    let navbarRight = browser.element( '.navbar-right' );

    let backgroundColor = navbarRight.getCssProperty( 'background-color' ).parsed.hex;
    let height          = navbarRight.getCssProperty( 'height' ).value;
    // Our plugin sets "margin", but Firefox currently uses the broken-out
    // properties.
    let marginBottom    = navbarRight.getCssProperty( 'margin-bottom' ).value;
    let marginLeft      = navbarRight.getCssProperty( 'margin-left' ).value;
    let marginRight     = navbarRight.getCssProperty( 'margin-right' ).value;
    let marginTop       = navbarRight.getCssProperty( 'margin-top' ).value;

    let minHeight       = navbarRight.getCssProperty( 'min-height' ).value;
    let overflow        = navbarRight.getCssProperty( 'overflow' ).value;

    return {
        backgroundColor,
        height,
        marginBottom,
        marginLeft,
        marginRight,
        marginTop,
        minHeight,
        overflow,
    }
}

function getVisibleElementIds( elements ) {
    let visibleChildElementIds = [];

    elements.forEach( function( element ) {
        let id = element.ELEMENT;
        if (
            browser.elementIdCssProperty( id, 'visibility' ).value != 'hidden' &&
            browser.elementIdCssProperty( id, 'display' ).value != 'none'
        ) {
            visibleChildElementIds.push( id );
        }
    } );

    return visibleChildElementIds;
}

function getVisibleButtons( elementIds ) {
    let buttons = {};

    elementIds.forEach( function( elementId ) {
        let idAttribute = browser.elementIdAttribute( elementId, 'id' ).value;
        buttons[ idAttribute ] = {
            css: getNavbarButtonCss( idAttribute ),
        };
    } );

    return buttons;
}

function getNavbarButtonCss( buttonIdAttribute ) {
    let button = browser.element( `#${buttonIdAttribute}` );

    return {
        backgroundColor    : button.getCssProperty( 'background-color' ).parsed.hex,
        backgroundPosition : button.getCssProperty( 'background-position' ).value,
        backgroundRepeat   : button.getCssProperty( 'background-repeat' ).value,
        color              : button.getCssProperty( 'color' ).parsed.hex,
        fontSize           : button.getCssProperty( 'font-size' ).value,
        height             : button.getCssProperty( 'height' ).value,
        width              : button.getCssProperty( 'width' ).value,
    }
}

ReadiumPage.BOOK_COVER_IMAGE_TYPE_SVG = BOOK_COVER_IMAGE_TYPE_SVG;
ReadiumPage.BOOK_COVER_IMAGE_TYPE_IMG = BOOK_COVER_IMAGE_TYPE_IMG;

module.exports = ReadiumPage;
