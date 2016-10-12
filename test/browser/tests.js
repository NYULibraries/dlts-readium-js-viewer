let assert = require( 'chai' ).assert;

let readium = require( './pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'DLTS ReadiumJS viewer', function() {

    test( 'customized navbar is styled correctly', function() {
        readium.open( DEFAULT_BOOK_PATH );

        let navbar = readium.navbar;

        assert.equal( navbar.backgroundColor, '#2c2c2c',                    '"background"' );
        assert.equal( navbar.boxShadow,       'xrgb(51,51,51)0px1px5px0px', '"box-shadow"' );
        assert.equal( navbar.borderRadius,    '0px',                        '"border-radius"' );
        assert.equal( navbar.minHeight,       '50px',                       '"min-height"' );
        assert.equal( navbar.marginBottom,    '0px',                        '"margin-bottom"' );
    } );

} );
