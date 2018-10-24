"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'Page turners', function() {

    setup( function() {
        readium.open( DEFAULT_BOOK_PATH );
    } );

    teardown( function() {
        readium.clearLocalStorage();
    } );

    test( 'right', function() {
        readium.clickPageTurnerRight();
        readium.clickPageTurnerRight();

        assert(
            // For some reason, selector "span=CONNECTED YOUTH AND DIGITAL FUTURES"
            // does not work.  Neither does "span.Sans-Medium=...".
            readium.isExistingInContentIframe( '.Sans-Medium=CONNECTED YOUTH AND DIGITAL FUTURES' ),
            'Series Title page is not displayed'
        );
    } );

    test( 'left', function() {
        // Go to Series Title page.
        readium.clickPageTurnerRight();
        readium.clickPageTurnerRight();
        // Go back to Half Title page.
        readium.clickPageTurnerLeft();

        assert( readium.isExistingInContentIframe( '.Sans-SC=By Any Media Necessary' ),
            'Half Title page is not displayed'
        );
    } );

} );
