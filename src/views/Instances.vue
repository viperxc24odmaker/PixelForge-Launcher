<template>
  <v-container fluid class="pa-6">
    <!-- Error Alert -->
    <v-row v-if="minecraftStore.error" class="mb-4">
      <v-col cols="12">
        <v-alert type="error" closable @click:close="minecraftStore.clearError()">
          {{ minecraftStore.error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card color="surface">
          <v-card-title>Manage Instances</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              variant="elevated"
              @click="showCreateDialog = true"
              :disabled="minecraftStore.loading"
            >
              <v-icon start>mdi-plus</v-icon>
              Create Instance
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="minecraftStore.loading">
      <v-col cols="12">
        <v-card color="surface">
          <v-card-text class="text-center py-12">
            <v-progress-circular indeterminate color="primary" class="mb-4"></v-progress-circular>
            <p class="text-subtitle1">Loading instances...</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="!minecraftStore.hasInstances">
      <v-col cols="12">
        <v-card color="surface">
          <v-card-text class="text-center py-12">
            <v-icon size="64" class="mb-4" color="primary">mdi-folder-plus</v-icon>
            <p class="text-subtitle1">No instances yet</p>
            <p class="text-caption mb-6">Create a new instance to get started</p>
            <v-btn color="primary" variant="tonal" @click="showCreateDialog = true">
              Create Instance
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Instances Grid -->
    <v-row v-else>
      <v-col
        v-for="(instance, idx) in minecraftStore.instances"
        :key="instance.id"
        cols="12"
        sm="6"
        md="4"
      >
        <div :ref="el => { if (el) instanceCardsRef[idx] = el as HTMLElement }">
        <v-card
          color="surface"
          class="h-100 d-flex flex-column instance-card"
          :class="{ 'border-primary selected': minecraftStore.selectedInstanceId === instance.id }"
          @mouseenter="onCardHover"
          @mouseleave="onCardHoverOut"
        >
          <v-card-title class="d-flex justify-space-between align-center pb-2">
            <span class="text-truncate">{{ instance.name }}</span>
            <v-chip
              label
              size="small"
              :color="instance.loader === 'vanilla' ? 'success' : instance.loader === 'forge' ? 'warning' : 'info'"
              variant="elevated"
            >{{ instance.loader }}</v-chip>
          </v-card-title>
          <v-card-subtitle class="text-secondary">v{{ instance.version }}</v-card-subtitle>
          <v-card-text class="flex-grow-1">
            <div class="info-item">
              <v-icon size="16" class="mr-2">mdi-folder</v-icon>
              <span class="text-caption text-truncate">{{ instance.path }}</span>
            </div>
            <div v-if="instance.createdAt" class="info-item mt-3">
              <v-icon size="16" class="mr-2">mdi-calendar</v-icon>
              <span class="text-caption">{{ new Date(instance.createdAt).toLocaleDateString() }}</span>
            </div>
            <div v-if="instance.mods" class="info-item mt-3">
              <v-icon size="16" class="mr-2">mdi-package-multiple</v-icon>
              <span class="text-caption">{{ instance.mods.length }} mods</span>
            </div>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              @click="minecraftStore.launchInstance(instance.id)"
              @mouseenter="onButtonHover"
              @mouseleave="onButtonHoverOut"
              :disabled="minecraftStore.launching"
              class="launch-btn"
            >
              <v-icon start>mdi-play-circle</v-icon>
              Launch
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              size="small"
              @click="confirmDelete(instance.id)"
              icon
            >
              <v-icon>mdi-trash-can-outline</v-icon>
              <v-tooltip activator="parent">Delete Instance</v-tooltip>
            </v-btn>
          </v-card-actions>
        </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Create Instance Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card color="surface">
        <v-card-title>Create New Instance</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newInstance.name"
            label="Instance Name"
            placeholder="e.g., My Modded Survival"
            outlined
            class="mb-4"
          ></v-text-field>

          <v-select
            v-model="newInstance.version"
            :items="minecraftStore.versions.map(v => v.id)"
            label="Minecraft Version"
            outlined
            class="mb-4"
          ></v-select>

          <v-select
            v-model="newInstance.loader"
            :items="['vanilla', 'forge', 'fabric']"
            label="Loader"
            outlined
            hint="vanilla = no mods, forge = mod support, fabric = lightweight mods"
            persistent-hint
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="createNewInstanceHandler"
            :disabled="!newInstance.name || minecraftStore.loading"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card color="surface">
        <v-card-title>Delete Instance?</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ instanceToDelete?.name }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteConfirm = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteInstance">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useMinecraftStore } from '@/stores/minecraft'
import { useAnimations } from '@/composables/useAnimations'
import { ref, onMounted } from 'vue'
import type { Instance } from '@/stores/minecraft'

const minecraftStore = useMinecraftStore()
const { animateListItems, animateButtonHover, animateButtonHoverOut } = useAnimations()
const showCreateDialog = ref(false)
const showDeleteConfirm = ref(false)
const instanceToDelete = ref<Instance | null>(null)
const instanceCardsRef = ref<HTMLElement[]>([])

const newInstance = ref({
  name: '',
  version: '1.20.1',
  loader: 'vanilla' as const
})

onMounted(async () => {
  await minecraftStore.fetchInstances()
  await minecraftStore.fetchVersions()

  // Set default version if available
  if (minecraftStore.versions.length > 0) {
    newInstance.value.version = minecraftStore.versions[0].id
  }

  // Animate cards on load
  setTimeout(() => {
    if (instanceCardsRef.value.length) {
      animateListItems(instanceCardsRef.value, 0.12)
    }
  }, 100)
})

function createNewInstanceHandler() {
  if (newInstance.value.name.trim()) {
    minecraftStore.createNewInstance(newInstance.value)
    showCreateDialog.value = false
    newInstance.value = { name: '', version: '1.20.1', loader: 'vanilla' }
  }
}

function confirmDelete(instanceId: string) {
  instanceToDelete.value = minecraftStore.instances.find(i => i.id === instanceId) || null
  showDeleteConfirm.value = true
}

async function deleteInstance() {
  if (instanceToDelete.value) {
    await minecraftStore.deleteInstanceById(instanceToDelete.value.id)
    showDeleteConfirm.value = false
    instanceToDelete.value = null
  }
}

function onCardHover(e: Event) {
  animateButtonHover(e.currentTarget as Element)
}

function onCardHoverOut(e: Event) {
  animateButtonHoverOut(e.currentTarget as Element)
}

function onButtonHover(e: Event) {
  animateButtonHover(e.currentTarget as Element)
}

function onButtonHoverOut(e: Event) {
  animateButtonHoverOut(e.currentTarget as Element)
}
</script>

<style scoped>
.instance-card {
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.instance-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 30px 60px rgba(124, 58, 237, 0.25),
              0 0 40px rgba(124, 58, 237, 0.15);
}

.instance-card.selected {
  border: 2px solid rgba(124, 58, 237, 0.8);
  box-shadow: 0 0 30px rgba(124, 58, 237, 0.4),
              inset 0 0 20px rgba(124, 58, 237, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.9;
}

.launch-btn {
  transition: all 0.3s ease;
}

.launch-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);
}
</style>
