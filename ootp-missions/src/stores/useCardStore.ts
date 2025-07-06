import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserCard } from '@/models/UserCard'
import type { ShopCard } from '@/models/ShopCard'
import db from '@/data/indexedDB'
import Papa from 'papaparse'

export const useCardStore = defineStore('card', () => {
  const userCards = ref<Array<UserCard>>([])
  const shopCards = ref<Array<ShopCard>>([])

  const hasUserCards = computed(() => userCards.value.length > 0)
  const hasShopCards = computed(() => shopCards.value.length > 0)

  async function addShopCards(data: ShopCard[]) {
    await db.shopCards.bulkAdd(data)
    shopCards.value.push(...data)
  }

  async function addUserCards(data: UserCard[]) {
    await db.userCards.bulkAdd(data)
    userCards.value.push(...data)
  }
  async function clearShopCards() {
    await db.shopCards.clear()
    shopCards.value = []
  }
  async function clearUserCards() {
    await db.userCards.clear()
    userCards.value = []
  }
  async function uploadShopFile(file: File) {
    const text = await file.text()
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: { data: ShopCard[] }) => {
        const data = results.data.map((row: any) => ({
          cardId: row['Card ID'].toString(),
          name: row['//Card Title'] || 'Unknown',
          sellPrice: parseInt(row['Sell Order Low'], 10) || 0,
          cardTitle: row['//Card Title'] || 'Unknown',
          cardValue: parseInt(row['Card Value'], 10) || 0,
          sellOrderLow: parseInt(row['Sell Order Low'], 10) || 0,
          lastPrice: parseInt(row['Last 10 Price'], 10) || 0,
          date: row['date'] || '',
        }))

        await clearShopCards()
        await addShopCards(data)
        console.log('Shop file uploaded successfully')
      },
    })
  }
  async function uploadUserFile(file: File) {
    const text = await file.text()
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: { data: UserCard[] }) => {
        const data = results.data.map(
          (row: any) =>
            ({
              cardId: row['CID'].toString(),
              lock: row['Lock'] === 'Yes', // Convert string to boolean
            }) as UserCard,
        )

        await clearUserCards()
        await addUserCards(data)
        console.log('User file uploaded successfully')
      },
    })
  }

  async function initialize() {
    const existingShopCards = await db.shopCards.toArray()
    const existingUserCards = await db.userCards.toArray()

    shopCards.value = existingShopCards.map((item) => ({
      cardId: item.cardId,
      cardTitle: item.cardTitle,
      cardValue: item.cardValue,
      sellOrderLow: item.sellOrderLow,
      lastPrice: item.lastPrice,
      date: item.date,
    }))

    userCards.value = existingUserCards.map((item) => ({
      cardId: item.cardId,
      lock: item.lock,
    }))

    if (shopCards.value.length === 0) {
      const response = await fetch('/src/data/shop_cards_initial.csv')
      const shopCardInitialFile = new File([await response.text()], 'shop_cards_initial.csv', {
        type: 'text/csv',
      })
      await uploadShopFile(shopCardInitialFile)
    }
  }

  return {
    userCards,
    shopCards,
    hasUserCards,
    hasShopCards,
    clearShopCards,
    clearUserCards,
    uploadShopFile,
    uploadUserFile,
    initialize,
  }
})
