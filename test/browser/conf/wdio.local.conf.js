let merge        = require( 'deepmerge' );
let wdioMainConf = require( './wdio.main.conf.js' );

exports.config = merge( wdioMainConf.config, {
    baseUrl: 'http://localhost/readium-js-viewer/dist/cloud-reader',
} );
