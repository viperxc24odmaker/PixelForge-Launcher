<template>
  <v-container fluid class="pa-6 h-100" style="overflow-y: auto">
    <!-- Welcome Banner with Animation -->
    <v-row class="mb-6">
      <v-col cols="12" ref="bannerRef">
        <v-card color="primary" class="welcome-card glow-effect">
          <v-card-title class="text-h4 gradient-text">Welcome to PixelForge Launcher</v-card-title>
          <v-card-text>
            <p class="mb-2 text-subtitle2">Everything you need to play Minecraft, without the clutter.</p>
            <p class="text-caption">Launch your favorite instances, manage mods, and enjoy a clean gaming experience.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Quick Launch Section -->
      <v-col cols="12" md="8">
        <!-- Quick Launch Card -->
        <v-card color="surface" class="mb-6">
          <v-card-title class="text-h6">🚀 Quick Launch</v-card-title>
          <v-card-text>
            <v-row v-if="minecraftStore.hasInstances">
              <v-col
                v-for="(instance, idx) in minecraftStore.instances.slice(0, 3)"
                :key="instance.id"
                cols="12"
                sm="6"
                ref="quickLaunchRef"
              >
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  size="large"
                  @click="minecraftStore.launchInstance(instance.id)"
                  @mouseenter="onButtonHover"
                  @mouseleave="onButtonHoverOut"
                  :disabled="minecraftStore.launching"
                  class="mb-2 launch-btn"
                >
                  <v-icon start>mdi-play-circle</v-icon>
                  {{ instance.name }}
                  <v-chip
                    size="x-small"
                    class="ml-2"
                    :color="instance.loader === 'vanilla' ? 'success' : instance.loader === 'forge' ? 'warning' : 'info'"
                  >
                    {{ instance.version }}
                  </v-chip>
                  <v-tooltip activator="parent">{{ instance.loader }}</v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="12" v-if="minecraftStore.instances.length > 3">
                <v-btn
                  block
                  variant="outlined"
                  to="/instances"
                  @mouseenter="onButtonHover"
                  @mouseleave="onButtonHoverOut"
                  class="view-all-btn"
                >
                  View All Instances
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col cols="12">
                <p class="text-center text-caption mb-4">No instances yet. Create one to get started!</p>
                <v-btn block color="primary" to="/instances"> Create Instance </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Quick Actions Grid -->
        <v-card color="surface">
          <v-card-title class="text-h6">⚡ Quick Actions</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" sm="4" ref="actionsRef">
                <v-btn
                  block
                  variant="tonal"
                  to="/instances"
                  @mouseenter="onButtonHover"
                  @mouseleave="onButtonHoverOut"
                  class="action-btn h-100 flex-column"
                >
                  <div class="text-center">
                    <v-icon size="36" class="mb-2">mdi-folder-multiple</v-icon>
                    <p class="text-caption">Instances</p>
                  </div>
                </v-btn>
              </v-col>
              <v-col cols="6" sm="4">
                <v-btn
                  block
                  variant="tonal"
                  to="/mods"
                  @mouseenter="onButtonHover"
                  @mouseleave="onButtonHoverOut"
                  class="action-btn h-100 flex-column"
                >
                  <div class="text-center">
                    <v-icon size="36" class="mb-2">mdi-puzzle-search</v-icon>
                    <p class="text-caption">Mods</p>
                  </div>
                </v-btn>
              </v-col>
              <v-col cols="6" sm="4">
                <v-btn
                  block
                  variant="tonal"
                  to="/settings"
                  @mouseenter="onButtonHover"
                  @mouseleave="onButtonHoverOut"
                  class="action-btn h-100 flex-column"
                >
                  <div class="text-center">
                    <v-icon size="36" class="mb-2">mdi-cog-outline</v-icon>
                    <p class="text-caption">Settings</p>
                  </div>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Stats Panel -->
      <v-col cols="12" md="4">
        <!-- Statistics Card -->
        <v-card color="surface" class="mb-6">
          <v-card-title class="text-h6">📊 Statistics</v-card-title>
          <v-card-text>
            <v-list density="comfortable">
              <v-list-item>
                <template #prepend>
                  <v-avatar color="primary" icon="mdi-folder-multiple"></v-avatar>
                </template>
                <v-list-item-title>Instances</v-list-item-title>
                <v-list-item-subtitle class="text-primary font-weight-bold">
                  {{ minecraftStore.instances.length }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-avatar color="secondary" icon="mdi-code-braces"></v-avatar>
                </template>
                <v-list-item-title>Versions</v-list-item-title>
                <v-list-item-subtitle class="text-secondary font-weight-bold">
                  {{ minecraftStore.versions.length }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-avatar color="success" icon="mdi-server-network"></v-avatar>
                </template>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip size="small" color="success" label>Ready</v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Info Card -->
        <v-card color="surface" class="glow-effect">
          <v-card-title class="text-h6">ℹ️ About</v-card-title>
          <v-card-text class="text-caption">
            <p class="mb-2"><strong>PixelForge Launcher</strong></p>
            <p class="mb-2"><strong>v1.0.0</strong> • A lightweight Minecraft launcher</p>
            <p class="mb-3">Forge & Fabric support with clean design</p>
            <v-divider class="my-3"></v-divider>
            <p class="text-xs">Built with Electron, Vue 3, and XMCL ❤️</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useMinecraftStore } from '@/stores/minecraft'
import { useAnimations } from '@/composables/useAnimations'
import { onMounted, ref } from 'vue'

const minecraftStore = useMinecraftStore()
const { animateCardIn, animateButtonHover, animateButtonHoverOut, animateListItems } = useAnimations()

const bannerRef = ref<HTMLElement | null>(null)
const quickLaunchRef = ref<HTMLElement[]>([])
const actionsRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await minecraftStore.fetchInstances()
  await minecraftStore.fetchVersions()

  // Stagger animations
  setTimeout(() => {
    if (bannerRef.value) animateCardIn(bannerRef.value)
  }, 100)

  setTimeout(() => {
    if (quickLaunchRef.value?.length) {
      animateListItems(quickLaunchRef.value, 0.15)
    }
  }, 300)
})

const onButtonHover = (e: Event) => {
  animateButtonHover(e.currentTarget as Element)
}

const onButtonHoverOut = (e: Event) => {
  animateButtonHoverOut(e.currentTarget as Element)
}
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
}

.launch-btn {
  position: relative;
  overflow: hidden;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: 12px;
}

h6 {
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
