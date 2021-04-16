var assert = require('assert');

describe('caps-upload-csv', function() {
    var jsdom = require('jsdom');
    global.jQuery = require('jquery')(new jsdom.JSDOM().window);    
    var CsvUpload = require("../src/caps-upload-csv.js");
    const headers = ['nome','codice','settore','crediti'];
    const line = ["giorgio", "XY", "MAT", "6"];
    var csv = new CsvUpload({
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