"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const YOUTUBE_VIDEO_URL           = 'https://www.youtube.com/embed/FyQi79aYfxU';

suite( 'YouTube', function() {

    // this.retries( 3 );

    setup( function() {
        readium.open( BY_ANY_MEDIA_NECESSARY_PATH );
    } );

    teardown( function() {
        readium.clearLocalStorage();
    } );

    test( 'Video loads successfully', function() {
        readium.toggleToc();

        browser.click( '=3. “Decreasing World Suck”: Harnessing Popular Culture for Fan Activism' );

        readium.clickPageTurnerRight();
        readium.clickPageTurnerRight();

        browser.frame( readium.epubContentIframe.contentIframeElement.value );

        let youtubeIframe = browser.element( 'iframe' );
        let src           = youtubeIframe.getAttribute( 'src' );
        let dataSrc       = youtubeIframe.getAttribute( 'data-src' );

        browser.frameParent();

        assert.equal( dataSrc, null, '<iframe> "data-src" attribute' );

        assert.equal( src, YOUTUBE_VIDEO_URL, '<iframe> "src" attribute' );
    } );
} );

