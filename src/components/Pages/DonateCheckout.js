import React, { useState } from "react";
import Button from "../UI/Button";

const API_BASE = "http://localhost:5000";

// ✅ Background image (replace with your own if you want)
const BG_IMAGE =
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1920&auto=format&fit=crop";

export default function DonateCheckout() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Education Support");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [method, setMethod] = useState("gcash"); // gcash or card

  // ✅ NEW: Card inputs
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const createIntent = async () => {
    const res = await fetch(`${API_BASE}/api/donations/create-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        purpose,
        donor_name: donorName || null,
        donor_email: donorEmail || null,
        type: "One-time",
        currency: "PHP",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Create intent failed");
    }

    return res.json(); // {payment_intent_id, client_key}
  };

  const pay = async () => {
    setMsg("");
    setLoading(true);

    try {
      if (!amount || Number(amount) <= 0) throw new Error("Enter a valid amount");
      if (donorEmail && !donorEmail.includes("@")) throw new Error("Enter a valid email");

      // ✅ Validate card fields if method is card
      if (method === "card") {
        if (!cardNumber || cardNumber.replace(/\s/g, "").length < 12)
          throw new Error("Enter a valid card number");
        if (!expMonth || Number(expMonth) < 1 || Number(expMonth) > 12)
          throw new Error("Enter valid exp month (1-12)");
        if (!expYear || String(expYear).length < 2)
          throw new Error("Enter valid exp year (e.g. 30)");
        if (!cvc || String(cvc).length < 3) throw new Error("Enter valid CVC");
      }

      // 1) Create Payment Intent
      const { payment_intent_id } = await createIntent();

      // 2) Create Payment Method (backend calls PayMongo)
      const pmRes = await fetch(`${API_BASE}/api/donations/create-payment-method`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          billing: {
            name: donorName || "Anonymous",
            email: donorEmail || "anonymous@example.com",
          },
          // ✅ here is the card: method === "card" ? {...} : null
          card:
            method === "card"
              ? { number: cardNumber, exp_month: expMonth, exp_year: expYear, cvc }
              : null,
        }),
      });

      const pmData = await pmRes.json();
      if (!pmRes.ok) throw new Error(pmData.message || "Failed to create payment method");

      // 3) Attach Payment Method to Payment Intent
      const attachRes = await fetch(`${API_BASE}/api/donations/attach-payment-method`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_intent_id,
          payment_method_id: pmData.payment_method_id,
        }),
      });

      const attachData = await attachRes.json();
      if (!attachRes.ok) throw new Error(attachData.message || "Failed to attach payment method");

      // If GCash, redirect user
      const redirectUrl =
        attachData?.next_action?.redirect?.url ||
        attachData?.data?.attributes?.next_action?.redirect?.url;

      if (redirectUrl) {
        setMsg("Redirecting to GCash checkout...");
        window.location.href = redirectUrl;
        return;
      }

      // If card succeeds instantly
      setMsg("Payment processed. Wait for confirmation in dashboard ✅ (webhook)");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI helpers (NO logic change) ----------
  const inputBase =
    "w-full rounded-xl border bg-white/95 dark:bg-gray-950/60 px-4 py-2.5 text-gray-900 dark:text-gray-100 " +
    "border-gray-200 dark:border-gray-800 " +
    "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
    "outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition";

  const labelBase = "text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-200 uppercase";

  // ✅ More solid card for readability
  const sectionCard =
    "rounded-2xl border border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl";

  const chipBase =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition " +
    "focus:outline-none focus:ring-4 focus:ring-blue-500/20";

  const chipActive =
    "border-blue-500/70 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-400/40";

  const chipInactive =
    "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800/60";

  const showCard = method === "card";

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      {/* ✅ Strong overlay for readable text */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-black/85 backdrop-blur-md" />

      {/* Background glow (kept) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="relative p-5 sm:p-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-1 text-xs text-white/95 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              PayMongo test mode • webhook • Gmail receipt
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xl">
              Donation Checkout
            </h1>
            <p className="mt-1 text-sm text-white/90 drop-shadow-md">
              Secure demo checkout flow. Choose GCash or Card (test) then proceed.
            </p>
          </div>

          {/* Main Card */}
          <div className={`${sectionCard} p-4 sm:p-6`}>
            {/* Amount + Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelBase}>Amount (PHP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                    ₱
                  </span>
                  <input
                    className={`${inputBase} pl-9`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 200"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelBase}>Purpose</label>
                <select
                  className={inputBase}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option>Education Support</option>
                  <option>Healthcare</option>
                  <option>Food & Nutrition</option>
                  <option>Infrastructure</option>
                  <option>General Support</option>
                </select>
              </div>
            </div>

            {/* Donor details */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelBase}>Name (optional)</label>
                <input
                  className={inputBase}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Anonymous"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className={labelBase}>Email (optional)</label>
                <input
                  className={inputBase}
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="mt-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className={labelBase}>Payment Method</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                    Select your preferred method
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`${chipBase} ${method === "gcash" ? chipActive : chipInactive}`}
                    onClick={() => setMethod("gcash")}
                    aria-pressed={method === "gcash"}
                  >
                    <span className="text-base">📱</span> GCash
                  </button>

                  <button
                    type="button"
                    className={`${chipBase} ${method === "card" ? chipActive : chipInactive}`}
                    onClick={() => setMethod("card")}
                    aria-pressed={method === "card"}
                  >
                    <span className="text-base">💳</span> Card (test)
                  </button>
                </div>
              </div>

              {/* Card fields */}
              <div
                className={`mt-4 overflow-hidden transition-all duration-300 ${
                  showCard ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-950/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Card Details
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-200">
                        Test card numbers only (demo)
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Required
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <label className={labelBase}>Card Number</label>
                      <input
                        className={inputBase}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className={labelBase}>Exp Month</label>
                        <input
                          className={inputBase}
                          value={expMonth}
                          onChange={(e) => setExpMonth(e.target.value)}
                          placeholder="12"
                          inputMode="numeric"
                          autoComplete="cc-exp-month"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={labelBase}>Exp Year</label>
                        <input
                          className={inputBase}
                          value={expYear}
                          onChange={(e) => setExpYear(e.target.value)}
                          placeholder="30"
                          inputMode="numeric"
                          autoComplete="cc-exp-year"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={labelBase}>CVC</label>
                        <input
                          className={inputBase}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 dark:text-gray-200">
                      Tip: Use your PayMongo test card values.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            {msg && (
              <div className="mt-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-200 flex items-center justify-center">
                    ℹ️
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {msg}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-6">
              <Button
                variant="primary"
                size="medium"
                disabled={loading}
                onClick={pay}
                className="w-full !rounded-2xl !py-3.5"
              >
                {loading ? "Processing..." : method === "gcash" ? "Donate with GCash" : "Donate with Card"}
              </Button>

              <div className="mt-3 text-center text-xs text-gray-700 dark:text-gray-200">
                By continuing, you agree this is a demo checkout for thesis/testing.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center text-xs text-white/80 drop-shadow-md">
            Need help? Check your webhook logs + dashboard status after payment.
          </div>
        </div>
      </div>
    </div>
  );
}
