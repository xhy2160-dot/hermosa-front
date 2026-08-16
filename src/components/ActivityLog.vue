<template>
  <div class="activity-log">

    <!-- Header -->
    <div class="al__header">
      <div class="al__header-left">
        <span class="al__eyebrow">System</span>
        <h2 class="al__title">Activity Log</h2>
      </div>
      <div class="al__count" v-if="logs.length">
        {{ logs.length }} of {{ total }} entries
      </div>
    </div>

    <!-- Log list -->
    <div class="al__list" ref="listRef">

      <TransitionGroup name="log-item" tag="div">
        <div
            v-for="log in logs"
            :key="log.id"
            class="al__entry"
            :class="`al__entry--${log.type}`"
        >
          <!-- Left: icon + connector line -->
          <div class="al__track">
            <div class="al__icon-wrap">
              <component :is="iconFor(log.type)" class="al__icon" />
            </div>
            <div class="al__line" />
          </div>

          <!-- Right: content -->
          <div class="al__content">
            <div class="al__meta">
              <span class="al__actor">{{ log.actor }}</span>
              <span class="al__verb">{{ log.verb }}</span>
              <span class="al__object" v-html="log.object" />
            </div>
            <time class="al__time" :datetime="log.createdAt">
              {{ formatLocalTime(log.createdAt) }}
            </time>
          </div>
        </div>
      </TransitionGroup>

      <!-- Sentinel element — triggers load when visible -->
      <div ref="sentinelRef" class="al__sentinel">
        <span v-if="loading" class="al__loading">
          <span class="al__spinner" />
          Loading more…
        </span>
        <span v-else-if="allLoaded" class="al__end">
          All caught up
        </span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useActivityLogStore } from '@/stores/log.js'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

const formatLocalTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
// ── Icon components (inline SVG) ──────────────────────────
const IconAdded = {
  template: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M2 7h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M6 1v3M10 1v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M8 9.5v3M6.5 11h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`
}

const IconCancelled = {
  template: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M2 7h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M6 1v3M10 1v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M6.5 10.5l3 3M9.5 10.5l-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`
}

const IconEdited = {
  template: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 3.5l3 3-7 7H2.5v-3l7-7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M8 5l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`
}

const IconLogin = {
  template: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M10.5 11L14 8l-3.5-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 8H6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`
}

const IconSystem = {
  template: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M8 5v3l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

const iconFor = (type) => {
  const map = {
    added:     IconAdded,
    cancelled: IconCancelled,
    edited:    IconEdited,
    login:     IconLogin,
    system:    IconSystem,
  }
  return map[type] ?? IconSystem
}

// ── Store Integration ────────────────────────────────────
const logStore = useActivityLogStore()
const { logs, total, loading, hasMore } = storeToRefs(logStore)

const allLoaded = computed(() => !hasMore.value && logs.value.length > 0)

// ── Infinite Scroll Observer ─────────────────────────────
const sentinelRef = ref(null)
let observer = null
let refreshTimer = null

const reloadLogs = async () => {
  logStore.resetLogs()
  await logStore.fetchLogs()
}

onMounted(async () => {
  await reloadLogs()

  observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          logStore.fetchLogs()
        }
      },
      { threshold: 0.1 }
  )

  if (sentinelRef.value) observer.observe(sentinelRef.value)

  refreshTimer = window.setInterval(() => {
    reloadLogs()
  }, REFRESH_INTERVAL_MS)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
/* ── Shell ──────────────────────────────────────────────── */
.activity-log {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e5e9ef;
  border-radius: 10px;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Header ─────────────────────────────────────────────── */
.al__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #f1f5f9;
}

.al__header-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.al__eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
}

.al__title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.al__count {
  font-size: 12px;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

/* ── List ───────────────────────────────────────────────── */
.al__list {
  padding: 8px 0 4px;
  overflow-y: auto;
  max-height: 560px;
}

/* ── Entry row ──────────────────────────────────────────── */
.al__entry {
  display: flex;
  gap: 0;
  padding: 0 20px;
  min-height: 56px;
}

/* ── Track (icon + vertical line) ───────────────────────── */
.al__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
  margin-right: 12px;
  padding-top: 14px;
}

.al__icon-wrap {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid;
}

.al__icon {
  width: 13px;
  height: 13px;
}

.al__line {
  width: 1px;
  flex: 1;
  min-height: 12px;
  margin-top: 4px;
  background: #e5e9ef;
}

/* Hide line on last entry */
.al__entry:last-of-type .al__line {
  display: none;
}

/* ── Type colours ───────────────────────────────────────── */
.al__entry--added .al__icon-wrap {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

.al__entry--cancelled .al__icon-wrap {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.al__entry--edited .al__icon-wrap {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.al__entry--login .al__icon-wrap {
  background: #fafaf9;
  border-color: #e5e7eb;
  color: #6b7280;
}

.al__entry--system .al__icon-wrap {
  background: #fdf4ff;
  border-color: #e9d5ff;
  color: #7e22ce;
}

/* ── Content ────────────────────────────────────────────── */
.al__content {
  flex: 1;
  padding: 12px 0 14px;
  border-bottom: 1px solid #f8fafc;
  min-width: 0;
}

.al__entry:last-of-type .al__content {
  border-bottom: none;
}

.al__meta {
  font-size: 13.5px;
  color: #374151;
  line-height: 1.45;
  flex-wrap: wrap;
  display: inline;
}

.al__actor {
  font-weight: 600;
  color: #111827;
  margin-right: 3px;
}

.al__verb {
  color: #6b7280;
  margin-right: 3px;
}

.al__object {
  color: #374151;
  display: inline;
}

.al__object :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.al__time {
  display: block;
  font-size: 11.5px;
  color: #9ca3af;
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
}

/* ── Sentinel / loading / end ───────────────────────────── */
.al__sentinel {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.al__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #9ca3af;
}

.al__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e9ef;
  border-top-color: #6b7280;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.al__end {
  font-size: 12px;
  color: #d1d5db;
  letter-spacing: 0.03em;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Transition ─────────────────────────────────────────── */
.log-item-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.log-item-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>