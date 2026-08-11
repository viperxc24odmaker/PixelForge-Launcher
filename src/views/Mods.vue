<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card color="surface">
          <v-card-title>Browse Mods</v-card-title>
          <v-card-subtitle>Search and install mods from CurseForge or Modrinth</v-card-subtitle>
          <v-card-text>
            <v-tabs v-model="activeTab" class="mb-4">
              <v-tab value="curseforge">
                <v-icon start>mdi-folder-search</v-icon>
                CurseForge
              </v-tab>
              <v-tab value="modrinth">
                <v-icon start>mdi-puzzle-search</v-icon>
                Modrinth
              </v-tab>
            </v-tabs>
            <v-text-field
              v-model="searchQuery"
              label="Search mods..."
              outlined
              prepend-inner-icon="mdi-magnify"
              @keyup.enter="search"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- CurseForge Tab -->
    <v-row v-show="activeTab === 'curseforge'">
      <v-col cols="12">
        <v-card color="surface">
          <v-card-text class="text-center py-16">
            <v-icon size="64" color="primary" class="mb-4">mdi-folder-search</v-icon>
            <p class="text-subtitle1 mb-2">CurseForge Integration</p>
            <p class="text-caption mb-6">Browse and install mods directly from CurseForge</p>
            <v-btn
              color="primary"
              @click="searchCurseForge"
              :disabled="!searchQuery"
              :loading="loading"
            >
              Search on CurseForge
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modrinth Tab -->
    <v-row v-show="activeTab === 'modrinth'">
      <v-col cols="12">
        <v-card color="surface">
          <v-card-text class="text-center py-16">
            <v-icon size="64" color="secondary" class="mb-4">mdi-puzzle-search</v-icon>
            <p class="text-subtitle1 mb-2">Modrinth Integration</p>
            <p class="text-caption mb-6">Browse lightweight mods from Modrinth</p>
            <v-btn
              color="secondary"
              @click="searchModrinth"
              :disabled="!searchQuery"
              :loading="loading"
            >
              Search on Modrinth
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Results Grid -->
    <v-row v-if="searchResults.length > 0" class="mt-4">
      <v-col v-for="mod in searchResults" :key="mod.id" cols="12" md="6" lg="4">
        <v-card color="surface">
          <v-card-title class="text-subtitle2">{{ mod.name }}</v-card-title>
          <v-card-subtitle class="text-caption">
            by {{ mod.author }}
          </v-card-subtitle>
          <v-card-text>
            <p class="text-caption mb-2">{{ mod.description }}</p>
            <v-chip size="small" class="mr-2">{{ mod.downloads }} downloads</v-chip>
            <v-rating
              :model-value="mod.rating"
              readonly
              half-increments
              size="small"
              color="warning"
            ></v-rating>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="tonal" size="small" disabled>
              Install
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon href="#" target="_blank" size="small">
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Info -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-alert type="info" title="Coming Soon">
          Full mod browsing and one-click installation will be available in the next release. For now,
          you can manually add mods to your instance folder at <code>~/.pixelforge/instances/[name]/mods</code>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('curseforge')
const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref<any[]>([])

// Mock data for demonstration
const mockMods = [
  {
    id: '1',
    name: 'JEI (Just Enough Items)',
    author: 'mezz',
    description: 'One of the most popular mods of all time.',
    downloads: 123456789,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Sodium',
    author: 'CaffeineMC',
    description: 'A modern rendering engine and client-side optimization mod.',
    downloads: 98765432,
    rating: 4.9
  },
  {
    id: '3',
    name: 'Lithium',
    author: 'CaffeineMC',
    description: 'No-compromises game logic optimization mod.',
    downloads: 87654321,
    rating: 4.8
  }
]

function search() {
  if (!searchQuery.value) return
  searchResults.value = mockMods.filter(
    m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
         m.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

function searchCurseForge() {
  loading.value = true
  setTimeout(() => {
    search()
    loading.value = false
  }, 500)
}

function searchModrinth() {
  loading.value = true
  setTimeout(() => {
    search()
    loading.value = false
  }, 500)
}
</script>
