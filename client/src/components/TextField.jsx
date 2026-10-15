function FieldMessages({ id, hint, error }) {
  return (
    <>
      {hint ? (
        <small id={`${id}-hint`} className="field-hint">
          {hint}
        </small>
      ) : null}
      {error ? (
        <small id={`${id}-error`} className="field-error">
          {error}
        </small>
      ) : null}
    </>
  );
}

// Field berlabel dengan petunjuk dan pesan error yang terhubung lewat aria-describedby.
export function TextField({ id, label, error, hint, ...inputProps }) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        className="input"
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}
