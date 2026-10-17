interface ProgressBarProps {
  value: number // 0-100
  label?: string
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value))
  const tone = v >= 75 ? 'bg-green-500' : v >= 50 ? 'bg-blue-500' : v >= 30 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">{v} / 100</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}
