"use strict";

let beautify = require( 'js-beautify' ).js_beautify,
    fs       = require( 'fs' );
 
fs.readFile( process.argv[ 2 ], 'utf8', function ( err, data ) {
    if ( err ) {
        throw err;
    }
    console.log( beautify( data, { indent_size: 2 } ) );
} );
