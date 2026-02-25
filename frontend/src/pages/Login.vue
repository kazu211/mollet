<template>
  <v-container class="login-container fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6" elevation="8">
          <v-card-title class="text-center text-h5 mb-4">
            <v-icon icon="mdi-wallet" size="large" class="mr-2" color="primary" />
            Mollet
          </v-card-title>
          <v-card-subtitle class="text-center mb-6">
            家計簿管理アプリ
          </v-card-subtitle>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="password"
              type="password"
              label="パスワード"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :error-messages="errorMessage"
              :disabled="isLoading"
              required
              autofocus
              @keyup.enter="handleLogin"
            />

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="isLoading"
              :disabled="!password"
              class="mt-4"
            >
              ログイン
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!password.value) {
    errorMessage.value = 'パスワードを入力してください'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(password.value)
    router.push('/dashboard')
  } catch (err) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'ログインに失敗しました'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style>

