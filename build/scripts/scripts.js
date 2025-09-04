(function($) {

    /* Глобальные константы */

    const $html = $('html');
    let rememberedPageScrollPosition = 0;
    let isDesktop;
    let containerPadding;

    function initGlobalConstant() {
        isDesktop = window.matchMedia("(min-width: 740px)").matches;
        containerPadding = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--container-padding'));
    }

    initGlobalConstant();
    window.addEventListener('resize', initGlobalConstant);



    /* Инпуты */

    /* Плейсхолдер у селекта */

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


    /* Расхлопывающаяся при печати textarea */

    function expandTextarea($element) {
        $element.css('height', 'auto');
        $element.css('height', ($element[0].scrollHeight + 2 * parseInt($element.css('border-width'), 10)) + 'px');
    }

    $('.input--expandable .input__widget').each(function () {
        expandTextarea($(this));
    }).on('input', function () {
        expandTextarea($(this));
    });


    /* Состояние ошибки */

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


    /* При загрузке страницы */

    $('.input:has(.input__clear-type)').each(function() {
        updateClearButton($(this));
    });


    /* В момент печати */

    $('.input:has(.input__clear-type) .input__widget').on('input', function() {
        updateClearButton($(this).closest('.input'));
    });


    /* Очистка по клику */

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
                // setTimeout(function (){
                //     const $firstInput = $popup.find('input').first();
                //     if ($firstInput.length) {
                //         $firstInput.focus();
                //     }
                // }, 100);
            }
        }
    });


    /* Поиск -- отдельная специфичная модалка */

    function focusAndOpenKeyboard(el, timeout) {
        if (!timeout) {
            timeout = 300; // Устанавливаем задержку по умолчанию 300 мс, чтобы синхронизироваться с анимацией Magnific Popup
        }
        if (el) {
            // Создаём временный input для вызова клавиатуры
            var __tempEl__ = document.createElement('input');
            __tempEl__.style.position = 'absolute';
            __tempEl__.style.top = (el.offsetTop + 7) + 'px';
            __tempEl__.style.left = el.offsetLeft + 'px';
            __tempEl__.style.height = 0;
            __tempEl__.style.opacity = 0;
            document.body.appendChild(__tempEl__);
            __tempEl__.focus();

            // Переключаем фокус на целевой элемент после задержки
            setTimeout(function() {
                el.focus();
                el.click(); // Дополнительный клик для имитации пользовательского взаимодействия
                document.body.removeChild(__tempEl__);
            }, timeout);
        }
    }

    $('.mfp-search-handler').magnificPopup({
        type: 'inline',
        removalDelay: 0,
        showCloseBtn: false,
        // focus: '.search__field .input__widget', // Устанавливаем фокус на поле поиска
        callbacks: {
            open: function() {

                /* Запомнить скролл пользователя, так как display: none на .page его сбросит (смотри .search-expanded .page) -- актуально на смартфонах */
                rememberedPageScrollPosition = $(window).scrollTop();

                /* На смартфонах этот класс полность скроет страницу и упростить саму модалку (смотри .search-expanded .page) */
                $html.addClass('search-expanded');

                /* Фокус на поле поиска */
                    var $input = $('.search__field .input__widget');
                    focusAndOpenKeyboard($input[0], 2000); // Передаём DOM-элемент и задержку

            },
            close: function() {
                $html.removeClass('search-expanded');
                $(window).scrollTop(rememberedPageScrollPosition);/* При закрытии меню скролл должен быть там, где пользователь его оставил */
            }
        }
    });


    var $testInput = $('#test-input');
    focusAndOpenKeyboard($testInput[0], 1000); // Передаём DOM-элемент и задержку



    /* Подвал */

    $('.footer__menu-column:has(.footer__sub-menu) .footer__link').on('click', function (event) {
        event.preventDefault();
        $(this).parents('.footer__menu-column').toggleClass('footer__menu-column--expanded');
    });

    $('.footer__info-handler').on('click', function () {
        $(this).parents('.footer__info').toggleClass('footer__info--expanded');
    });



    /* Шапка */

    /* Классы scrolled, scrolling-down, scrolling-up */

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


    /* Бургер */

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


    /* Аккордион в шапке (раляет только на смартфонах) */

    $('.header__item:has(.header__menu-dropdown) .header__link').on('click', function (event) {
        if( ! isDesktop ) {
            event.preventDefault();
            $(this).parents('.header__item').toggleClass('header__item--expanded');
        }
    });



    /* Баблы */

    /* Показ (тап на смартфонах) */
    $('.bubble-handler').on('click', function () {
        var $target = $(this).parents('.bubble-context').find('.bubble');
        $('.bubble--visible').not($target).removeClass('bubble--visible');
        $target.toggleClass('bubble--visible');
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.bubble, .bubble-handler').length) {
            $('.bubble--visible').removeClass('bubble--visible');
        }
    });

    $(document).on('keyup', function(event) {
        if (event.keyCode === 27) {
            $('.bubble--visible').removeClass('bubble--visible');
        }
    });


    /* Проверяем не обрезаются ли баблы краем экрана */

    function adjustBubblePosition() {

        const $bubbleAll = $('.bubble')

        /* Сбрасываем предыдущие замеры */
        $bubbleAll.css('margin-right', 0);

        /* Запускаем перерасчёт сдвигов: */
        $bubbleAll.each(function() {
            const $bubble = $(this);
            const $bubbleChevron = $bubble.find('.bubble__chevron')
            const rect = $bubble[0].getBoundingClientRect();
            const windowWidth = window.innerWidth;

            /* Выходит ли за левый край */
            if (rect.left < 0) {
                const shiftDistance = rect.left - (containerPadding / 2);
                $bubble.css('margin-right', shiftDistance + 'px');
                $bubbleChevron.css('left', (shiftDistance * 2) + 'px');
            }
            /* Выходит ли за правый край */
            else if (rect.right > windowWidth) {
                const shiftDistance = rect.right - windowWidth + (containerPadding / 2);
                $bubble.css('margin-right', shiftDistance + 'px');
                $bubbleChevron.css('right', (-1 * shiftDistance * 2) + 'px');
            /* Иначе сбрасываем значение в ноль, потому что могло остаться с прошлого замера */
            } else {
                $bubble.css('margin-right', 0);
                $bubbleChevron.css('right', 0); /* Значение по умолчанию 'auto', но здесь нужен ноль, потому что в вёрстке ноль */
                $bubbleChevron.css('left', 0); /* Значение по умолчанию 'auto', но здесь нужен ноль, потому что в вёрстке ноль */
            }
        });
    }

    adjustBubblePosition();
    $(window).on('resize', adjustBubblePosition)


})(jQuery);
