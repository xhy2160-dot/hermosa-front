<template>
  <section class="home-nav">
    <div class="home-nav__header">
      <div>
        <p class="home-nav__eyebrow">Hermosa</p>
        <h1 class="home-nav__title">{{greeting}}{{ userName ? `, ${userName}` : '' }}!</h1>
        <p class="home-nav__subtitle">Where would you like to go?</p>
      </div>
      <div class="home-nav__header-actions">
        <div class="home-nav__date">
          <span class="home-nav__date-day">{{ today.day }}</span>
          <span class="home-nav__date-label">{{ today.label }}</span>
        </div>
        <button class="home-nav__logout-btn" @click="handleLogout" title="Log out">
          <component :is="IconLogout" class="home-nav__logout-icon" />
          <span>Log out</span>
        </button>
      </div>
    </div>

    <div class="home-nav__grid">
      <NavCard
          v-for="card in cards"
          :key="card.to"
          v-bind="card"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavCard from "@/components/NavCard.vue";
import { useAuthStore } from "@/stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();
const userName = authStore.user?.name;

const handleLogout = async () => {
    await authStore.logout();
    await router.push('/login');
};

const greeting = computed(() => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
});

// ── Icons (inline SVG components) ────────────────────────────
const IconLogout = {
  template: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 14l4-4m0 0l-4-4m4 4H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 3H5a2 2 0 00-2 2v10a2 2 0 002 2h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}

const IconCalendar = {
  template: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M3 8h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M7 2v3M13 2v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="6" y="11" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="9" y="11" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="12" y="11" width="2" height="2" rx="0.5" fill="currentColor"/>
  </svg>`
}

const IconChart = {
  template: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 14l4-4 3 3 4-5 3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 17h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}

const IconUsers = {
  template: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/>
    <path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M14 5a3 3 0 010 6M18 17c0-2.5-1.5-4.5-4-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
}

// ── Cards config ──────────────────────────────────────────────
const cards = [
  {
    to: '/customer-profile',
    icon: IconChart,
    label: 'Customers and treatments',
    title: 'Customer Profile',
    description: 'Add and edit a customer or a treatment',
    accent: '#2563eb',
    stats: [
      { value: '94%', label: 'uptime' },
      { value: '↑ 12%', label: 'vs last mo.' },
    ]
  },
  {
    to: '/staff',
    icon: IconUsers,
    label: 'People',
    title: 'Team',
    description: 'Directory, roles, and availability for your whole team.',
    accent: '#d97706',
    stats: [
      { value: '24', label: 'members' },
      { value: '19', label: 'active' },
    ]
  },
  {
    to: '/calendar',
    icon: IconCalendar,
    label: 'Schedule',
    title: 'Calendar',
    description: 'Appointments, all about appointments.',
    accent: '#7c3aed',
    stats: [
      { value: '3', label: 'today' },
      { value: '18', label: 'this week' },
    ]
  }
]

// ── Date header ───────────────────────────────────────────────
const today = computed(() => {
  const d = new Date()
  return {
    day: d.getDate(),
    label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short' }).toUpperCase()
  }
})
</script>

<style scoped>
.home-nav {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Header ─────────────────────────────────────────────── */
.home-nav__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36px;
  gap: 16px;
}

.home-nav__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-nav__logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-nav__logout-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.home-nav__logout-icon {
  width: 16px;
  height: 16px;
}

.home-nav__eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 0 8px;
}

.home-nav__title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.home-nav__subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.home-nav__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e5e9ef;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  width: 56px;
}

.home-nav__date-day {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1;
  padding: 8px 0 6px;
  font-variant-numeric: tabular-nums;
}

.home-nav__date-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffffff;
  background: #111827;
  width: 100%;
  text-align: center;
  padding: 4px 0;
}

/* ── Grid ───────────────────────────────────────────────── */
.home-nav__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* Last card spans full width if odd count */
.home-nav__grid > *:last-child:nth-child(odd) {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .home-nav__grid {
    grid-template-columns: 1fr;
  }

  .home-nav__grid > *:last-child:nth-child(odd) {
    grid-column: auto;
  }

  .home-nav__title {
    font-size: 22px;
  }
}
</style>