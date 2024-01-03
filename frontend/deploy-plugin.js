//
// This script installs the compiled Javascript code into the webroot, 
// properly handling versioning. 
//
// In particular:
//  - It creates a text file in ../backend/webroot/js/ver which contains
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
const INSTALL_DIR = '../api/webroot/';
const JS_DIR = `${INSTALL_DIR}js/`;

class CAPSDeployPlugin {
    apply(compiler) {
        compiler.hooks.done.tap(
            'CAPS Deploy Plugin',
            (stats) => {
                this.deploy(stats);
            }
        );
    }

    async deploy(stats) {
        const output_file =  stats.compilation.outputOptions.path + 
            "/" + stats.compilation.outputOptions.filename;
        const hash = stats.hash;

        const name = 'caps-' + hash;
        const version_file = stats.compilation.outputOptions.filename + '.version';        
        
        const extension = '.' + output_file.split('.').splice(1).join('.');

        // Check that the directory ../backend/webroot/js exists; if not, create it
        try {
            fs.accessSync(JS_DIR, fs.constants.W_OK);
        } 
        catch {
            console.log(`Creating the missing directory ${JS_DIR}`);
            fs.mkdirSync(JS_DIR);
        }

        // Try to remove all the old files that have the same extension.
        const files = fs.readdirSync(JS_DIR);
        for (const f of files) {
            const fe = '.' + f.split('.').splice(1).join('.');
            if (fe == extension) {
                console.log(`Removing the old file ${f}`);
                try {
                    fs.unlinkSync(JS_DIR + f);
                }
                catch {
                    console.log("Error during removal, ignoring");
                }
            }
        }

        const fn = JS_DIR + name + extension;
        console.log(`Installing ${output_file} into ${fn}`);
        fs.copyFileSync(output_file, fn);

        console.log(`Creating the file ${JS_DIR}${version_file}`);
        fs.writeFileSync(`${JS_DIR}${version_file}`, name + extension);

        const index_filename = INSTALL_DIR + 'index.html';
        console.log(`Creating ${index_filename}`);
        fs.writeFileSync(index_filename,`<!DOCTYPE html>
<html>
<head>
    <script type="text/javascript" src="/js/${name}${extension}"></script>    
</head>
<body>
    <div id="app">...loading...</div>
    <script>
        // globally defined in /js/caps.js
        capsStart();
    </script>
</body>
</html>`);
    }
}
  
module.exports = CAPSDeployPlugin;

