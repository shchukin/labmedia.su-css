(function($) {

    /* Глобальные константы */
    const $html = $('html');
    let rememberedPageScrollPosition = 0;
    let isDesktop;

    function initGlobalConstant() {
        isDesktop = window.matchMedia("(min-width: 740px)").matches;
    }

    initGlobalConstant();
    window.addEventListener('resize', initGlobalConstant);


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


    /* Cleartype (крестик для стирания текста) */

    function updateClearButton($input) {
        const $inputWidget = $input.find('.input__widget');
        const $clearButtonContainer = $input.find('.input__clear-type');
        $clearButtonContainer.toggleClass('input__clear-type--visible', $inputWidget.val().length > 0);
    }

    // При загрузке страницы
    $('.input:has(.input__clear-type)').each(function() {
        updateClearButton($(this));
    });

    // В момент печати
    $('.input:has(.input__clear-type) .input__widget').on('input', function() {
        updateClearButton($(this).closest('.input'));
    });

    // Обработчик клика по кнопке очистки
    $('.input__clear-type .button').on('click', function() {
        const $input = $(this).closest('.input');
        const $inputWidget = $input.find('.input__widget');
        $inputWidget.val('');
        updateClearButton($input);
    });



    /* Инициализация библиотеки magnific popup -- модалки */

    $('.mfp-handler').magnificPopup({
        type: 'inline', // не картинки, а html-код
        removalDelay: 200, // анимация закрытия
        showCloseBtn: false,
        callbacks: {
            open: function() {
                const $popup = $.magnificPopup.instance.content;

                /* Если внутри есть input--expandable, перезапустить инициализацию, чтобы высоты обсчитались правильно (а то при инициализации по document ready они были скрыты) */
                const $expandableInputs = $popup.find('.input--expandable .input__widget');
                if($expandableInputs.length) {
                    $expandableInputs.each(function() {
                        expandTextarea($(this));
                    });
                }

                /* Фокус на первый инпут, если есть */
                setTimeout(function (){
                    const $firstInput = $popup.find('input').first();
                    if ($firstInput.length) {
                        $firstInput.focus();
                    }
                }, 100);
            }
        }
    });


    /* Поиск -- отдельная специфичная модалка */

    $('.mfp-search-handler').magnificPopup({
        type: 'inline',
        removalDelay: 0,
        showCloseBtn: false,
        callbacks: {
            open: function() {

                /* Запомнить скролл пользователя, так как display: none на .page его сбросит (смотри .search-expanded .page) -- актуально на смартфонах */
                rememberedPageScrollPosition = $(window).scrollTop();

                /* На смартфонах этот класс полность скроет страницу и упростить саму модалку (смотри .search-expanded .page) */
                $html.addClass('search-expanded');

                /* Фокус на поле поиска */
                setTimeout(function () {
                    $('.search__field .input__widget').focus();
                }, 100);
            },
            close: function() {
                $html.removeClass('search-expanded');
                $(window).scrollTop(rememberedPageScrollPosition);/* При закрытии меню скролл должен быть там, где пользователь его оставил */
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



    /* Скролл и шапка */

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
                $html.addClass('scrolling-down').removeClass('scrolling-up');
            } else {
                $html.addClass('scrolling-up').removeClass('scrolling-down');
            }
            scrolledBefore = scrolled; // Update scrolledBefore only when classes are toggled
        }
    }

    $(window).on('scroll', scrolling);
    $(window).on('resize', scrolling);
    $(document).ready(scrolling);

    $('.header__burger').on('click', function () {

        if( ! $html.hasClass('burger-expanded') ) {
            rememberedPageScrollPosition = $(window).scrollTop(); /* Запомнить скролл пользователя, так как display: none на .page его сбросит (смотри .burger-expanded .page) */
            $html.addClass('burger-expanded');
            $(window).scrollTop(0); /* При открытии меню его скролл должен быть в начале */
        } else {
            $html.removeClass('burger-expanded');
            $('.nav__item').removeClass('nav__item--expanded');
            $(window).scrollTop(rememberedPageScrollPosition);/* При закрытии меню скролл должен быть там, где пользователь его оставил */
        }
    });


    $(document).on('click', function(event) {
        if (!$(event.target).closest('.header').length) {
            if($html.hasClass('burger-expanded')) {
                $html.removeClass('burger-expanded');
                $(window).scrollTop(rememberedPageScrollPosition); /* При закрытии меню скролл должен быть там, где пользователь его оставил */
            }
        }
    });


    $('.header__item:has(.header__menu-dropdown) .header__link').on('click', function (event) {
        event.preventDefault();
        $(this).parents('.header__item').toggleClass('header__item--expanded');
    });


})(jQuery);
