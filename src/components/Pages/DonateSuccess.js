export default function DonateSuccess() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="rounded-3xl border border-gray-200/70 dark:border-gray-800/70 bg-white/90 dark:bg-gray-900/85 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Donation Submitted
          </div>

          {/* Icon */}
          <div className="mt-5 flex items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Thank you!
          </h1>

          {/* Message */}
          <p className="mt-2 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Payment submitted. Please check the Donation Management dashboard for confirmation
            <span className="font-semibold"> (webhook update)</span>.
          </p>

          {/* Divider */}
          <div className="mt-6 h-px w-full bg-gray-200/70 dark:bg-gray-800/70" />

          {/* Helpful note */}
          <div className="mt-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/30 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-9 w-9 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-200 flex items-center justify-center">
                ℹ️
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200">
                If you don’t see it yet, wait a few seconds and refresh the dashboard. Webhooks may take a short moment
                to arrive.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            You can close this tab safely.
          </div>
        </div>
      </div>
    </div>
  );
}
