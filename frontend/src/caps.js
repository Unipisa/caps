require("regenerator-runtime/runtime");

import "../scss/main.scss";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
// import '@fortawesome/fontawesome-free/js/regular';
// import '@fortawesome/fontawesome-free/js/brands';

// These libraries need to be available as global variables
import CapsController from './caps-controller.js';
global.CapsController = CapsController;

// These are only used inside this code
import 'jquery.easing';
import 'popper.js';
import 'bootstrap';
import './sb-admin-2.js';
