"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;
const DELAY_IN_SECONDS            = 8;
const SHORT_DELAY_IN_SECONDS      = 3;

suite( 'DLTS ReadiumJS viewer navbar', function() {

    test( 'initially visible long enough for the user to see it', function() {
        readium.open( DEFAULT_BOOK_PATH );

        let navbarSelector = readium.navbar.selector;

        assert( browser.isVisible( navbarSelector ), 'Navbar is initially visible' );

        // Apparently can't use setTimeout() -- probably because asynchronously runs
        // the callback.  Had trouble installing the NPM `sleep` module, and anyway
        // why bother with another dependency just for this.
        let waitTill =
                new Date( new Date().getTime() + SHORT_DELAY_IN_SECONDS * 1000 );
        while ( waitTill > new Date() ){}

        assert( browser.isVisible( navbarSelector ),
            `Navbar is still visible after ${SHORT_DELAY_IN_SECONDS} seconds`
        );
    } );

        readium.open( DEFAULT_BOOK_PATH );

        let navbarSelector = readium.navbar.selector;

        assert( browser.isVisible( navbarSelector ), 'Navbar is initially visible' );

        // Apparently can't use setTimeout() -- probably because asynchronously runs
        // the callback.  Had trouble installing the NPM `sleep` module, and anyway
        // why bother with another dependency just for this.
        let waitTill = new Date( new Date().getTime() + DELAY_IN_SECONDS * 1000 );
        while ( waitTill > new Date() ){}

        assert.isFalse(
            browser.isVisible( navbarSelector ),
            `Navbar has been hidden after delay of ${DELAY_IN_SECONDS} seconds`
        );
    } );

} );
