const jQuery = require('jquery');

// https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/string/levenshtein-distance
/**
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
function levenshteinDistance(a, b) {
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
    // Fill the first row of the matrix.
    // If this is first row then we're transforming empty string to a.
    // In this case the number of transformations equals to size of a substring.
    for (let i = 0; i <= a.length; i += 1) {
      distanceMatrix[0][i] = i;
    }
  
    // Fill the first column of the matrix.
    // If this is first column then we're transforming empty string to b.
    // In this case the number of transformations equals to size of b substring.
    for (let j = 0; j <= b.length; j += 1) {
      distanceMatrix[j][0] = j;
    }
  
    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1, // deletion
          distanceMatrix[j - 1][i] + 1, // insertion
          distanceMatrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
  
    return distanceMatrix[b.length][a.length];
  }  

class CsvUpload {
    constructor(options) {
        this.upload_fields = options.upload_fields;
        this.upload_fields_db = options.upload_fields_db;
        this.validator = options.validator;
        this.csrf_token = options.csrf_token;
        this.data = [];
        this.column_separator = ",";
        this.has_headers = 1;
        this.headers = [];
        this.column_map = [];
        this.auto_detect_headers = 1;

        this.setup();
    }

    split_row(row) {
        var result = [];
        while(row.length>0) {
            if (row[0]==='"' || row[0]==="'") {
                var c = row.charAt(0);
                var f = row.indexOf(c + this.column_separator, 1);
                if (f>=0) {
                    result.push(row.substring(1,f));
                    row = row.substring(f+this.column_separator.length+1);
                } else if (row.charAt(row.length-1) === c) {
                    result.push(row.substring(1,row.length-1));
                    break;
                }
            } 
            else {
                var f = row.indexOf(this.column_separator);
                if (f>=0) {
                    result.push(row.substring(0,f));
                    row = row.substring(f+this.column_separator.length);
                    continue;
                }
                else {
                    result.push(row);
                    break;
                }
            }
        }
        return result;
    }

    to_array(contents) {
        // TODO: usare libreria dedicata, ad esempio: papaparse

        var lines = contents.split(/\r?\n/);
        this.data = []
        this.headers = [];
        for (var i=0; i<lines.length; i++) {
            if (jQuery.trim(lines[i]) === "") {
                continue;
            }

            // var row = lines[i].split(csv_column_separator);
            var row = this.split_row(lines[i]);

            if (i == 0 && this.has_headers) {
                this.headers = row;
            } else {
                this.data.push(row);
            }
        }
        // populate headers selection

        if (!this.has_headers) {
            this.headers = Array(this.data[0].length);
            for (var i=0;i<this.data[0].length;i++) {
                this.headers[i] = "colonna " + (i+1);
            }
        }

        var html = "";
        for (var i=0;i<this.headers.length;++i) {
            html += "<option value=" + i + ">"+ this.headers[i]+"</option>\n";
        }
        for (var i=0;i<this.upload_fields.length;++i) {
            jQuery("select[name='csv_field["+i+"]']").html(html);
            jQuery("select[name='csv_field["+i+"]']").val(this.column_map[i]);
        }
    }

    fill_table_html() {
        var csv = this;
        var table_html = "";
        let validation_context = {};
        for (var i=-1; i<this.data.length; i++) {
            var row = Array(this.upload_fields.length+2);
            if (i==-1) {
                delimiter = "th";
                row[0]="";
                var j;
                for (j=1;j<row.length-1;++j) {
                    row[j] = this.upload_fields[j-1];
                }
                row[j] = "validazione";
            } else {
                var delimiter = "td";
                var error = null;
                if (this.validator) {
                    var obj = {};
                    this.upload_fields_db.forEach(function(field, j) {
                        obj[field] = csv.data[i][csv.column_map[j]];
                    });
                    error = this.validator(obj, validation_context);
                }
                var j = 0;
                row[j] = "<input type='checkbox' id='csv_row_" + i + "' " + (error ? "" : "checked='checked'" )+ ">";
                for (var j=1;j<row.length-1;++j) {
                    row[j] = this.data[i][this.column_map[j-1]];
                }
                row[j] = error?("<span class='text-danger'>" + error + "</span>"):"";
            }
            table_html += "<tr><"+delimiter+">" + row.join("</"+delimiter+"><"+delimiter+">")+"</"+delimiter+"></tr>\n";
        }
        jQuery("#input_table").html(table_html);
        return table_html;
    }

    preparePreview(contents) {
        this.to_array(contents);
        if (this.column_map.length != this.upload_fields.length) {
            this.column_map = Array(this.upload_fields.length);
            for (var i=0;i<this.upload_fields.length;i++) {
                this.column_map[i]=i;
            }
        }
        for(var i=0;i<this.upload_fields.length;++i) {
            if (this.auto_detect_headers) {
                var best = 0;
                var dist = 99999;
                for(var j=0;j<this.headers.length;++j) {
                    var d = levenshteinDistance(this.upload_fields[i].toLowerCase(),
                        this.headers[j].toLowerCase());
                    // console.log("distance("+this.upload_fields[i]+","+this.headers[j]+")="+d);
                    if (d<dist) {
                        best = j;
                        dist = d;
                    }
                }
                this.column_map[i] = best;
                jQuery("select[name='csv_field["+i+"]']").val(best);
            } else {
                var val = parseInt(jQuery("select[name='csv_field["+i+"]']").val());
                this.column_map[i] = val;
            }
        }
        var html = this.fill_table_html();
        jQuery("#csv_preview_table").html(html);
    }

    upload_file(f) {
        var csv = this;
        if (f) {
            var r = new FileReader();
            r.onload = function(e) {
                jQuery("#csv_options_div").show();
                csv.preparePreview(e.target.result);
            }
            r.readAsText(f);
        } else {
            alert("Failed to load file");
        }
    }

    submit() {
        var csv = this;
        var payload = this.data.filter(function(row, i) {
            return jQuery("#csv_row_" + i).prop('checked');
        }).map(function(row){
            var obj = {};
            for (var i=0;i<csv.upload_fields.length;i++){
                obj[csv.upload_fields_db[i]] = row[csv.column_map[i]];
            }
            return obj;
        })

        var form = document.createElement('form');
        form.style.visibility = 'hidden';
        form.method = 'POST';
        form.action = '';

        var input = document.createElement('input');
        input.name = '_csrfToken';
        input.value = this.csrf_token;
        form.appendChild(input);

        input = document.createElement('input');
        input.name = 'payload';
        input.value = JSON.stringify(payload);
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
    }

    setup() {
        var csv = this;
        jQuery("#csv_file_input").change(function (evt) {
            csv.upload_file(evt.target.files[0]);
        });
        jQuery("select[name='csv_separator']").change(function() {
            csv.column_separator = jQuery(this).val();
            csv.preparePreview();
        });
        jQuery("select[name='csv_headers']").change(function() {
            csv.has_headers = parseInt(jQuery(this).val());
            csv.preparePreview();
        })
        for (var i=0;i<csv.upload_fields.length;i++) {
            jQuery("select[name='csv_field["+i+"]']").change(function() {
                csv.auto_detect_headers = 0;
                for (var k=0;k<csv.upload_fields.length;k++){
                    csv.column_map[k] = parseInt(jQuery("select[name='csv_field["+k+"]']").val());
                }
                csv.preparePreview();
            })
        }
    
        // Setup the callbacks for the buttons
        jQuery('#csvSubmitButton').on('click', function(){csv.submit()});
    }
}

module.exports = CsvUpload;


