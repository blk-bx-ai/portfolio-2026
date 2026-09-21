(() => {
  const formId = "contact-form";
  const storageKey = "contact-form-idempotency-key";
  const privacyVersion = "2026-09-13";
  const choices = {
    enquiry_type: new Set([
      "project_discussion",
      "pricing_process",
      "general_enquiry",
    ]),
    team_size: new Set(["", "solo", "2_5", "6_20", "21_50", "51_200", "201_plus"]),
    budget_range: new Set([
      "",
      "under_1000",
      "1000_2499",
      "2500_4999",
      "5000_9999",
      "10000_plus",
      "not_sure",
    ]),
    start_timeframe: new Set([
      "",
      "asap",
      "within_1_month",
      "1_3_months",
      "3_6_months",
      "over_6_months",
      "flexible",
    ]),
  };

  let submitting = false;
  let idempotencyKey = loadIdempotencyKey();

  function ensureRequiredSemantics() {
    const form = document.getElementById(formId);
    if (!form) return;
    for (const name of ["name", "email", "enquiry_type", "message"]) {
      const control = form.elements[name];
      if (control instanceof HTMLElement) control.setAttribute("aria-required", "true");
      if (control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLTextAreaElement) control.required = true;
    }
  }

  function loadIdempotencyKey() {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored && /^[0-9a-f-]{36}$/i.test(stored)) return stored;
      const generated = crypto.randomUUID();
      sessionStorage.setItem(storageKey, generated);
      return generated;
    } catch {
      return crypto.randomUUID();
    }
  }

  function clearIdempotencyKey() {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Storage availability does not affect successful submission handling.
    }
  }

  function length(value) {
    return [...value].length;
  }

  function clearErrors(form) {
    form.querySelectorAll(".error").forEach((node) => node.textContent = "");
    form.querySelectorAll("[aria-invalid=true]").forEach((node) =>
      node.removeAttribute("aria-invalid")
    );
    form.querySelector("#form-status").textContent = "";
  }

  function showFieldError(form, name, message) {
    const control = form.elements[name];
    const error = form.querySelector(`#error-${name}`);
    if (control instanceof HTMLElement) control.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }

  function validate(form) {
    const data = new FormData(form);
    const values = Object.fromEntries(
      [...data.entries()].map(([key, value]) => [key, String(value).trim()]),
    );
    const errors = {};
    const bounded = (name, minimum, maximum, required, label) => {
      const value = values[name] ?? "";
      const count = length(value);
      if (required && !value) errors[name] = `${label} is required.`;
      else if (value && (count < minimum || count > maximum)) {
        errors[name] = `${label} must be between ${minimum} and ${maximum} characters.`;
      }
    };

    bounded("name", 2, 100, true, "Your name");
    bounded("email", 1, 254, true, "Your email address");
    bounded("company", 0, 150, false, "Company or organisation");
    bounded("message", 20, 5000, true, "Your message");
    bounded("current_tools", 0, 2000, false, "Current tools");

    if (
      values.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(values.email)
    ) errors.email = "Please enter a valid email address.";
    if (!choices.enquiry_type.has(values.enquiry_type ?? "")) {
      errors.enquiry_type = "Please choose what you’re getting in touch about.";
    }
    for (const name of ["team_size", "budget_range", "start_timeframe"]) {
      if (!choices[name].has(values[name] ?? "")) {
        errors[name] = "Please choose a valid option.";
      }
    }

    for (const [name, message] of Object.entries(errors)) {
      showFieldError(form, name, message);
    }
    return Object.keys(errors).length === 0;
  }

  function buildPayload(form) {
    const data = Object.fromEntries(
      [...new FormData(form).entries()].map(([key, value]) => [key, String(value).trim()]),
    );
    const query = new URLSearchParams(location.search);
    for (const name of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ]) {
      data[name] = (query.get(name) ?? "").trim().slice(0, 200);
    }
    data.privacy_notice_version = privacyVersion;
    data.source_path = location.pathname;
    data.idempotency_key = idempotencyKey;
    return data;
  }

  function track(eventName) {
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track(eventName);
    }
  }

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest(`#${formId}`);
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (submitting) return;

    clearErrors(form);
    if (!validate(form)) return;

    const button = form.querySelector(".submit");
    const status = form.querySelector("#form-status");
    submitting = true;
    button.disabled = true;
    button.textContent = "Sending...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 429) {
          status.textContent = "Too many attempts have been made. Please wait a few minutes and try again.";
        } else if (body && typeof body.fieldErrors === "object") {
          for (const [name, message] of Object.entries(body.fieldErrors)) {
            if (form.elements[name]) showFieldError(form, name, String(message));
          }
        } else {
          status.textContent = "Something went wrong, and your enquiry has not been sent. Please try again shortly.";
        }
        return;
      }

      clearIdempotencyKey();
      track("contact-form-submitted");
      location.href = "/thank-you/";
    } catch {
      status.textContent = "We couldn’t connect, so your enquiry has not been sent. Check your connection and try again.";
    } finally {
      if (location.pathname !== "/thank-you/") {
        submitting = false;
        button.disabled = false;
        button.textContent = "Send enquiry";
      }
    }
  }, true);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("mailto:")) track("direct-email-click");
    else if (href.startsWith("tel:")) track("direct-phone-click");
    else if (href.includes("upwork.com")) track("professional-profile-upwork");
    else if (href.includes("contra.com")) track("professional-profile-contra");
  });

  ensureRequiredSemantics();
  window.addEventListener("load", () => {
    ensureRequiredSemantics();
    setTimeout(ensureRequiredSemantics, 0);
    setTimeout(ensureRequiredSemantics, 500);
  });
})();
