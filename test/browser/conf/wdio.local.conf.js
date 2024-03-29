"use strict";

let merge        = require( 'deepmerge' );
let wdioMainConf = require( './wdio.main.conf.js' );

exports.config = merge( wdioMainConf.config, {
    // Put trailing slash at the end.  See https://github.com/webdriverio/webdriverio/issues/2094#issuecomment-418865131
    baseUrl                   : 'http://opensquare-local.nyupress.org/open-square-reader/cloud-reader/',
    openSquareGoogleAnalytics : false,
} );
