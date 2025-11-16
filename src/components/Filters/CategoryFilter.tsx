'use client'

import { CATEGORY_MAP } from '@/lib/constants/categories'

interface CategoryFilterProps {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

export default function CategoryFilter({ selectedCategories, onChange }: CategoryFilterProps) {
  const handleToggle = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      onChange(selectedCategories.filter((c) => c !== slug))
    } else {
      onChange([...selectedCategories, slug])
    }
  }

  const handleSelectAll = () => {
    onChange(Object.keys(CATEGORY_MAP))
  }

  const handleClearAll = () => {
    onChange([])
  }

  return (
    <div className="absolute left-4 top-16 z-[1000] max-h-[calc(100vh-120px)] w-64 overflow-y-auto rounded-lg bg-white p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Categorias</h3>
        <div className="flex gap-1">
          <button onClick={handleSelectAll} className="text-xs text-green-600 hover:text-green-800">
            Todas
          </button>
          <span className="text-gray-400">|</span>
          <button onClick={handleClearAll} className="text-xs text-gray-600 hover:text-gray-800">
            Limpar
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {Object.entries(CATEGORY_MAP).map(([slug, category]) => (
          <label
            key={slug}
            className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(slug)}
              onChange={() => handleToggle(slug)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-base">{category.icon}</span>
            <span className="text-sm text-gray-700">{category.name}</span>
          </label>
        ))}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <span className="text-xs text-gray-500">{selectedCategories.length} selecionadas</span>
        </div>
      )}
    </div>
  )
}
