"use strict";

function Page () {
}

Page.prototype.open = function( path ) {
    // Remove leading slash.  See https://github.com/webdriverio/webdriverio/issues/2094#issuecomment-418865131
    if ( path.startsWith( '/' ) ) {
        path = path.substring( 1 );
    }
    browser.url( path );
};

module.exports = new Page();
