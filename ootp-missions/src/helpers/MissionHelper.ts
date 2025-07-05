import type { ShopCard } from '../models/ShopCard'
import type { UserCard } from '../models/UserCard'
import type { Mission } from '../models/Mission'

interface PriceCalculationResult {
  totalPrice: number
  includedCards: Array<{ cardId: number; price: number }>
}

export default class MissionHelper {
  private static calculatePriceDetailsPointsType(
    sortedCards: Array<{ cardId: number; price: number }>,
    mission: Mission,
    userCards: Array<UserCard>,
  ): {
    totalPrice: number
    includedCards: Array<{ cardId: number; price: number }>
  } {
    const ownedPoints = userCards.reduce(
      (sum, userCard) =>
        sum + (mission.cards.find((card) => card.cardId === userCard.cardId)?.points || 0),
      0,
    )

    const requiredPoints = Math.max(mission.requiredCount - ownedPoints, 0)

    let bestCombination: Array<{ cardId: number; price: number }> = []
    let lowestPrice = Infinity

    // Generate all combinations of cards
    const generateCombinations = (
      cards: Array<{ cardId: number; price: number }>,
      combination: Array<{ cardId: number; price: number }>,
      index: number,
    ) => {
      const totalPoints = combination.reduce(
        (sum, card) =>
          sum + (mission.cards.find((mCard) => mCard.cardId === card.cardId)?.points || 0),
        0,
      )
      const totalPrice = combination.reduce((sum, card) => sum + card.price, 0)

      if (totalPoints >= requiredPoints && totalPrice < lowestPrice) {
        bestCombination = [...combination]
        lowestPrice = totalPrice
      }

      for (let i = index; i < cards.length; i++) {
        generateCombinations(cards, [...combination, cards[i]], i + 1)
      }
    }

    generateCombinations(sortedCards, [], 0)

    return {
      totalPrice: lowestPrice === Infinity ? 0 : lowestPrice,
      includedCards: bestCombination,
    }
  }
  private static calculatePriceDetailsCardType(
    sortedCards: Array<{ cardId: number; price: number }>,
    mission: Mission,
    userCards: Array<UserCard>,
  ): {
    totalPrice: number
    includedCards: Array<{ cardId: number; price: number }>
  } {
    const requiredCount = Math.max(
      mission.requiredCount -
        userCards.filter((userCard) =>
          mission.cards.some((card) => card.cardId === userCard.cardId),
        ).length,
      0,
    )

    const includedCards = sortedCards.slice(0, requiredCount)
    const totalPrice = includedCards.reduce((total, card) => total + card.price, 0)

    return { totalPrice, includedCards }
  }

  static calculateTotalPriceOfNonOwnedCards(
    mission: Mission,
    userCards: Array<UserCard>,
    shopCardsData: Array<ShopCard>,
    selectedPriceType: string,
  ): PriceCalculationResult {
    const nonOwnedCards = mission.cards
      .filter((card) => !userCards.some((userCard) => userCard.cardId === card.cardId))
      .map((card) => {
        const shopCard = shopCardsData.find((shopCard) => shopCard.cardId === card.cardId)
        if (!shopCard) return null

        const price = selectedPriceType === 'sellPrice' ? shopCard.sellOrderLow : shopCard.lastPrice

        return { cardId: card.cardId, price }
      })
      .filter((card) => card !== null) as Array<{
      cardId: number
      price: number
    }>

    // Sort by price ascending
    const sortedCards = nonOwnedCards.sort((a, b) => a.price - b.price)

    // Delegate price calculation to private method
    if (mission.type === 'count') {
      return this.calculatePriceDetailsCardType(sortedCards, mission, userCards)
    } else if (mission.type === 'points') {
      return this.calculatePriceDetailsPointsType(sortedCards, mission, userCards)
    } else {
      return {
        totalPrice: 0,
        includedCards: [],
      }
    }
  }
}
