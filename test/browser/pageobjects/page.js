function Page () {
}

Page.prototype.open = function( path ) {
    if ( ! path.startsWith( '/' ) ) {
        path = '/' + path;
    }
    browser.url( path );
};

module.exports = new Page();