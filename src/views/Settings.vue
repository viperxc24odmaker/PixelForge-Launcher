<template>
  <v-container fluid class="pa-6">
    <v-row>
      <!-- Game Settings -->
      <v-col cols="12" md="8">
        <v-card color="surface" class="mb-6">
          <v-card-title>Game Settings</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="settings.javaPath"
              label="Java Executable"
              outlined
              hint="Leave empty for auto-detection"
              persistent-hint
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="settings.gameDir"
              label="Game Directory"
              outlined
              hint="Path to .minecraft folder"
              persistent-hint
              class="mb-4"
            ></v-text-field>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="settings.ram.min"
                  type="number"
                  label="Min RAM (MB)"
                  outlined
                  :min="512"
                  :step="256"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="settings.ram.max"
                  type="number"
                  label="Max RAM (MB)"
                  outlined
                  :min="1024"
                  :step="256"
                  hint="Recommended: 4096 - 8192"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Launcher Settings -->
        <v-card color="surface" class="mb-6">
          <v-card-title>Launcher Settings</v-card-title>
          <v-card-text>
            <v-switch
              v-model="settings.autoUpdate"
              label="Auto-update launcher"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="settings.closeAfterLaunch"
              label="Close launcher after starting game"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-select
              v-model="settings.theme"
              :items="['dark', 'light']"
              label="Theme"
              outlined
            ></v-select>
          </v-card-text>
        </v-card>

        <!-- Actions -->
        <v-card color="surface">
          <v-card-title>Actions</v-card-title>
          <v-card-text>
            <v-btn color="warning" variant="outlined" class="mb-2">
              <v-icon start>mdi-folder-open</v-icon>
              Open Game Directory
            </v-btn>
            <v-btn color="error" variant="outlined" class="mb-2 ml-2">
              <v-icon start>mdi-refresh</v-icon>
              Reset to Defaults
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Info Sidebar -->
      <v-col cols="12" md="4">
        <!-- System Info -->
        <v-card color="surface" class="mb-6">
          <v-card-title>System Information</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title class="text-caption">Launcher Version</v-list-item-title>
                <v-list-item-subtitle class="text-caption">v1.0.0</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption">Java</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ javaVersion }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-caption">Total RAM</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ totalRam }} GB</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Data Location -->
        <v-card color="surface">
          <v-card-title>Data Location</v-card-title>
          <v-card-text class="text-caption">
            <p class="mb-2">
              <strong>Launcher Data:</strong><br />
              <code>~/.pixelforge</code>
            </p>
            <v-btn size="small" variant="text" @click="openDataDir">
              Open Data Folder
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Save Button -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-btn color="primary" size="large" @click="saveSettings" :loading="saving">
          <v-icon start>mdi-content-save</v-icon>
          Save Settings
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const settings = ref({
  javaPath: '',
  gameDir: '',
  ram: {
    min: 1024,
    max: 4096
  },
  autoUpdate: true,
  closeAfterLaunch: false,
  theme: 'dark'
})

const saving = ref(false)
const javaVersion = ref('Auto-detected')
const totalRam = ref('N/A')

onMounted(async () => {
  // Load settings from localStorage if available
  const saved = localStorage.getItem('launcherSettings')
  if (saved) {
    settings.value = JSON.parse(saved)
  }

  // Fetch system info via IPC (main process has access to os module)
  try {
    const info = await window.electron?.system?.getInfo?.()
    if (info) {
      totalRam.value = info.totalRamGB
      javaVersion.value = info.javaVersion
    }
  } catch {
    // IPC not wired yet, defaults will show
  }
})

function saveSettings() {
  saving.value = true
  setTimeout(() => {
    localStorage.setItem('launcherSettings', JSON.stringify(settings.value))
    saving.value = false
    console.log('Settings saved')
  }, 500)
}

function openDataDir() {
  console.log('Open data directory')
}
</script>
