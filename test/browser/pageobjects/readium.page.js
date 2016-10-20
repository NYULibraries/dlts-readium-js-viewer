"use strict";

let Page = require('./page');

const NAVBAR_SELECTOR       = '#app-navbar';
const READING_AREA_SELECTOR = '#reading-area';

let ReadiumPage = Object.create( Page, {
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
    } },

    readingArea: { get:
        function() {
            let element = browser.element( READING_AREA_SELECTOR );

            return {
                top: element.getCssProperty( 'top' ).value
            };
        }
    },
} );

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

module.exports = ReadiumPage;
