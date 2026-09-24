import { toIsoDate } from '../lib/date'

export function DatePicker({
  id,
  label,
  value,
  onChange,
  max,
}: {
  id: string
  label: string
  value: Date
  onChange: (date: Date) => void
  max?: Date
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="date"
        value={toIsoDate(value)}
        max={max ? toIsoDate(max) : undefined}
        onChange={(event) => {
          if (!event.target.value) return
          const [year, month, day] = event.target.value.split('-').map(Number)
          onChange(new Date(year, month - 1, day))
        }}
      />
    </div>
  )
}
