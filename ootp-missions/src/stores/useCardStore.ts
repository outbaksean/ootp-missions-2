import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserCard } from '@/models/UserCard'
import type { ShopCard } from '@/models/ShopCard'
import db from '@/data/indexedDB'
import Papa from 'papaparse'
import shopCardsInitialText from '@/data/shop_cards_initial.csv?raw'

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
      },
    })
  }

  async function initialize() {
    const existingShopCards = await db.shopCards.toArray()
    const existingUserCards = await db.userCards.toArray()

    shopCards.value = existingShopCards
    userCards.value = existingUserCards

    if (shopCards.value.length === 0) {
      Papa.parse(shopCardsInitialText, {
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
        },
      })
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
