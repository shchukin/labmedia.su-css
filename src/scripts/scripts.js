(function($) {

    const $html = $('html');

    /* Inputs */

    /* Select placeholder */
    function selectPlaceholder($element) {
        if ($element.val() === 'placeholder') {
            $element.parent('.input').addClass('input--placeholder-is-chosen');
        } else {
            $element.parent('.input').removeClass('input--placeholder-is-chosen');
        }
    }

    $('select.input__widget').each(function () {
        selectPlaceholder($(this));
    }).on('change', function () {
        selectPlaceholder($(this));
    });

    /* Expanding textarea */
    function expandTextarea($element) {
        $element.css('height', 'auto');
        $element.css('height', ($element[0].scrollHeight + 2 * parseInt($element.css('border-width'), 10)) + 'px');
    }

    $('.input--expandable .input__widget').each(function () {
        expandTextarea($(this));
    }).on('input', function () {
        expandTextarea($(this));
    });

    /* Error field */
    $('.input__widget').on('focus', function () {
        $(this).parents('.input').removeClass('input--error');
        $(this).parents('.input').nextUntil(':not(.helper--error)').remove();
    });



    /* Init magnific popup */

    $('.mfp-handler').magnificPopup({
        type: 'inline',
        removalDelay: 200,
        showCloseBtn: false,
        callbacks: {
            open: function() {
                const $popup = $.magnificPopup.instance.content;
                const $expandableInputs = $popup.find('.input--expandable .input__widget');
                $expandableInputs.each(function() {
                    expandTextarea($(this));
                });
            }
        }
    });

    $('.mfp-search-handler').magnificPopup({
        type: 'inline',
        removalDelay: 0,
        showCloseBtn: false,
        callbacks: {
            open: function() {
                const $popup = $.magnificPopup.instance.content;
                const $expandableInputs = $popup.find('.input--expandable .input__widget');
                $expandableInputs.each(function() {
                    expandTextarea($(this));
                });
                if ($popup.attr('id') === 'search') {
                    $('html').addClass('search-expanded');
                }
            },
            close: function() {
                $('html').removeClass('search-expanded');
            }
        }
    });



    /* Подвал */

    $('.footer__menu-column:has(.footer__sub-menu) .footer__link').on('click', function (event) {
        event.preventDefault();
        $(this).parents('.footer__menu-column').toggleClass('footer__menu-column--expanded');
    });

    $('.footer__info-handler').on('click', function () {
        $(this).parents('.footer__info').toggleClass('footer__info--expanded');
    });



    /* Page scrolling и шапка */

    let scrolled = $(window).scrollTop();
    let scrolledBefore = 0;
    const sensitivity = 5;

    function scrolling() {
        scrolled = $(window).scrollTop();
        if ( scrolled > 0 ) {
            $html.addClass('scrolled');
        } else {
            $html.removeClass('scrolled');
        }
        // if ( scrolled > 126 ) {
        //     $html.addClass('scrolled126plus');
        // } else {
        //     $html.removeClass('scrolled126plus');
        // }

        if (Math.abs(scrolled - scrolledBefore) > sensitivity) {
            if (scrolled > scrolledBefore) {
                $('html').addClass('scrolling-down').removeClass('scrolling-up');
            } else {
                $('html').addClass('scrolling-up').removeClass('scrolling-down');
            }
            scrolledBefore = scrolled; // Update scrolledBefore only when classes are toggled
        }
    }

    $(window).on('scroll', scrolling);
    $(window).on('resize', scrolling);
    $(document).ready(scrolling);


})(jQuery);
