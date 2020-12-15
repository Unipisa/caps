// These libraries need to be available as global variables
global.jQuery = require('jquery');
global.Chart = require('chart.js');

// These are only used inside this code
var jQueryEasing = require('jquery.easing');
var popper = require('popper.js');
var bootstrap = require('bootstrap');
var sbadmin = require('./sb-admin-2.js');

var caps_proposals_add = require('./caps-proposals-add.js');
var caps_settings = require('./caps-settings.js')
var caps_attachments = require('./caps-attachments.js')

global.Caps = require('./caps-controller.js');
