"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const JAPANESE_LESSONS_PATH       = '/?epub=epub_content%2F9780814712917&epubs=epub_content%2Fepub_library.json&';

// Not sure if we need to test OA Books (EPUB 2, generally) and Connected Youth (EPUB 3),
// but doing it just in case.
suite( 'TOC', function() {

    this.retries( 3 );

    suite( 'Connected Youth TOC', function() {

        setup( function() {
            readium.open( BY_ANY_MEDIA_NECESSARY_PATH );
        } );

        test( 'toggle TOC on', function() {
            readium.clickToc();

            assert.equal( readium.toc.display, 'inline-block',
                          'display property is "inline-block"'
            );
        } );

        test( 'toggle TOC off', function() {
            readium.clickToc();

            assert.equal( readium.toc.display, 'inline-block',
                          'TOC is on'
            );

            readium.clickToc();

            assert.equal( readium.toc.display, 'none',
                          'TOC is off'
            );
        } );

        test( 'navigate to chapter', function() {
            readium.clickToc();

            browser.click( '=About the Authors' );

            // "span.Sans-SC=About the Authors" selector doesn't work.
            assert( readium.isExistingInContentIframe( 'span', 'About the Authors' ),
                    'Found <span>About the Authors</span> on page'
            );

            // Make sure the TOC hasn't disappeared.
            assert.equal( readium.toc.display, 'inline-block',
                          'display property is "inline-block"'
            );
        } );

    } );

    suite( 'OA Books TOC', function() {

        setup( function() {
            readium.open( JAPANESE_LESSONS_PATH );
        } );

        teardown( function() {
            readium.clearLocalStorage();
        } );

        test( 'toggle TOC on', function() {
            readium.clickToc();

            assert.equal( readium.toc.display, 'inline-block',
                          'display property is "inline-block"'
            );
        } );

        test( 'toggle TOC off', function() {
            readium.clickToc();

            assert.equal( readium.toc.display, 'inline-block',
                          'TOC is on'
            );

            readium.clickToc();

            assert.equal( readium.toc.display, 'none',
                          'TOC is off'
            );
        } );

        test( 'navigate to chapter', function() {
            readium.clickToc();

            browser.click( '=3 Day-to-Day Routines' );

            assert( readium.isExistingInContentIframe( 'small', 'AILY' ),
                    'Found <small>AILY</small> on page'
            );

            // Make sure the TOC hasn't disappeared.
            assert.equal( readium.toc.display, 'inline-block',
                          'display property is "inline-block"'
            );
        } );

    } );

} );
