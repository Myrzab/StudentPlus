/* =========================================================
   STUDENT+
   AI ABOUT JS
========================================================= */


/* =========================================================
   MOBILE MENU
========================================================= */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", () => {

        mainNav.classList.toggle("open");
        menuToggle.classList.toggle("active");

    });


    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.addEventListener("click", () => {

                mainNav.classList.remove("open");
                menuToggle.classList.remove("active");

            });

        });


    document.addEventListener("click", (event) => {

        const clickedInsideMenu =
            mainNav.contains(event.target);

        const clickedButton =
            menuToggle.contains(event.target);

        if (
            !clickedInsideMenu &&
            !clickedButton
        ) {

            mainNav.classList.remove("open");
            menuToggle.classList.remove("active");

        }

    });

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements = document.querySelectorAll(
    ".feature-card, .step, .technology-card, .morse-card, .cta-box"
);

const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

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


revealElements.forEach(element => {

    element.classList.add("reveal");

    revealObserver.observe(element);

});


/* =========================================================
   MORSE VISUAL
========================================================= */

const morseCircle =
    document.querySelector(".morse-circle");

if (morseCircle) {

    morseCircle.addEventListener(
        "mouseenter",
        () => {

            morseCircle.style.animationPlayState =
                "paused";

        }
    );


    morseCircle.addEventListener(
        "mouseleave",
        () => {

            morseCircle.style.animationPlayState =
                "running";

        }
    );

}


/* =========================================================
   AI WINDOW TYPING
========================================================= */

const typingDots =
    document.querySelectorAll(".typing span");

if (typingDots.length) {

    let current = 0;

    setInterval(() => {

        typingDots.forEach(dot => {

            dot.style.opacity = "0.3";

        });

        if (typingDots[current]) {

            typingDots[current].style.opacity = "1";

        }

        current++;

        if (current >= typingDots.length) {
            current = 0;
        }

    }, 450);

}


/* =========================================================
   SMOOTH ANCHOR
========================================================= */

document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });