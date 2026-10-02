const EmptyState = () => (
  <section className="hidden flex-1 items-center justify-center bg-chat-bg md:flex" aria-label="Чат не выбран">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-brand-500 shadow-sm">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path
            d="M21 12c0 4.4-4 8-9 8-1.5 0-3-.3-4.2-.9L3 20l1.1-3.6C3.4 15.1 3 13.6 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-800">Выберите чат</h2>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Откройте существующий чат или создайте новый по номеру телефона
      </p>
    </div>
  </section>
)

export default EmptyState
