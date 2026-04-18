import React, { lazy, Suspense, useState } from "react";
import { SectionReveal } from "./components/SectionReveal.jsx";
import { SplitText } from "./components/SplitText.jsx";
import {
  packageCatalog,
  proof,
  services,
  stats,
  testimonials,
  tickerItems,
} from "./data/site.js";

const StripeCheckout = lazy(() =>
  import("./components/StripeCheckout.jsx").then((module) => ({
    default: module.StripeCheckout,
  })),
);

const initialForm = {
  name: "",
  email: "",
  brand: "",
  website: "",
  timeline: "",
  goals: "",
  pages: "",
  notes: "",
};

function buildKickoffSummary(selectedPackage, form, payment) {
  return [
    "DroMetaSites Kickoff Summary",
    "",
    `Package: ${selectedPackage.name}`,
    `Price Paid: $${selectedPackage.price}`,
    `Timeline: ${form.timeline}`,
    `Client: ${form.name}`,
    `Email: ${form.email}`,
    `Brand: ${form.brand}`,
    `Current Website: ${form.website || "Not provided"}`,
    "",
    "Primary Goals:",
    form.goals,
    "",
    "Pages / Screens Needed:",
    form.pages,
    "",
    "Extra Notes:",
    form.notes || "None provided",
    "",
    `Payment ID: ${payment.id}`,
    `Payment Status: ${payment.status}`,
  ].join("\n");
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);

  const selectedPackage =
    packageCatalog.find((item) => item.id === selectedPackageId) || null;

  const isStepOneValid = Boolean(selectedPackageId && form.timeline.trim());

  const isStepTwoValid =
    Boolean(selectedPackageId) &&
    form.name.trim() &&
    form.email.trim() &&
    form.brand.trim() &&
    form.goals.trim() &&
    form.pages.trim();

  const kickoffSummary = paymentSuccess && selectedPackage
    ? buildKickoffSummary(selectedPackage, form, paymentSuccess)
    : "";

  function selectPackage(packageId) {
    setSelectedPackageId(packageId);
    setPaymentError("");
    setPaymentSuccess(null);
    setDetailsConfirmed(false);
    setStep(1);
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleDetailsSubmit(event) {
    event.preventDefault();

    if (!isStepTwoValid) {
      setPaymentError("Add the required project details before continuing to payment.");
      return;
    }

    setPaymentError("");
    setDetailsConfirmed(true);

    fetch("/api/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:        form.name,
        email:       form.email,
        brand:       form.brand,
        website:     form.website,
        timeline:    form.timeline,
        goals:       form.goals,
        pages:       form.pages,
        notes:       form.notes,
        packageId:   selectedPackage?.id   ?? "",
        packageName: selectedPackage?.name ?? "",
      }),
    }).catch(() => {});
  }

  async function handleCopySummary() {
    if (!kickoffSummary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(kickoffSummary);
      setCopyStatus("Kickoff summary copied.");
    } catch {
      setCopyStatus("Clipboard copy failed. Copy the summary manually.");
    }
  }

  const navItems = [
    { href: "#packages", label: "Packages" },
    { href: "#services", label: "Services" },
    { href: "#order", label: "Get Started" },
  ];

  return (
    <div className="site-shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow bg-glow-a" aria-hidden="true" />
      <div className="bg-glow bg-glow-b" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top">
          <span className="brand-mark" />
          <span>DROMETA</span>
          <span className="brand-accent">SITES</span>
        </a>

        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((current) => !current)}
        >
          Menu
        </button>

        <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} id="site-nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a className="button button-primary button-nav" href="#order">
            Launch Project
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section">
          <SectionReveal className="hero-copy">
            <div className="eyebrow">Limited build slots available</div>
            <SplitText
              as="h1"
              className="hero-title"
              text="Premium Websites Built To Grow Your Business"
            />
            <p className="hero-lead">
              Your brand deserves more than a template. We design and build high-performance,
              conversion-optimised websites that make your competition irrelevant.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#order">
                Claim Your Build Slot
              </a>
              <a className="button button-secondary" href="#services">
                See What We Build
              </a>
            </div>
            <div className="hero-chips">
              <span>Custom-built websites</span>
              <span>Limited slots open</span>
              <span>Results guaranteed</span>
            </div>
          </SectionReveal>

        </section>

        <section className="stats-grid section section-tight">
          {stats.map((item, index) => (
            <SectionReveal className="stat-card" delay={index * 0.05} key={item.label}>
              <span className="stat-value">{item.value}</span>
              <span className="stat-label">{item.label}</span>
            </SectionReveal>
          ))}
        </section>

        <section className="ticker" aria-label="Key advantages">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section" id="packages">
          <SectionReveal className="section-heading">
            <div className="eyebrow">Pricing & Packages</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Transparent Pricing. No Surprises. Just Results."
            />
            <p>Choose the build path that matches your goals and timeline. Every package is scoped, priced, and delivered to spec.</p>
          </SectionReveal>

          <div className="package-grid">
            {packageCatalog.map((item, index) => (
              <SectionReveal
                className={`glass-card package-card ${item.featured ? "is-featured" : ""}`}
                delay={index * 0.06}
                key={item.id}
              >
                <div className="package-topline">{item.label}</div>
                <h3>{item.name}</h3>
                <p className="package-price">${item.price.toFixed(2)}</p>
                <p className="package-blurb">{item.blurb}</p>
                <div className="package-meta">Turnaround: {item.turnaround}</div>
                <ul className="feature-list">
                  {item.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => selectPackage(item.id)}
                >
                  Get Started
                </button>
              </SectionReveal>
            ))}
          </div>
        </section>

        <section className="section order-section" id="order">
          <div className="order-layout">
            <SectionReveal className="order-sidebar">
              <div className="eyebrow">Ready To Get Started?</div>
              <SplitText
                as="h2"
                className="section-title"
                text="Secure Your Build Slot Today"
              />
              <p className="hero-lead">
                Build slots are limited. Select your package, add your project details, and we'll be in touch within 48 hours to kick things off.
              </p>
              <div className="step-list">
                {[1, 2].map((currentStep) => (
                  <div
                    className={`step-item ${step === currentStep ? "is-active" : ""} ${
                      step > currentStep ? "is-complete" : ""
                    }`}
                    key={currentStep}
                  >
                    <span>{currentStep}</span>
                    <div>
                      <strong>
                        {currentStep === 1 && "Package Selection"}
                        {currentStep === 2 && "Project Payment"}
                      </strong>
                      <p>
                        {currentStep === 1 && "Select your package and expected timeline."}
                        {currentStep === 2 && "Add project details and complete checkout."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card order-summary">
                <div className="panel-label">Selected Package</div>
                <strong>{selectedPackage ? selectedPackage.name : "Select your package..."}</strong>
                <span>${selectedPackage ? selectedPackage.price.toFixed(2) : "0.00"}</span>
                <p>
                  {selectedPackage
                    ? selectedPackage.blurb
                    : "Expected timeline and package choice are locked in before payment."}
                </p>
              </div>
            </SectionReveal>

            <SectionReveal className="order-panel" delay={0.08}>
              {!paymentSuccess ? (
                <div className="glass-card checkout-card">
                  <div className="checkout-topline">
                    <span>Project Payment</span>
                    <span>Step {step} of 2</span>
                  </div>

                  {step === 1 ? (
                    <div className="selection-stack">
                      <div className="payment-overview">
                        <div>
                          <span className="panel-label">Project Payment</span>
                          <strong>Step 1 of 2</strong>
                        </div>
                        <div className="payment-price">
                          ${selectedPackage ? selectedPackage.price.toFixed(2) : "0.00"}
                        </div>
                      </div>
                      <label>
                        <span>Package Selection</span>
                        <select
                          name="packageSelection"
                          value={selectedPackageId}
                          onChange={(event) => setSelectedPackageId(event.target.value)}
                        >
                          <option value="">Select your package...</option>
                          {packageCatalog.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} - ${item.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Expected Timeline</span>
                        <select name="timeline" value={form.timeline} onChange={handleInputChange}>
                          <option value="">When do you need this launched?</option>
                          <option>ASAP</option>
                          <option>1 to 2 weeks</option>
                          <option>2 to 4 weeks</option>
                          <option>1 to 2 months</option>
                        </select>
                      </label>
                      <button
                        className="button button-primary"
                        type="button"
                        onClick={() => {
                          if (!isStepOneValid) {
                            setPaymentError("Select your package and expected timeline first.");
                            return;
                          }
                          setPaymentError("");
                          setStep(2);
                        }}
                      >
                        NEXT STEP →
                      </button>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <>
                    <form className="detail-form" onSubmit={handleDetailsSubmit}>
                      <label>
                        <span>Full name</span>
                        <input
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label>
                        <span>Email</span>
                        <input
                          name="email"
                          type="email"
                          placeholder="john@brand.com"
                          value={form.email}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label>
                        <span>Brand / company</span>
                        <input
                          name="brand"
                          type="text"
                          placeholder="Your brand name"
                          value={form.brand}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label>
                        <span>Current website</span>
                        <input
                          name="website"
                          type="text"
                          placeholder="https://yoursite.com"
                          value={form.website}
                          onChange={handleInputChange}
                        />
                      </label>
                      <label>
                        <span>Timeline</span>
                        <select name="timeline" value={form.timeline} onChange={handleInputChange}>
                          <option value="">When do you need this launched?</option>
                          <option>ASAP</option>
                          <option>1 to 2 weeks</option>
                          <option>2 to 4 weeks</option>
                          <option>1 to 2 months</option>
                        </select>
                      </label>
                      <label className="field-wide">
                        <span>Main goals</span>
                        <textarea
                          name="goals"
                          rows="4"
                          placeholder="What should the site accomplish?"
                          value={form.goals}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label className="field-wide">
                        <span>Pages or screens needed</span>
                        <textarea
                          name="pages"
                          rows="4"
                          placeholder="List the pages, funnels, or product screens you need."
                          value={form.pages}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label className="field-wide">
                        <span>Extra notes</span>
                        <textarea
                          name="notes"
                          rows="3"
                          placeholder="Brand direction, references, integrations, or anything else."
                          value={form.notes}
                          onChange={handleInputChange}
                        />
                      </label>

                      <div className="checkout-actions">
                        <button
                          className="button button-secondary"
                          type="button"
                          onClick={() => { setStep(1); setDetailsConfirmed(false); }}
                        >
                          Back
                        </button>
                        <button className="button button-primary" type="submit">
                          Confirm Details
                        </button>
                      </div>
                    </form>

                    {detailsConfirmed && (
                    <div className="payment-stage field-wide">
                      <div className="payment-overview">
                        <div>
                          <span className="panel-label">Package</span>
                          <strong>{selectedPackage ? selectedPackage.name : "No package selected"}</strong>
                        </div>
                        <div className="payment-price">
                          ${selectedPackage ? selectedPackage.price.toFixed(2) : "0.00"}
                        </div>
                      </div>
                      <p className="payment-note">
                        Complete the payment below to reserve the slot. The project summary is
                        generated immediately after successful capture.
                      </p>
                      {isStepTwoValid ? (
                        <Suspense
                          fallback={
                            <div className="payment-warning">
                              Loading secure checkout…
                            </div>
                          }
                        >
                          <StripeCheckout
                            selectedPackage={selectedPackage}
                            customer={form}
                            onSuccess={(result) => {
                              setPaymentError("");
                              setPaymentSuccess(result);
                            }}
                            onError={(message) => setPaymentError(message)}
                          />
                        </Suspense>
                      ) : (
                        <div className="payment-warning">
                          Complete all required fields above to unlock payment.
                        </div>
                      )}
                      <div className="checkout-actions">
                        <button
                          className="button button-secondary"
                          type="button"
                          onClick={() => { setStep(1); setDetailsConfirmed(false); }}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                    )}
                    </>
                  ) : null}

                  {paymentError ? <p className="form-error">{paymentError}</p> : null}
                </div>
              ) : (
                <div className="glass-card success-card">
                  <div className="success-pill">Payment Captured</div>
                  <SplitText
                    as="h3"
                    className="success-title"
                    text="Your project slot is reserved."
                  />
                  <p className="success-copy">
                    Payment was captured successfully. Use the kickoff summary below as the
                    project handoff document.
                  </p>
                  <pre className="summary-output">{kickoffSummary}</pre>
                  <div className="checkout-actions">
                    <button className="button button-primary" type="button" onClick={handleCopySummary}>
                      Copy Kickoff Summary
                    </button>
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => {
                        setPaymentSuccess(null);
                        setCopyStatus("");
                        setPaymentError("");
                        setStep(1);
                        setForm(initialForm);
                      }}
                    >
                      Start Another Order
                    </button>
                  </div>
                  {copyStatus ? <p className="copy-status">{copyStatus}</p> : null}
                </div>
              )}
            </SectionReveal>
          </div>
        </section>

        <section className="section" id="services">
          <SectionReveal className="section-heading">
            <div className="eyebrow">What We Build</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Everything Your Online Presence Needs To Compete"
            />
            <p>
              From design and development to brand identity and ongoing support — we handle the full picture so you don't have to piece it together yourself.
            </p>
          </SectionReveal>

          <div className="service-grid">
            {services.map((service, index) => (
              <SectionReveal className="glass-card service-card" delay={index * 0.06} key={service.title}>
                <div className="service-index">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </SectionReveal>
            ))}
          </div>
        </section>

        <section className="section" id="intel">
          <div className="proof-layout">
            <SectionReveal className="section-heading">
              <div className="eyebrow">Why Clients Choose Us</div>
              <SplitText
                as="h2"
                className="section-title"
                text="We Build Sites That Work As Hard As You Do"
              />
              <p>
                Positioning, speed, and conversion architecture are built into the structure from day one — not added as an afterthought.
              </p>
            </SectionReveal>

            <div className="proof-grid">
              {proof.map((item, index) => (
                <SectionReveal className="glass-card proof-card" delay={index * 0.06} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section testimonials-section">
          <SectionReveal className="section-heading">
            <div className="eyebrow">Client Results</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Real Businesses. Real Results. Real Words."
            />
          </SectionReveal>

          <div className="testimonial-grid">
            {testimonials.map((item, index) => (
              <SectionReveal className="glass-card testimonial-card" delay={index * 0.05} key={item.name}>
                <p>"{item.quote}"</p>
                <div className="testimonial-meta">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </SectionReveal>
            ))}
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div>
          <a className="brand" href="#top">
            <span className="brand-mark" />
            <span>DROMETA</span>
            <span className="brand-accent">SITES</span>
          </a>
          <p>Premium websites built for businesses that are serious about growth. No templates. No shortcuts. Just results.</p>
        </div>
        <div className="footer-meta">
          <span>Johannesburg / Remote</span>
          <span>{new Date().getFullYear()} All systems live</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
