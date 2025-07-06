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

          const userCard = userCards.find((userCard) => userCard.cardId == card.cardId)

          const price = selectedPriceType.value.sellPrice
            ? shopCard.sellOrderLow || shopCard.lastPrice
            : shopCard.lastPrice

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
        .sort((a, b) => {
          if (a.owned !== b.owned) return a.owned ? 1 : -1
          if (a.locked !== b.locked) return a.locked ? 1 : -1
          return a.price - b.price
        })

      let progressText = ''
      if (mission.type === 'points') {
        const ownedPoints = userCards.reduce((total, userCard) => {
          const card = mission?.cards.find((missionCard) => missionCard.cardId == userCard.cardId)
          return total + (card?.points || 0)
        }, 0)

        const remainingPrice = (mission.requiredCount ?? 0) - ownedPoints
        progressText = `${ownedPoints} points out of ${mission.requiredCount} of any ${mission.totalPoints} total (${remainingPrice} remaining)`
      } else {
        const ownedCount = userCards.filter((userCard) =>
          mission?.cards.some((card) => card.cardId == userCard.cardId),
        ).length

        progressText = `${ownedCount} out of any ${mission.requiredCount} of ${mission.totalPoints} total`
      }

      return {
        id: mission.id,
        rawMission: mission,
        progressText: progressText,
        completed: completed,
        missionCards: missionCards,
        remainingPrice: remainingPrice.totalPrice,
      }
    })
    userMissions.value.forEach((mission) => {
      if (mission.rawMission.type === 'missions') {
        // Count the number of userMissions that are completed and have missionIds in this mission
        const subMissions = userMissions.value.filter(
          (userMission) =>
            mission.rawMission.missionIds &&
            mission.rawMission.missionIds.some((id) => id == userMission.rawMission.id),
        )
        console.log('subMissions:', subMissions)
        const completedCount = subMissions.filter((m) => m.completed).length

        // take the sum of the x lowest remaining prices of the subMissions where x is requiredCount minus completedCount
        const remainingCount = mission.rawMission.requiredCount - completedCount
        console.log('remainingCount:', remainingCount)
        const lowestRemainingPrices = subMissions
          .filter((m) => !m.completed)
          .filter((m) => m.remainingPrice > 0)
          .map((m) => m.remainingPrice)
          .sort((a, b) => a - b)
          .slice(0, remainingCount)
        console.log('lowestRemainingPrices:', lowestRemainingPrices)
        const totalRemainingPrice = lowestRemainingPrices.reduce((sum, price) => sum + price, 0)

        mission.progressText = `${completedCount} out of ${mission.rawMission.requiredCount} missions completed`
        mission.remainingPrice = totalRemainingPrice
      }
    })
  }

  return { userMissions, selectedMission, selectedPriceType, initialize }
})
