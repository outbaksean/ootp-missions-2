import type { ShopCard } from '@/models/ShopCard'
import type { UserCard } from '@/models/UserCard'
import Dexie from 'dexie'

// Define the database schema
export class OOTPMissionsDB extends Dexie {
  shopCards: Dexie.Table<ShopCard, number>
  userCards: Dexie.Table<UserCard, number>

  constructor() {
    super('OOTPMissionsDB')

    this.version(1).stores({
      shopCards: '++cardId, cardTitle, cardValue, sellOrderLow, lastPrice, date',
      userCards: '++cardId, lock',
    })

    this.shopCards = this.table('shopCards')
    this.userCards = this.table('userCards')
  }
}

// Initialize the database
const db = new OOTPMissionsDB()
export default db
