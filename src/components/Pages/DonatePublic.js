    import React, { useMemo, useState } from "react";

    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

    export default function DonatePublic() {
    const [amount, setAmount] = useState(100);
    const [purpose, setPurpose] = useState("General Support");
    const [donorName, setDonorName] = useState("");
    const [donorEmail, setDonorEmail] = useState("");
    const [method, setMethod] = useState("gcash"); // "gcash" | "card"

    // card fields (test card: 4242 4242 4242 4242)
    const [cardNumber, setCardNumber] = useState("");
    const [expMonth, setExpMonth] = useState("");
    const [expYear, setExpYear] = useState("");
    const [cvc, setCvc] = useState("");


    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const amountValid = useMemo(() => Number(amount) > 0, [amount]);

    const pay = async () => {
        try {
        setMsg("");
        if (!amountValid) return setMsg("Amount must be greater than 0.");
        if (!donorEmail) return setMsg("Donor email is required (for receipt).");

        setLoading(true);

        // 1) Create intent (DB status Pending)
        const intentRes = await fetch(`${API_BASE}/api/donations/create-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            amount: Number(amount),
            currency: "PHP",
            purpose,
            donor_name: donorName || null,
            donor_email: donorEmail || null,
            type: "One-time",
            }),
        });

        if (!intentRes.ok) {
            const err = await intentRes.json().catch(() => ({}));
            throw new Error(err.message || "Failed to create payment intent");
        }

        const intent = await intentRes.json();
        const payment_intent_id = intent.payment_intent_id;

        // 2) Create payment method
        const pmPayload =
            method === "card"
            ? {
                method: "card",
                billing: {
                    name: donorName || "Anonymous Donor",
                    email: donorEmail,
                },
                card: {
                    number: cardNumber.replace(/\s/g, ""),
                    exp_month: Number(expMonth),
                    exp_year: Number(expYear),
                    cvc,
                },
                }
            : {
                method: "gcash",
                billing: {
                    name: donorName || "Anonymous Donor",
                    email: donorEmail,
                },
                };

        const pmRes = await fetch(`${API_BASE}/api/donations/create-payment-method`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pmPayload),
        });

        if (!pmRes.ok) {
            const err = await pmRes.json().catch(() => ({}));
            throw new Error(err.message || "Failed to create payment method");
        }

        const pm = await pmRes.json();
        const payment_method_id = pm.payment_method_id;

        // 3) Attach payment method to intent
        const attachRes = await fetch(`${API_BASE}/api/donations/attach-payment-method`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            payment_intent_id,
            payment_method_id,
            }),
        });

        if (!attachRes.ok) {
            const err = await attachRes.json().catch(() => ({}));
            throw new Error(err.message || "Failed to attach payment method");
        }

        const attach = await attachRes.json();

        // If GCash, PayMongo returns a redirect URL (next_action.redirect.url)
        const redirectUrl =
            attach?.data?.attributes?.next_action?.redirect?.url ||
            attach?.data?.data?.attributes?.next_action?.redirect?.url;

        if (redirectUrl) {
            window.location.href = redirectUrl; // donor completes GCash payment
            return;
        }

        // If card succeeds immediately (often), webhook will still confirm status
        setMsg("Payment submitted. Please wait… Your donation will appear after webhook confirms payment.");
        } catch (e) {
        setMsg(e.message || "Payment error");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
            <h1 className="text-2xl font-bold mb-1">Donate</h1>
            <p className="text-sm text-gray-600 mb-6">
            Public Donor Page (Card / GCash) – connected to PayMongo + webhook
            </p>

            <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Amount (PHP)</label>
                <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <div>
                <label className="text-sm font-medium">Purpose</label>
                <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                />
            </div>

            <div>
                <label className="text-sm font-medium">Name</label>
                <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="Optional"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                />
            </div>

            <div>
                <label className="text-sm font-medium">Email (required)</label>
                <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="you@email.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="text-sm font-medium">Payment Method</label>
                <div className="flex gap-2 mt-2">
                <button
                    onClick={() => setMethod("gcash")}
                    className={`px-3 py-2 rounded-lg border w-full ${
                    method === "gcash" ? "bg-blue-600 text-white" : "bg-white"
                    }`}
                >
                    GCash
                </button>
                <button
                    onClick={() => setMethod("card")}
                    className={`px-3 py-2 rounded-lg border w-full ${
                    method === "card" ? "bg-blue-600 text-white" : "bg-white"
                    }`}
                >
                    Card
                </button>
                </div>
            </div>

            {method === "card" && (
                <div className="space-y-3">
                    <div>
                    <label className="text-sm">Card Number</label>
                    <input
                        className="w-full rounded-lg border px-4 py-2"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                    />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="text-sm">MM</label>
                        <input
                        className="w-full rounded-lg border px-4 py-2"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                        placeholder="12"
                        />
                    </div>
                    <div>
                        <label className="text-sm">YY</label>
                        <input
                        className="w-full rounded-lg border px-4 py-2"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                        placeholder="30"
                        />
                    </div>
                    <div>
                        <label className="text-sm">CVC</label>
                        <input
                        className="w-full rounded-lg border px-4 py-2"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                        />
                    </div>
                    </div>

                    <p className="text-xs text-gray-500">
                    Test card: 4009930000001421 • 12/30 • 123
                    </p>
                </div>
                )}


            {msg && <div className="text-sm p-3 rounded-lg bg-yellow-50 border border-yellow-200">{msg}</div>}

            <button
                disabled={loading}
                onClick={pay}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-3 disabled:opacity-60"
            >
                {loading ? "Processing..." : "Donate Now"}
            </button>
            </div>
        </div>
        </div>
    );
    }
