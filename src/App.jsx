import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { SectionReveal } from "./components/SectionReveal.jsx";
import { SplitText } from "./components/SplitText.jsx";
import {
  packageCatalog,
  processSteps,
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
  timeline: "1 to 2 weeks",
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
  const [selectedPackageId, setSelectedPackageId] = useState(packageCatalog[1].id);
  const [form, setForm] = useState(initialForm);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  const selectedPackage =
    packageCatalog.find((item) => item.id === selectedPackageId) || packageCatalog[1];

  const isStepTwoValid =
    form.name.trim() &&
    form.email.trim() &&
    form.brand.trim() &&
    form.goals.trim() &&
    form.pages.trim();

  const kickoffSummary = paymentSuccess
    ? buildKickoffSummary(selectedPackage, form, paymentSuccess)
    : "";

  function selectPackage(packageId) {
    setSelectedPackageId(packageId);
    setPaymentError("");
    setPaymentSuccess(null);
    setStep(2);
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
    setStep(3);
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
    { href: "#packages", label: "Packages" },
    { href: "#proof", label: "Why It Converts" },
    { href: "#order", label: "Order" },
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
            Start Order
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero section">
          <SectionReveal className="hero-copy">
            <div className="eyebrow">Future-built websites</div>
            <SplitText
              as="h1"
              className="hero-title"
              text="We build websites that look elite and close faster."
            />
            <p className="hero-lead">
              Built for DroMetaSites with a sharper order flow, stronger motion,
              and a working PayPal checkout.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#order">
                Lock In A Build
              </a>
              <a className="button button-secondary" href="#packages">
                View Packages
              </a>
            </div>
            <div className="hero-chips">
              <span>Custom React build</span>
              <span>Motion-driven UI</span>
              <span>PayPal checkout live</span>
            </div>
          </SectionReveal>

          <SectionReveal className="hero-visual" delay={0.12}>
            <div className="visual-frame">
              <div className="visual-topline">
                <span>Launch Console</span>
                <span>Realtime Signal</span>
              </div>
              <div className="visual-main">
                <div className="visual-kicker">Signal strength</div>
                <div className="visual-score">98</div>
                <div className="visual-graph">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="visual-cards">
                <div className="mini-card">
                  <strong>0.8s</strong>
                  <span>Targeted first load</span>
                </div>
                <div className="mini-card">
                  <strong>3-Step</strong>
                  <span>Ordering workflow</span>
                </div>
              </div>
              <motion.div
                className="floating-panel"
                animate={{ y: [0, -10, 0], rotate: [0, 1.5, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span>Checkout Ready</span>
                <strong>PayPal Connected</strong>
              </motion.div>
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
            <div className="eyebrow">Services</div>
            <SplitText
              as="h2"
              className="section-title"
              text="A premium frontend is useless if it does not move the buyer."
            />
            <p>
              The design direction is aggressive on purpose, but the conversion path stays
              disciplined. Better visuals, stronger messaging, and a clear route into checkout.
            </p>
          </SectionReveal>

          <div className="service-grid">
            {services.map((service, index) => (
              <SectionReveal className="glass-card service-card" delay={index * 0.06} key={service.title}>
                <div className="service-index">0{index + 1}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </SectionReveal>
            ))}
          </div>
        </section>

        <section className="section" id="proof">
          <div className="proof-layout">
            <SectionReveal className="section-heading">
              <div className="eyebrow">Why It Converts</div>
              <SplitText
                as="h2"
                className="section-title"
                text="The page feels cinematic, but the UX stays clean under pressure."
              />
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
            <div className="eyebrow">Packages</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Choose the build path, then move straight into checkout."
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
                  Select Package
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

        <section className="section">
          <SectionReveal className="section-heading">
            <div className="eyebrow">Process</div>
            <SplitText
              as="h2"
              className="section-title"
              text="Three steps from interest to a paid project slot."
            />
          </SectionReveal>

          <div className="process-grid">
            {processSteps.map((item, index) => (
              <SectionReveal className="glass-card process-card" delay={index * 0.06} key={item.number}>
                <span className="process-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </SectionReveal>
            ))}
          </div>
        </section>

        <section className="section order-section" id="order">
          <div className="order-layout">
            <SectionReveal className="order-sidebar">
              <div className="eyebrow">Order Flow</div>
              <SplitText
                as="h2"
                className="section-title"
                text="Reserve the project slot and collect the build brief in one flow."
              />
              <div className="step-list">
                {[1, 2, 3].map((currentStep) => (
                  <div
                    className={`step-item ${step === currentStep ? "is-active" : ""} ${
                      step > currentStep ? "is-complete" : ""
                    }`}
                    key={currentStep}
                  >
                    <span>{currentStep}</span>
                    <div>
                      <strong>
                        {currentStep === 1 && "Package"}
                        {currentStep === 2 && "Project Details"}
                        {currentStep === 3 && "Payment"}
                      </strong>
                      <p>
                        {currentStep === 1 && "Choose the build level."}
                        {currentStep === 2 && "Add client and project info."}
                        {currentStep === 3 && "Complete PayPal checkout."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card order-summary">
                <div className="panel-label">Selected Package</div>
                <strong>{selectedPackage.name}</strong>
                <span>${selectedPackage.price}</span>
                <p>{selectedPackage.blurb}</p>
              </div>
            </SectionReveal>

            <SectionReveal className="order-panel" delay={0.08}>
              {!paymentSuccess ? (
                <div className="glass-card checkout-card">
                  <div className="checkout-topline">
                    <span>Step {step} of 3</span>
                    <span>Secure ordering</span>
                  </div>

                  {step === 1 ? (
                    <div className="selection-stack">
                      {packageCatalog.map((item) => (
                        <button
                          className={`selection-card ${selectedPackage.id === item.id ? "is-selected" : ""}`}
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedPackageId(item.id)}
                        >
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.turnaround}</span>
                          </div>
                          <div className="selection-price">${item.price}</div>
                        </button>
                      ))}
                      <button
                        className="button button-primary"
                        type="button"
                        onClick={() => setStep(2)}
                      >
                        Continue To Details
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
                          Continue To Payment
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {step === 3 ? (
                    <div className="payment-stage">
                      <div className="payment-overview">
                        <div>
                          <span className="panel-label">Package</span>
                          <strong>{selectedPackage.name}</strong>
                        </div>
                        <div className="payment-price">${selectedPackage.price}</div>
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
                          onClick={() => setStep(2)}
                        >
                          Back
                        </button>
                      </div>
                    </div>
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
