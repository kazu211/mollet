<template>
  <v-app-bar color="primary" elevation="2">
    <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none" />

    <v-toolbar-title class="d-flex align-center">
      <v-icon icon="mdi-wallet" class="mr-2" />
      Mollet
    </v-toolbar-title>

    <v-spacer />

    <v-btn variant="text" prepend-icon="mdi-logout" @click="$emit('logout')">
      ログアウト
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  logout: []
}>()

const drawer = ref(false)
</script>

