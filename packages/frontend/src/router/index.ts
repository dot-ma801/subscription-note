import { createRouter, createWebHistory } from 'vue-router'
import RecurringPaymentListView from '@/views/RecurringPaymentListView.vue'
import RecurringPaymentDetailView from '@/views/RecurringPaymentDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: RecurringPaymentListView },
    { path: '/:id', component: RecurringPaymentDetailView },
  ],
})

export default router
