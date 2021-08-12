//
// This script installs the compiled Javascript code into the webroot, 
// properly handling versioning. 
//
// In particular:
//  - It creates a text file in ../app/webroot/js/ver which contains
//    the name of the JS file to load. The name is without the extension, 
//    i.e., if it is caps-xxxx, then the files are:
//
//      caps-xxxx.js    and   caps-xxxx.min.js
//
//  - It renames js/caps.js and js/caps.min.js with those names. 
//

const fs = require('fs');
var crypto = require('crypto');
const { setFlagsFromString } = require('v8');

candidate_files = [ 'js/caps.js', 'js/caps.min.js' ]

var hash = crypto.createHash('md5');

candidate_files.map((f) => {
    if (fs.existsSync(f)) {
        const data = fs.readFileSync('js/caps.js');
        hash.update(data);
    }
});

const name = 'caps-' + hash.digest('hex');

var copied_files = 0;

candidate_files.map((f) => {
    if (fs.existsSync(f)) {
        const extension = '.' + f.split('.').splice(1).join('.');
        const fn = '../app/webroot/js/' + name + extension;
        console.log(`Installing ${f} into ${fn}`);
        fs.copyFileSync(f, fn);
        copied_files++;
    }
});

if (copied_files) {
    console.log("Creating the file ../app/webroot/js/ver");
    fs.writeFileSync('../app/webroot/js/ver', name);
}


