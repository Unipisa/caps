require("regenerator-runtime/runtime");

import "../scss/main.scss";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

// These libraries need to be available as global variables
global.CapsController = require('./caps-controller.js');

// These are only used inside this code
require('jquery.easing');
require('popper.js');
require('bootstrap');
require('./sb-admin-2.js');
