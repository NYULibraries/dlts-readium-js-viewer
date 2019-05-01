"use strict";

/**
 * Keep these tests in a separate file so that they can be run independently and
 * in parallel with other tests (if maxInstances is set high enough).
 * These tests intentionally block to allow enough enough time to pass for the
 * navbar show/hide behavior to be verified.  No need to impose this delay on the
 * other tests.
 */

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;
const DELAY_IN_SECONDS            = 8;
const SHORT_DELAY_IN_SECONDS      = 3;

suite( 'DLTS ReadiumJS viewer navbar', function() {

    test( 'initially visible long enough for the user to see it', function() {
        readium.open( DEFAULT_BOOK_PATH );

        let navbarSelector = readium.navbar.selector;

        assert( browser.isDisplayed( navbarSelector ), 'Navbar is not initially visible' );

        // Apparently can't use setTimeout() -- probably because asynchronously runs
        // the callback.  Had trouble installing the NPM `sleep` module, and anyway
        // why bother with another dependency just for this.
        let waitTill =
                new Date( new Date().getTime() + SHORT_DELAY_IN_SECONDS * 1000 );
        while ( waitTill > new Date() ){}

        assert( browser.isDisplayed( navbarSelector ),
            `Navbar is not still visible after ${SHORT_DELAY_IN_SECONDS} seconds`
        );
    } );

    test( `disappears after ${DELAY_IN_SECONDS} seconds`, function() {
        readium.open( DEFAULT_BOOK_PATH );

        let navbarSelector = readium.navbar.selector;

        assert( browser.isDisplayed( navbarSelector ), 'Navbar is not initially visible' );

        // Apparently can't use setTimeout() -- probably because asynchronously runs
        // the callback.  Had trouble installing the NPM `sleep` module, and anyway
        // why bother with another dependency just for this.
        let waitTill = new Date( new Date().getTime() + DELAY_IN_SECONDS * 1000 );
        while ( waitTill > new Date() ){}

        assert.isFalse(
            browser.isDisplayed( navbarSelector ),
            `Navbar has not been hidden after delay of ${DELAY_IN_SECONDS} seconds`
        );
    } );

    // browser.moveToObject() doesn't work yet for Firefox.
    // https://github.com/mozilla/geckodriver/issues/159
    test( 're-appears when user hovers over it', function() {
        readium.open( DEFAULT_BOOK_PATH );

        let navbarSelector = readium.navbar.selector;

        // Apparently can't use setTimeout() -- probably because asynchronously runs
        // the callback.  Had trouble installing the NPM `sleep` module, and anyway
        // why bother with another dependency just for this.
        let waitTill = new Date( new Date().getTime() + DELAY_IN_SECONDS * 1000 );
        while ( waitTill > new Date() ){}

        assert.isFalse(
            browser.isDisplayed( navbarSelector ),
            `Navbar has not been hidden after delay of ${DELAY_IN_SECONDS} seconds`
        );

        browser.moveToObject( navbarSelector );

        assert( browser.isDisplayed( navbarSelector ), 'Navbar is has not become visible again' );
    } );

} );
