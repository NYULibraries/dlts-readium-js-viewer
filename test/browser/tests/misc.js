"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

const EXPECTED_NAVBAR_BUTTONS = [ 'tocButt', 'settbutt1', 'buttFullScreenToggle' ];

suite( 'Reading area', function() {

    test( 'is low enough to clear the navbar', function() {
        readium.open( DEFAULT_BOOK_PATH );

        assert.equal( readium.readingArea.top, '78px', 'Top position is not correct' );
    } );

} );
