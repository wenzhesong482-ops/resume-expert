import type { TextareaHTMLAttributes, ChangeEvent } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  /** 示例文本：输入为空时按回车可自动填入 */
  example?: string
}

export default function TextArea({
  label,
  hint,
  example,
  className = '',
  value,
  onChange,
  ...rest
}: TextAreaProps) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <textarea
        {...rest}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && example && String(value ?? '').trim() === '') {
            e.preventDefault()
            onChange?.({ target: { value: example } } as ChangeEvent<HTMLTextAreaElement>)
          }
        }}
        className={`w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 ${className}`}
      />
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  )
}
