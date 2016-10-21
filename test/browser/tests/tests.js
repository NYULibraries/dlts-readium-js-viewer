"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const JAPANESE_LESSONS            = '/?epub=epub_content%2F9780814712917&epubs=epub_content%2Fepub_library.json&';
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
            readium.open( JAPANESE_LESSONS );

            let bookCoverPosition = readium.epubContentIframe
                                        .bookCoverImage
                                        .position;

            assert.equal( bookCoverPosition, 'absolute', '<svg> is absolutely positioned' );
        } );

        suite( 'Connected Youth cover', function() {

            readium.open( BY_ANY_MEDIA_NECESSARY_PATH );
            let bookCoverImage = readium.epubContentIframe.bookCoverImage;

            test( '"height"', function() {
                assert.equal( bookCoverImage.height, '93vh' );
            } );

            test( '"max-height"', function() {
                assert.equal( bookCoverImage.height, '93vh' );
            } );

            test( 'max-width', function() {
                assert.equal( bookCoverImage.height, '98%' );
            } );

            test( 'width', function() {
                assert.equal( bookCoverImage.height, 'auto' );
            } );

        } );

    } );

} );
