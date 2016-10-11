let assert = require( 'chai' ).assert;

const TEMP_URL = 'http://localhost/readium-js-viewer/dist/cloud-reader/?epub=..%2F..%2Fepub_content%2Faccessible_epub_3&';

suite( 'DLTS ReadiumJS viewer', function() {
    test( 'should load _Accessible EPUB 3_', function() {
        browser.url( TEMP_URL );
        assert( 'Readium' == browser.getTitle() );
    } );
} );

