    import React, { useState } from "react";
    import Button from "../UI/Button";

    const API_BASE = "http://localhost:5000";

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
            if (!cardNumber || cardNumber.replace(/\s/g, "").length < 12) throw new Error("Enter a valid card number");
            if (!expMonth || Number(expMonth) < 1 || Number(expMonth) > 12) throw new Error("Enter valid exp month (1-12)");
            if (!expYear || String(expYear).length < 2) throw new Error("Enter valid exp year (e.g. 30)");
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
            card: method === "card"
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Donate</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
            Thesis demo checkout using PayMongo test mode + webhook + Gmail receipt.
            </p>

            <div className="space-y-2">
            <label className="text-sm text-gray-700 dark:text-gray-200">Amount (PHP)</label>
            <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 200"
            />
            </div>

            <div className="space-y-2">
            <label className="text-sm text-gray-700 dark:text-gray-200">Purpose</label>
            <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
                <label className="text-sm text-gray-700 dark:text-gray-200">Name (optional)</label>
                <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Anonymous"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-700 dark:text-gray-200">Email (optional)</label>
                <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="email@example.com"
                />
            </div>
            </div>

            <div className="space-y-2">
            <label className="text-sm text-gray-700 dark:text-gray-200">Payment Method</label>
            <div className="flex gap-2">
                <button
                type="button"
                className={`px-4 py-2 rounded-lg border ${
                    method === "gcash"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-300 dark:border-gray-700"
                }`}
                onClick={() => setMethod("gcash")}
                >
                GCash
                </button>

                <button
                type="button"
                className={`px-4 py-2 rounded-lg border ${
                    method === "card"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-300 dark:border-gray-700"
                }`}
                onClick={() => setMethod("card")}
                >
                Card (test)
                </button>
            </div>

            {/* ✅ Card fields only show when Card is selected */}
            {method === "card" && (
                <div className="mt-3 space-y-3">
                
                <div className="space-y-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">Card Number</label>
                    <input
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">Exp Month</label>
                    <input
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                        placeholder="12"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">Exp Year</label>
                    <input
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                        placeholder="30"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-sm text-gray-700 dark:text-gray-200">CVC</label>
                    <input
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                    />
                    </div>
                </div>
                </div>
            )}
            </div>

            {msg && (
            <div className="text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3 text-gray-800 dark:text-gray-200">
                {msg}
            </div>
            )}

            <Button variant="primary" size="medium" disabled={loading} onClick={pay} className="w-full">
            {loading ? "Processing..." : "Donate Now"}
            </Button>
        </div>
        </div>
    );
    }
