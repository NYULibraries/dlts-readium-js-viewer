"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '?epub=epub_content%2F9781479829712&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'Fullscreen button', function() {

    setup( function() {
        readium.open( DEFAULT_BOOK_PATH );
    } );

    teardown( function() {
        readium.clearLocalStorage();
    } );

    test( 'toggle fullscreen on', function() {
        readium.toggleFullscreen();

        assert( readium.isFullscreen, 'Fullscreen is not on' );
    } );

    test( 'toggle fullscreen off', function() {
        readium.toggleFullscreen();

        assert( readium.isFullscreen, 'Fullscreen is not initially on' );

        readium.toggleFullscreen();
        assert.isFalse( readium.isFullscreen, 'Fullscreen is not off' );
    } );

} );
