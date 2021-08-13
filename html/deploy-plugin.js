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
const crypto = require('crypto');
const { exec } = require("child_process");

class CAPSDeployPlugin {
    apply(compiler) {
        compiler.hooks.done.tap(
            'CAPS Deploy Plugin',
            (stats) => {
                this.deployJSFiles(stats);
            }
        );
    }

    async deployJSFiles(stats) {
        const output_file =  stats.compilation.outputOptions.path + 
            "/" + stats.compilation.outputOptions.filename;
        const hash = stats.hash;

        const name = 'caps-' + hash;
        const version_file = stats.compilation.outputOptions.filename + '.version';        
        
        const extension = '.' + output_file.split('.').splice(1).join('.');

        // Try to remove all the old files that have the same extension.
        const files = fs.readdirSync('../app/webroot/js/');
        for (const f of files) {
            const fe = '.' + f.split('.').splice(1).join('.');
            if (fe == extension) {
                console.log(`Removing the old file ${f}`);
                try {
                    fs.unlinkSync('../app/webroot/js/' + f);
                }
                catch {
                    console.log("Error during removal, ignoring");
                }
            }
        }

        const fn = '../app/webroot/js/' + name + extension;
        console.log(`Installing ${output_file} into ${fn}`);
        fs.copyFileSync(output_file, fn);

        console.log(`Creating the file ../app/webroot/js/${version_file}`);
        fs.writeFileSync(`../app/webroot/js/${version_file}`, name + extension);
    }
}
  
module.exports = CAPSDeployPlugin;

