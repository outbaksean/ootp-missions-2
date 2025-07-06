import type { Mission } from '@/models/Mission'

const missions: Mission[] = [
  {
    id: 1,
    name: 'First Victims',
    type: 'count',
    requiredCount: 18,
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
      { cardId: 72996 },
    ],
  },
  {
    id: 2,
    name: 'Test Mission B',
    type: 'points',
    requiredCount: 60,
    cards: [
      { cardId: 73932, points: 10 },
      { cardId: 73621, points: 15 },
      { cardId: 72522, points: 20 },
      { cardId: 73642, points: 5 },
      { cardId: 72583, points: 10 },
    ],
  },
  {
    id: 3,
    name: 'Test Mission C',
    type: 'points',
    requiredCount: 100,
    cards: [
      { cardId: 73932, points: 20 },
      { cardId: 73621, points: 25 },
      { cardId: 73223, points: 30 },
      { cardId: 72075, points: 10 },
      { cardId: 73642, points: 15 },
      { cardId: 72583, points: 10 },
    ],
  },
  {
    id: 4,
    name: 'Test Mission D',
    type: 'points',
    requiredCount: 50,
    cards: [
      { cardId: 73932, points: 10 },
      { cardId: 73621, points: 15 },
      { cardId: 73223, points: 20 },
      { cardId: 73642, points: 5 },
      { cardId: 72583, points: 10 },
    ],
  },
  {
    id: 5,
    name: 'Test Mission E',
    type: 'points',
    requiredCount: 75,
    cards: [
      { cardId: 73932, points: 25 },
      { cardId: 73621, points: 30 },
      { cardId: 73223, points: 20 },
      { cardId: 73642, points: 10 },
    ],
  },
  {
    id: 6,
    name: 'Test Mission F',
    type: 'points',
    requiredCount: 40,
    cards: [
      { cardId: 73932, points: 10 },
      { cardId: 73621, points: 15 },
      { cardId: 73223, points: 15 },
      { cardId: 73642, points: 10 },
    ],
  },
  {
    id: 7,
    name: 'Test Mission G',
    type: 'points',
    requiredCount: 120,
    cards: [
      { cardId: 73932, points: 40 },
      { cardId: 73621, points: 30 },
      { cardId: 73223, points: 50 },
      { cardId: 73642, points: 20 },
    ],
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
