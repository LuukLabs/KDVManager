/** Sitegedrag: navigatie, scroll-reveal en het demoformulier. */
(function () {
  "use strict";

  /* Header krijgt een lijn zodra je van de bovenkant af scrolt. */
  var header = document.querySelector(".site-header");
  if (header) {
    var setStuck = function () {
      header.setAttribute("data-stuck", window.scrollY > 8 ? "true" : "false");
    };
    setStuck();
    window.addEventListener("scroll", setStuck, { passive: true });
  }

  /* Mobiele navigatie */
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Scroll-reveal, één keer per element. */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (n) {
        n.setAttribute("data-seen", "true");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.setAttribute("data-seen", "true");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.06 }
      );
      reveals.forEach(function (n) {
        io.observe(n);
      });
    }
  }

  /* ------------------------------------------------------ demoformulier */

  var form = document.querySelector("[data-demo-form]");
  if (!form) return;

  var status = form.querySelector("[data-form-status]");

  function setError(input, message) {
    var holder = input.closest(".field");
    var out = holder && holder.querySelector(".field__error");
    if (out) out.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validate() {
    var problems = [];

    var name = form.elements.naam;
    var org = form.elements.organisatie;
    var mail = form.elements.email;

    [name, org, mail].forEach(function (input) {
      setError(input, "");
    });

    if (!name.value.trim()) {
      setError(name, "Vul je naam in.");
      problems.push(name);
    }
    if (!org.value.trim()) {
      setError(org, "Vul de naam van je organisatie in.");
      problems.push(org);
    }
    var mailValue = mail.value.trim();
    if (!mailValue) {
      setError(mail, "Vul je e-mailadres in.");
      problems.push(mail);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mailValue)) {
      setError(mail, "Dit e-mailadres kan niet gebruikt worden. Controleer het op typefouten.");
      problems.push(mail);
    }

    return problems;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var problems = validate();
    if (problems.length) {
      status.setAttribute("data-kind", "error");
      status.setAttribute("data-shown", "true");
      status.textContent =
        problems.length === 1
          ? "Er ontbreekt nog één gegeven. Bekijk het gemarkeerde veld."
          : "Er ontbreken nog " + problems.length + " gegevens. Bekijk de gemarkeerde velden.";
      problems[0].focus();
      return;
    }

    /* Deze site is statisch: er is nog geen endpoint dat de aanvraag ontvangt.
       Zet FORM_ENDPOINT in index.html op een URL om echt te versturen. */
    var endpoint = form.getAttribute("data-endpoint");
    var naam = form.elements.naam.value.trim().split(" ")[0];

    if (!endpoint) {
      status.setAttribute("data-kind", "ok");
      status.setAttribute("data-shown", "true");
      status.textContent =
        "Bedankt " +
        naam +
        ". Deze demopagina verstuurt nog niets — koppel een endpoint om aanvragen te ontvangen. " +
        "Mail intussen naar demo@kdvmanager.nl.";
      return;
    }

    var button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Versturen…";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        status.setAttribute("data-kind", "ok");
        status.setAttribute("data-shown", "true");
        status.textContent =
          "Bedankt " + naam + ". We nemen binnen één werkdag contact op om je demo in te richten.";
      })
      .catch(function () {
        status.setAttribute("data-kind", "error");
        status.setAttribute("data-shown", "true");
        status.textContent =
          "De aanvraag is niet verstuurd. Probeer het opnieuw of mail naar demo@kdvmanager.nl.";
      })
      .then(function () {
        button.disabled = false;
        button.textContent = "Demo aanvragen";
      });
  });
})();
