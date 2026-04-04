<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as api from '@/api/recurringPayments'
import type { RecurringPaymentDetail } from '@subscription-note/shared'

const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const payment = ref<RecurringPaymentDetail | null>(null)
const error = ref<string | null>(null)
const saving = ref(false)
const cancelling = ref(false)
const saveError = ref<string | null>(null)

const form = ref({
  name: '',
  price: '',
  intervalType: 'month' as 'month' | 'quarter' | 'year',
  frequency: '1',
  day: '1',
  month: '',
  status: 'active' as 'active' | 'cancelled',
  memo: '',
})

const isCancelled = computed(() => payment.value?.status === 'cancelled')

async function load() {
  error.value = null
  try {
    const data = await api.fetchById(id)
    payment.value = data
    form.value = {
      name: data.name,
      price: String(data.price),
      intervalType: data.billingInterval.intervalType,
      frequency: String(data.billingInterval.frequency),
      day: String(data.billingInterval.day),
      month: data.billingInterval.month != null ? String(data.billingInterval.month) : '',
      status: data.status,
      memo: data.memo,
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '取得に失敗しました'
  }
}

async function save() {
  saveError.value = null
  saving.value = true
  try {
    await api.update(id, {
      name: form.value.name,
      price: Number(form.value.price),
      billingInterval: {
        intervalType: form.value.intervalType,
        frequency: Number(form.value.frequency),
        day: Number(form.value.day),
        ...(form.value.intervalType === 'year' ? { month: Number(form.value.month) } : {}),
      },
      status: form.value.status,
      memo: form.value.memo,
    })
    await load()
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : '更新に失敗しました'
  } finally {
    saving.value = false
  }
}

async function cancelPayment() {
  if (!confirm('この支払いを解約しますか？')) return
  cancelling.value = true
  try {
    await api.cancel(id)
    await load()
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : '解約に失敗しました'
  } finally {
    cancelling.value = false
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ja-JP')
}

onMounted(load)
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto; padding: 24px; font-family: sans-serif">
    <button @click="router.push('/')" style="margin-bottom: 16px; padding: 6px 12px; cursor: pointer">
      ← 一覧に戻る
    </button>

    <p v-if="error" style="color: red">{{ error }}</p>

    <div v-if="payment">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
        <h1 style="margin: 0">{{ payment.name }}</h1>
        <span
          :style="isCancelled ? { color: '#999', fontSize: '14px' } : { color: 'green', fontSize: '14px' }"
        >
          {{ isCancelled ? 'キャンセル済' : '利用中' }}
        </span>
      </div>

      <p style="color: #666; font-size: 14px; margin-bottom: 24px">
        次回支払日：{{ formatDate(payment.nextBillingDate) }}
        　登録日：{{ formatDate(payment.createdAt) }}
      </p>

      <form @submit.prevent="save" style="display: grid; gap: 12px">
        <label>
          名前 <span style="color:red">*</span><br />
          <input v-model="form.name" required :disabled="isCancelled" style="width: 100%; padding: 6px; box-sizing: border-box" />
        </label>
        <label>
          金額（円）<span style="color:red">*</span><br />
          <input v-model="form.price" type="number" min="1" required :disabled="isCancelled" style="width: 100%; padding: 6px; box-sizing: border-box" />
        </label>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px">
          <label>
            周期タイプ<br />
            <select v-model="form.intervalType" :disabled="isCancelled" style="width: 100%; padding: 6px">
              <option value="month">月払い</option>
              <option value="quarter">四半期払い</option>
              <option value="year">年払い</option>
            </select>
          </label>
          <label>
            頻度<br />
            <input v-model="form.frequency" type="number" min="1" required :disabled="isCancelled" style="width: 100%; padding: 6px; box-sizing: border-box" />
          </label>
          <label>
            引き落とし日<br />
            <input v-model="form.day" type="number" min="1" max="31" required :disabled="isCancelled" style="width: 100%; padding: 6px; box-sizing: border-box" />
          </label>
        </div>
        <label v-if="form.intervalType === 'year'">
          引き落とし月<span style="color:red">*</span><br />
          <input v-model="form.month" type="number" min="1" max="12" required :disabled="isCancelled" style="width: 100%; padding: 6px; box-sizing: border-box" />
        </label>
        <label>
          メモ<br />
          <textarea v-model="form.memo" :disabled="isCancelled" style="width: 100%; padding: 6px; box-sizing: border-box; height: 60px" />
        </label>

        <p v-if="saveError" style="color: red; margin: 0">{{ saveError }}</p>

        <div style="display: flex; gap: 8px">
          <button
            type="submit"
            :disabled="saving || isCancelled"
            style="padding: 8px 16px; cursor: pointer"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button
            v-if="!isCancelled"
            type="button"
            @click="cancelPayment"
            :disabled="cancelling"
            style="padding: 8px 16px; cursor: pointer; color: red; border-color: red"
          >
            {{ cancelling ? '解約中...' : '解約する' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
