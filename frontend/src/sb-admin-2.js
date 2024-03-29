const jQuery = require('jquery');

// We keep track of the manual opening of the sidebar, to avoid hiding in those
// cases, as it might be unexpected from the user side.
var sidebarToggled = false;

(function ($) {
    "use strict"; // Start of use strict

    $(document).ready(function () {

        var dpi = window.devicePixelRatio || 1;

        // Toggle the side navigation
        $("#sidebarToggle, #sidebarToggleTop").on('click', function (e) {
            $("body").toggleClass("sidebar-toggled");
            $(".sidebar").toggleClass("toggled");
            if ($(".sidebar").hasClass("toggled")) {
                $('.sidebar .collapse').collapse('hide');
                sidebarToggled = false;
            }
            else {
                sidebarToggled = true;
            }
        });

        // Close any open menu accordions when window is resized below 850px
        $(window).resize(function () {

            if ($(window).width() < 850 * dpi) {
                $('.sidebar .collapse').collapse('hide');
            };

            // Toggle the side navigation when window is resized below 600px
            if ($(window).width() < 600 * dpi && !$(".sidebar").hasClass("toggled") && !sidebarToggled) {
                $("body").addClass("sidebar-toggled");
                $(".sidebar").addClass("toggled");
                $('.sidebar .collapse').collapse('hide');
            };
        });

        // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
        $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function (e) {
            if ($(window).width() >= 850 * dpi) {
                var e0 = e.originalEvent,
                    delta = e0.wheelDelta || -e0.detail;
                this.scrollTop += (delta < 0 ? 1 : -1) * 30;
                e.preventDefault();
            }
        });

        // Scroll to top button appear
        $(document).on('scroll', function () {
            var scrollDistance = $(this).scrollTop();
            if (scrollDistance > 100) {
                $('.scroll-to-top').fadeIn();
            } else {
                $('.scroll-to-top').fadeOut();
            }
        });

        // Smooth scrolling using jQuery easing
        $(document).on('click', 'a.scroll-to-top', function (e) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: ($($anchor.attr('href')).offset().top)
            }, 1000, 'easeInOutExpo');
            e.preventDefault();
        });

        // Just make sure to apply the policy on page load
        $(window).trigger('resize');

    });

})(jQuery); // End of use strict
