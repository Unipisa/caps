// require("regenerator-runtime/runtime");

import "../scss/main.scss";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
// import '@fortawesome/fontawesome-free/js/regular';
// import '@fortawesome/fontawesome-free/js/brands';

import SinglePage from './pages/SinglePage';
import React from 'react';
import ReactDOM from 'react-dom';

function capsStart(config) {
    ReactDOM.render(
        <SinglePage config={config}/>, 
        document.getElementById("app")
    );
}
global.capsStart = capsStart;

// These are only used inside this code
import 'jquery.easing';
import 'popper.js';
import 'bootstrap';
