export const CATEGORY_MAP: Record<string, { name: string; icon: string; color: string }> = {
  'alimentacao-regenerativa': {
    name: 'Alimentação regenerativa',
    icon: '🥕',
    color: '#FF6B35',
  },
  'consumo-consciente': {
    name: 'Consumo consciente',
    icon: '🛍️',
    color: '#F7931E',
  },
  'economia-circular': {
    name: 'Economia circular',
    icon: '🔄',
    color: '#00A651',
  },
  'natureza-biodiversidade': {
    name: 'Natureza e biodiversidade',
    icon: '🌳',
    color: '#39B54A',
  },
  'agroecologia-urbana': {
    name: 'Agroecologia urbana',
    icon: '🌱',
    color: '#8CC63F',
  },
  'comunidades-coletivos': {
    name: 'Comunidades e coletivos',
    icon: '🤝',
    color: '#00AEEF',
  },
  'oficinas-aprendizado': {
    name: 'Oficinas e aprendizado',
    icon: '🛠️',
    color: '#662D91',
  },
  'ongs-organizacoes': {
    name: 'ONGs e organizações',
    icon: '🏢',
    color: '#93278F',
  },
}

export function getCategoryInfo(slug: string) {
  return CATEGORY_MAP[slug] || { name: slug, icon: '📍', color: '#666666' }
}

export function getPrimaryCategory(categories: string[]) {
  if (!categories || categories.length === 0) {
    return { name: 'Sem categoria', icon: '📍', color: '#666666' }
  }
  return getCategoryInfo(categories[0])
}
