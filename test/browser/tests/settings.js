"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'Settings', function() {

    this.retries( 3 );

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

        readium.toggleSettings();
        readium.selectSettingsStyleTab();

        assert.equal( readium.stylePreview.fontSize, '14px',
            'Font size preview is at default' );

        readium.setFontSizeSliderValue( '160' );

        assert.equal( readium.stylePreview.fontSize, '22.4px',
                      'Font size preview has been changed (1.6em)' );

        readium.saveSettings();

        assert.equal(
            readium.epubContentIframe.fontSize,
            '160%',
            'Content font-size has been changed'
        );
    } );

    test( 'Text and background color', function() {
        readium.toggleSettings();
        readium.selectSettingsStyleTab();

        assert.equal( readium.stylePreview.backgroundColor, '#ffffff',
                      'Preview "background-color" property is at default' );
        assert.equal( readium.stylePreview.color, '#000000',
                      'Preview "color" property is at default' );

        readium.selectSettingArabianNights();

        assert.equal( readium.stylePreview.backgroundColor, '#141414',
                      'Preview "background-color" property has been changed' );
        assert.equal( readium.stylePreview.color, '#ffffff',
                      'Preview "color" property has been changed' );

        readium.saveSettings();

        assert.equal(
            readium.epubContentIframe.backgroundColor,
            '#141414',
            'Content "background-color" property has been changed'
        );
        assert.equal(
            readium.epubContentIframe.color,
            '#ffffff',
            'Content "color" property has been changed'
        );
    } );

    suite( 'Page width', function() {

        this.retries( 3 );

        const PAGE_WIDTH_SLIDER_MIN = '500';
        const PAGE_WIDTH_SLIDER_MAX = '2000';

        let expectedDefaultPageWidth;
        let expectedMaxPagewidth;
        let expectedMinPagewidth;

        suiteSetup( function() {
            // Chrome and Firefox both seem to want to open at different sizes,
            // and this determines the actual widths set by moving Page Width slider
            // to the min and max.  Presumably screen resolution also influences
            // the max.  For now, just expect what we've been seeing during
            // development.  Later, we might need to tighten this up.
            let browserName = browser.options.desiredCapabilities.browserName;

            if ( browserName === 'chrome' ) {
                expectedDefaultPageWidth = '550px';
                expectedMaxPagewidth     = '846px';
                expectedMinPagewidth     = '500px';
            } else if ( browserName === 'firefox' ) {
                expectedDefaultPageWidth = '1160px';
                expectedMaxPagewidth     = '1200px';
                expectedMinPagewidth     = '1060px';
            } else {
                // Should never get here.
            }
        } );

        test( 'set to minimum', function() {
            assert.equal( readium.epubContentIframe.htmlWidth,
                          expectedDefaultPageWidth,
                          'Page width at default' );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.setPageWidthSliderValue( PAGE_WIDTH_SLIDER_MIN );
            readium.saveSettings();

            assert.equal( readium.epubContentIframe.htmlWidth, expectedMinPagewidth,
                          'Page width has been changed to minimum' );
        } );

        test( 'set to maximum', function() {
            assert.equal( readium.epubContentIframe.htmlWidth,
                          expectedDefaultPageWidth,
                          'Page width at default' );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.setPageWidthSliderValue( PAGE_WIDTH_SLIDER_MAX );
            readium.saveSettings();

            assert.equal( readium.epubContentIframe.htmlWidth, expectedMaxPagewidth,
                          'Page width has been changed to maximum' );
        } );
    } );

    suite( 'Display format', function() {

        this.retries( 3 );

        let expectedDefaultColumns;
        let expectedSinglePageColumns;
        let expectedDoublePageColumns;

        suiteSetup( function() {
            let browserName = browser.options.desiredCapabilities.browserName;

            if ( browserName === 'chrome' ) {

                // Chrome initially opens at a narrower width than Firefox, which
                // might explain why it defaults to single-column format instead
                // of double.
                expectedDefaultColumns    = '550px auto';
                expectedSinglePageColumns = '550px auto';
                expectedDoublePageColumns = 'auto 2';

            } else if ( browserName === 'firefox' ) {

                expectedDefaultColumns    = '2';
                expectedSinglePageColumns = 'auto';
                expectedDoublePageColumns = '2';

            } else {
                // Should never get here.
            }
        } );

        test( 'Single column/page', function() {
            assert.equal( readium.epubContentIframe.columns, expectedDefaultColumns,
                          'Columns at default'
            );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.selectSettingSinglePage();
            readium.saveSettings();

            assert.equal( readium.epubContentIframe.columns, expectedSinglePageColumns,
                          'Single-page layout'
            );
        } );

        test( 'Double column/page', function() {
            assert.equal( readium.epubContentIframe.columns, expectedDefaultColumns,
                          'Columns at default'
            );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.selectSettingDoublePage();
            readium.saveSettings();

            assert.equal( readium.epubContentIframe.columns, expectedDoublePageColumns,
                          'Double-page layout'
            );
        } );
    } );

    test( 'Scroll mode', function() {

    } );
} );

