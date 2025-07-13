import { defineStore } from 'pinia'
import MissionHelper from '@/helpers/MissionHelper'
import rawMissions from '@/data/missions'
import type { UserMission } from '@/models/UserMission'
import { ref } from 'vue'
import type { PriceType } from '@/models/PriceType'
import db from '@/data/indexedDB'

export const useMissionStore = defineStore('mission', () => {
  const loading = ref<boolean>(true)
  const userMissions = ref<Array<UserMission>>([])
  const selectedMission = ref<UserMission | null>(null)
  const selectedPriceType = ref<PriceType>({ sellPrice: false })

  async function calculateMissionDetails(missionId: number, isSubMission = false) {
    if (!isSubMission) {
      loading.value = true
    }
    const shopCards = await db.shopCards.toArray()
    const userMission = userMissions.value.find((m) => m.id === missionId)
    if (!userMission || userMission.progressText !== 'Not Calculated') {
      return
    }

    const mission = userMission.rawMission
    if (mission.type === 'points') {
      const remainingPrice = MissionHelper.calculateTotalPriceOfNonOwnedCards(
        mission,
        shopCards,
        selectedPriceType.value.sellPrice,
      )
      const completed = MissionHelper.isMissionComplete(mission, shopCards)
      const missionCards = mission.cards
        .map((card) => {
          const shopCard = shopCards.find((shopCard) => shopCard.cardId == card.cardId)

          if (!shopCard || shopCard.cardId === undefined) {
            return null
          }

          const price = selectedPriceType.value.sellPrice
            ? shopCard.sellOrderLow || shopCard.lastPrice
            : shopCard.lastPrice

          const highlighted =
            remainingPrice.totalPrice > 0 &&
            remainingPrice.includedCards.some((c) => c.cardId == card.cardId)

          return {
            cardId: shopCard.cardId,
            title: shopCard.cardTitle,
            owned: shopCard.owned,
            locked: shopCard.locked,
            price,
            highlighted: highlighted,
            points: card.points || 0,
          }
        })
        .filter((card) => card !== null)
        .sort((a, b) => {
          if (a.owned !== b.owned) return a.owned ? 1 : -1
          if (a.locked !== b.locked) return a.locked ? 1 : -1
          return a.price - b.price
        })
      let progressText = ''
      const ownedPoints = shopCards.reduce((total, shopCard) => {
        const card = mission?.cards.find(
          (missionCard) => missionCard.cardId == shopCard.cardId && shopCard.owned,
        )
        return total + (card?.points || 0)
      }, 0)

      const remainingCount = (mission.requiredCount ?? 0) - ownedPoints
      if (remainingCount <= 0) {
        progressText = `Completed with ${ownedPoints} points out of ${mission.requiredCount} of any ${mission.totalPoints} total`
      } else {
        progressText = `${ownedPoints} points out of ${mission.requiredCount} of any ${mission.totalPoints} total (${remainingCount} remaining)`
      }

      userMission.progressText = progressText
      userMission.completed = completed
      userMission.missionCards = missionCards
      userMission.remainingPrice = remainingPrice.totalPrice
    }
    if (mission.type === 'missions') {
      if (!mission.missionIds || mission.missionIds.length === 0) {
        loading.value = false
        return
      }
      await Promise.all(
        mission.missionIds.map((id) => {
          return calculateMissionDetails(id, true)
        }),
      )
      const subMissions = userMissions.value.filter(
        (userMission) =>
          mission.missionIds && mission.missionIds.some((id) => id == userMission.rawMission.id),
      )
      const completedCount = subMissions.filter((m) => m.completed).length

      // take the sum of the x lowest remaining prices of the subMissions where x is requiredCount minus completedCount
      const remainingCount = mission.requiredCount - completedCount
      const lowestRemainingPrices = subMissions
        .filter((m) => !m.completed)
        .filter((m) => m.remainingPrice > 0)
        .map((m) => m.remainingPrice)
        .sort((a, b) => a - b)
        .slice(0, remainingCount)
      const totalRemainingPrice = lowestRemainingPrices.reduce((sum, price) => sum + price, 0)

      userMission.progressText = `${completedCount} out of ${mission.requiredCount} missions completed`
      userMission.remainingPrice = totalRemainingPrice
      userMission.completed = completedCount >= mission.requiredCount
    }
    if (!isSubMission) {
      loading.value = false
    }
  }

  async function initialize() {
    loading.value = true
    const shopCards = await db.shopCards.toArray()

    userMissions.value = rawMissions.map((mission) => {
      if (mission.type == 'missions' || mission.type == 'points') {
        return {
          id: mission.id,
          rawMission: mission,
          progressText: 'Not Calculated',
          completed: false,
          missionCards: [],
          remainingPrice: 0,
        }
      }
      const remainingPrice = MissionHelper.calculateTotalPriceOfNonOwnedCards(
        mission,
        shopCards,
        selectedPriceType.value.sellPrice,
      )
      const completed = MissionHelper.isMissionComplete(mission, shopCards)
      const missionCards = mission.cards
        .map((card) => {
          const shopCard = shopCards.find((shopCard) => shopCard.cardId == card.cardId)

          if (!shopCard || shopCard.cardId === undefined) {
            return null
          }

          const price = selectedPriceType.value.sellPrice
            ? shopCard.sellOrderLow || shopCard.lastPrice
            : shopCard.lastPrice

          const highlighted =
            remainingPrice.totalPrice > 0 &&
            remainingPrice.includedCards.some((c) => c.cardId == card.cardId)

          return {
            cardId: shopCard.cardId,
            title: shopCard.cardTitle,
            owned: shopCard.owned,
            locked: shopCard.locked,
            price,
            highlighted: highlighted,
            points: card.points || 0,
          }
        })
        .filter((card) => card !== null)
        .sort((a, b) => {
          if (a.owned !== b.owned) return a.owned ? 1 : -1
          if (a.locked !== b.locked) return a.locked ? 1 : -1
          return a.price - b.price
        })

      const ownedCount = shopCards.filter((shopCard) =>
        mission?.cards.some((card) => card.cardId == shopCard.cardId && shopCard.owned),
      ).length

      const progressText = `${ownedCount} out of any ${mission.requiredCount} of ${mission.totalPoints} total`

      loading.value = false
      return {
        id: mission.id,
        rawMission: mission,
        progressText: progressText,
        completed: completed,
        missionCards: missionCards,
        remainingPrice: remainingPrice.totalPrice,
      }
    })
  }

  async function calculateAllNotCalculatedMissions(missionIds: number[]) {
    const notCalculatedMissions = userMissions.value.filter(
      (mission) => mission.progressText === 'Not Calculated' && missionIds.includes(mission.id),
    )

    for (const mission of notCalculatedMissions) {
      await calculateMissionDetails(mission.id)
    }
  }

  return {
    userMissions,
    selectedMission,
    selectedPriceType,
    loading,
    initialize,
    calculateMissionDetails,
    calculateAllNotCalculatedMissions,
  }
})
