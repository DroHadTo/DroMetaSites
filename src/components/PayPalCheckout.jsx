import React from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

function buildOrderPayload(selectedPackage, customer) {
  return {
    packageId: selectedPackage.id,
    customer,
  };
}

export function PayPalCheckout({
  selectedPackage,
  customer,
  disabled,
  onSuccess,
  onError,
}) {
  const clientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim();

  if (!clientId) {
    return (
      <div className="payment-warning">
        PayPal is not configured. Add `VITE_PAYPAL_CLIENT_ID` in Vercel and redeploy.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
        components: "buttons",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "pill",
          label: "pay",
        }}
        disabled={disabled}
        forceReRender={[selectedPackage.id, selectedPackage.price, customer.email]}
        createOrder={async () => {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(buildOrderPayload(selectedPackage, customer)),
          });

          const data = await response.json();

          if (!response.ok || !data.id) {
            throw new Error(data.error || "Unable to create PayPal order.");
          }

          return data.id;
        }}
        onApprove={async (data) => {
          const response = await fetch(`/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(buildOrderPayload(selectedPackage, customer)),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Unable to capture PayPal order.");
          }

          onSuccess(result);
        }}
        onError={(error) => {
          onError(error instanceof Error ? error.message : "PayPal checkout failed.");
        }}
      />
    </PayPalScriptProvider>
  );
}
