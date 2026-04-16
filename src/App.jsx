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

const PayPalCheckout = lazy(() =>
  import("./components/PayPalCheckout.jsx").then((module) => ({
    default: module.PayPalCheckout,
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
    `PayPal Order: ${payment.id}`,
    `Capture Status: ${payment.status}`,
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
    setStep(1);
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleDetailsSubmit(event) {
    event.preventDefault();

    if (!isStepTwoValid) {
      setPaymentError("Add the required project details before continuing to payment.");
      return;
    }

    setPaymentError("");
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
    { href: "#services", label: "Services" },
    { href: "#intel", label: "Intel" },
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
            <div className="eyebrow">Now accepting new builds</div>
            <SplitText
              as="h1"
              className="hero-title"
              text="We Don't Build Websites. We Engineer Digital Empires"
            />
            <p className="hero-lead">
              Your brand deserves more than a template. We architect high-performance,
              conversion-optimized web experiences that make your competition irrelevant.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#order">
                Start Your Build
              </a>
              <a className="button button-secondary" href="#services">
                See What We Do
              </a>
            </div>
            <div className="hero-chips">
              <span>Launch Project</span>
              <span>Now accepting new builds</span>
              <span>Scroll</span>
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

        <section className="section" id="services">
          <SectionReveal className="section-heading">
            <div className="eyebrow">// What We Deploy</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Full-Stack Web Solutions"
            />
            <p>
              Every pixel engineered. Every interaction optimized. Every result measured.
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
              <div className="eyebrow">Intel</div>
              <SplitText
                as="h2"
                className="section-title"
                text="Strategic Systems For Brands That Need More Than A Template"
              />
              <p>
                Positioning, speed, conversion architecture, and launch clarity are built into
                the structure from the start.
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

        <section className="section" id="packages">
          <SectionReveal className="section-heading">
            <div className="eyebrow">Launch Project</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Choose The Right Build Path Before You Initialize Checkout"
            />
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
                <p className="package-price">${item.price}</p>
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
                  Launch Project
                </button>
              </SectionReveal>
            ))}
          </div>
        </section>

        <section className="section testimonials-section">
          <SectionReveal className="section-heading">
            <div className="eyebrow">Client Intel</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Sharper visuals help, but clarity is what makes people buy."
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

        <section className="section order-section" id="order">
          <div className="order-layout">
            <SectionReveal className="order-sidebar">
              <div className="eyebrow">// Secure Your Spot</div>
              <SplitText
                as="h2"
                className="section-title"
                text="Initialize Build Sequence"
              />
              <p className="hero-lead">
                Select your package and secure your spot to begin the process.
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
                          type="url"
                          placeholder="https://"
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
                          onClick={() => setStep(1)}
                        >
                          Back
                        </button>
                        <button className="button button-primary" type="submit">
                          Confirm Details
                        </button>
                      </div>
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
                      <Suspense
                        fallback={
                          <div className="payment-warning">
                            Loading secure checkout...
                          </div>
                        }
                      >
                        <PayPalCheckout
                          selectedPackage={selectedPackage}
                          customer={form}
                          disabled={!isStepTwoValid}
                          onSuccess={(result) => {
                            setPaymentError("");
                            setPaymentSuccess(result);
                          }}
                          onError={(message) => setPaymentError(message)}
                        />
                      </Suspense>
                      <div className="checkout-actions">
                        <button
                          className="button button-secondary"
                          type="button"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </button>
                      </div>
                      </div>
                    </form>
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
                    The PayPal order was captured successfully. Use the kickoff summary below as the
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
      </main>

      <footer className="site-footer">
        <div>
          <a className="brand" href="#top">
            <span className="brand-mark" />
            <span>DROMETA</span>
            <span className="brand-accent">SITES</span>
          </a>
          <p>Premium websites, cleaner sales flows, and a front door that feels built for scale.</p>
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
