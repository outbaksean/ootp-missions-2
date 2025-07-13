import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ShopCard } from '@/models/ShopCard'
import db from '@/data/indexedDB'
import Papa from 'papaparse'
import shopCardsInitialText from '@/data/shop_cards_initial.csv?raw'

export const useCardStore = defineStore('card', () => {
  const shopCards = ref<Array<ShopCard>>([])

  const hasShopCards = computed(() => shopCards.value.length > 0)

  async function addShopCards(data: ShopCard[]) {
    await db.shopCards.bulkAdd(data)
    shopCards.value.push(...data)
  }

  async function clearShopCards() {
    await db.shopCards.clear()
    shopCards.value = []
  }
  async function uploadShopFile(file: File) {
    const text = await file.text()
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: { data: ShopCard[] }) => {
        const data = results.data.map((row: any) => ({
          cardId: parseInt(row['Card ID'], 10) || 0,
          name: row['//Card Title'] || 'Unknown',
          sellPrice: parseInt(row['Sell Order Low'], 10) || 0,
          cardTitle: row['//Card Title'] || 'Unknown',
          cardValue: parseInt(row['Card Value'], 10) || 0,
          sellOrderLow: parseInt(row['Sell Order Low'], 10) || 0,
          lastPrice: parseInt(row['Last 10 Price'], 10) || 0,
          date: row['date'] || '',
          owned: parseInt(row['owned'], 10) > 0,
          locked: false,
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
      complete: async (results: { data: { CID: string; Lock: string }[] }) => {
        const userCards = results.data
        for (const userCard of userCards) {
          if (userCard.Lock === 'Yes') {
            const cardId = parseInt(userCard.CID, 10)
            const shopCard = await db.shopCards.get(cardId)
            if (shopCard) {
              shopCard.locked = true
              await db.shopCards.put(shopCard)
            }
          }
        }
        shopCards.value = await db.shopCards.toArray()
      },
    })
  }

  async function initialize() {
    const existingShopCards = await db.shopCards.toArray()

    shopCards.value = existingShopCards

    if (shopCards.value.length === 0) {
      Papa.parse(shopCardsInitialText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: { data: ShopCard[] }) => {
          const data = results.data.map((row: any) => ({
            cardId: parseInt(row['Card ID'], 10) || 0,
            name: row['//Card Title'] || 'Unknown',
            sellPrice: parseInt(row['Sell Order Low'], 10) || 0,
            cardTitle: row['//Card Title'] || 'Unknown',
            cardValue: parseInt(row['Card Value'], 10) || 0,
            sellOrderLow: parseInt(row['Sell Order Low'], 10) || 0,
            lastPrice: parseInt(row['Last 10 Price'], 10) || 0,
            date: row['date'] || '',
            owned: parseInt(row['owned'], 10) > 0,
            locked: false,
          }))

          await clearShopCards()
          await addShopCards(data)
        },
      })
    }
  }

  return {
    shopCards,
    hasShopCards,
    clearShopCards,
    uploadShopFile,
    uploadUserFile,
    initialize,
  }
})
