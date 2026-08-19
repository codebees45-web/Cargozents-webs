const EmptyState = ({ title, body, actionLabel, onAction }) => {
  return (
    <div className="rounded-2xl border border-dashed border-primary/15 px-8 py-14 text-center">
      <h3 className="font-display text-base font-semibold text-primary">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[#5B7A70]">{body}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-primary transition hover:shadow-glow"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
