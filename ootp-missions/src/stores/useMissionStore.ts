import { defineStore } from 'pinia'
import MissionHelper from '@/helpers/MissionHelper'
import rawMissions from '@/data/missions'
import type { UserMission } from '@/models/UserMission'
import { ref } from 'vue'
import type { PriceType } from '@/models/PriceType'
import db from '@/data/indexedDB'

export const useMissionStore = defineStore('mission', () => {
  const userMissions = ref<Array<UserMission>>([])
  const selectedMission = ref<UserMission | null>(null)
  const selectedPriceType = ref<PriceType>({ sellPrice: true })

  async function initialize() {
    const shopCards = await db.shopCards.toArray()
    const userCards = await db.userCards.toArray()

    userMissions.value = rawMissions.map((mission) => {
      const remainingPrice = MissionHelper.calculateTotalPriceOfNonOwnedCards(
        mission,
        userCards,
        shopCards,
        selectedPriceType.value.sellPrice,
      )
      const completed = MissionHelper.isMissionComplete(mission, userCards)
      const remainingPriceText = completed
        ? 'Complete'
        : `Remaining Price: PP ${remainingPrice.totalPrice.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`
      console.log('remainingPrice:', remainingPrice)
      const missionCards = mission.cards
        .map((card) => {
          const shopCard = shopCards.find((shopCard) => shopCard.cardId == card.cardId)

          if (!shopCard || shopCard.cardId === undefined) {
            return null
          }
          console.log('cardId:', card.cardId, 'shopCard:', shopCard)
          const userCard = userCards.find((userCard) => userCard.cardId == card.cardId)
          console.log('userCard:', userCard)
          const price = selectedPriceType.value.sellPrice
            ? shopCard.sellOrderLow || shopCard.lastPrice
            : shopCard.lastPrice
          console.log('price:', price)
          const highlighted =
            remainingPrice.totalPrice > 0 &&
            remainingPrice.includedCards.some((c) => c.cardId == card.cardId)

          return {
            cardId: shopCard.cardId,
            title: shopCard.cardTitle,
            owned: !!userCard,
            locked: userCard?.lock || false,
            price,
            highlighted: highlighted,
          }
        })
        .filter((card) => card !== null)

      console.log('initializing')
      return {
        id: mission.id,
        rawMission: mission,
        progressText: remainingPriceText,
        completed: completed,
        missionCards: missionCards,
      }
    })
  }

  return { userMissions, selectedMission, selectedPriceType, initialize }
})
