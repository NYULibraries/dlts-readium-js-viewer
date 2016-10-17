"use strict";

let Page = require('./page');

let ReadiumPage = Object.create( Page, {
    navbar: { get:
        function() {
            let element = browser.element( '#app-navbar' );

            let navbarCss = getNavbarCss( element );

            let navbarRight = getNavbarRightCss();

            let navbarLeftButtons = browser.elements( '.btn-group.navbar-left > button' ).value;
            let leftSideVisibleButtons = getVisibleChildElementIds( navbarLeftButtons );

            let navbarRightButtons = browser.elements( '.btn-group.navbar-right > button' ).value;
            let rightSideVisibleButtons = getVisibleChildElementIds( navbarRightButtons );

            let navbar = {
                element,
                leftSideVisibleButtons,
                navbarRight,
                rightSideVisibleButtons,
            };

            Object.assign( navbar, navbarCss );

            return navbar;
        }
    },

    open: { value: function( path ) {
        Page.open.call( this, path );
    } },
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

    let borderRadius    = navbarElement.getCssProperty( 'border-radius' ).value;
    let minHeight       = navbarElement.getCssProperty( 'min-height' ).value;
    let marginBottom    = navbarElement.getCssProperty( 'margin-bottom' ).value;

    return {
        backgroundColor,
        boxShadow,
        borderRadius,
        minHeight,
        marginBottom,
    }
}

function getNavbarRightCss() {
    let navbarRight = browser.element( '.navbar-right' );

    let backgroundColor = navbarRight.getCssProperty( 'background-color' ).parsed.hex;
    let height          = navbarRight.getCssProperty( 'height' ).value;
    let margin          = navbarRight.getCssProperty( 'margin' ).value;
    let minHeight       = navbarRight.getCssProperty( 'min-height' ).value;
    let overflow        = navbarRight.getCssProperty( 'overflow' ).value;

    return {
        backgroundColor,
        height,
        margin,
        minHeight,
        overflow,
    }
}

function getVisibleChildElementIds ( parentElement ) {
    let visibleChildElementIds = [];

    for ( let i in parentElement ) {
        let id = parentElement[ i ].ELEMENT;
        if (
            browser.elementIdCssProperty( id, 'visibility' ).value != 'hidden' &&
            browser.elementIdCssProperty( id, 'display' ).value != 'none'
        ) {
            visibleChildElementIds.push( browser.elementIdAttribute( id, 'id' ).value );
        }
    }

    return visibleChildElementIds;
}

function getNavbarButtonCss( buttonElement ) {
    let color = navbarRight.getCssProperty( 'color' ).value;
    let fontSize = navbarRight.getCssProperty( 'font-size' ).value;
    let width = navbarRight.getCssProperty( 'width' ).value;
    let height = navbarRight.getCssProperty( 'height' ).value;
    let background = navbarRight.getCssProperty( 'background' ).value;
    let backgroundColor = navbarRight.getCssProperty( 'background-color' ).value;

    return {
        background,
        backgroundColor,
        color,
        fontSize,
        height,
        width,
    }
}

module.exports = ReadiumPage;
