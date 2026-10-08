/* =========================================================
   STUDENT+ — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ====================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", () => {

            navMenu.classList.toggle("active");
            menuToggle.classList.toggle("active");

        });


        // Menu ішіндегі сілтемені басқанда менюді жабу

        const navLinks = navMenu.querySelectorAll(".nav-link");

        navLinks.forEach((link) => {

            link.addEventListener("click", () => {

                navMenu.classList.remove("active");
                menuToggle.classList.remove("active");

            });

        });


        // Терезе үлкейген кезде mobile menu жабылады

        window.addEventListener("resize", () => {

            if (window.innerWidth > 900) {

                navMenu.classList.remove("active");
                menuToggle.classList.remove("active");

            }

        });

    }


    /* =====================================================
       HEADER SCROLL EFFECT
    ====================================================== */

    const header = document.querySelector(".header");

    if (header) {

        const updateHeader = () => {

            if (window.scrollY > 30) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        };

        window.addEventListener("scroll", updateHeader);

        updateHeader();

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ====================================================== */

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    const navigationLinks =
        document.querySelectorAll(".nav-link");

    navigationLinks.forEach((link) => {

        const linkPage =
            link.getAttribute("href");

        if (linkPage === currentPage) {

            navigationLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

        }

    });


    /* =====================================================
       SCROLL REVEAL
    ====================================================== */

    const revealElements = document.querySelectorAll(
        ".section-header, " +
        ".about-text, " +
        ".feature-item, " +
        ".direction-card, " +
        ".achievement-preview-item, " +
        ".ai-preview-text, " +
        ".ai-visual, " +
        ".cta-box"
    );


    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


        revealElements.forEach((element) => {

            element.classList.add("reveal");

            observer.observe(element);

        });

    } else {

        revealElements.forEach((element) => {

            element.classList.add("show");

        });

    }


    /* =====================================================
       SMOOTH SCROLL
    ====================================================== */

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');


    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const headerHeight =
                header ? header.offsetHeight : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                15;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });


    /* =====================================================
       AI BUTTON
    ====================================================== */

    const aiLinks =
        document.querySelectorAll(
            'a[href="ai.html"]'
        );


    aiLinks.forEach((link) => {

        link.addEventListener("click", () => {

            // AI бетіне өту.
            // Нақты AI API жұмысы ai.html + backend/server.js
            // арқылы кейін қосылады.

            console.log("Student+ AI ашылуда...");

        });

    });


    /* =====================================================
       DIRECTION CARDS
    ====================================================== */

    const directionCards =
        document.querySelectorAll(".direction-card");


    directionCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            card.classList.add("hovered");

        });


        card.addEventListener("mouseleave", () => {

            card.classList.remove("hovered");

        });

    });


    /* =====================================================
       AI CORE INTERACTION
    ====================================================== */

    const aiCore =
        document.querySelector(".ai-core");


    if (aiCore) {

        aiCore.addEventListener("click", () => {

            aiCore.classList.add("ai-active");

            setTimeout(() => {

                aiCore.classList.remove("ai-active");

            }, 800);

        });

    }


    /* =====================================================
       HERO CARD PARALLAX
    ====================================================== */

    const heroCard =
        document.querySelector(".hero-card");


    if (heroCard && window.innerWidth > 900) {

        document.addEventListener("mousemove", (event) => {

            const x =
                (window.innerWidth / 2 - event.clientX) / 80;

            const y =
                (window.innerHeight / 2 - event.clientY) / 80;


            heroCard.style.transform =
                `rotateY(${-x}deg) rotateX(${y}deg)`;

        });


        document.addEventListener("mouseleave", () => {

            heroCard.style.transform =
                "rotate(2deg)";

        });

    }


    /* =====================================================
       CURRENT YEAR
    ====================================================== */

    const year =
        new Date().getFullYear();


    const footerText =
        document.querySelector(".footer-bottom span");


    if (footerText) {

        footerText.textContent =
            `© ${year} Student+. All rights reserved.`;

    }


    /* =====================================================
       CONSOLE
    ====================================================== */

    console.log(
        "%cStudent+",
        "color:#1769ff;font-size:25px;font-weight:900;"
    );

    console.log(
        "%cLearn • Create • Develop",
        "color:#777;font-size:13px;"
    );

});