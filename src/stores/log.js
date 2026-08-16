import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPaginatedLogs } from '@/api/index.js'

export const useActivityLogStore = defineStore('activityLog', () => {
    const logs = ref([])
    const page = ref(1)
    const limit = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const hasMore = ref(true)

    const normalizeLogPayload = (payload) => {
        if (Array.isArray(payload)) {
            return { entries: payload, total: payload.length }
        }

        if (payload && typeof payload === 'object') {
            const entrySources = [payload.data, payload.logs, payload.items, payload.list].find(Array.isArray)
            const entries = Array.isArray(entrySources) ? entrySources : []
            const totalValue = Number.isFinite(payload.total)
                ? payload.total
                : Number.isFinite(payload.count)
                    ? payload.count
                    : Number.isFinite(payload.totalCount)
                        ? payload.totalCount
                        : entries.length

            return { entries, total: totalValue }
        }

        return { entries: [], total: 0 }
    }

    const fetchLogs = async () => {
        if (loading.value || !hasMore.value) return

        loading.value = true
        try {
            const res = await getPaginatedLogs({ page: page.value, limit: limit.value })
            const { entries, total: totalCount } = normalizeLogPayload(res)

            logs.value.push(...entries)
            total.value = totalCount

            if (entries.length < limit.value || logs.value.length >= totalCount) {
                hasMore.value = false
            } else {
                page.value += 1
            }
        } catch (err) {
            console.error('Error fetching activity logs:', err)
        } finally {
            loading.value = false
        }
    }

    const resetLogs = () => {
        logs.value = []
        page.value = 1
        total.value = 0
        hasMore.value = true
        loading.value = false
    }

    return {
        logs,
        total,
        loading,
        hasMore,
        fetchLogs,
        resetLogs
    }
})