/* =============== SHOW MENU =============== */
/* Added functionality to toggle the visibility of 
the navigation menu when the toggle button is clicked, 
and to hide the menu when the close button is clicked */
const $navMenu = $('#nav-menu'),
    $navToggle = $('#nav-toggle'),
    $navClose = $('#nav-close');

/* Menu show */
// Validate if constant exists
if ($navToggle.length) {
    $navToggle.on('click', () => {
        $navMenu.addClass('show-menu');
    });
}

/* Menu hidden */
// Validate if constant exists
if ($navClose.length) {
    $navClose.on('click', () => {
        $navMenu.removeClass('show-menu');
    });
}

/* =============== REMOVE MENU MOBILE =============== */
/* Implemented functionality to remove the mobile menu 
when any navigation link is clicked */
const $navLink = $('.nav_link');

const linkAction = () => {
    $navMenu.removeClass('show-menu');
}
$navLink.each(function() {
    $(this).on('click', linkAction);
});

/* =============== CHANGE BACKGROUND HEADER =============== */
/* Implemented functionality to dynamically change the background 
of the header based on scroll position */
const scrollHeader = () => {
    const $header = $('#header');

    /* when the scroll is greater than 50 viewport height, 
    add the scroll-header class to the header tag */
    $(this).scrollTop() >= 50 ? $header.addClass('bg-header') : $header.removeClass('bg-header');
}
$(window).on('scroll', scrollHeader);

/* =============== SCROLL SECTIONS ACTIVE LINK =============== */
/* Implemented functionality to highlight active navigation links 
based on scroll position */
const $sections = $('section[id]');

const scrollActive = () => {
    const scrollY = $(window).scrollTop();

    $sections.each(function() {
        const $current = $(this),
            sectionHeight = $current.outerHeight(),
            sectionTop = $current.offset().top - 58,
            sectionId = $current.attr('id'),
            $sectionsClass = $(`.nav_menu a[href*=${sectionId}]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            $sectionsClass.addClass('active-link');
        } else {
            $sectionsClass.removeClass('active-link');
        }
    });
}
$(window).on('scroll', scrollActive);

/* =============== SHOW SCROLL UP =============== */
/* Implemented functionality to display a scroll-to-top 
button when the user scrolls beyond a certain point */
const scrollUp = () => {
    const $scrollUp = $('#scroll-up');

    // when the scroll is higher than 350vh, add the show-scroll class
    $(this).scrollTop() >= 350 ? $scrollUp.addClass('show-scroll') : $scrollUp.removeClass('show-scroll');
}
$(window).on('scroll', scrollUp);

/* =============== SCROLL REVEAL ANIMATION =============== */
/* Configure the Scroll Reveal library to animate elements 
when they come into view during scrolling */
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400
});

/* Implemented Scroll Reveal animations for various elements */
sr.reveal(`.home_data, .footer_container, .footer_group`);
sr.reveal(`.home_img`, { delay: 700, origin: 'bottom' });
sr.reveal(`.program_card, .program_card2, .pricing_card`, { interval: 100 });
sr.reveal(`.exercises_content`, { origin: 'left' });
sr.reveal(`.exercises_img`, { origin: 'right' });

/* =============== EMAIL JS =============== */
/* Defined JS variables to manage the contact form 
elements for EmailJS integration */
const $contactForm = $('#contact-form'),
    $contactMessage = $('#contact-message'),
    $contactUser = $('#contact-user');

const sendEmail = (e) => {
    e.preventDefault();

    // We check if the field has a value
    if ($contactUser.val() === '') {
        // add and remove colour
        $contactMessage.removeClass('color-green').addClass('color-red');

        // show message
        $contactMessage.text('You must enter an email');

        // remove message after 3s
        setTimeout(() => {
            $contactMessage.text('');
        }, 3000);
    } else {
        /* Implemented EmailJS functionality to send form data */
        // serviceId - templateId - #form - publicKey
        emailjs.sendForm('service_1nllsid', 'template_op2u9yl', '#contact-form', 'jtPMwhZnrHV16l0xY')
            .then(() => {
                /* Added callback functions to handle successful form submission 
                and error handling in EmailJS integration */
                // show message and add colour
                $contactMessage.addClass('color-green').text('You have been registered successfully!');

                // remove message after 3s
                setTimeout(() => {
                    $contactMessage.text('');
                }, 3000);
            }, (error) => {
                // mail sending error
                alert('Oops! Something went wrong...', error);
            });
        // clean input field
        $contactUser.val('');
    }
}
$contactForm.on('submit', sendEmail);
