import React, { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

if (!publishableKey) {
  console.error(
    "VITE_STRIPE_PUBLISHABLE_KEY is missing. The payment form cannot load. Set it in Vercel and redeploy.",
  );
}

const stripeAppearance = {
  theme: "night",
  variables: {
    colorPrimary: "#7c5cfc",
    colorBackground: "#0d0d0d",
    colorText: "#f0f0f0",
    colorDanger: "#ff4f4f",
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: "8px",
  },
};

function PayForm({ onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [elementReady, setElementReady] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    onError("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || "Please check your card details.");
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed. Please try again.");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess({ id: paymentIntent.id, status: paymentIntent.status });
      } else {
        onError("Unexpected payment state. Please contact support.");
      }
    } catch (err) {
      onError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="stripe-element-wrap" style={{ minHeight: "200px" }}>
        <PaymentElement onReady={() => setElementReady(true)} />
        {!elementReady && (
          <div className="payment-warning">Loading secure card form…</div>
        )}
      </div>
      <button
        className="button button-primary stripe-pay-button"
        type="submit"
        disabled={!stripe || !elements || !elementReady || loading}
      >
        {loading ? "Processing…" : "Complete Payment"}
      </button>
    </form>
  );
}

export function StripeCheckout({ selectedPackage, customer, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    if (!selectedPackage) return;

    if (!publishableKey) {
      const message =
        "Stripe publishable key is missing. Set VITE_STRIPE_PUBLISHABLE_KEY in Vercel and redeploy.";
      setInitError(message);
      setLoading(false);
      onError(message);
      return;
    }

    setLoading(true);
    setInitError("");

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: selectedPackage.id,
        customer,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || "Failed to initialize checkout.");
        if (!data.clientSecret) throw new Error("No client secret returned.");
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        const message = err.message || "Failed to initialize payment.";
        setInitError(message);
        onError(message);
      })
      .finally(() => setLoading(false));
  }, [selectedPackage?.id]);

  if (loading) {
    return <div className="payment-warning">Initializing secure checkout…</div>;
  }

  if (initError) {
    return (
      <div className="payment-warning">
        Failed to load payment form. {initError}
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <ElementsWithSecret
      clientSecret={clientSecret}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}

function ElementsWithSecret({ clientSecret, onSuccess, onError }) {
  const options = useMemo(
    () => ({ clientSecret, appearance: stripeAppearance }),
    [clientSecret],
  );

  return (
    <Elements
      stripe={stripePromise}
      options={options}
    >
      <PayForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
