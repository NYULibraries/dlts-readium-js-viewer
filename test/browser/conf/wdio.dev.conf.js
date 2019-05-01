'use strict';

let merge        = require( 'deepmerge' );
let wdioMainConf = require( './wdio.main.conf.js' );

exports.config = merge( wdioMainConf.config, {
    baseUrl                   : 'http://opensquare-dev.nyupress.org/open-square-reader/cloud-reader/',
    openSquareGoogleAnalytics : false,
} );
