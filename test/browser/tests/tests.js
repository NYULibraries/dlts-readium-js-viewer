"use strict";

let assert = require( 'chai' ).assert;

let readium = require( '../pageobjects/readium.page' );

// The trailing "&" is often put there by Readium and browser, so using it here, too.
const BY_ANY_MEDIA_NECESSARY_PATH = '/?epub=epub_content%2F9781479899982&epubs=epub_content%2Fepub_library.json&';
const DEFAULT_BOOK_PATH           = BY_ANY_MEDIA_NECESSARY_PATH;

suite( 'DLTS ReadiumJS viewer', function() {
    let navbar;

    suiteSetup( function() {
        readium.open( DEFAULT_BOOK_PATH );

        navbar = readium.navbar;
    } );

    suite( 'Navbar styling', function() {

        test( '"background"', function() {
            assert.equal( navbar.backgroundColor, '#2c2c2c' );
        } );

        test( '"box-shadow"', function() {
            assert.equal( navbar.boxShadow, '0px 1px 5px #333' );
        } );

        test( '"border-radius"', function() {
            assert.equal( navbar.borderRadius, '0px' );
        } );

        test( '"minHeight"', function() {
            assert.equal( navbar.minHeight, '50px' );
        } );

        test( '"marginBotton"', function() {
            assert.equal( navbar.marginBottom, '0px' );
        } );

    } );

    suite( 'Navbar styling - right side buttons', function() {
        
        let navbarRight = navbar.navbarRight;

        test( '"background"', function() {
            assert.equal( navbarRight.backgroundColor, '#2c2c2c' );
        } );

        test( '"height"', function() {
            assert.equal( navbarRight.height, '0.4em' );
        } );

        test( '"margin"', function() {
            assert.equal( navbarRight.margin, '10px 15px 0 0' );
        } );

        test( '"min-height"', function() {
            assert.equal( navbarRight.minHeight, '50px' );
        } );

        test( '"overflow"', function() {
            assert.equal( navbarRight.overflow, 'visible' );
        } );

    } );

    suite( 'navbar has the correct buttons', function() {

        test( 'Left side', function() {
            assert.equal( navbar.leftSideVisibleButtons.length, 0,
                         'Has the correct # of visible buttons' );
        } );

        test( 'Right side', function() {
            assert.sameDeepMembers(
                navbar.rightSideVisibleButtons,
                [ 'tocButt', 'settbutt1', 'buttFullScreenToggle' ],
               'Has the correct visible buttons'
            );
        } );

    } );

} );
