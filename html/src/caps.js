// These libraries need to be available as global variables
global.jQuery = require('jquery');
global.Chart = require('chart.js');
global.CapsController = require('./caps-controller.js');

// These are only used inside this code
var jQueryEasing = require('jquery.easing');
var popper = require('popper.js');
var bootstrap = require('bootstrap');
var sbadmin = require('./sb-admin-2.js');

require('./caps-proposals-add.js');
require('./caps-settings.js');
require('./caps-attachments.js');
require('./caps-upload-csv.js');
