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

    /* Общие настройки Magnific Popup */
    const magnificPopupSettings = {
        type: 'inline', // не картинки, а html-код
        removalDelay: 200, // анимация закрытия
        showCloseBtn: false,
        callbacks: {
            open: function() {
                const $popup = $.magnificPopup.instance.content;

                /* Если внутри есть input--expandable, перезапустить инициализацию, чтобы высоты обсчитались правильно */
                const $expandableInputs = $popup.find('.input--expandable .input__widget');
                if ($expandableInputs.length) {
                    $expandableInputs.each(function() {
                        expandTextarea($(this));
                    });
                }

                /* Focus on the first input, if any */
                setTimeout(function() {
                    const $firstInput = $popup.find('input').first();
                    if ($firstInput.length) {
                        $firstInput.focus();
                    }
                }, 100);
            }
        }
    };

    /* Инициализация mfp в общем случае */
    $('.mfp-handler').magnificPopup(magnificPopupSettings);

    /* Инициализация mfp-smartphone-only-handler, только если не десктоп */
    if (!isDesktop) {
        $('.mfp-smartphone-only-handler').magnificPopup(magnificPopupSettings);
    } else {
        $('.mfp-smartphone-only-handler').on('click', function(event){
            event.preventDefault();
        });
    }


    /* Поиск -- отдельная специфичная модалка */

    $('.mfp-search-handler').magnificPopup({
        type: 'inline',
        removalDelay: 0,
        showCloseBtn: false,
        focus: '.search__field .input__widget', // Устанавливаем фокус на поле поиска
        callbacks: {
            open: function() {

                /* Запомнить скролл пользователя, так как display: none на .page его сбросит (смотри .search-expanded .page) -- актуально на смартфонах */
                rememberedPageScrollPosition = $(window).scrollTop();

                /* На смартфонах этот класс полность скроет страницу и упростить саму модалку (смотри .search-expanded .page) */
                $html.addClass('search-expanded');

                /* Очистка и закрытие по внутреннему крестику */
                $('.search__close').on('click', function() {
                    $.magnificPopup.instance.close();
                });
            },
            close: function() {
                $html.removeClass('search-expanded');
                $('.search__field .input__widget').val('');
                $('.search__close').off('click');
                $(window).scrollTop(rememberedPageScrollPosition);/* При закрытии меню скролл должен быть там, где пользователь его оставил */
            }
        }
    });






    /* Карусели */

    /* Будем симулировать свайп на десктопах, чтобы работал свайп на тачпаде: */
    const trackpadSwipeConfig = {
        simulateTouch: true,
        threshold: 10,
        touchAngle: 45,
        mousewheel: {
            enabled: true,
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true, // Отпускать события на краях (для скролла страницы)
        }
    };

    /* Избавляемся от неприятного баунсинга, который будет появляться при симулясии тачпада: */
    document.querySelectorAll(".carousel .swiper").forEach(swiper => {
        swiper.addEventListener(
            "wheel",
            event => {
                if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                    event.preventDefault();
                }
            },
            { passive: false }
        );
    });

    document.querySelectorAll('.carousel').forEach(($carousel) => {

        if ($carousel.classList.contains("carousel--js-init-default-gallery")) {
            new Swiper($carousel.querySelector(".swiper"), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: 24,
                navigation: {
                    prevEl: $carousel.querySelector(".carousel__button--prev"),
                    nextEl: $carousel.querySelector(".carousel__button--next"),
                },
                pagination: {
                    clickable: true,
                    el: $carousel.querySelector(".carousel__pagination"),
                    bulletClass: "carousel__bullet",
                    bulletActiveClass: "carousel__bullet--current",
                },
            });
        }

        if ($carousel.classList.contains("carousel--js-init-thanks")) {
            new Swiper($carousel.querySelector(".swiper"), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: 16,
                pagination: {
                    clickable: true,
                    el: $carousel.querySelector(".carousel__pagination"),
                    bulletClass: "carousel__bullet",
                    bulletActiveClass: "carousel__bullet--current",
                },
                navigation: {
                    prevEl: $carousel.querySelector(".carousel__button--prev"),
                    nextEl: $carousel.querySelector(".carousel__button--next"),
                },
                breakpoints: {
                    740: {
                        pagination: {
                            type: "fraction",
                        },
                    },
                },
            });
        }

        if( $carousel.classList.contains('carousel--js-init-case') ) {
            new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 24,
                navigation: {
                    prevEl: $carousel.querySelector('.carousel__button--prev'),
                    nextEl: $carousel.querySelector('.carousel__button--next')
                },
            });
        }

        if ($carousel.classList.contains("carousel--js-init-main-slider")) {

            /* В этом слайдере есть ещё превьюшки с навигацией: */
            const thumbnails = document.querySelectorAll(".main-slider__nav-item .feature-thumbnail");

            const mainSlider = new Swiper(".carousel--js-init-main-slider .swiper", {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                navigation: {
                    nextEl: ".main-slider__button--next",
                    prevEl: ".main-slider__button--prev",
                },
                autoplay: {
                    delay: 6000,
                    disableOnInteraction: false,
                },
                on: {
                    autoplayTimeLeft(s, time, progress) {
                        document.documentElement.style.setProperty("--progress", `${(1 - progress) * 100}%`);
                    },
                    init: function () {
                        updateActiveThumbnail(this.realIndex);
                    },
                    slideChange: function () {
                        updateActiveThumbnail(this.realIndex);
                    },
                    slideChangeTransitionEnd: function () {
                        updateActiveThumbnail(this.realIndex);
                    },
                },
            });

            /* Клики по превьюшкам */
            thumbnails.forEach((thumbnail, index) => {
                thumbnail.addEventListener("click", () => {
                    mainSlider.slideToLoop(index);
                    updateActiveThumbnail(index);
                });
            });

            /* Синхронизация слайдера с превьюшками */
            function updateActiveThumbnail(realIndex) {
                const index = Math.max(0, Math.min(realIndex, thumbnails.length - 1));

                /* Изначально свайпер возвращает неправильные значение из-за клонирования. Забираем правильное из DOM: */
                thumbnails.forEach(thumbnail => {
                    thumbnail.classList.remove("feature-thumbnail--current");
                });

                if (thumbnails[index]) {
                    thumbnails[index].classList.add("feature-thumbnail--current");
                }
            }
        }

        if( $carousel.classList.contains('carousel--js-about-hero-slider') ) {
            // Сохраняем состояние видео для каждого слайда
            const videoStates = new Map();

            new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                slidesPerGroup: 1,
                pagination: {
                    clickable: true,
                    el: '.carousel--js-about-hero-slider__pagination',
                    bulletClass: 'carousel--js-about-hero-slider__bullet',
                    bulletActiveClass: 'carousel--js-about-hero-slider__bullet--current',
                },
                on: {
                    slideChange: function() {
                        handleVideoPlayback(this.activeIndex);
                    },
                    init: function() {
                        handleVideoPlayback(0);
                    }
                }
            });
            
            /* Пауза + плей видео на текущем слайде */
            function handleVideoPlayback(activeIndex) {
                const allSlides = $carousel.querySelectorAll('.swiper-slide');
                
                allSlides.forEach((slide, index) => {
                    const video = slide.querySelector('video');
                    
                    if (video) {
                        if (index === activeIndex) {
                            // Активируем видео на текущем слайде
                            if (videoStates.has(index)) {
                                // Восстанавливаем время воспроизведения
                                video.currentTime = videoStates.get(index);
                            }
                            
                            video.play().catch(e => {
                                console.log('Автовоспроизведение заблокировано:', e);
                            });
                        } else {
                            // Сохраняем текущее время и ставим на паузу
                            if (!video.paused) {
                                videoStates.set(index, video.currentTime);
                                video.pause();
                            }
                        }
                    }
                });
            }
        }

        if ($carousel.classList.contains("carousel--js-init-thermometer")) {
            // Сохраняем состояние видео для каждого слайда
            const videoStates = new Map();

            new Swiper($carousel.querySelector(".swiper"), {
                ...trackpadSwipeConfig,
                slidesPerView: "auto",
                slidesPerGroup: 8,
                spaceBetween: 6,

                /* свайп на трекпаде: */
                direction: "horizontal",
                simulateTouch: true, // Эмуляция touch для мыши/трекпада
                threshold: 20, // Минимальное расстояние для свайпа (px)
                touchAngle: 45, // Угол свайпа (для горизонтального — меньше 45°)

                mousewheel: {
                    enabled: true, // Включить mousewheel
                    forceToAxis: true, // Привязка к горизонтальной оси (только влево-вправо)
                    sensitivity: 1, // Чувствительность
                    releaseOnEdges: true, // Отпускать события на краях (для скролла страницы)
                },
                navigation: {
                    prevEl: $carousel.querySelector(".carousel__button--prev"),
                    nextEl: $carousel.querySelector(".carousel__button--next"),
                },
            });
        }
    });


    /* В секции announcement два слайдера: основной и фоновый */
    const $announcementBodyCarousel = document.querySelector('.carousel--js-init-announcement-body');
    const $announcementBackgroundCarousel = document.querySelector('.carousel--js-init-announcement-background');

    let announcementBodyInstance;
    let announcementBackgroundInstance;

    if ($announcementBodyCarousel && $announcementBackgroundCarousel) {

        /* Основной слайдер с контентом и органами управления */

        announcementBodyInstance = new Swiper($announcementBodyCarousel.querySelector('.swiper'), {
            ...trackpadSwipeConfig,
            slidesPerView: 1,
            slidesPerGroup: 1,
            speed: 500,
            navigation: {
                prevEl: $announcementBodyCarousel.querySelector('.carousel__button--prev'),
                nextEl: $announcementBodyCarousel.querySelector('.carousel__button--next'),
            },
            pagination: {
                clickable: true,
                el: $announcementBodyCarousel.querySelector('.carousel__pagination'),
                bulletClass: 'carousel__bullet',
                bulletActiveClass: 'carousel__bullet--current',
            },
            breakpoints: {
                740: {
                    pagination: {
                        type: 'fraction',
                    }
                }
            }
        });


        /* Фоновый слайдер с картинками */

        announcementBackgroundInstance = new Swiper($announcementBackgroundCarousel.querySelector('.swiper'), {
            ...trackpadSwipeConfig,
            slidesPerView: 1,
            slidesPerGroup: 1,
            controller: {
                control: announcementBodyInstance, // Связываем с announcementBodyInstance
            },
        });

        /* Устанавливаем двустороннюю синхронизацию */
        if (announcementBodyInstance) {
            announcementBodyInstance.controller.control = announcementBackgroundInstance;
        }
    }



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
    const sensitivity = 40;

    function throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func.apply(this, args);
        };
    }

    function scrolling() {
        scrolled = $(window).scrollTop();
        if (scrolled > 0) {
            $html.addClass('scrolled');
        } else {
            $html.removeClass('scrolled');
        }
        // if (scrolled > 126) {
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

    const throttledScrolling = throttle(scrolling, 100);

    $(window).on('scroll', throttledScrolling);
    $(window).on('resize', throttledScrolling);
    $(document).ready(throttledScrolling);



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



    /* Содержание на деталке кейса (аббревеатура TOC = Table of Contains)*/

    const tocMap = [];
    const $tocList = $('.table-of-contains__list');
    const $tocTargetedHeadings = $(".article__body h2");
    let $tocLinks;

    /* Список заголовков */
    $tocTargetedHeadings.each(function(index) {
        const id = `section-${index + 1}`;
        $(this).attr('id', id);
        tocMap.push({
            id: id,
            text: $(this).text()
        });
    });

    /* Генерируем само содержание */
    $tocList.empty();
    tocMap.forEach(link => {
        $tocList.append(
            `<a class="table-of-contains__link" href="#${link.id}">${link.text}</a>`
        );
    });

    $tocLinks = $('.table-of-contains__link');

    /* Якоря */
    $tocLinks.on('click', function(e) {
        e.preventDefault();
        const targetId = $(this).attr('href');
        const targetElement = $(targetId);
        const targetOffset = targetElement.offset().top;
        const currentScroll = $(window).scrollTop();
        const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;

        // Закрываем модальное окно, если оно открыто
        if ($.magnificPopup && $.magnificPopup.instance.isOpen) {
            $.magnificPopup.close();
        }

        // Будем тормозить скролл чуть раньше (визуальный отступ). На 48px если скроллим вниз и на 48+шапка, если вверх (при скролле вверх шапка появляется)
        const offset = currentScroll < targetOffset ? 48 : 48 + headerHeight;

        $('html, body').animate({
            scrollTop: targetOffset - offset
        }, 800);
    });

    /* Scrollspy -- подсветка активного компонента меню */
    const scrollSpy = throttle(function() {
        let currentSection = '';

        $tocTargetedHeadings.each(function() {
            const sectionTop = $(this).offset().top;
            const scrollPosition = $(window).scrollTop();

            if (scrollPosition >= sectionTop - 200) {
                currentSection = `#${$(this).attr('id')}`;
            }
        });

        $tocLinks.removeClass('table-of-contains__link--current');
        if (currentSection) {
            $tocLinks.filter(`[href="${currentSection}"]`).addClass('table-of-contains__link--current');
        }
    }, 100);

    $(window).on('scroll', scrollSpy);
    $(window).on('load', scrollSpy);
    $(document).on('ready', scrollSpy);




    /* Бегущая строка -- галерея на главной
     *
     * Иногда браузер подтупливает и запускает анимацию с разной скоростью.
     * Что-то типа: 100% ширины для анимации в стилях может просчитаться
     * с учётом клонирования в скрипте, или без. Решается явной простановкой
     * класса marquee--init-animation
     */
    $('.marquee').each(function() {
        const $marquee = $(this);
        const $content = $marquee.find('.marquee__content');

        const contentWidth = $content.width();
        const containerWidth = $marquee.width();

        /* Скорость анимации (чтобы не зависела от количества плиток) */
        const baseSpeed = 30;
        const animationDuration = contentWidth / baseSpeed;
        $content.css('animation-duration', animationDuration + 's');

        /* Дублируем контент для создания эффекта бесконечной строки */
        $content.append($content.html());
        $content.append($content.html());

        /* Устанавливаем ширину контента, чтобы он был достаточно длинным */
        $content.css('width', contentWidth * 3 + 'px');

        $marquee.addClass('marquee--init-animation');
    });


    /* Фильтр */

    /* На смартфонах будет mfp, на десктопах обычные выпадайки: */
    if(isDesktop) {

        function showFilter($filter) {
            hideFilter();
            $filter.addClass('filter--expanded');
        }

        function hideFilter($filter) {
            $('.filter').removeClass('filter--expanded');
        }

        $(document).on('click', function(event) {
            if (!$(event.target).closest('.filter').length) {
                $('.filter').removeClass('filter--expanded');
            }
        });

        $(document).on('keyup', function(event) {
            if (event.keyCode === 27) {
                hideFilter();
            }
        });

        $('.filter__handler').on('click', function() {
            const $filter = $(this).parents('.filter');
            if( ! $filter.hasClass('filter--expanded') ) {
                showFilter($filter);
            } else {
                hideFilter();
            }
        });
    }


    /* Клиенты (работает как обычные табы) */

    $('.clients .thermometer__action').on('click', function() {
        const $this = $(this);
        const $clients = $this.closest('.clients');
        if( ! $this.hasClass('thermometer__action--current')) {
            const index = $this.index();

            $this.siblings().removeClass('thermometer__action--current');
            $this.addClass('thermometer__action--current');

            $clients.find('.clients__tab--current').removeClass('clients__tab--current');
            $clients.find('.clients__tab:nth-child('+ (index + 1) +')').addClass('clients__tab--current');
        }
    });


    /* About experts video */
    function initAboutExpertsVideo() {
        const video = $('.about-experts__video video')[0];
        const progressCircle = $('.about-experts__video-progress-circle');
        const volumeButton = $('.about-experts__video-volume');
        const volumeStub = $('.about-experts__video-volume-stub');

        if (!video) {
            throw new Error('[page-about]: Не найдено видео в разделе "Эксперты"');
        }

        /* Прогресс видео */
        if (progressCircle.length) {
            const radius = 99;
            const circumference = 2 * Math.PI * radius;
            
            video.addEventListener('timeupdate', function() {
                if (video.duration > 0) {
                    const progress = (video.currentTime / video.duration) * 100;
                    const offset = circumference - (progress / 100) * circumference;
                    progressCircle.css('stroke-dashoffset', offset);
                }
            });
            
            video.addEventListener('loadedmetadata', function() {
                progressCircle.css('stroke-dashoffset', circumference);
            });
            
            video.addEventListener('ended', function() {
                progressCircle.css('stroke-dashoffset', circumference);
            });
        }

        /* Звук видео */
        if (volumeButton.length) {
            updateVolumeUI();
            
            volumeButton.on('click', function(e) {
                e.preventDefault();
                toggleVideoVolume();
            });
            
            video.addEventListener('volumechange', updateVolumeUI);
            video.addEventListener('loadedmetadata', updateVolumeUI);
        }
        
        function toggleVideoVolume() {
            video.muted = !video.muted;
            if (!video.muted) {
                video.volume = 1;
            }
        }
        
        function updateVolumeUI() {
            if (video.muted) {
                volumeStub.css('opacity', '0');
            } else {
                volumeStub.css('opacity', '1');
            }
        }
    }    

    initAboutExpertsVideo();


})(jQuery);
