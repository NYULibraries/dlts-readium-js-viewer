"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'Settings', function() {

    setup( function() {
        readium.open( DEFAULT_BOOK_PATH );

        // It seems that setting width to higher than 1150 causes tests to hang
        // in Firefox.  Cause currently unknown.
        readium.setWindowSize(
            {
                height: 920,
                width: 1150,
            }
        );
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

        const PAGE_WIDTH_SLIDER_MIN = '500';
        const PAGE_WIDTH_SLIDER_MAX = '2000';

        let expectedMaxPagewidth = '1070px';
        let expectedMinPagewidth = '1060px';

        test( 'set to minimum', function() {
            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.setPageWidthSliderValue( PAGE_WIDTH_SLIDER_MIN );
            readium.saveSettings();

            assert.equal( readium.epubContentIframe.htmlWidth, expectedMinPagewidth,
                          'Page width has been changed to minimum' );
        } );

        test( 'set to maximum', function() {
            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.setPageWidthSliderValue( PAGE_WIDTH_SLIDER_MAX );
            readium.saveSettings();

            assert.equal( readium.epubContentIframe.htmlWidth, expectedMaxPagewidth,
                          'Page width has not been changed to maximum' );
        } );
    } );

    suite( 'Display format', function() {

        let expectedDefaultColumns;
        let expectedSinglePageColumns;
        let expectedDoublePageColumns;

        let browserName = browser.options.desiredCapabilities.browserName;

        if ( browserName === 'chrome' ) {
            expectedDefaultColumns    = 'auto 2';
            expectedSinglePageColumns = '550px auto';
            expectedDoublePageColumns = 'auto 2';

        } else if ( browserName === 'firefox' ) {

            expectedDefaultColumns    = '2';
            expectedSinglePageColumns = 'auto';
            expectedDoublePageColumns = '2';

        } else {
            // Should never get here.
        }

        test( 'Single column/page', function() {
            assert.equal( readium.epubContentIframe.columns, expectedDefaultColumns,
                          'Columns are not at default'
            );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.selectSettingSinglePage();
            readium.saveSettings();

            readium.waitForColumnsToBeEqualTo( expectedSinglePageColumns );

            assert.equal( readium.epubContentIframe.columns, expectedSinglePageColumns,
                          'Not in single-page layout'
            );
        } );

        test( 'Double column/page', function() {
            assert.equal( readium.epubContentIframe.columns, expectedDefaultColumns,
                          'Columns are not at default'
            );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.selectSettingDoublePage();
            readium.saveSettings();

            readium.waitForColumnsToBeEqualTo( expectedDoublePageColumns );

            assert.equal( readium.epubContentIframe.columns, expectedDoublePageColumns,
                          'Not in double-page layout'
            );
        } );
    } );

    suite( 'Scroll mode', function() {

        test( 'Document mode', function() {

            readium.toggleToc();

            readium.waitForTocToBeVisible();

            browser.click( '=1. Youth Voice, Media, and Political Engagement: Introducing the Core Concepts' );

            readium.waitForExistInContentIframe(
                'span', 'Youth Voice, Media, and Political Engagement'
            );

            // Default max-height usually "846px", but it seems to change sometimes,
            // so just check for "px".
            assert.match( readium.epubContentIframe.maxHeight, /\d+px$/,
                          'Content iframe <html> "max-height" not set to default'
            );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.selectSettingDocumentScrollMode();
            readium.saveSettings();

            readium.toggleToc();

            assert.equal( readium.epubContentIframe.maxHeight, 'none',
                          'Content iframe <html> "max-height" not set to "none"'
            );

        } );

        test( 'Continuous mode', function() {

            readium.toggleToc();

            readium.waitForTocToBeVisible();

            browser.click( '=1. Youth Voice, Media, and Political Engagement: Introducing the Core Concepts' );

            readium.toggleSettings();
            readium.selectSettingsLayoutTab();
            readium.selectSettingContinuousScrollMode();
            readium.saveSettings();

            readium.toggleToc();

            assert.equal( readium.scrolledContentFrame.overflowY, 'auto',
                'ReadiumJS viewer scrolled content frame is not present and/or does not have correct "overflow-y" value' );

        } );

    } );
} );

