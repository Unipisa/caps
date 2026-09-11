import "regenerator-runtime/runtime";

import "../scss/main.scss";

// These libraries need to be available as global variables
import CapsController from './caps-controller.js';
globalThis.CapsController = CapsController;
globalThis.dispatchEvent(new Event('caps:ready'));

// These are only used inside this code
import 'jquery.easing';
import 'popper.js';
import 'bootstrap';
import './sb-admin-2.js';
