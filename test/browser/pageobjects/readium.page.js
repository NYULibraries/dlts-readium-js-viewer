let Page = require('./page');

let ReadiumPage = Object.create( Page, {
    navbar: { get: function() { return browser.element( '#app-navbar' ); } },

    open: { value: function( path ) {
        Page.open.call( this, path );
    } },
} );

module.exports = ReadiumPage;
