import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    onError("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed. Please try again.");
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess({ id: paymentIntent.id, status: paymentIntent.status });
    } else {
      onError("Unexpected payment state. Please contact support.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <PaymentElement />
      <button
        className="button button-primary stripe-pay-button"
        type="submit"
        disabled={!stripe || !elements || loading}
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
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: stripeAppearance }}
    >
      <PayForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
