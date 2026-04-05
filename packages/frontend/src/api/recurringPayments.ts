import type {
  RecurringPaymentList,
  RecurringPaymentDetail,
  CreateRecurringPaymentRequest,
  UpdateRecurringPaymentRequest,
} from '@subscription-note/shared'

const BASE = '/api/recurring-payments'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchAll(): Promise<RecurringPaymentList> {
  const res = await fetch(BASE)
  return handleResponse<RecurringPaymentList>(res)
}

export async function fetchById(id: string): Promise<RecurringPaymentDetail> {
  const res = await fetch(`${BASE}/${id}`)
  return handleResponse<RecurringPaymentDetail>(res)
}

export async function create(body: CreateRecurringPaymentRequest): Promise<RecurringPaymentDetail> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<RecurringPaymentDetail>(res)
}

export async function update(
  id: string,
  body: UpdateRecurringPaymentRequest,
): Promise<RecurringPaymentDetail> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<RecurringPaymentDetail>(res)
}

export async function cancel(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }
}
