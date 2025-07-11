<template>
  <div class="mission-container">
    <!-- Add spinner when loading -->
    <div v-if="missionStore.loading" class="spinner-container">
      <div class="spinner"></div>
    </div>
    <div v-else class="mission-list">
      <div class="mission-header">
        <h2>Missions</h2>
        <div class="form-check form-switch price-toggle">
          <input
            type="checkbox"
            class="form-check-input"
            role="switch"
            v-model="useSellPrice"
            @change="updatePriceType"
          />
          <span>Use Sell Price</span>
        </div>
        <div class="form-check form-switch price-toggle">
          <input type="checkbox" class="form-check-input" role="switch" v-model="hideCompleted" />
          <span>Hide Completed</span>
        </div>
        <select v-model="selectedMissionFilter" class="mission-dropdown">
          <option value="">All Missions</option>
          <option v-for="mission in missionsOfTypeMissions" :key="mission.id" :value="mission.id">
            {{ mission.rawMission.name }} - {{ mission.rawMission.reward }}
          </option>
        </select>
      </div>
      <ul class="list-group">
        <li
          v-for="mission in filteredMissions"
          :key="mission.id"
          class="list-group-item d-flex flex-column align-items-start"
        >
          <div class="d-flex justify-content-between w-100">
            <div class="col text-start">
              <strong>{{ mission.rawMission.name }}</strong>
            </div>
            <div class="col text-start">
              <span
                :class="{
                  'text-success': isMissionComplete(mission),
                  'text-danger': !isMissionComplete(mission),
                }"
              >
                {{ mission.progressText }}
              </span>
            </div>
            <div class="col text-start">
              <span class="progress-text">{{ remainingPriceText(mission) }}</span>
            </div>
            <div class="col-auto">
              <button class="btn btn-primary btn-sm" @click="selectMission(mission)">Select</button>
            </div>
          </div>
          <div class="reward-text">{{ mission.rawMission.reward }}</div>
        </li>
      </ul>
    </div>
    <div v-if="!missionStore.loading && selectedMission" class="mission-cards">
      <template v-if="selectedMission.rawMission.type === 'missions'">
        <h3>Sub-Missions for {{ selectedMission.rawMission.name }}</h3>
        <ul class="list-group">
          <li
            v-for="subMission in selectedMissionSubMissions"
            :key="subMission.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              ><strong>{{ subMission.rawMission.name }}</strong></span
            >
            <span
              :class="{
                'text-success': isMissionComplete(subMission),
                'text-danger': !isMissionComplete(subMission),
              }"
            >
              {{ subMission.progressText }}
            </span>
            <span class="progress-text">{{ remainingPriceText(subMission) }}</span>
          </li>
        </ul>
      </template>
      <template v-else>
        <h3>Mission Cards for {{ selectedMission.rawMission.name }}</h3>
        <h4 class="text-muted">
          {{ selectedMission.rawMission.reward }}
        </h4>
        <ul class="list-group">
          <li
            v-for="card in selectedMission.missionCards"
            :key="card.cardId"
            class="list-group-item"
            :style="{ backgroundColor: card.highlighted ? '#ffeb3b' : '' }"
          >
            <span :class="{ 'text-muted': card.locked }">
              {{ missionCardDescription(card) }}
            </span>
            <span v-if="card.owned" class="badge bg-success">Owned</span>
            <span v-if="card.locked" class="badge bg-secondary">Locked</span>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMissionStore } from '../stores/useMissionStore'
import type { UserMission } from '../models/UserMission'
import type { MissionCard } from '@/models/MissionCard'

const missionStore = useMissionStore()
const missions = computed(() => missionStore.userMissions)
const missionsOfTypeMissions = computed(() =>
  missionStore.userMissions.filter((mission) => mission.rawMission.type === 'missions'),
)
const selectedMission = ref<UserMission | null>(null)
const useSellPrice = ref(false)
const selectedMissionFilter = ref<string | null>(null)
const hideCompleted = ref(false)

const updatePriceType = () => {
  missionStore.selectedPriceType.sellPrice = useSellPrice.value
  missionStore.initialize()
}

const filteredMissions = computed(() => {
  let result = missions.value

  if (selectedMissionFilter.value) {
    const filteredMission = missions.value.find(
      (mission) => mission.id === Number(selectedMissionFilter.value),
    )
    if (filteredMission) {
      const missionIds = filteredMission.rawMission.missionIds || []
      result = missions.value.filter(
        (mission) => missionIds.includes(mission.id) || mission.id === filteredMission.id,
      )
    } else {
      result = []
    }
  }

  if (hideCompleted.value) {
    result = result.filter((mission) => !mission.completed)
  }

  return result
})

const remainingPriceText = (mission: UserMission) => {
  if (mission.completed) {
    return 'Mission Completed'
  }
  if (mission.remainingPrice <= 0) {
    return 'Remaining Price: Unknown'
  }
  return `Remaining Price: ${mission.remainingPrice.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} PP`
}

const missionCardDescription = (card: MissionCard) => {
  if (selectedMission.value?.rawMission.type === 'points') {
    return (
      card.title +
      ' - ' +
      card.points +
      ' Points - ' +
      card.price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) +
      ' PP'
    )
  } else {
    return (
      card.title +
      ' - ' +
      card.price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) +
      ' PP'
    )
  }
}

const isMissionComplete = (mission: UserMission) => {
  return mission.completed
}

const selectMission = (mission: UserMission) => {
  selectedMission.value = mission
}

const selectedMissionSubMissions = computed(() => {
  if (selectedMission.value?.rawMission.type === 'missions') {
    const missionIds = selectedMission.value.rawMission.missionIds || []
    return missions.value.filter((mission) => missionIds.includes(mission.id))
  }
  return []
})

watch(
  () => missionStore.userMissions,
  () => {
    selectedMission.value = null
  },
  { deep: true },
)
</script>

<style scoped>
.mission-container {
  display: flex;
  gap: 20px;
}

.mission-list {
  flex: 1;
  margin: 20px;
}

.mission-cards {
  flex: 1;
  margin: 20px;
}

.list-group-item {
  font-size: 1.2rem;
}

.price-toggle {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mission-dropdown {
  margin-left: 20px;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.reward-text {
  margin-top: 5px;
  font-size: 0.9rem;
  color: #6c757d;
}
</style>
