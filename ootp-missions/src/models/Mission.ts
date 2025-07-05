export interface Mission {
  id: number
  name: string
  type: 'count' | 'points'
  requiredCount: number
  totalPoints?: number
  cards: Array<{ cardId: number; points?: number }>
}
