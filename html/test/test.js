var assert = require('assert');

describe('models', function() {
    var curricula = require('../src/models/curricula.js');
    var degrees = require('../src/models/degrees.js');
    var exams = require('../src/models/exams.js');
    var groups = require('../src/models/groups.js');
    var proposals = require('../src/models/proposals.js');
});

describe('modules', function() {
    var jsdom = require('jsdom');
    global.window = new jsdom.JSDOM().window;
    global.document = window.document;
    var CapsAttachment = require('../src/modules/attachment.js');
    // ERROR: cannot use ES6 syntax: 
    var loadDashboardData = require('../src/modules/dashboard.js');
    describe('upload-csv', function() {
        var UploadCsv = require("../src/modules/upload-csv.js");
        const headers = ['nome','codice','settore','crediti'];
        const line = ["giorgio", "XY", "MAT", "6"];
        var csv = new UploadCsv({
            upload_fields: headers
        });
        describe('split_row', () => {
            it('simple line', () => {
                assert.deepStrictEqual(csv.split_row(line.join(",")), line);
            });
            it('quoted fields', () => {
                assert.deepStrictEqual(csv.split_row('"'+line.join('","')+'"'), line);
            });
        });
        describe('to_array', () => {
            var contents = [
                headers.join(","), 
                line.join(","), 
                line.join(",")].join("\r\n")+"\r\n"; 
            csv.to_array(contents);
            it('three lines', () => {
                assert.deepStrictEqual(csv.data,[line,line]);
            });
        });
    });
});