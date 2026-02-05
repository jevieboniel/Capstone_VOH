    export default function DonateSuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Thank you!</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Payment submitted. Please check the Donation Management dashboard for confirmation (webhook update).
            </p>
        </div>
        </div>
    );
    }
