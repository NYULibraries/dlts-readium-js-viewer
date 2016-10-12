let Page = require('./page');

let ReadiumPage = Object.create( Page, {
    navbar: { get:
        function() {
            let element = browser.element( '#app-navbar' );
            let backgroundColor = element.getCssProperty( 'background-color' ).parsed.hex;
            let boxShadow       = element.getCssProperty( 'box-shadow' ).value;
            let borderRadius    = element.getCssProperty( 'border-radius' ).value;
            let minHeight       = element.getCssProperty( 'min-height' ).value;
            let marginBottom    = element.getCssProperty( 'margin-bottom' ).value;

            return {
                element,
                backgroundColor,
                boxShadow,
                borderRadius,
                minHeight,
                marginBottom,
            }
        }
    },

    open: { value: function( path ) {
        Page.open.call( this, path );
    } },
} );

module.exports = ReadiumPage;
