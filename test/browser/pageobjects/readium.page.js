let Page = require('./page');

let ReadiumPage = Object.create( Page, {
    navbar: { get:
        function() {
            let element = browser.element( '#app-navbar' );
            let backgroundColor = element.getCssProperty( 'background-color' ).parsed.hex;

            // Build the convenient testing string.
            // Need this for the dimensional/spatial information in (for example) "rgb(51,51,51)0px1px5px0px"
            let boxShadowUnparsedValue = element.getCssProperty( 'box-shadow' ).value;
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
                            element.getCssProperty( 'box-shadow' ).parsed.hex.substring( 0, 4 );

            let borderRadius    = element.getCssProperty( 'border-radius' ).value;
            let minHeight       = element.getCssProperty( 'min-height' ).value;
            let marginBottom    = element.getCssProperty( 'margin-bottom' ).value;

            let navbarLeftButtons = browser.elements( '.btn-group.navbar-left > button' ).value;
            let leftSideVisibleButtons = getVisibleChildElementIds( navbarLeftButtons );

            let navbarRightButtons = browser.elements( '.btn-group.navbar-right > button' ).value;
            let rightSideVisibleButtons = getVisibleChildElementIds( navbarRightButtons );

            return {
                element,
                backgroundColor,
                boxShadow,
                borderRadius,
                minHeight,
                marginBottom,
                leftSideVisibleButtons,
                rightSideVisibleButtons,
            }
        }
    },

    open: { value: function( path ) {
        Page.open.call( this, path );
    } },
} );

function getVisibleChildElementIds ( parentElement ) {
    let visibleChildElementIds = [];

    for ( i in parentElement ) {
        let id = parentElement[ i ].ELEMENT;
        if (
            browser.elementIdCssProperty( id, 'visibility' ).value != 'hidden' &&
            browser.elementIdCssProperty( id, 'display' ).value != 'none'
        ) {
            visibleChildElementIds.push( browser.elementIdAttribute( id, 'id' ).value );
        };
    }

    return visibleChildElementIds;
}

module.exports = ReadiumPage;
