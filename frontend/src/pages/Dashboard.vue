<template>
  <div>
    <LayoutHeader @logout="handleLogout" />

    <v-main>
      <v-container class="mt-4">
        <v-row>
          <v-col cols="12">
            <h1 class="text-h4 mb-4">ダッシュボード</h1>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-card color="error" variant="tonal">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-arrow-down-bold" class="mr-2" />
                本月の支出
              </v-card-title>
              <v-card-text class="text-h4 font-weight-bold">
                ¥{{ formatNumber(summary.totalExpense) }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card color="success" variant="tonal">
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-arrow-up-bold" class="mr-2" />
                本月の収入
              </v-card-title>
              <v-card-text class="text-h4 font-weight-bold">
                ¥{{ formatNumber(summary.totalIncome) }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>収支バランス</v-card-title>
              <v-card-text>
                <span
                  class="text-h5 font-weight-bold"
                  :class="balance >= 0 ? 'text-success' : 'text-error'"
                >
                  {{ balance >= 0 ? '+' : '' }}¥{{ formatNumber(balance) }}
                </span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LayoutHeader from '@/components/LayoutHeader.vue'

const router = useRouter()
const authStore = useAuthStore()

// Phase 1では仮のサマリーデータ（Phase 2以降でAPI連携）
const summary = reactive({
  month: '2026-02',
  totalIncome: 0,
  totalExpense: 0
})

const balance = computed(() => summary.totalIncome - summary.totalExpense)

const formatNumber = (num: number): string => {
  return num.toLocaleString('ja-JP')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

