"use strict";

let merge         = require( 'deepmerge' );
let wdioLocalConf = require( './wdio.local.conf.js' );

wdioLocalConf.config.capabilities = [
    {
        // maxInstances can get overwritten per capability. So if you have an in-house Selenium
        // grid with only 5 firefox instance available you can make sure that not more than
        // 5 instance gets started at a time.
        maxInstances : 1,
        //
        browserName  : 'firefox',
    },
];

wdioLocalConf.config.mochaOpts.timeout = 99999;

exports.config = wdioLocalConf.config;
