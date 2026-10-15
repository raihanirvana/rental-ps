export function FieldError({ id, error }) {
  if (!error) {
    return null;
  }
  return (
    <small id={id} className="field-error">
      {error}
    </small>
  );
}
