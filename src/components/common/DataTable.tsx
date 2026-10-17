import type { ReactNode } from 'react'

interface DataTableProps {
  headers: string[]
  rows: ReactNode[][]
  empty?: string
}

export default function DataTable({ headers, rows, empty = '暂无数据' }: DataTableProps) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">{empty}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
