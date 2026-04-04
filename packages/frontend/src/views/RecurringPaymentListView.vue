<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '@/api/recurringPayments'
import type { RecurringPaymentListItem } from '@subscription-note/shared'

const router = useRouter()
const payments = ref<RecurringPaymentListItem[]>([])
const error = ref<string | null>(null)
const showForm = ref(false)

const form = ref({
  name: '',
  price: '',
  intervalType: 'month' as 'month' | 'quarter' | 'year',
  frequency: '1',
  day: '1',
  month: '',
  memo: '',
})
const formError = ref<string | null>(null)
const submitting = ref(false)

async function load() {
  error.value = null
  try {
    payments.value = await api.fetchAll()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '取得に失敗しました'
  }
}

async function submit() {
  formError.value = null
  submitting.value = true
  try {
    await api.create({
      name: form.value.name,
      price: Number(form.value.price),
      billingInterval: {
        intervalType: form.value.intervalType,
        frequency: Number(form.value.frequency),
        day: Number(form.value.day),
        ...(form.value.intervalType === 'year' ? { month: Number(form.value.month) } : {}),
      },
      memo: form.value.memo,
    })
    showForm.value = false
    form.value = { name: '', price: '', intervalType: 'month', frequency: '1', day: '1', month: '', memo: '' }
    await load()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : '作成に失敗しました'
  } finally {
    submitting.value = false
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ja-JP')
}

function formatInterval(item: RecurringPaymentListItem) {
  // nextBillingDate から周期は表示できないので一覧では省略
  return item.status === 'cancelled' ? 'キャンセル済' : '利用中'
}

onMounted(load)
</script>

<template>
  <div style="max-width: 900px; margin: 0 auto; padding: 24px; font-family: sans-serif">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
      <h1 style="margin: 0">定期支払い一覧</h1>
      <button @click="showForm = !showForm" style="padding: 8px 16px; cursor: pointer">
        {{ showForm ? 'キャンセル' : '+ 新規追加' }}
      </button>
    </div>

    <!-- 作成フォーム -->
    <div v-if="showForm" style="border: 1px solid #ccc; border-radius: 6px; padding: 16px; margin-bottom: 24px; background: #f9f9f9">
      <h2 style="margin-top: 0">新規追加</h2>
      <form @submit.prevent="submit" style="display: grid; gap: 12px">
        <label>
          名前 <span style="color:red">*</span><br />
          <input v-model="form.name" required style="width: 100%; padding: 6px; box-sizing: border-box" />
        </label>
        <label>
          金額（円）<span style="color:red">*</span><br />
          <input v-model="form.price" type="number" min="1" required style="width: 100%; padding: 6px; box-sizing: border-box" />
        </label>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px">
          <label>
            周期タイプ<br />
            <select v-model="form.intervalType" style="width: 100%; padding: 6px">
              <option value="month">月払い</option>
              <option value="quarter">四半期払い</option>
              <option value="year">年払い</option>
            </select>
          </label>
          <label>
            頻度<br />
            <input v-model="form.frequency" type="number" min="1" required style="width: 100%; padding: 6px; box-sizing: border-box" />
          </label>
          <label>
            引き落とし日<br />
            <input v-model="form.day" type="number" min="1" max="31" required style="width: 100%; padding: 6px; box-sizing: border-box" />
          </label>
        </div>
        <label v-if="form.intervalType === 'year'">
          引き落とし月<span style="color:red">*</span><br />
          <input v-model="form.month" type="number" min="1" max="12" required style="width: 100%; padding: 6px; box-sizing: border-box" />
        </label>
        <label>
          メモ<br />
          <textarea v-model="form.memo" style="width: 100%; padding: 6px; box-sizing: border-box; height: 60px" />
        </label>
        <p v-if="formError" style="color: red; margin: 0">{{ formError }}</p>
        <button type="submit" :disabled="submitting" style="padding: 8px 16px; cursor: pointer; justify-self: start">
          {{ submitting ? '作成中...' : '作成' }}
        </button>
      </form>
    </div>

    <p v-if="error" style="color: red">{{ error }}</p>

    <table v-if="payments.length > 0" style="width: 100%; border-collapse: collapse">
      <thead>
        <tr style="background: #f0f0f0">
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd">名前</th>
          <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd">金額</th>
          <th style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd">次回支払日</th>
          <th style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd">状態</th>
          <th style="padding: 8px; border-bottom: 1px solid #ddd"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="p in payments"
          :key="p.id"
          style="border-bottom: 1px solid #eee"
          :style="p.status === 'cancelled' ? { color: '#999' } : {}"
        >
          <td style="padding: 8px">{{ p.name }}</td>
          <td style="padding: 8px; text-align: right">¥{{ p.price.toLocaleString() }}</td>
          <td style="padding: 8px; text-align: center">{{ formatDate(p.nextBillingDate) }}</td>
          <td style="padding: 8px; text-align: center">{{ formatInterval(p) }}</td>
          <td style="padding: 8px; text-align: right">
            <button @click="router.push(`/${p.id}`)" style="padding: 4px 10px; cursor: pointer">
              詳細
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!error">支払いが登録されていません。</p>
  </div>
</template>
