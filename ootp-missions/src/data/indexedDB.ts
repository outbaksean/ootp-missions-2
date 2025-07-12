import type { ShopCard } from '@/models/ShopCard'
import Dexie from 'dexie'

// Define the database schema
export class OOTPMissionsDB extends Dexie {
  shopCards: Dexie.Table<ShopCard, number>

  constructor() {
    super('OOTPMissionsDB')

    this.version(3).stores({
      shopCards: '++cardId, cardTitle, cardValue, sellOrderLow, lastPrice, date, owned, lock',
    })

    this.shopCards = this.table('shopCards')
  }
}

// Initialize the database
const db = new OOTPMissionsDB()
export default db
