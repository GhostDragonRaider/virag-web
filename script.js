(() => {
  const header = document.querySelector(".site-header");
  const year = document.getElementById("year");
  const form = document.getElementById("order-form");
  const status = document.getElementById("form-status");
  const productSelect = document.getElementById("product-select");
  const revealItems = document.querySelectorAll(".product, .contact-form");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const selectProduct = (productName) => {
    if (!productSelect || !productName) return;
    const match = Array.from(productSelect.options).find(
      (option) => option.value === productName
    );
    if (match) {
      productSelect.value = match.value;
      productSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  document.querySelectorAll(".order-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.closest(".product")?.getAttribute("data-product");
      selectProduct(product);
      document.getElementById("kapcsolat")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => {
        selectProduct(product);
        form?.querySelector('textarea[name="message"]')?.focus();
      }, 500);
    });
  });

  const setFieldValidity = (field, valid) => {
    field.classList.toggle("is-invalid", !valid);
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const product = String(data.get("product") || "").trim();
    const message = String(data.get("message") || "").trim();

    const nameField = form.elements.namedItem("name");
    const emailField = form.elements.namedItem("email");
    const messageField = form.elements.namedItem("message");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const nameOk = name.length >= 2;
    const messageOk = message.length >= 8;

    if (nameField instanceof HTMLElement) setFieldValidity(nameField, nameOk);
    if (emailField instanceof HTMLElement) setFieldValidity(emailField, emailOk);
    if (messageField instanceof HTMLElement) setFieldValidity(messageField, messageOk);

    if (!nameOk || !emailOk || !messageOk) {
      status.textContent = "Kérjük, töltsd ki helyesen a kötelező mezőket.";
      status.className = "form-status is-error";
      return;
    }

    const subject = encodeURIComponent(
      product ? `Megrendelés: ${product}` : "Üzenet az Örökvirág oldalról"
    );
    const body = encodeURIComponent(
      [
        `Név: ${name}`,
        `Email: ${email}`,
        phone ? `Telefon: ${phone}` : null,
        product ? `Termék: ${product}` : null,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n")
    );

    const payload = { name, email, phone, product, message, sentAt: new Date().toISOString() };
    try {
      const existing = JSON.parse(localStorage.getItem("orokvirag-orders") || "[]");
      existing.push(payload);
      localStorage.setItem("orokvirag-orders", JSON.stringify(existing));
    } catch (_) {
      /* ignore storage errors */
    }

    status.textContent = product
      ? `Köszönjük, ${name}! A(z) „${product}” iránti kérésedet rögzítettük.`
      : `Köszönjük, ${name}! Üzenetedet rögzítettük.`;
    status.className = "form-status is-success";

    form.reset();
    [nameField, emailField, messageField].forEach((field) => {
      if (field instanceof HTMLElement) field.classList.remove("is-invalid");
    });

    // Megnyitja az email klienset is, ha elérhető
    window.setTimeout(() => {
      window.location.href = `mailto:hello@orokvirag.hu?subject=${subject}&body=${body}`;
    }, 250);
  });
})();
