"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const JAPANESE_LESSONS_PATH       = '/?epub=epub_content%2F9780814712917&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

const EXPECTED_NAVBAR_BUTTONS = [ 'tocButt', 'settbutt1', 'buttFullScreenToggle' ];

suite( 'DLTS ReadiumJS viewer', function() {

    suite( 'Navbar', function() {

        let navbar, navbarRight;

        suiteSetup( function() {
            readium.open( DEFAULT_BOOK_PATH );

            navbar      = readium.navbar;
            navbarRight = navbar.navbarRight;
        } );

        suite( 'styles', function() {

            test( '"background"', function() {
                assert.equal( navbar.backgroundColor, '#2c2c2c' );
            } );

            test( '"box-shadow"', function() {
                assert.equal( navbar.boxShadow, '0px 1px 5px #333' );
            } );

            test( '"border-bottom-left-radius"', function() {
                assert.equal( navbar.borderBottomLeftRadius, '0px' );
            } );

            test( '"border-bottom-right-radius"', function() {
                assert.equal( navbar.borderBottomRightRadius, '0px' );
            } );

            test( '"border-top-left-radius"', function() {
                assert.equal( navbar.borderTopLeftRadius, '0px' );
            } );

            test( '"border-top-right-radius"', function() {
                assert.equal( navbar.borderTopRightRadius, '0px' );
            } );

            test( '"minHeight"', function() {
                assert.equal( navbar.minHeight, '50px' );
            } );

            test( '"marginBotton"', function() {
                assert.equal( navbar.marginBottom, '0px' );
            } );

        } );

        suite( 'right button panel styles', function() {

            test( '"background"', function() {
                assert.equal( navbarRight.backgroundColor, '#2c2c2c' );
            } );

            test( '"height"', function() {
                // Our plugin sets height to 0.4em, but this is apparently overridden
                // in the test by min-height of 50px.
                assert.equal( navbarRight.height, '50px' );
            } );

            test( '"marginBottom"', function() {
                assert.equal( navbarRight.marginBottom, '0px' );
            } );

            test( '"marginLeft"', function() {
                assert.equal( navbarRight.marginLeft, '0px' );
            } );

            test( '"marginRight"', function() {
                assert.equal( navbarRight.marginRight, '15px' );
            } );

            test( '"marginTop"', function() {
                assert.equal( navbarRight.marginTop, '10px' );
            } );

            test( '"min-height"', function() {
                assert.equal( navbarRight.minHeight, '50px' );
            } );

            test( '"overflow"', function() {
                assert.equal( navbarRight.overflow, 'visible' );
            } );

        } );

        suite( 'button visibility', function() {

            test( 'Left side', function() {
                assert.equal( Object.keys( navbar.leftSideVisibleButtons ).length, 0,
                              'Has no visible buttons' );
            } );

            test( 'Right side', function() {
                assert.sameDeepMembers(
                    Object.keys( navbar.rightSideVisibleButtons ),
                    EXPECTED_NAVBAR_BUTTONS,
                    'Has the correct visible buttons'
                );
            } );

        } );

        suite( 'button styles', function() {

            EXPECTED_NAVBAR_BUTTONS.forEach( function( buttonId ) {

                test(
                    `${buttonId}: "background-position"`, function () {
                        // We define background position as "center center" in the
                        // "background" shorthand property.  It gets expressed as
                        // "50% 50%" in the element.
                        assert.equal(
                            navbar.rightSideVisibleButtons[ buttonId ]
                                .css
                                .backgroundPosition, '50% 50%'
                        );
                    }
                );

                test(
                    `${buttonId}: "backgroundRepeat"`, function () {
                        assert.equal(
                            navbar.rightSideVisibleButtons[ buttonId ]
                                .css
                                .backgroundRepeat, 'no-repeat'
                        );
                    }
                );

                test(
                    `${buttonId}: "backgroundColor"`, function () {
                        assert.equal(
                            navbar.rightSideVisibleButtons[ buttonId ]
                                .css
                                .backgroundColor, '#2c2c2c'
                        );
                    }
                );

                test(
                    `${buttonId}: "color"`, function () {
                        assert.equal(
                            navbar.rightSideVisibleButtons[ buttonId ]
                                .css
                                .color, '#666666'
                        );
                    }
                );

                test(
                    `${buttonId}: "fontSize"`, function () {
                        assert.equal(
                            navbar.rightSideVisibleButtons[ buttonId ]
                                .css
                                .fontSize, '22px'
                        );
                    }
                );

                test(
                    `${buttonId}: "height"`, function () {
                        assert.equal(
                            navbar.rightSideVisibleButtons[ buttonId ]
                                .css
                                .height, '36px'
                        );
                    }
                );

                test(
                    `${buttonId}: "width"`, function () {
                        assert.equal(
                            navbar.rightSideVisibleButtons[ buttonId ]
                                .css
                                .width, '43px'
                        );
                    }
                );

            } );

        } );

    } );

    test( 'Reading area is low enough to clear the navbar', function() {
        readium.open( DEFAULT_BOOK_PATH );

        assert.equal( readium.readingArea.top, '78px', 'Top position is correct' );
    } );

    suite( 'Book cover', function() {
        // OA Book covers are <svg>, Connected Youth book covers are <img>
        // We use different fixes for each.

        test( 'OA Books cover should be absolutely positioned to prevent splitting', function() {
            readium.open( JAPANESE_LESSONS_PATH );

            let bookCoverPosition = readium.bookCoverImageSvg.position;

            assert.equal( bookCoverPosition, 'absolute', '<svg> is absolutely positioned' );
        } );

        suite( 'Connected Youth cover', function() {
            let bookCoverImage;
            let expectedValue = {
                height:    undefined,
                maxHeight: undefined,
                maxWidth:  undefined,
                width:     undefined,
            };

            suiteSetup( function() {
                readium.open( BY_ANY_MEDIA_NECESSARY_PATH );

                bookCoverImage = readium.bookCoverImageImg;

                // We've specified the properties mostly using proportions, but
                // WebdriverIO in almost all cases returns calculated pixel values
                // which differ depending on the browser.  Furthermore, the values
                // seem to change depending on where the tests are run from.
                // For example, running the tests from the Mac OS X Terminal
                // program and running them from the terminal panel in Intellij
                // produced different values.
                //
                // So need to calculate the expected values anew for each test run.
                // This is what we specify in our CSS:
                //
                //     height:    '93vh'
                //     maxHeight: '93vh'
                //     maxWidth:  '98%'
                //     width:     'auto'
                //
                // Do the expected value assignments here instead of individually
                // in the tests so that if we need to add browsers later it will be
                // less work.

                let vh = readium.vh;
                const expectedNumberOfVh = 93;

                expectedValue.height    = Math.floor( expectedNumberOfVh * vh );
                expectedValue.maxHeight = Math.floor( expectedNumberOfVh * vh );

                let browserName = browser.options.desiredCapabilities.browserName;

                if ( browserName === 'chrome' ) {
                    expectedValue.maxWidth = '98%';

                    // width: auto is broken in Chrome.  See comment in else if
                    // block.
                    expectedValue.width = undefined;
                } else if ( browserName = 'firefox' ) {
                    expectedValue.maxWidth = Math.floor(
                        readium.bookCoverImageImgEnclosingElementWidth * 0.98
                    );

                    // Aspect ratio for the cover being tested is 2:3 (600px x 900px).
                    // width: auto for <img> tags indicates that width should be
                    // set so that aspect ratio is maintained.
                    // Note that this only seems to work in Firefox, so we won't
                    // test width in Chrome, where the image is distorted on load
                    // (the aspect ratio was 404px to 783px).
                    expectedValue.width = Math.floor(
                        parseInt(
                            bookCoverImage.height.substring( 0, 3 )
                        ) * 2 / 3
                    );
                } else {
                    console.log( 'Should never get here.' );
                }

            } );

            test( '"height"', function() {
                assert.equal( bookCoverImage.height.substring( 0, 3 ), expectedValue.height );
            } );

            test( '"max-height"', function() {
                assert.equal( bookCoverImage.maxHeight.substring( 0, 3 ), expectedValue.maxHeight );
            } );

            test( '"max-width"', function() {
                assert.equal( bookCoverImage.maxWidth.substring( 0, 3 ), expectedValue.maxWidth );
            } );

            // We are not testing width for every browser.  See comments in
            // suiteSetup().
            if ( expectedValue.width ) {
                test( '"width"', function() {
                    assert.equal( bookCoverImage.width.substring( 0, 3 ), expectedValue.width );
                } );
            }

        } );

    } );

    suite( 'Page turners', function() {

        setup( function() {
            readium.open( DEFAULT_BOOK_PATH );
        } );

        test( 'right', function() {
            readium.clickPageTurnerRight();
            readium.clickPageTurnerRight();

            assert(
                // For some reason, selector "span=CONNECTED YOUTH AND DIGITAL FUTURES"
                // does not work.  Neither does "span.Sans-Medium=...".
                readium.isExistingInContentIframe( '.Sans-Medium=CONNECTED YOUTH AND DIGITAL FUTURES' ),
                'Series Title page is displayed'
            );
        } );

        test( 'left', function() {
            // Go to Series Title page.
            readium.clickPageTurnerRight();
            readium.clickPageTurnerRight();
            // Go back to Half Title page.
            readium.clickPageTurnerLeft();

            assert( readium.isExistingInContentIframe( '.Sans-SC=By Any Media Necessary' ),
                'Half Title page is displayed'
            );
        } );

    } );

    suite( 'Fullscreen button', function() {

        setup( function() {
            readium.open( DEFAULT_BOOK_PATH );
        } );

        test( 'toggle fullscreen on', function() {
            readium.clickFullscreenToggle();

            assert( readium.isFullscreen, 'Fullscreen is on' );
        } );

        test( 'toggle fullscreen off', function() {
            readium.clickFullscreenToggle();
            assert( readium.isFullscreen, 'Fullscreen is initially on' );

            readium.clickFullscreenToggle();
            assert.isFalse( readium.isFullscreen, 'Fullscreen is off' );
        } );

    } );

    // Not sure if we need to test OA Books (EPUB 2, generally) and Connected Youth (EPUB 3),
    // but doing it just in case.
    suite( 'TOC', function() {

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

    suite( 'Settings', function() {

        setup( function() {
            readium.open( DEFAULT_BOOK_PATH );

            readium.clickSettingsButton();
        } );

        test( 'Font size', function() {
            readium.clickSettingsStyleTab();

            assert.equal( readium.stylePreview.fontSize, '14px',
                'Font size default is 14px (1.1em)' );

            readium.setFontSizeSliderValue( '160' );

            assert.equal( readium.stylePreview.fontSize, '22.4px',
                          'Font size preview has changed to 22.4px (1.6em)' );
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

} );
