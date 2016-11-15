"use strict";

let Page = require('./page');

const EPUB_CONTENT_IFRAME        = '#epubContentIframe';
const NAVBAR_SELECTOR            = '#app-navbar';
const PAGE_TURNER_LEFT_SELECTOR  = '#left-page-btn';
const PAGE_TURNER_RIGHT_SELECTOR = '#right-page-btn';
const READING_AREA_SELECTOR      = '#reading-area';

const BOOK_COVER_IMAGE_TYPE_SVG = 'svg';
const BOOK_COVER_IMAGE_TYPE_IMG = 'img';

let ReadiumPage = Object.create( Page, {

    bookCoverImageImg: { get:
        function() {
            let contentIframeElement = browser.element( EPUB_CONTENT_IFRAME );

            let bookCoverImage = getBookCoverImage( contentIframeElement.value, BOOK_COVER_IMAGE_TYPE_IMG );

            return bookCoverImage;
        }
    },

    bookCoverImageImgEnclosingElementWidth: { get:
        function() {
            let contentIframeElement = browser.element( EPUB_CONTENT_IFRAME );

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
            let contentIframeElement = browser.element( EPUB_CONTENT_IFRAME );

            let bookCoverImage = getBookCoverImage( contentIframeElement.value, BOOK_COVER_IMAGE_TYPE_SVG );

            return bookCoverImage;
        }
    },

    clickPageTurnerLeft: { value:
        function() {
            // browser.moveToObject() doesn't work yet for Firefox.
            // https://github.com/mozilla/geckodriver/issues/159
            browser.moveToObject( PAGE_TURNER_LEFT_SELECTOR );
            browser.waitForVisible( PAGE_TURNER_LEFT_SELECTOR );
            browser.click( PAGE_TURNER_LEFT_SELECTOR );
        }
    },

    clickPageTurnerRight: { value:
        function() {
            // browser.moveToObject() doesn't work yet for Firefox.
            // https://github.com/mozilla/geckodriver/issues/159
            browser.moveToObject( PAGE_TURNER_RIGHT_SELECTOR );
            browser.waitForVisible( PAGE_TURNER_RIGHT_SELECTOR );
            browser.click( PAGE_TURNER_RIGHT_SELECTOR );
        }
    },

    epubContentIframe: { get:
        function() {
            let contentIframeElement = browser.element( EPUB_CONTENT_IFRAME );

            return {
                contentIframeElement,
            };
        }
    },

    isExistingInContentIframe: { value:
        function( selector, index, matchText ) {
            let isExistingResult;

            let contentIframeElement = browser.element( EPUB_CONTENT_IFRAME );

            browser.frame( contentIframeElement.value );

            let text = browser.getText( selector );

            // Element with text selectors (e.g. "small=AILY") and XPath selectors
            // (e.g. //small[normalize-space() = "AILY"]) do not seem to be working.
            // This provides an alternative for verification.  The optional
            // arguments allow for a workaround of fetching array of all tags of
            // type selector and matching the indexed element against the optional
            // matchText argument.
            if ( index >= 0 ) {
                isExistingResult = text[ index ] === matchText;
            } else {
                isExistingResult = text !== '';
            }

            browser.frameParent();

            return isExistingResult;
        }
    },

    navbar: { get:
        function() {
            let element = browser.element( NAVBAR_SELECTOR );

            let navbarCss = getNavbarCss( element );

            let navbarRight = getNavbarRightCss();

            let navbarLeftButtons = browser.elements( '.btn-group.navbar-left > button' ).value;
            let navbarLeftVisibleButtonIds = getVisibleElementIds( navbarLeftButtons );
            let leftSideVisibleButtons = getVisibleButtons( navbarLeftVisibleButtonIds );

            let navbarRightButtons = browser.elements( '.btn-group.navbar-right > button' ).value;
            let navbarRightVisibleButtonIds = getVisibleElementIds( navbarRightButtons );
            let rightSideVisibleButtons = getVisibleButtons( navbarRightVisibleButtonIds );

            let navbar = {
                element,
                leftSideVisibleButtons,
                navbarRight,
                selector : NAVBAR_SELECTOR,
                rightSideVisibleButtons,
            };

            Object.assign( navbar, navbarCss );

            return navbar;
        }
    },

    open: { value: function( path ) {
        Page.open.call( this, path );

        browser.waitForExist( EPUB_CONTENT_IFRAME );
    } },

    readingArea: { get:
        function() {
            let element = browser.element( READING_AREA_SELECTOR );

            return {
                top: element.getCssProperty( 'top' ).value
            };
        }
    },

    vh: { get:
        function() {
            let contentIframeElement = browser.element( EPUB_CONTENT_IFRAME );

            browser.frame( contentIframeElement.value );

            let vh = browser.getViewportSize().height / 100;

            browser.frameParent();

            return vh;
        }
    },
} );

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
