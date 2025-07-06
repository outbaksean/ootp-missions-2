import type { Mission } from '@/models/Mission'

const missions: Mission[] = [
  {
    id: 1,
    name: 'First Victims',
    type: 'count',
    requiredCount: 18,
    reward: '3 Standard Packs',
    category: 'Future Legends',
    cards: [
      { cardId: 72503 },
      { cardId: 72504 },
      { cardId: 72538 },
      { cardId: 72071 },
      { cardId: 72073 },
      { cardId: 72508 },
      { cardId: 72536 },
      { cardId: 72544 },
      { cardId: 72509 },
      { cardId: 72514 },
      { cardId: 72512 },
      { cardId: 72365 },
      { cardId: 72075 },
      { cardId: 72513 },
      { cardId: 72522 },
      { cardId: 72550 },
      { cardId: 72088 },
      { cardId: 72546 },
    ],
  },
  {
    id: 2,
    name: 'Call-Ups',
    type: 'points',
    requiredCount: 305,
    reward: '2 Historical Diamond Packs',
    category: 'Future Legends',
    cards: [
      { cardId: 73275, points: 5 },
      { cardId: 73207, points: 5 },
      { cardId: 73474, points: 5 },
      { cardId: 74006, points: 5 },
      { cardId: 73622, points: 5 },
      { cardId: 73218, points: 5 },
      { cardId: 73584, points: 5 },
      { cardId: 73277, points: 5 },
      { cardId: 73583, points: 5 },
      { cardId: 73582, points: 10 },
      { cardId: 73274, points: 10 },
      { cardId: 73972, points: 10 },
      { cardId: 73475, points: 15 },
      { cardId: 74026, points: 15 },
      { cardId: 73208, points: 15 },
      { cardId: 73587, points: 50 },
      { cardId: 72799, points: 75 },
      { cardId: 72791, points: 75 },
      { cardId: 74253, points: 75 },
    ],
  },
  {
    id: 3,
    name: 'The Next Generation',
    type: 'points',
    requiredCount: 450,
    reward: '3 Historical Diamond Packs',
    category: 'Future Legends',
    cards: [
      { cardId: 73857, points: 5 },
      { cardId: 74012, points: 5 },
      { cardId: 74013, points: 5 },
      { cardId: 72866, points: 5 },
      { cardId: 72796, points: 10 },
      { cardId: 72872, points: 10 },
      { cardId: 74017, points: 15 },
      { cardId: 74021, points: 15 },
      { cardId: 74020, points: 15 },
      { cardId: 74016, points: 15 },
      { cardId: 72802, points: 50 },
      { cardId: 72800, points: 50 },
      { cardId: 72793, points: 50 },
      { cardId: 72981, points: 50 },
      { cardId: 72879, points: 75 },
      { cardId: 74019, points: 75 },
      { cardId: 72982, points: 75 },
      { cardId: 72979, points: 75 },
      { cardId: 74018, points: 75 },
      { cardId: 72788, points: 200 },
      { cardId: 72983, points: 200 },
      { cardId: 72873, points: 200 },
      { cardId: 74023, points: 200 },
    ],
  },
  {
    id: 4,
    name: 'Opening Day',
    type: 'points',
    requiredCount: 185,
    reward: '4 Historical Gold Packs',
    category: 'Future Legends',
    cards: [
      { cardId: 72801, points: 5 },
      { cardId: 72795, points: 15 },
      { cardId: 72862, points: 15 },
      { cardId: 72798, points: 75 },
      { cardId: 72792, points: 75 },
      { cardId: 72863, points: 75 },
      { cardId: 72789, points: 200 },
      { cardId: 73124, points: 200 },
    ],
  },
  {
    id: 5,
    name: 'Debut Heat',
    type: 'missions',
    requiredCount: 4,
    missionIds: [1, 2, 3, 4],
    reward: 'Future Legend Call-Ups SP Jacob Misiorowski MIL 2025',
    category: 'Future Legends',
    cards: [],
  },
  {
    id: 6,
    name: 'Immortal Relievers',
    type: 'count',
    requiredCount: 2,
    reward: 'Immortal Seasons 2 CL Aroldis Chapman CIN 2012',
    category: 'Immortal Seasons',
    cards: [{ cardId: 73230 }, { cardId: 73928 }, { cardId: 73215 }, { cardId: 74232 }],
  },
  {
    id: 7,
    name: 'Immortal Clevelanders',
    type: 'count',
    requiredCount: 3,
    reward: 'Immortal Seasons 2 2B Nap Lajoie CLE 1904',
    category: 'Immortal Seasons',
    cards: [
      { cardId: 74218 },
      { cardId: 73213 },
      { cardId: 73225 },
      { cardId: 73212 },
      { cardId: 73193 },
    ],
  },
  {
    id: 8,
    name: 'Immortal Infielders',
    type: 'count',
    requiredCount: 4,
    reward: 'Immortal Seasons 2 3B John McGraw BLN 1899',
    category: 'Immortal Seasons',
    cards: [
      { cardId: 73227 },
      { cardId: 73192 },
      { cardId: 73214 },
      { cardId: 73229 },
      { cardId: 73188 },
      { cardId: 73221 },
      { cardId: 73193 },
    ],
  },
  {
    id: 9,
    name: 'Immortal Starters',
    type: 'count',
    requiredCount: 2,
    reward: 'Immortal Seasons 2 SP Matt Kilroy BL2 1886',
    category: 'Immortal Seasons',
    cards: [{ cardId: 73228 }, { cardId: 74218 }, { cardId: 73209 }],
  },
  {
    id: 10,
    name: 'Immortal Outfielders',
    type: 'count',
    requiredCount: 3,
    reward: 'Immortal Seasons 2 RF Tony Gwynn SD 1994',
    category: 'Immortal Seasons',
    cards: [{ cardId: 73235 }, { cardId: 73220 }, { cardId: 73226 }, { cardId: 74225 }],
  },
  {
    id: 11,
    name: 'Immortal Seasons 2 Complete',
    type: 'missions',
    requiredCount: 5,
    missionIds: [6, 7, 8, 9, 10],
    reward: '1 Historical Perfect Pack',
    category: 'Immortal Seasons',
    cards: [],
  },
]

missions.forEach((mission) => {
  if (mission.type === 'count') {
    if (mission.cards.length < mission.requiredCount) {
      throw new Error(
        `Mission "${mission.name}" has type "count" but fewer cards than requiredCount.`,
      )
    }
    mission.totalPoints = mission.cards.length // Add totalPoints to the mission object
  } else if (mission.type === 'points') {
    const totalPoints = mission.cards.reduce<number>((sum, card) => {
      if (!card.points || card.points <= 0) {
        throw new Error(
          `Mission "${mission.name}" has type "points" but contains a card with invalid points value.`,
        )
      }
      return sum + card.points
    }, 0)

    if (totalPoints < mission.requiredCount) {
      throw new Error(
        `Mission "${mission.name}" has type "points" but fewer total points than requiredCount.`,
      )
    }

    mission.totalPoints = totalPoints // Add totalPoints to the mission object
  }
})

export default missions
