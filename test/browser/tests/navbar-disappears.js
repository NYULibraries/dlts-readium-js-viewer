"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'DLTS ReadiumJS viewer navbar', function() {
    let navbar;

    suiteSetup( function() {
        readium.open( DEFAULT_BOOK_PATH );

        navbar      = readium.navbar;
    } );

    test( 'disappears after 8 seconds', function() {
        assert.fail();
    } );

} );
