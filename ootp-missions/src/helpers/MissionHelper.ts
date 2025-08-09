import type { ShopCard } from '../models/ShopCard'
import type { Mission } from '../models/Mission'

interface PriceCalculationResult {
  totalPrice: number
  includedCards: Array<{ cardId: number; price: number }>
}

export default class MissionHelper {
  private static calculatePriceDetailsPointsType(
    sortedCards: Array<{ cardId: number; price: number }>,
    mission: Mission,
    shopCards: Array<ShopCard>,
    useGreedyAlgorithm: boolean = false,
  ): {
    totalPrice: number
    includedCards: Array<{ cardId: number; price: number }>
  } {
    if (useGreedyAlgorithm) {
      return this.calculatePriceDetailsPointsTypeGreedy(sortedCards, mission, shopCards)
    }

    const ownedPoints = shopCards.reduce(
      (sum, shopCard) =>
        sum +
        (mission.cards.find((card) => shopCard.owned && card.cardId == shopCard.cardId)?.points ||
          0),
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
          sum + (mission.cards.find((mCard) => mCard.cardId == card.cardId)?.points || 0),
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

  private static calculatePriceDetailsPointsTypeGreedy(
    sortedCards: Array<{ cardId: number; price: number }>,
    mission: Mission,
    shopCards: Array<ShopCard>,
  ): {
    totalPrice: number
    includedCards: Array<{ cardId: number; price: number }>
  } {
    const ownedPoints = shopCards.reduce(
      (sum, shopCard) =>
        sum +
        (mission.cards.find((card) => shopCard.owned && card.cardId == shopCard.cardId)?.points ||
          0),
      0,
    )

    const requiredPoints = Math.max(mission.requiredCount - ownedPoints, 0)

    // Sort cards by price-to-points ratio
    const cardsWithPoints = sortedCards.map((card) => ({
      ...card,
      points: mission.cards.find((mCard) => mCard.cardId == card.cardId)?.points || 0,
    }))
    cardsWithPoints.sort((a, b) => a.price / a.points - b.price / b.points)

    let totalPrice = 0
    let accumulatedPoints = 0
    const includedCards: Array<{ cardId: number; price: number }> = []

    for (const card of cardsWithPoints) {
      if (accumulatedPoints >= requiredPoints) break
      includedCards.push(card)
      totalPrice += card.price
      accumulatedPoints += card.points
    }

    return {
      totalPrice: accumulatedPoints >= requiredPoints ? totalPrice : 0,
      includedCards: accumulatedPoints >= requiredPoints ? includedCards : [],
    }
  }

  private static calculatePriceDetailsCardType(
    sortedCards: Array<{ cardId: number; price: number }>,
    mission: Mission,
    userCards: Array<ShopCard>,
  ): {
    totalPrice: number
    includedCards: Array<{ cardId: number; price: number }>
  } {
    const requiredCount = Math.max(
      mission.requiredCount -
        userCards.filter((shopCard) =>
          mission.cards.some((card) => card.cardId == shopCard.cardId && shopCard.owned),
        ).length,
      0,
    )

    const includedCards = sortedCards.slice(0, requiredCount)
    const totalPrice = includedCards.reduce((total, card) => total + card.price, 0)

    return { totalPrice, includedCards }
  }

  static calculateTotalPriceOfNonOwnedCards(
    mission: Mission,
    shopCardsData: Array<ShopCard>,
    useSellPrice: boolean,
    useGreedyAlgorithm: boolean = false, // Add the toggle parameter
  ): PriceCalculationResult {
    const nonOwnedCards = mission.cards
      .filter(
        (card) =>
          !shopCardsData.some((shopCard) => shopCard.cardId == card.cardId && shopCard.owned),
      )
      .map((card) => {
        const shopCard = shopCardsData.find((shopCard) => shopCard.cardId == card.cardId)
        if (!shopCard) return null

        const price =
          useSellPrice && shopCard.sellOrderLow > 0 ? shopCard.sellOrderLow : shopCard.lastPrice

        return { cardId: card.cardId, price }
      })
      .filter((card) => card !== null && card.price > 0) as Array<{
      cardId: number
      price: number
    }>

    // Sort by price ascending
    const sortedCards = nonOwnedCards.sort((a, b) => a.price - b.price)

    // Delegate price calculation to private method
    if (mission.type === 'count') {
      return this.calculatePriceDetailsCardType(sortedCards, mission, shopCardsData)
    } else if (mission.type === 'points') {
      return this.calculatePriceDetailsPointsType(
        sortedCards,
        mission,
        shopCardsData,
        useGreedyAlgorithm,
      ) // Pass the toggle
    } else {
      return {
        totalPrice: 0,
        includedCards: [],
      }
    }
  }

  static isMissionComplete(mission: Mission, shopCards: Array<ShopCard>): boolean {
    if (mission.type === 'count') {
      const ownedCount = shopCards.filter((shopCard) =>
        mission.cards.some((card) => card.cardId == shopCard.cardId && shopCard.owned),
      ).length

      return ownedCount >= mission.requiredCount
    } else if (mission.type === 'points') {
      const ownedPoints = shopCards.reduce(
        (sum, shopCard) =>
          sum +
          (mission.cards.find((card) => card.cardId == shopCard.cardId && shopCard.owned)?.points ||
            0),
        0,
      )

      return ownedPoints >= mission.requiredCount
    }

    return false
  }
}
