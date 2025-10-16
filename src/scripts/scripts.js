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
    if(isDesktop) {
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
    }

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
            const navWrap = document.querySelector(".main-slider__nav-wrap");

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
                        if (this.realIndex < 2) {
                            navWrap.scrollTo({ left: 0, behavior: 'smooth' });
                        } else {
                            navWrap.scrollTo({ left: navWrap.scrollWidth - navWrap.clientWidth, behavior: 'smooth' });
                        }
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
                speed: 800,
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


        if( $carousel.classList.contains('carousel--js-about-gallery') ) {
            // Конфигурация галереи
            const GALLERY_CONFIG = {
                data: [
                    // office (7 изображений)
                    [
                        '../images/about/gallery/office/1.jpg',
                        '../images/about/gallery/office/2.jpg',
                        '../images/about/gallery/office/3.jpg',
                        '../images/about/gallery/office/4.jpg',
                        '../images/about/gallery/office/5.jpg',
                        '../images/about/gallery/office/6.jpg',
                        '../images/about/gallery/office/7.jpg'
                    ],
                    // cafe (6 изображений)
                    [
                        '../images/about/gallery/cafe/1.jpg',
                        '../images/about/gallery/cafe/2.jpg',
                        '../images/about/gallery/cafe/3.jpg',
                        '../images/about/gallery/cafe/4.jpg',
                        '../images/about/gallery/cafe/5.jpg',
                        '../images/about/gallery/cafe/6.jpg'
                    ],
                    // events (6 изображений)
                    [
                        '../images/about/gallery/events/1.jpg',
                        '../images/about/gallery/events/2.jpg',
                        '../images/about/gallery/events/3.jpg',
                        '../images/about/gallery/events/4.jpg',
                        '../images/about/gallery/events/5.jpg',
                        '../images/about/gallery/events/6.jpg'
                    ],
                    // conf (8 изображений)
                    [
                        '../images/about/gallery/conf/1.jpg',
                        '../images/about/gallery/conf/2.jpg',
                        '../images/about/gallery/conf/3.jpg',
                        '../images/about/gallery/conf/4.jpg',
                        '../images/about/gallery/conf/5.jpg',
                        '../images/about/gallery/conf/6.jpg',
                        '../images/about/gallery/conf/7.jpg',
                        '../images/about/gallery/conf/8.jpg'
                    ],
                ],
                swiper: {
                    slidesPerView: 1,
                    loop: true,
                    speed: 800,
                    autoplay: {
                        delay: 6000,
                        disableOnInteraction: false,
                    }
                }
            };

            // CSS классы для элементов
            const CSS_CLASSES = {
                pagination: 'carousel--js-about-gallery__pagination',
                bullet: 'carousel--js-about-gallery__bullet',
                bulletCurrent: 'carousel--js-about-gallery__bullet--current',
                gallery: 'about-gallery__gallery',
                galleryMobile: 'about-gallery__gallery_mobile',
                galleryCurrent: 'about-gallery__gallery--current',
                swiperWrapper: 'swiper-wrapper',
                swiperSlide: 'swiper-slide',
                galleryItem: 'about-gallery__item'
            };

            // Селекторы DOM элементов
            const SELECTORS = {
                pagination: `.${CSS_CLASSES.pagination}`,
                bullet: `.${CSS_CLASSES.bullet}`,
                galleries: `.${CSS_CLASSES.gallery}`,
                galleriesMobile: `.${CSS_CLASSES.galleryMobile}`,
                swiper: '.swiper',
                swiperWrapper: `.${CSS_CLASSES.swiperWrapper}`
            };

            // Состояние слайдера
            let swiperInstance = null;
            const galleries = $carousel.querySelectorAll(SELECTORS.galleries);
            const galleriesMobile = $carousel.querySelectorAll(SELECTORS.galleriesMobile);

            /**
             * Создает HTML для пагинации галереи
             * @param {Array} images - массив изображений
             * @returns {string} HTML строка
             */
            function createPaginationHTML(images) {
                return images.map((img, index) => `
                    <div class="${CSS_CLASSES.bullet} ${index === 0 ? CSS_CLASSES.bulletCurrent : ''}" 
                         data-index="${index}">
                        <img src="${img}" alt="Gallery thumbnail">
                    </div>
                `).join('');
            }

            /**
             * Создает HTML для слайдов галереи
             * @param {Array} images - массив изображений
             * @returns {string} HTML строка
             */
            function createSlidesHTML(images) {
                return images.map(img => `
                    <div class="${CSS_CLASSES.swiperSlide}">
                        <div class="${CSS_CLASSES.galleryItem}">
                            <img src="${img}" alt="Gallery image">
                        </div>
                    </div>
                `).join('');
            }

            /**
             * Заполняет пагинацию для выбранной галереи
             * @param {number} galleryIndex - индекс галереи
             * @param {Object} swiperInstance - экземпляр Swiper
             */
            function renderPagination(galleryIndex, swiperInstance) {
                const pagination = $carousel.querySelector(SELECTORS.pagination);
                const currentGalleryImages = GALLERY_CONFIG.data[galleryIndex];
                
                pagination.innerHTML = createPaginationHTML(currentGalleryImages);
                
                // Добавляем обработчики кликов на буллеты
                pagination.querySelectorAll(SELECTORS.bullet).forEach((bullet, index) => {
                    bullet.addEventListener('click', () => {
                        swiperInstance.slideTo(index);
                    });
                });
            }

            /**
             * Очищает все обработчики событий пагинации
             */
            function clearPaginationListeners() {
                const pagination = $carousel.querySelector(SELECTORS.pagination);

                if (pagination) {
                    // Клонируем элемент, чтобы удалить все слушатели
                    const newPagination = pagination.cloneNode(true);
                    pagination.parentNode.replaceChild(newPagination, pagination);
                }
            }

            /**
             * Заполняет слайды для выбранной галереи
             * @param {number} galleryIndex - индекс галереи
             */
            function renderSlides(galleryIndex) {
                const slider = $carousel.querySelector(SELECTORS.swiperWrapper);
                const currentGalleryImages = GALLERY_CONFIG.data[galleryIndex];
                
                slider.innerHTML = createSlidesHTML(currentGalleryImages);
            }

            /**
             * Создает и настраивает экземпляр Swiper
             * @returns {Object} экземпляр Swiper
             */
            function createSwiperInstance() {
                return new Swiper($carousel.querySelector(SELECTORS.swiper), {
                    ...trackpadSwipeConfig,
                    ...GALLERY_CONFIG.swiper,
                    on: {
                        slideChange: function() {
                            updatePaginationState(this.realIndex);
                        }
                    }
                });
            }

            /**
             * Обновляет состояние пагинации при смене слайда
             * @param {number} currentIndex - текущий индекс слайда
             */
            function updatePaginationState(currentIndex) {
                const pagination = $carousel.querySelector(SELECTORS.pagination);

                pagination.querySelectorAll(SELECTORS.bullet).forEach((bullet, index) => {
                    bullet.classList.toggle(CSS_CLASSES.bulletCurrent, index === currentIndex);
                });
            }

            /**
             * Уничтожает текущий экземпляр Swiper
             */
            function destroySwiperInstance() {
                if (swiperInstance) {
                    swiperInstance.destroy();
                    swiperInstance = null;
                }
            }

            /**
             * Инициализирует слайдер для выбранной галереи
             * @param {number} galleryIndex - индекс галереи
             */
            function initGallerySlider(galleryIndex) {
                destroySwiperInstance();
                clearPaginationListeners();
                renderSlides(galleryIndex);
                swiperInstance = createSwiperInstance();
                renderPagination(galleryIndex, swiperInstance);
            }

            /**
             * Обновляет визуальное состояние галерей
             * @param {number} activeIndex - индекс активной галереи
             */
            function updateGalleriesState(activeIndex) {
                galleries.forEach((gallery, index) => {
                    gallery.classList.toggle(CSS_CLASSES.galleryCurrent, index === activeIndex);
                });
                galleriesMobile.forEach((gallery, index) => {
                    gallery.classList.toggle(CSS_CLASSES.galleryCurrent, index === activeIndex);
                });
            }

            /**
             * Добавляет обработчики кликов на галереи
             */
            function attachGalleryListeners() {
                galleries.forEach((gallery, index) => {
                    gallery.addEventListener('click', () => {
                        initGallerySlider(index);
                        updateGalleriesState(index);
                    });
                });
                galleriesMobile.forEach((gallery, index) => {
                    gallery.addEventListener('click', () => {
                        initGallerySlider(index);
                        updateGalleriesState(index);
                    });
                });
            }

            // Инициализация галереи
            attachGalleryListeners();
            initGallerySlider(0);
            updateGalleriesState(0);
        }

        if ($carousel.classList.contains('carousel--js-about-gallery-inner')) {
            return new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1.5,
                spaceBetween: 8,
                loop: false,
            });
        }

        if ($carousel.classList.contains('carousel--js-about-news')) {
            return new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                spaceBetween: 8,
                loop: false,
            });
        }

        if ($carousel.classList.contains('carousel--js-about-voices')) {
            const swiper = new Swiper($carousel.querySelector('.swiper'), {
                simulateTouch: true,
                threshold: 10,
                touchAngle: 45,
                mousewheel: {
                    enabled: false,
                },
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                spaceBetween: -95,
                coverflowEffect: {
                    rotate: 0,
                    stretch: 0,
                    depth: 200,
                    modifier: 1,
                    slideShadows: false,
                },
                navigation: {
                    prevEl: $carousel.querySelector(".about-voices__prev"),
                    nextEl: $carousel.querySelector(".about-voices__next"),
                },
                loop: true,
                on: {
                    slideChange: function() {
                        // Пауза всех видео и выключение звука
                        const allVideos = $carousel.querySelectorAll('video');
                        allVideos.forEach(video => {
                            video.pause();
                            video.muted = true;
                        });
                        
                        // Воспроизведение видео на активном слайде (без звука)
                        const activeSlide = this.slides[this.activeIndex];
                        const activeVideo = activeSlide.querySelector('video');
                        if (activeVideo) {
                            activeVideo.muted = true;
                            activeVideo.play();
                        }
                    },
                    init: function() {
                        // Воспроизведение видео на первом слайде при инициализации (без звука)
                        const firstVideo = this.slides[0].querySelector('video');
                        if (firstVideo) {
                            firstVideo.muted = true;
                            firstVideo.play();
                        }
                    }
                }
            });

            // Обработчики для кнопок мьют - включаем звук и открываем полноэкранный режим
            $carousel.addEventListener('click', function(e) {
                if (e.target.classList.contains('about-voices__mute')) {
                    const video = e.target.closest('.about-voices__item').querySelector('video');
                    if (video) {
                        // Включаем звук
                        video.muted = !video.muted;
                    }
                }
            });

            // Обработчик для полноэкранного режима при клике на видео
            $carousel.addEventListener('click', function(e) {
                if (e.target.tagName === 'VIDEO') {
                    // Включаем звук
                    e.target.muted = false;
                    
                    // Открываем полноэкранный режим
                    if (e.target.requestFullscreen) {
                        e.target.requestFullscreen();
                    } else if (e.target.webkitRequestFullscreen) {
                        e.target.webkitRequestFullscreen();
                    } else if (e.target.msRequestFullscreen) {
                        e.target.msRequestFullscreen();
                    }
                }
            });

            // Обработчик для закрытия полноэкранного режима - выключаем звук
            document.addEventListener('fullscreenchange', function() {
                if (!document.fullscreenElement) {
                    // Полноэкранный режим закрыт, выключаем звук у всех видео
                    const allVideos = $carousel.querySelectorAll('video');
                    allVideos.forEach(video => {
                        video.muted = true;
                    });
                }
            });

            // Обработчики для других браузеров
            document.addEventListener('webkitfullscreenchange', function() {
                if (!document.webkitFullscreenElement) {
                    const allVideos = $carousel.querySelectorAll('video');
                    allVideos.forEach(video => {
                        video.muted = true;
                    });
                }
            });

            document.addEventListener('msfullscreenchange', function() {
                if (!document.msFullscreenElement) {
                    const allVideos = $carousel.querySelectorAll('video');
                    allVideos.forEach(video => {
                        video.muted = true;
                    });
                }
            });

            return swiper;
        }

        if ($carousel.classList.contains('carousel--js-courses-process')) {
            // Данные для курсов процесса
            const coursesProcessData = [
                {
                    title: "Графические элементы",
                    description: "Разрабатываем дизайн, персонажей, сюжеты и практики под специфику конкретной компании, подбираем учебные сценарии под целевую аудиторию",
                    image: "../images/courses/process/1.webp"
                },
                {
                    title: "Методология и сценарий",
                    description: "Педагогические дизайнеры и сценаристы адаптируют материалы и выбирают лучшие форматы подачи с учетом целевой аудитории, чтобы обучение было логичным, понятным и эффективным",
                    image: "../images/courses/process/2.webp"
                },
                {
                    title: "Сборка курса",
                    description: "Разработчики собирают курс на платформе (ДелайКурс, CourseLab и т.д.), настраивая интерактив, анимацию, практические задания и баллы",
                    image: "../images/courses/process/3.webp"
                },
                {
                    title: "Контроль качества",
                    description: "Тестировщики проверяют работоспособность курса и соответствие техническому заданию. Корректоры исключают ошибки в тексте",
                    image: "../images/courses/process/4.webp"
                },
                {
                    title: "Поддержка",
                    description: "Специалисты службы сервиса отвечают за работоспособность и актуальность материалов после внедрения в процесс обучения",
                    image: "../images/courses/process/5.webp"
                }
            ];

            // Отрисовываем слайды
            const swiperWrapper = $carousel.querySelector('.swiper-wrapper');
            swiperWrapper.innerHTML = '';
            
            coursesProcessData.forEach((item, index) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `<img src="${item.image}" alt="${item.title}">`;
                swiperWrapper.appendChild(slide);
            });

            // Отрисовываем контент
            const updateContent = (activeIndex) => {
                const countElement = document.querySelector('.courses-process__count');
                const titleElement = document.querySelector('.courses-process__info h3');
                const descriptionElement = document.querySelector('.courses-process__info p');
                
                if (countElement) {
                    countElement.textContent = `${activeIndex + 1}/${coursesProcessData.length}`;
                }
                if (titleElement) {
                    titleElement.textContent = coursesProcessData[activeIndex].title;
                }
                if (descriptionElement) {
                    descriptionElement.textContent = coursesProcessData[activeIndex].description;
                }
            };

            // Инициализируем Swiper
            const swiper = new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                spaceBetween: 0,
                loop: false,
                navigation: {
                    prevEl: document.querySelector(".courses-process__controls-prev"),
                    nextEl: document.querySelector(".courses-process__controls-next"),
                },
                on: {
                    slideChange: function() {
                        updateContent(this.activeIndex);
                    }
                },
                pagination: {
                    clickable: true,
                    el: '.carousel--js-courses-process__pagination',
                    bulletClass: 'carousel--js-courses-process__bullet',
                    bulletActiveClass: 'carousel--js-courses-process__bullet--current',
                },
            });

            // Инициализируем контент для первого слайда
            updateContent(0);

            return swiper;
        }

        if ($carousel.classList.contains('carousel--js-courses-rewiews')) {
            return new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                spaceBetween: 8,
                loop: false,
            });
        }

        if ($carousel.classList.contains('carousel--js-courses-choose')) {
            return new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                spaceBetween: 8,
                loop: false,
            });
        }

        if ($carousel.classList.contains('carousel--js-videos-rewiews')) {
            return new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                spaceBetween: 8,
                loop: false,
            });
        }

        if ($carousel.classList.contains('carousel--js-gamification-rewiews')) {
            return new Swiper($carousel.querySelector('.swiper'), {
                ...trackpadSwipeConfig,
                slidesPerView: 1,
                spaceBetween: 8,
                loop: false,
            });
        }
    });


    /* В этих каруселях важно дождаться момента, когда прогрузились и применились шрифты -- от этого зависит ширина слайдов: */
    window.addEventListener("load", (event) => {
        document.querySelectorAll('.carousel').forEach(($carousel) => {
            if ($carousel.classList.contains("carousel--js-init-thermometer")) {

                if(isDesktop) {
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
            }
        });
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

        if (scrolled > 10) {
            $html.addClass('scrolled');
        } else {
            $html.removeClass('scrolled');
        }

        if (scrolled > 200) {
            $html.addClass('scrolled-200px');
        } else {
            $html.removeClass('scrolled-200px');
        }

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
    $(window).on('load', adjustBubblePosition)



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

        $('.filter__actions').on('click', function(){
            $(this).closest('.filter').removeClass('filter--expanded');
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


    /* Блог (обычные табы, но тут в карусели) */

    $('.blog__navigation .inner-thermometer-button').on('click', function() {
        const $this = $(this);
        const $blog = $this.closest('.blog');
        if( ! $this.hasClass('inner-thermometer-button--current')) {
            const index = $this.closest('.swiper-slide').index();

            $blog.find('.inner-thermometer-button').removeClass('inner-thermometer-button--current');
            $this.addClass('inner-thermometer-button--current');

            $blog.find('.blog__tab--current').removeClass('blog__tab--current');
            $blog.find('.blog__tab:nth-child('+ (index + 1) +')').addClass('blog__tab--current');
        }
    });


    /* FAQ */

    $('.faq__question').on('click', function() {
        const $currentItem = $(this).closest('.faq__item');
        $('.faq__item').not($currentItem).removeClass('faq__item--expanded');
        $currentItem.toggleClass('faq__item--expanded');
    });



    /* Плавная прокрутка */
    $('.anchor').on('click', function(event) {
        event.preventDefault();
        $.magnificPopup.close();
        const target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 800);
    });

    /* About hero counter - days since April 1, 1999 */
    function updateAboutHeroCounter() {
        const startDate = new Date(1999, 3, 1); // 1 апреля 1999 года
        const currentDate = new Date();
        const timeDifference = currentDate - startDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        
        const counterElement = $('.about-hero__counter-value').first();
        if (counterElement.length) {
            counterElement.text(daysDifference);
        }
    }
    
    updateAboutHeroCounter();

    /* About experts video */
    function initAboutExpertsVideo() {
        const video = $('.about-experts__video video')[0];
        const progressCircle = $('.about-experts__video-progress-circle');
        const volumeButton = $('.about-experts__video-volume');
        const volumeStub = $('.about-experts__video-volume-stub');

        if (!video) {
            return;
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

    /* About экосистема. Аккордионы */
    function initAboutEcoAccordions() {
        $('.about-eco__graph-accordion').each(function() {
            const $accordion = $(this);
            const $trigger = $accordion.find('[data-type="accordion-trigger"]');
            const $content = $accordion.find('.about-eco__graph-accordion-content');
            const $topic = $accordion.find('.about-eco__graph-topic');

            $trigger.on('click', function() {
                const currentState = $content.attr('data-state');
                const newState = currentState === 'closed' ? 'opened' : 'closed';
                
                $content.attr('data-state', newState);
                
                if (newState === 'opened') {
                    $topic.addClass('about-eco__graph-topic_opened');
                } else {
                    $topic.removeClass('about-eco__graph-topic_opened');
                }
            });
        });
    }

    initAboutEcoAccordions();

    /* About tour line-by-line animation */
    function initAboutTourLineAnimation() {
        const tourElement = document.querySelector('.about-tour h3');
        if (!tourElement) return;

        let hasAnimated = false;

        // Создаем Intersection Observer для отслеживания появления блока
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    startLineAnimation(tourElement);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3 // Анимация запустится когда 30% элемента будет видно
        });

        observer.observe(tourElement);
    }

    function startLineAnimation(element) {
        // Показываем элемент
        element.classList.add('animation-ready');
        
        // Получаем HTML содержимое с br тегами
        const originalHTML = element.innerHTML;
        
        // Разбиваем на строки по br тегам
        const lines = originalHTML.split('<br>');
        
        // Очищаем элемент и создаем структуру для анимации
        element.innerHTML = '';
        
        // Создаем контейнеры для каждой строки
        lines.forEach((line, index) => {
            const lineContainer = document.createElement('div');
            lineContainer.className = 'about-tour__line';
            lineContainer.innerHTML = line;
            lineContainer.style.opacity = '0';
            lineContainer.style.transform = 'translateY(20px)';
            lineContainer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            element.appendChild(lineContainer);
        });
        
        // Анимируем появление строк с задержкой
        const lineContainers = element.querySelectorAll('.about-tour__line');
        lineContainers.forEach((lineContainer, index) => {
            setTimeout(() => {
                lineContainer.style.opacity = '1';
                lineContainer.style.transform = 'translateY(0)';
            }, 300 + (index * 500)); // Задержка 1 секунда + 500ms между строками
        });
    }

    initAboutTourLineAnimation();

    /* Courses roadmap accordions */
    function initCoursesRoadmapAccordions() {
        $('.courses-roadmap__accordion-title').on('click', function() {
            const $accordion = $(this).closest('.courses-roadmap__accordion');
            
            // Переключаем аккордион
            $accordion.toggleClass('courses-roadmap__accordion_open');
        });
    }

    initCoursesRoadmapAccordions();

    /* Courses reviews expand/collapse */
    function initCoursesReviews() {
        $('.courses-reviews__full').on('click', function() {
            const $button = $(this);
            const $text = $button.siblings('p');
            
            if ($text.hasClass('expanded')) {
                // Сворачиваем текст
                $text.removeClass('expanded');
                $button.text('Читать полностью');
            } else {
                // Разворачиваем текст
                $text.addClass('expanded');
                $button.text('Свернуть');
            }
        });
    }

    initCoursesReviews();

    /* Videos roadmap accordions */
    function initVideosRoadmapAccordions() {
        $('.videos-roadmap__accordion-title').on('click', function() {
            const $accordion = $(this).closest('.videos-roadmap__accordion');
            
            // Переключаем аккордион
            $accordion.toggleClass('videos-roadmap__accordion_open');
        });
    }

    initVideosRoadmapAccordions();

    /* Videos reviews expand/collapse */
    function initVideosReviews() {
        $('.videos-reviews__full').on('click', function() {
            const $button = $(this);
            const $text = $button.siblings('p');
            
            if ($text.hasClass('expanded')) {
                // Сворачиваем текст
                $text.removeClass('expanded');
                $button.text('Читать полностью');
            } else {
                // Разворачиваем текст
                $text.addClass('expanded');
                $button.text('Свернуть');
            }
        });
    }

    initVideosReviews();

        /* Gamification roadmap accordions */
    function initGamificationRoadmapAccordions() {
        $('.gamification-roadmap__accordion-title').on('click', function() {
            const $accordion = $(this).closest('.gamification-roadmap__accordion');
            
            // Переключаем аккордион
            $accordion.toggleClass('gamification-roadmap__accordion_open');
        });
    }

    initGamificationRoadmapAccordions();

    /* Videos reviews expand/collapse */
    function initGamificationReviews() {
        $('.gamification-reviews__full').on('click', function() {
            const $button = $(this);
            const $text = $button.siblings('p');
            
            if ($text.hasClass('expanded')) {
                // Сворачиваем текст
                $text.removeClass('expanded');
                $button.text('Читать полностью');
            } else {
                // Разворачиваем текст
                $text.addClass('expanded');
                $button.text('Свернуть');
            }
        });
    }

    initGamificationReviews();

    // Videos roadmap tabs functionality
    function initVideosRoadmapTabs() {
        const tabs = document.querySelectorAll('.videos-roadmap__tab');
        const maps = document.querySelectorAll('.videos-roadmap__map');
        const accordions = document.querySelectorAll('.videos-roadmap__accordions');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');

                // Hide all maps and accordions
                maps.forEach(map => map.style.display = 'none');
                accordions.forEach(accordion => accordion.style.display = 'none');

                // Show corresponding map and accordion
                const targetMap = document.querySelector(`.videos-roadmap__map_${tabType}`);
                const targetAccordion = document.querySelector(`.videos-roadmap__accordions_${tabType}`);
                
                if (targetMap) targetMap.style.display = 'block';
                if (targetAccordion) targetAccordion.style.display = 'flex';
            });
        });
    }

    initVideosRoadmapTabs();
})(jQuery);
