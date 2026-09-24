export function Textarea({
  id,
  label,
  value,
  onChange,
  maxLength,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
