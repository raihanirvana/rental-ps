import { FieldError } from './FieldError.jsx';

function SelectInput({ id, value, options, error, onChange, disabled }) {
  return (
    <select
      id={id}
      className="input"
      value={value}
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function SelectField({ label, ...props }) {
  return (
    <div>
      <label className="field-label" htmlFor={props.id}>
        {label}
      </label>
      <SelectInput {...props} />
      <FieldError id={`${props.id}-error`} error={props.error} />
    </div>
  );
}
