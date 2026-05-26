export interface Category {
  id: string
  label: string
  icon: string // Lucide icon name
}

export const CATEGORIES: Category[] = [
  { id: 'food_drinks', label: 'Food & drinks', icon: 'UtensilsCrossed' },
  { id: 'apparel', label: 'Apparel', icon: 'Shirt' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'RefreshCcw' },
  { id: 'tech', label: 'Tech & gadgets', icon: 'Smartphone' },
  { id: 'beauty', label: 'Beauty & care', icon: 'Sparkles' },
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Clapperboard' },
  { id: 'transport', label: 'Transport', icon: 'Car' },
  { id: 'gifts', label: 'Gifts', icon: 'Gift' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal' },
]

export const DEFAULT_CATEGORY = 'other'

export function getCategoryLabel(id: string | null | undefined): string {
  if (!id) return 'Other'
  return CATEGORIES.find(c => c.id === id)?.label ?? 'Other'
}
