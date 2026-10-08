/* =========================================================
   STUDENT+
   ACHIEVEMENTS JS
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

        const clickedMenu =
            mainNav.contains(event.target);

        const clickedButton =
            menuToggle.contains(event.target);

        if (!clickedMenu && !clickedButton) {

            mainNav.classList.remove("open");
            menuToggle.classList.remove("active");

        }

    });

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

const achievementItems =
    document.querySelectorAll(
        ".achievement-card, .achievement-item, .achievement-section"
    );


const revealObserver =
    new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    observer.unobserve(
                        entry.target
                    );

                }

            });

        },
        {
            threshold: 0.12
        }
    );


achievementItems.forEach(item => {

    item.classList.add("reveal");

    revealObserver.observe(item);

});


/* =========================================================
   SCROLL TO ACHIEVEMENTS
========================================================= */

const achievementButton =
    document.querySelector(
        'a[href="#achievements"]'
    );


if (achievementButton) {

    achievementButton.addEventListener(
        "click",
        event => {

            const target =
                document.getElementById(
                    "achievements"
                );

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


/* =========================================================
   CERTIFICATE IMAGE PREVIEW
========================================================= */

const certificateImages =
    document.querySelectorAll(
        ".certificate-image img"
    );


certificateImages.forEach(image => {

    image.addEventListener(
        "click",
        () => {

            const overlay =
                document.createElement("div");

            overlay.className =
                "image-preview";


            overlay.innerHTML = `

                <button
                    class="preview-close"
                    type="button"
                    aria-label="Жабу"
                >
                    ×
                </button>

                <img
                    src="${image.src}"
                    alt="${image.alt || "Certificate"}"
                >

            `;


            document.body.appendChild(
                overlay
            );


            document.body.style.overflow =
                "hidden";


            const closePreview =
                () => {

                    overlay.remove();

                    document.body.style.overflow =
                        "";

                };


            overlay
                .querySelector(".preview-close")
                .addEventListener(
                    "click",
                    closePreview
                );


            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target === overlay
                    ) {

                        closePreview();

                    }

                }
            );


            document.addEventListener(
                "keydown",
                function escapeHandler(event) {

                    if (
                        event.key === "Escape"
                    ) {

                        closePreview();

                        document.removeEventListener(
                            "keydown",
                            escapeHandler
                        );

                    }

                }
            );

        }
    );

});


/* =========================================================
   ACTIVE CERTIFICATE
========================================================= */

const achievementCards =
    document.querySelectorAll(
        ".achievement-card"
    );


achievementCards.forEach(card => {

    card.addEventListener(
        "mouseenter",
        () => {

            achievementCards.forEach(
                otherCard => {

                    otherCard.classList.remove(
                        "focused"
                    );

                }
            );

            card.classList.add(
                "focused"
            );

        }
    );

});


/* =========================================================
   CURRENT YEAR
========================================================= */

const yearElements =
    document.querySelectorAll(
        "[data-current-year]"
    );


yearElements.forEach(element => {

    element.textContent =
        new Date().getFullYear();

});