"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'Settings', function() {

    setup( function() {
        readium.open( DEFAULT_BOOK_PATH );
    } );

    teardown( function() {
        readium.clearLocalStorage();
    } );

    test( 'Font size', function() {
        assert.equal(
            readium.epubContentIframe.fontSize,
            '100%',
            'Content font-size is at default'
        );

        readium.clickSettingsButton();
        readium.clickSettingsStyleTab();

        assert.equal( readium.stylePreview.fontSize, '14px',
            'Font size preview is at default' );

        readium.setFontSizeSliderValue( '160' );

        assert.equal( readium.stylePreview.fontSize, '22.4px',
                      'Font size preview has been changed (1.6em)' );

        readium.clickSettingsSaveButton();

        assert.equal(
            readium.epubContentIframe.fontSize,
            '160%',
            'Content font-size has been changed'
        );
    } );

    test( 'Text and background color', function() {

    } );

    test( 'Page width', function() {

    } );

    test( 'Display format', function() {

    } );

    test( 'Scroll mode', function() {

    } );
} );

