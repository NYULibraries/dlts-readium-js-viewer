"use strict";

let Page      = require('./page');
let Selectors = require( './readium-selectors' );

const BOOK_COVER_IMAGE_TYPE_SVG = 'svg';
const BOOK_COVER_IMAGE_TYPE_IMG = 'img';

let ReadiumPage = Object.create( Page, {

    bookCoverImageImg: { get:
        function() {
            let contentIframeElement = $( Selectors.epubContentIframe );

            let bookCoverImage = getBookCoverImage( contentIframeElement, BOOK_COVER_IMAGE_TYPE_IMG );

            return bookCoverImage;
        }
    },

    bookCoverImageSvg: { get:
        function() {
            let contentIframeElement = $( Selectors.epubContentIframe );

            let bookCoverImage = getBookCoverImage( contentIframeElement, BOOK_COVER_IMAGE_TYPE_SVG );

            return bookCoverImage;
        }
    },

    browserName: { get:
        function() {
            return browser.options.capabilities.browserName;
        }
    },

    clearLocalStorage: { value:
        function() {
            browser.execute( function() {
                localStorage.clear();
            } );
        }
    },

    clickPageTurnerLeft: { value:
        function() {
            clickElement( Selectors.pageTurners.left );
        }
    },

    clickPageTurnerRight: { value:
        function() {
            clickElement( Selectors.pageTurners.right );
        }
    },

    closeSettings : { value :
        function() {
            clickElement( Selectors.settings.close );
        }
    },

    // This is only used in Auto and Document scroll modes.  Continuous scroll mode
    // uses a view that has two <iframe> elements.  See the ReadiumPage.scrolledContentFrame
    // property.
    epubContentIframe: { get:
        function() {
            let contentIframeElement = $( Selectors.epubContentIframe );

            browser.switchToFrame( contentIframeElement );

            let bodyElement = $( 'body' );
            let backgroundColor = bodyElement.getCSSProperty( 'background-color' ).parsed.hex;
            let color           = bodyElement.getCSSProperty( 'color' ).parsed.hex;

            let columns;
            if ( this.browserName === 'chrome' ) {
                columns = browser.execute( function() {
                    return document.querySelector( 'html' ).style.columns;
                } );
            } else if ( this.browserName === 'firefox' ) {
                columns = $( 'html' ).getCSSProperty( '-moz-column-count' ).value
            } else {
                // Should never get here.
            }
            // Convert to string.  Sometimes the value is 2, which is not === '2',
            // and so fails waitForColumnsToBeEqualTo( '2' ).
            columns = columns.toString();

            let fontSize = browser.execute( function() {
                return document.querySelector( 'html' ).style.fontSize;
            } );

            let htmlWidth = browser.execute( function() {
                return document.querySelector( 'html' ).style.width;
            } );

            let maxHeight = $( 'html' ).getCSSProperty( 'max-height' ).value;

            browser.switchToParentFrame();

            return {
                contentIframeElement,
                backgroundColor,
                color,
                columns,
                fontSize,
                htmlWidth,
                maxHeight,
            };
        }
    },

    // This is only used in Auto and Document scroll modes.  Continuous scroll mode
    // uses a view that has two <iframe> elements.  See the ReadiumPage.scrolledContentFrame
    // property.
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
            // optional matchText param.  When matchText is specified, the selector
            // argument is understood to be a selector for fetching an array of
            // tags whose elements will then be checked against matchText.
            // Otherwise, selector will be understood to be a specification for
            // fetching a single element only based on text.
            //
            // Example: use `readium.isExistingInContentIframe( 'span', 'Spreadable Media' )`
            //     instead of `readium.isExistingInContentIframe( 'span=Spreadable Media' )`

            let isExistingResult;

            let contentIframeElement = $( Selectors.epubContentIframe );

            browser.switchToFrame( contentIframeElement );

            if ( matchText ) {
                // Make race condition less likely.
                browser.waitUntil(
                    function() {
                        return $$( selector ).length > 0;
                    }
                );

                const elements = $$( selector );
                const numElements = elements.length;

                for ( let i = 0; i < numElements; i++ ) {
                    if ( elements[ i ].getText().includes( matchText ) ) {
                        isExistingResult = true;
                        break;
                    }
                }
            } else {
                // Make race condition less likely.
                $( selector ).waitForDisplayed();
                isExistingResult = ( $( selector ).getText() !== '' );
            }

            browser.switchToParentFrame();

            return isExistingResult;
        }
    },

    isFullscreen : { get:
        function() {
            let fullscreenEnabled = browser.execute( function() {
                if ( document.mozFullScreenElement || document.webkitFullscreenElement ) {
                    return true;
                } else {
                    return false;
                }
            } );

            return fullscreenEnabled;
        }
    },

    navbar: { get:
        function() {
            let element = $( Selectors.navbar.main );

            let navbarCss = getNavbarCss( element );

            let navbarRight = getNavbarRightCss();

            let leftSideVisibleButtons = getVisibleButtons( $$( Selectors.navbar.leftSideButtons ) );

            let rightSideVisibleButtons = getVisibleButtons( $$( Selectors.navbar.rightSideButtons ) );

            let navbar = {
                element,
                hover : () => { element.moveTo(); },
                // Currently element.isDisplayed() does not appear to work correctly
                // with Firefox.  For details, see https://jira.nyu.edu/jira/browse/NYUP-647?focusedCommentId=117270&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-117270
                isDisplayed : this.browserName === 'firefox'  ?
                              element.getCSSProperty( 'opacity' ).value !== 0 :
                              element.isDisplayed(),
                leftSideVisibleButtons,
                navbarRight,
                selector : Selectors.navbar.main,
                rightSideVisibleButtons,
            };

            Object.assign( navbar, navbarCss );

            return navbar;
        }
    },

    open: { value: function( path ) {
        Page.open.call( this, path );

        $( Selectors.epubContentIframe ).waitForExist();
    } },

    readingArea: { get:
        function() {
            let element = $( Selectors.readingArea );

            return {
                top: element.getCSSProperty( 'top' ).value
            };
        }
    },

    saveSettings : { value :
        function() {
            clickElement( Selectors.settings.save );
        }
    },

    selectSettingArabianNights : { value :
        function() {
            clickElement( Selectors.settings.style.textAndBackground.arabianNights );
        }
    },

    selectSettingContinuousScrollMode: { value :
        function() {
            clickElement( Selectors.settings.layout.scrollMode.continuous );
        }
    },

    selectSettingDocumentScrollMode: { value :
        function() {
            clickElement( Selectors.settings.layout.scrollMode.document );
        }
    },

    selectSettingSinglePage: { value :
        function() {
            clickElement( Selectors.settings.layout.displayFormat.singlePage );
        }
    },

    selectSettingDoublePage: { value :
        function() {
            clickElement( Selectors.settings.layout.displayFormat.doublePage );
        }
    },

    selectSettingsLayoutTab : { value :
        function() {
            clickElement( Selectors.settings.layout.tab );
        }
    },

    selectSettingsStyleTab : { value :
        function() {
            clickElement( Selectors.settings.style.tab );
        }
    },

    setFontSizeSliderValue: { value:
        function( value ) {
            setSliderValue( Selectors.settings.style.fontSize, value );
        }
    },

    setPageWidthSliderValue: { value:
        function( value ) {
            setSliderValue( Selectors.settings.layout.pageWidth, value );
        }
    },

    setWindowSize : { value :
        function( size) {
            // size must be an object with width and height fields:
            // {
            //     width  : 500,
            //     height : 500,
            // }
            browser.setWindowSize( size.width, size.height );
        }
    },

    scrolledContentFrame: { get:
        function() {
            let scrolledContentFrameElement = $( Selectors.scrolledContentFrame );

            let overflowY = scrolledContentFrameElement.getCSSProperty( 'overflow-y' ).value;

            return {
                scrolledContentFrameElement,
                overflowY,
            };
        }
    },

    stylePreview: { get:
        function() {
            $( Selectors.settings.style.preview ).waitForDisplayed();

            let element = $( Selectors.settings.style.preview );

            let backgroundColor = element.getCSSProperty( 'background-color' ).parsed.hex;
            let color           = element.getCSSProperty( 'color' ).parsed.hex;
            let fontSize        = element.getCSSProperty( 'font-size' ).value;

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
            let element = $( Selectors.toc.body );

            return {
                element,
                display: element.getCSSProperty( 'display' ).value,
            }
        }
    },

    toggleFullscreen : { value :
        function() {
            // This does not seem to work with Firefox (geckodriver) right now.
            // Firefox goes fullscreen but all-black, pauses, then shrinks back
            // to the original size and view.
            clickElement( Selectors.fullscreen );
        }
    },

    toggleSettings : { value :
        function() {
            clickElement( Selectors.settings.toggle );
        }
    },

    toggleToc : { value :
        function() {
            clickElement( Selectors.toc.toggle );
        }
    },

    vh: { get:
        function() {
            let contentIframeElement = $( Selectors.epubContentIframe );

            browser.switchToFrame( contentIframeElement );

            const htmlHeight = parseInt( $( 'html' ).getCSSProperty( 'height' ).value );

            const vh = htmlHeight / 100;

            browser.switchToParentFrame();

            return vh;
        }
    },

    // On fast machines, sometimes need to pause a bit to allow settings change
    // of columns to take effect.
    waitForColumnsToBeEqualTo : { value :
        function( columnsValue ) {
            let that = this;
            browser.waitUntil(
                function() {
                    return that.epubContentIframe.columns === columnsValue;
                },
                1000
            );
        }
    },

    waitForExistInContentIframe : { value :
        function( selector, matchText ) {
            let that = this;
            browser.waitUntil(
                function() {
                    return that.isExistingInContentIframe( selector, matchText );
                }
            );
        }
    },

    waitForTocToBeVisible : { value :
        function() {
            return $( Selectors.toc.body ).waitForDisplayed();
        }
    }
} );

function clickElement( selector ) {
    $( selector ).waitForDisplayed();
    $( selector ).click();
}

function getBookCoverImage( frameElement, bookCoverImageType ) {
    let bookCoverImage = {};

    browser.switchToFrame( frameElement );

    // Book covers can be either <svg> are <img>.
    // We use different fixes for each.

    if ( bookCoverImageType === BOOK_COVER_IMAGE_TYPE_SVG ) {
        bookCoverImage.maxHeight = $( 'svg' )
            .getCSSProperty( 'max-height' )
            .value;
    } else if ( bookCoverImageType === BOOK_COVER_IMAGE_TYPE_IMG ) {
        let bookCoverImageElement = $( '.cover img' );

        if ( bookCoverImageElement ) {
            bookCoverImage.height    = bookCoverImageElement.getCSSProperty( 'height' ).value;
            bookCoverImage.maxHeight = bookCoverImageElement.getCSSProperty( 'max-height' ).value;
            bookCoverImage.maxWidth  = bookCoverImageElement.getCSSProperty( 'max-width' ).value;
            bookCoverImage.width     = bookCoverImageElement.getCSSProperty( 'width' ).value;
        }
    } else {
        console.log( 'Should never get here.' );
    }

    browser.switchToParentFrame();

    return bookCoverImage;
}

function getNavbarCss( navbarElement ) {
    let backgroundColor = navbarElement.getCSSProperty( 'background-color' ).parsed.hex;

    // Build the convenient testing string.
    // Need this for the dimensional/spatial information in (for example) "rgb(51,51,51)0px1px5px0px"
    let boxShadowUnparsedValue = navbarElement.getCSSProperty( 'box-shadow' ).value;
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
                    navbarElement.getCSSProperty( 'box-shadow' ).parsed.hex.substring( 0, 4 );

    // Our plugin sets "border-radius", but Firefox currently uses the broken-out
    // properties.
    let borderBottomLeftRadius  = navbarElement.getCSSProperty( 'border-bottom-left-radius' ).value;
    let borderBottomRightRadius = navbarElement.getCSSProperty( 'border-bottom-right-radius' ).value;
    let borderTopLeftRadius     = navbarElement.getCSSProperty( 'border-top-left-radius' ).value;
    let borderTopRightRadius    = navbarElement.getCSSProperty( 'border-top-right-radius' ).value;

    let minHeight       = navbarElement.getCSSProperty( 'min-height' ).value;
    let marginBottom    = navbarElement.getCSSProperty( 'margin-bottom' ).value;

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
    let navbarRight = $( '.navbar-right' );

    let backgroundColor = navbarRight.getCSSProperty( 'background-color' ).parsed.hex;
    let height          = navbarRight.getCSSProperty( 'height' ).value;
    // Our plugin sets "margin", but Firefox currently uses the broken-out
    // properties.
    let marginBottom    = navbarRight.getCSSProperty( 'margin-bottom' ).value;
    let marginLeft      = navbarRight.getCSSProperty( 'margin-left' ).value;
    let marginRight     = navbarRight.getCSSProperty( 'margin-right' ).value;
    let marginTop       = navbarRight.getCSSProperty( 'margin-top' ).value;

    let minHeight       = navbarRight.getCSSProperty( 'min-height' ).value;
    let overflow        = navbarRight.getCSSProperty( 'overflow' ).value;

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

function getVisibleButtons( elements ) {
    let buttons = {};

    elements.forEach( function( element ) {
        if (
            element.getCSSProperty( 'visibility' ).value != 'hidden' &&
            element.getCSSProperty( 'display' ).value != 'none'
        ) {
            buttons[ element.getAttribute( 'id' ) ] = {
                css: getNavbarButtonCss( element ),
            };
        }
    } );

    return buttons;
}

function getNavbarButtonCss( button ) {
    return {
        backgroundColor    : button.getCSSProperty( 'background-color' ).parsed.hex,
        backgroundPosition : button.getCSSProperty( 'background-position' ).value,
        backgroundRepeat   : button.getCSSProperty( 'background-repeat' ).value,
        color              : button.getCSSProperty( 'color' ).parsed.hex,
        fontSize           : button.getCSSProperty( 'font-size' ).value,
        height             : button.getCSSProperty( 'height' ).value,
        width              : button.getCSSProperty( 'width' ).value,
    }
}

function setSliderValue( sliderSelector, value ) {
    $( sliderSelector ).waitForDisplayed();

    browser.execute( function( selector, newValue ) {
        $( selector ).val( newValue );

        // Trigger change event so that the preview window text changes.
        $( selector  ).change();
    }, sliderSelector, value );
}

ReadiumPage.BOOK_COVER_IMAGE_TYPE_SVG = BOOK_COVER_IMAGE_TYPE_SVG;
ReadiumPage.BOOK_COVER_IMAGE_TYPE_IMG = BOOK_COVER_IMAGE_TYPE_IMG;

module.exports = ReadiumPage;
