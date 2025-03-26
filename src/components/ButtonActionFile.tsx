export default function ButtonActionFile({
  loading,
  onAction,
  loadingLabel,
  label,
}: {
  loading: boolean;
  onAction: () => void;
  loadingLabel: string;
  label: string;
}) {
  return (
    <div className="mx-auto max-w-max">
      <button
        title={label}
        disabled={loading}
        onClick={() => onAction()}
        className="btn btn-primary btn-lg mt-12"
      >
        {loading && (
          <>
            <span className="loading loading-spinner"></span>
            {loadingLabel}
          </>
        )}
        {!loading && label}
      </button>
    </div>
  );
}
