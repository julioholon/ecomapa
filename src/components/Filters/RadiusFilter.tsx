'use client'

interface RadiusFilterProps {
  selectedRadius: number | null
  onChange: (radius: number | null) => void
  hasLocation: boolean
}

const RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
]

export default function RadiusFilter({ selectedRadius, onChange, hasLocation }: RadiusFilterProps) {
  if (!hasLocation) {
    return null
  }

  return (
    <div className="absolute left-4 top-[400px] z-[1000] w-64 rounded-lg bg-white p-3 shadow-lg">
      <h3 className="mb-3 font-semibold text-gray-800">Distância máxima</h3>

      <div className="space-y-1">
        <label className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-gray-50">
          <input
            type="radio"
            name="radius"
            checked={selectedRadius === null}
            onChange={() => onChange(null)}
            className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Sem limite</span>
        </label>

        {RADIUS_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-gray-50"
          >
            <input
              type="radio"
              name="radius"
              checked={selectedRadius === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
