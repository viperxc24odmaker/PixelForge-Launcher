<template>
  <v-app theme="dark" class="bg-dark">
    <v-app-bar color="surface">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>PixelForge Launcher</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/settings">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item to="/" title="Home" prepend-icon="mdi-home"></v-list-item>
        <v-list-item to="/instances" title="Instances" prepend-icon="mdi-folder"></v-list-item>
        <v-list-item to="/mods" title="Mods" prepend-icon="mdi-puzzle"></v-list-item>
        <v-list-item to="/settings" title="Settings" prepend-icon="mdi-cog"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(false)
</script>

<style scoped>
.bg-dark {
  background-color: #0f0f23;
}
</style>
