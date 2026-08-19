<!-- views/TreatmentManagement.vue -->
<template>
  <div class="treatment-management">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div>
            <h1 class="header-title">Treatment Management</h1>
            <p class="header-subtitle">Manage patient treatments and appointments</p>
          </div>
          <div class="header-actions">
            <button v-if="canEdit" @click="openCustomerModal" class="btn-primary">
              <span class="btn-icon">👤</span>
              Add New Customer
            </button>
            <button v-if="canEdit" @click="openCreateModal" class="btn-primary">
              <span class="btn-icon">+</span>
              Add Treatment Package
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Search Section -->
        <div class="search-section">
          <div class="search-card">
            <div class="search-wrapper">
              <span class="search-icon">🔍</span>
              <input v-model="searchQuery" type="text" placeholder="Search by customer name, email, or phone..."
                class="search-input" @input="handleSearch" />
              <button v-if="searchQuery" @click="clearSearch" class="clear-btn">×</button>
            </div>

            <!-- Search Results Dropdown -->
            <div v-if="searchResults.length > 0" class="search-results">
              <div v-for="customer in searchResults" :key="customer.id" class="search-result-item"
                @click="selectCustomer(customer)">
                <div class="result-avatar">{{ getInitials(customer.name) }}</div>
                <div class="result-info">
                  <div class="result-name">{{ customer.name }}</div>
                  <div class="result-details">
                    <span>{{ customer.email }}</span>
                    <span class="result-divider">•</span>
                    <span>{{ customer.phone || 'No phone' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="searching && searchResults.length === 0 && searchQuery" class="search-empty">
              <span>No customers found</span>
            </div>
          </div>
        </div>

        <!-- Selected Customer Info -->
        <div v-if="selectedCustomer" class="customer-info-card">
          <div class="customer-info-header">
            <div class="customer-info-left">
              <div class="customer-avatar-large">{{ getInitials(selectedCustomer.name) }}</div>
              <div>
                <h2 class="customer-name">{{ selectedCustomer.name }}</h2>
                <div class="customer-credit-row">
                  <span class="customer-credit-text">Store Credits: ${{ balance }}</span>
                  <button v-if="canEdit" @click="openStoreCreditModal" class="customer-credit-edit-btn"
                    title="Edit store credits">
                    ✏️
                  </button>
                </div>
                <div class="customer-details">
                  <span>{{ selectedCustomer.email }}</span>
                  <span class="divider">•</span>
                  <span>{{ selectedCustomer.phone || 'No phone' }}</span>
                  <span class="divider">•</span>
                  <span class="badge" :class="selectedCustomer.status === 'active' ? 'badge-active' : 'badge-inactive'">
                    {{ selectedCustomer.status }}
                  </span>
                </div>
              </div>
            </div>
            <div class="customer-stats">
              <div class="stat-item">
                <span class="stat-label">Total Visits</span>
                <span class="stat-value">{{ totalVisits || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Treatments</span>
                <span class="stat-value">{{ treatments.length }}</span>
              </div>
              <button v-if="canEdit" @click="editCustomer(selectedCustomer)" class="edit-customer-btn"
                title="Edit Customer">
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>

        <!-- Treatments List -->
        <div v-if="selectedCustomer" class="treatments-section">
          <div class="treatments-header">
            <div class="history-title-group">
              <div class="history-tabs">
                <button class="history-tab" :class="{ active: activeHistoryTab === 'appointments' }"
                  @click="activeHistoryTab = 'appointments'">
                  Appointment History
                </button>
                <button class="history-tab" :class="{ active: activeHistoryTab === 'treatments' }"
                  @click="activeHistoryTab = 'treatments'">
                  Treatment Package History
                </button>
              </div>
            </div>
            <div class="treatments-filters">
              <select v-model="yearFilter" class="filter-select">
                <option value="">All Years</option>
                <option v-for="year in past5years()" :value="year">{{ year }}</option>
              </select>
              <select v-model="statusFilter" class="filter-select">
                <option value="">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
              <button @click="refreshTreatments" class="refresh-btn" title="Refresh">
                ⟳
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="activeHistoryTab === 'treatments' && loadingTreatments" class="loading-state">
            <div class="spinner"></div>
            <p>Loading treatments...</p>
          </div>
          <div v-else-if="activeHistoryTab === 'appointments' && loadingAppointmentHistory" class="loading-state">
            <div class="spinner"></div>
            <p>Loading appointments...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="activeHistoryTab === 'treatments' && filteredTreatments.length === 0" class="empty-state">
            <div class="empty-icon">💊</div>
            <h3 class="empty-title">No treatments found</h3>
            <p class="empty-text">No treatment records to display. You can add a new treatment or adjust the filters</p>
            <button v-if="canEdit" @click="openCreateModal" class="btn-primary empty-btn">
              <span class="btn-icon">+</span>
              Add First Treatment
            </button>
          </div>
          <div v-else-if="activeHistoryTab === 'appointments' && filteredAppointments.length === 0" class="empty-state">
            <div class="empty-icon">📅</div>
            <h3 class="empty-title">No appointments found</h3>
            <p class="empty-text">No appointment records to display for this customer yet.</p>
          </div>

          <!-- Treatments Table -->
          <div v-else-if="activeHistoryTab === 'treatments'" class="table-wrapper">
            <table class="treatments-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>Treatment</th>
                  <th>Appointment History</th>
                  <th>Staff</th>
                  <th>Total</th>
                  <th>Balance</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th>Remark</th>
                  <th v-if="canEdit" class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="treatment in paginatedTreatments" :key="treatment.id" class="table-row">
                  <td>{{ toDateString(treatment.created_at) }}</td>
                  <td>
                    <strong class="treatment-name">{{ treatment.name }}</strong>
                  </td>
                  <!--                  <td class="link-style" @click.stop="showAppointments(treatment.id, treatment.name)">{{-->
                  <!--                    `C${treatment.completed_appointments},S${treatment.total_appointments},T${treatment.total_sessions}`-->
                  <!--                  }}-->
                  <!--                  </td>-->
                  <td class="link-style" @click.stop="showAppointments(treatment.id, treatment.name)">{{
                    `${treatment.completed_appointments}/${treatment.total_sessions}`
                  }}
                  </td>
                  <td>{{ treatment.staff_name || 'Unassigned' }}</td>
                  <td>${{ treatment.total || '—' }}</td>
                  <td>${{ treatment.balance }}</td>
                  <td class="link-style" @click.stop="openPaymentModal(treatment)">${{
                    treatment.appUsed }}</td>
                  <td>
                    <span class="badge-status" :class="getStatusClass(treatment.status)">
                      {{ getStatusLabel(treatment.status) }}
                    </span>
                  </td>
                  <td class="treatment-remark">{{ treatment.remark }}</td>
                  <td v-if="canEdit" class="text-right">
                    <div class="action-buttons">
                      <button @click="openEditModal(treatment)" class="action-btn action-edit" title="Edit">
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Appointments Table -->
          <div v-else class="table-wrapper">
            <table class="treatments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Treatment</th>
                  <th>Staff</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Remark</th>
                  <th v-if="canEdit" class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in paginatedAppointments" :key="appointment.id" class="table-row">
                  <td>{{ toDateString(appointment.date) }}</td>
                  <td>{{ appointment.start_time || '—' }}</td>
                  <td>{{ appointment.end_time || '—' }}</td>
                  <td>
                    <strong class="treatment-name">{{ appointment.treatment_name || 'Untitled treatment' }}</strong>
                  </td>
                  <td>{{ appointment.staff_name || 'Unassigned' }}</td>
                  <td>
                    <select v-model="appointment.status" class="badge-status"
                      :class="getStatusClass(appointment.status)" @change="handleStatusChange(appointment)">
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No-Show</option>
                    </select>
                  </td>
                  <td>
                    {{ Number(appointment.treatment_id) === 0 ? `$${appointment.total_paid}` :
                      `-$${Math.abs(appointment.total_paid)}` }}
                  </td>
                  <td class="treatment-remark">{{ appointment.remark || '—' }}</td>
                  <td v-if="canEdit" class="text-right">
                    <div class="action-buttons">
                      <button @click="openPaymentModal(appointment)" class="action-btn action-edit"
                        title="Add a payment">
                        💲
                      </button>
                      <!--                      <button @click="openEditModal(appointment)" class="action-btn action-edit" title="Edit">-->
                      <!--                        ✏️-->
                      <!--                      </button>-->
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="activeHistoryTab === 'appointments' && filteredAppointments.length > 0" class="pagination-wrapper">
            <span class="pagination-info">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to
              {{ Math.min(currentPage * pageSize, filteredAppointments.length) }} of
              {{ filteredAppointments.length }}
            </span>
            <div class="pagination-controls">
              <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1" class="pagination-btn">
                Previous
              </button>
              <span class="pagination-page">Page {{ currentPage }} of {{ appointmentTotalPages }}</span>
              <button @click="currentPage < appointmentTotalPages && currentPage++"
                :disabled="currentPage === appointmentTotalPages" class="pagination-btn">
                Next
              </button>
            </div>
          </div>

          <div v-if="activeHistoryTab === 'treatments' && filteredTreatments.length > 0" class="pagination-wrapper">
            <span class="pagination-info">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to
              {{ Math.min(currentPage * pageSize, filteredTreatments.length) }} of
              {{ filteredTreatments.length }}
            </span>
            <div class="pagination-controls">
              <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1" class="pagination-btn">
                Previous
              </button>
              <span class="pagination-page">Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages"
                class="pagination-btn">
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- No Customer Selected -->
        <div v-else class="no-customer-selected">
          <div class="no-customer-icon">👤</div>
          <h3 class="no-customer-title">Search for a Customer</h3>
          <p class="no-customer-text">
            Use the search bar above to find a customer and view their treatment history.
          </p>
        </div>
      </div>
    </main>

    <!-- Customer Modal -->
    <CustomerModal :visible="showCustomerModal" :mode="customerModalMode" :customer-data="editingCustomerData"
      @close="closeCustomerModal" @success="onCustomerSaved" />

    <div v-if="showStoreCreditModal" class="modal-overlay">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h1 class="modal-title">Edit Store Credits</h1>
          <button @click="closeStoreCreditModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-group">
            <label class="form-label" for="store-credit-editor">Store Credits: </label>
            <input id="store-credit-editor" v-model.number="storeCreditDraft" type="number" step="0.01"
                   class="store-credit-input" placeholder="0.00" />
          </div>

<div class="modal-group">
  <label class="form-label" for="store-credit-remark">Remark: </label>
  <textarea id="store-credit-remark" v-model="storeCreditRemark" type="text" class="store-credit-input"
         placeholder="Add a note for this change" />
</div>
</div>

        <p class="store-credit-note">Note: positive number to add, negative number to deduct.</p>
        <div class="modal-footer">
          <button @click="closeStoreCreditModal" class="btn-cancel">Cancel</button>
          <button @click="saveStoreCredit" class="btn-primary">Save</button>
        </div>
      </div>
    </div>

    <!-- Treatment Modal -->
    <TreatmentModal :visible="showTreatmentModal" :mode="treatmentModalMode" :treatment-data="editingTreatmentData"
      :customer="selectedCustomer" @close="closeTreatmentModal" @success="onTreatmentSaved" />
    <AppointmentsModal :is-open="showAppointmentModal" :treatmentId="treatmentId" :treatmentName="treatmentName"
      @close="showAppointmentModal = false" @refresh="refreshTreatments" />
    <InstallmentModal :is-open="showPaymentModal" :isAdding="isAdding" :id="treatmentId" :flag="paymentModelFlag"
      :treatmentName="treatmentName" :customerId='selectedCustomer?.id' @close="handleCloseModal" />
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">Confirm Delete</h3>
          <button @click="closeDeleteModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="delete-icon">⚠️</div>
          <p class="delete-text">
            Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>?
          </p>
          <p class="delete-subtext">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-cancel">Cancel</button>
          <button @click="deleteTreatment" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTreatmentStore } from '@/stores/treatment';
import { useCustomerStore } from '@/stores/customer';
import { useAuthStore } from '@/stores/auth';
import { useAppointmentStore } from "@/stores/appointment.js";
import { useStoreCredits } from '@/stores/storeCredits.js'
import { useToast } from '@/composables/useToast';
const { showToast } = useToast();
import CustomerModal from '@/components/CustomerModal.vue';
import TreatmentModal from '@/components/TreatmentModal.vue';
import AppointmentsModal from "@/components/AppointmentsModal.vue";
import InstallmentModal from "@/components/InstallmentModal.vue";
import { storeToRefs } from "pinia";
import { past5years } from "@/utils/formatDate.js";

// Stores
const treatmentStore = useTreatmentStore();
const customerStore = useCustomerStore();
const authStore = useAuthStore();
const appointmentStore = useAppointmentStore();
const storeCreditStore = useStoreCredits()

// ============ State ============
// Search
const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);

// Customer
const selectedCustomer = ref(null);
const showCustomerModal = ref(false);
const customerModalMode = ref('create');
const editingCustomerData = ref(null);
const totalVisits = ref(0)
const showStoreCreditModal = ref(false);
const storeCreditDraft = ref(0);
const storeCreditRemark = ref('');

// Treatments
const { treatments } = storeToRefs(treatmentStore);
const loadingTreatments = ref(false);
const loadingAppointmentHistory = ref(false);
const statusFilter = ref('');
const yearFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const activeHistoryTab = ref('appointments');
const appointmentHistory = ref([]);
const appointmentHistoryCustomerId = ref(null);

// Treatment Modal
const showTreatmentModal = ref(false);
const treatmentModalMode = ref('create');
const editingTreatmentData = ref(null);

//appointments modal
const treatmentId = ref(0)
const treatmentName = ref('')
const showAppointmentModal = ref(false);

//payment
const showPaymentModal = ref(false);
const isAdding = ref(false);
const paymentModelFlag = ref(null)

//store credits
const { balance } = storeToRefs(storeCreditStore)

// Delete
const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const loading = ref(false);

// ============ Computed ============
const userRole = computed(() => authStore.user?.role || 'staff');
const canEdit = computed(() => userRole.value === 'admin' || userRole.value === 'manager');

const filteredTreatments = computed(() => {
  let result = treatments.value;
  if (statusFilter.value) {
    result = result.filter(t => t.status === statusFilter.value);
  }
  if (yearFilter.value) {
    result = result.filter(t => {
      if (!t.created_at) return false;
      const yearPart = String(t.created_at).slice(0, 4);
      return yearPart === yearFilter.value;
    });
  }
  return result;
});

const paginatedTreatments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTreatments.value.slice(start, end);
});

const filteredAppointments = computed(() => {
  let result = appointmentHistory.value;
  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value);
  }
  if (yearFilter.value) {
    result = result.filter(item => {
      const rawDate = item.date || item.created_at;
      if (!rawDate) return false;
      const yearPart = String(rawDate).slice(0, 4);
      return yearPart === yearFilter.value;
    });
  }
  return result;
});

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredAppointments.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTreatments.value.length / pageSize.value);
});

const appointmentTotalPages = computed(() => {
  return Math.ceil(filteredAppointments.value.length / pageSize.value);
});

// ============ Utility Methods ============
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const toDateString = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // Forces the output to respect UTC day boundaries
  });
};

const formatTime = (time) => {
  if (!time) return '—';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0.00';
  return parseFloat(amount).toFixed(2);
};

const getTreatmentDisplayName = (item) => {
  if (!item) return 'Untitled treatment';
  return item.name || item.title?.name || item.treatment_name || 'Untitled treatment';
};

const getStoreCreditValue = (customer) => {
  if (!customer) return 0;
  const possibleValue = customer.store_credit ?? customer.storeCredit ?? customer.credit_balance ?? customer.creditBalance ?? customer.balance;
  return possibleValue === null || possibleValue === undefined ? 0 : Number(possibleValue);
};

const getStatusClass = (status) => {
  const map = {
    'in-progress': 'status-progress',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled',
    'no-show': 'status-noshow'
  };
  return map[status] || 'status-progress';
};

const getStatusLabel = (status) => {
  const map = {
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no-show': 'No Show'
  };
  return map[status] || status;
};

// ============ Search Methods ============
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    treatments.value = []
    appointmentHistory.value = []
    selectedCustomer.value = null
    return;
  }

  searching.value = true;
  try {
    const results = await customerStore.searchCustomers(searchQuery.value);
    searchResults.value = results || [];
  } catch (error) {
    console.error('Search error:', error);
    showToast('Failed to search customers', 'error');
  } finally {
    searching.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

const selectCustomer = async (customer) => {
  selectedCustomer.value = customer;
  searchResults.value = [];
  searchQuery.value = customer.name;
  await fetchTreatments(customer.id);
  await loadAppointmentHistory();
  await storeCreditStore.fetchCreditBalance(customer.id);
};

// ============ Customer Modal Methods ============
const openCustomerModal = () => {
  customerModalMode.value = 'create';
  editingCustomerData.value = null;
  showCustomerModal.value = true;
};

const editCustomer = (customer) => {
  customerModalMode.value = 'edit';
  editingCustomerData.value = { ...customer };
  showCustomerModal.value = true;
};

const closeCustomerModal = () => {
  showCustomerModal.value = false;
  editingCustomerData.value = null;
};

const openStoreCreditModal = () => {
  if (!selectedCustomer.value || !canEdit.value) return;
  storeCreditDraft.value = getStoreCreditValue(selectedCustomer.value);
  showStoreCreditModal.value = true;
};

const closeStoreCreditModal = () => {
  showStoreCreditModal.value = false;
  storeCreditDraft.value = 0;
  storeCreditRemark.value = '';
};

const saveStoreCredit = async () => {
  if (!selectedCustomer.value || !canEdit.value) return;
  try {
    const payload = {
      customer_id: selectedCustomer.value.id,
      amount: Number(storeCreditDraft.value || 0),
      type: 'manual',
      remark: storeCreditRemark.value.trim()
    };
    await storeCreditStore.updateCredits(payload)
    closeStoreCreditModal();
  } catch (error) {
    console.error('Failed to update store credits', error);
  }
};

const onCustomerSaved = async (response) => {
  selectedCustomer.value = response;
  closeCustomerModal();
};

// ============ Treatment Methods ============
const loadAppointmentHistory = async () => {
  if (!selectedCustomer.value) {
    appointmentHistory.value = [];
    appointmentHistoryCustomerId.value = null;
    return;
  }
  loadingAppointmentHistory.value = true;
  try {
    appointmentHistory.value = await appointmentStore.fetchAppointmentsByCustomerId(selectedCustomer.value.id)
    const completedAppointments = appointmentHistory.value.filter((item) => {
      const status = String(item.status || '').toLowerCase();
      return status === 'completed'
    });
    totalVisits.value = completedAppointments.length;
    appointmentHistoryCustomerId.value = selectedCustomer.value.id;

  } catch (error) {
    console.error('Failed to load appointment history', error);
    appointmentHistory.value = [];
  } finally {
    loadingAppointmentHistory.value = false;
  }
};

const handleStatusChange = async (appointment) => {
  await appointmentStore.updateAppointment(appointment)
  console.log(appointment)
  await loadAppointmentHistory()
  await fetchTreatments(appointment.customer_id)
}

const fetchTreatments = async (customerId) => {
  loadingTreatments.value = true;
  try {
    await treatmentStore.fetchTreatmentsByCustomer(customerId);
    if (activeHistoryTab.value === 'appointments' && selectedCustomer.value) {
      await loadAppointmentHistory();
    }
  } catch (error) {
    showToast('Failed to load treatments', 'error');
  } finally {
    loadingTreatments.value = false;
  }
};

const refreshTreatments = async () => {
  if (selectedCustomer.value) {
    await fetchTreatments(selectedCustomer.value.id);
    statusFilter.value = '';
    yearFilter.value = '';
  }
};

// ============ Treatment Modal Methods ============
const openCreateModal = () => {
  // Check if customer is selected
  if (!selectedCustomer.value) {
    showToast('Please search and select a customer first', 'warning');
    return;
  }

  treatmentModalMode.value = 'create';
  editingTreatmentData.value = null;
  showTreatmentModal.value = true;
};

const openEditModal = (treatment) => {
  treatmentModalMode.value = 'edit';
  editingTreatmentData.value = { ...treatment };
  showTreatmentModal.value = true;
};

const closeTreatmentModal = () => {
  showTreatmentModal.value = false;
  editingTreatmentData.value = null;
};

const onTreatmentSaved = async () => {
  if (selectedCustomer.value) {
    await fetchTreatments(selectedCustomer.value.id);
  }
  closeTreatmentModal();
};

//=======payment==========

const openPaymentModal = (appointment) => {
  console.log(appointment);
  showPaymentModal.value = true
  treatmentId.value = appointment.id;
  treatmentName.value = getTreatmentDisplayName(appointment);
  if (appointment.total_sessions) {
    paymentModelFlag.value = 'package';
  } else if (parseInt(appointment.treatment_id)) {
    paymentModelFlag.value = 'treatment';
  } else {
    paymentModelFlag.value = 'appointment';
  }
}

//===appointments methods===
const showAppointments = async (id, name) => {
  showAppointmentModal.value = true;
  treatmentId.value = id;
  treatmentName.value = name || 'Untitled treatment';
}

// ============ Delete Methods ============
const confirmDelete = (treatment) => {
  deleteTarget.value = treatment;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteTarget.value = null;
};

const deleteTreatment = async () => {
  if (!deleteTarget.value) return;
  loading.value = true;
  try {
    await treatmentStore.deleteTreatment(deleteTarget.value.id);
    showToast('Treatment deleted successfully!', 'success');
    closeDeleteModal();
    if (selectedCustomer.value) {
      await fetchTreatments(selectedCustomer.value.id);
    }
  } catch (error) {
    showToast('Failed to delete treatment', 'error');
  } finally {
    loading.value = false;
  }
};

const handleCloseModal = async () => {
  showPaymentModal.value = false
  loadAppointmentHistory();
  fetchTreatments(selectedCustomer.value?.id);
}

// ============ Watchers ============
watch([statusFilter, yearFilter], () => {
  currentPage.value = 1;
});

watch(activeHistoryTab, async (tab) => {
  currentPage.value = 1;
  if (tab === 'appointments' && selectedCustomer.value) {
    await loadAppointmentHistory();
  }else{
    await fetchTreatments(selectedCustomer.value.id);
  }
});

</script>

<style scoped>
/* ============================================
   GLOBAL RESET & BASE
   ============================================ */
.treatment-management {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f7f8fa;
  min-height: 100vh;
  color: #1a1a2e;
}

.container {
  max-width: 80%;
  margin: 0 auto;
  padding: 0 24px;
}

/* ============================================
   HEADER
   ============================================ */
.header {
  background: #ffffff;
  border-bottom: 1px solid #e8eaed;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.header-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ============================================
   BUTTONS
   ============================================ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: #ffffff;
  color: #4f46e5;
  border: 1.5px solid #4f46e5;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #4f46e5;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.btn-icon {
  margin-right: 8px;
  font-size: 18px;
  line-height: 1;
}

.btn-cancel {
  padding: 10px 20px;
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-danger {
  padding: 10px 24px;
  background: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: #dc2626;
}

/* ============================================
   HISTORY TABS
   ============================================ */
.history-title-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-tab {
  border: 1px solid #d1d5db;
  background: #f8fafc;
  color: #475569;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-tab:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

.history-tab.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
}

/* ============================================
   SEARCH SECTION
   ============================================ */
.search-section {
  margin-bottom: 24px;
}

.search-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 16px 20px;
  border: 1px solid #e8eaed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  background: #ffffff;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #9ca3af;
  padding: 0 4px;
}

.clear-btn:hover {
  color: #374151;
}

/* ============================================
   SEARCH RESULTS
   ============================================ */
.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 320px;
  overflow-y: auto;
  z-index: 20;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.search-result-item:hover {
  background: #f3f4f6;
}

.result-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 500;
  color: #1a1a2e;
}

.result-details {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.result-divider {
  color: #d1d5db;
}

.result-badge {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.search-empty {
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

/* ============================================
   CUSTOMER INFO CARD
   ============================================ */
.customer-info-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 24px;
  border: 1px solid #e8eaed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.customer-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.customer-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #4f46e5;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.customer-name {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.customer-credit-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 10px;
  font-size: 14px;
  color: #4f46e5;
  font-weight: 600;
}

.customer-credit-text {
  color: #4f46e5;
}

.customer-credit-edit-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.customer-details {
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.divider {
  color: #d1d5db;
}

.customer-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.edit-customer-btn {
  padding: 6px 16px;
  background: transparent;
  color: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-customer-btn:hover {
  background: #4f46e5;
  color: #ffffff;
}

/* ============================================
   BADGES
   ============================================ */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-active {
  background: #ecfdf5;
  color: #065f46;
}

.badge-inactive {
  background: #fef2f2;
  color: #991b1b;
}

/* ============================================
   TREATMENTS SECTION
   ============================================ */
.treatments-section {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e8eaed;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.treatments-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: #f9fafb;
}

.treatments-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.treatments-filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  background: #ffffff;
  cursor: pointer;
}

.refresh-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  background: #f3f4f6;
  transform: rotate(45deg);
}

/* ============================================
   TABLE
   ============================================ */
.table-wrapper {
  overflow-x: auto;
}

.treatments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.treatments-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e8eaed;
}

.treatments-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  white-space: nowrap;
}

.treatments-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-row:hover {
  background: #fafbfc;
}

.table-row:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #9ca3af;
  font-weight: 500;
}

.treatment-name {
  color: #1a1a2e;
}

.link-style {
  color: #2563eb;
  /* 现代科技蓝（类似 Tailwind 的 blue-600） */
  text-decoration: underline;
  /* 下划线 */
  cursor: pointer;
  /* 鼠标悬浮时变为“小手”图标 */
  transition: color 0.2s ease;
}

/* 🖱️ 悬浮状态 */
.link-style:hover {
  color: #1d4ed8;
  /* 悬浮时颜色加深 */
}

.treatment-remark {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.balance-due {
  color: #dc2626;
  font-weight: 500;
}

.balance-paid {
  color: #10b981;
}

/* ============================================
   STATUS BADGES
   ============================================ */
.badge-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-progress {
  background: #fef3c7;
  color: #92400e;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-noshow {
  background: #f3f4f6;
  color: #374151;
}

/* ============================================
   ACTION BUTTONS
   ============================================ */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.action-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.action-edit:hover {
  background: #eef2ff;
}

.action-delete:hover {
  background: #fef2f2;
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination-wrapper {
  padding: 14px 20px;
  border-top: 1px solid #e8eaed;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 4px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-page {
  font-size: 13px;
  color: #374151;
  padding: 0 8px;
}

/* ============================================
   LOADING & EMPTY STATES
   ============================================ */
.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.empty-text {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
}

.no-customer-selected {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e8eaed;
}

.no-customer-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-customer-title {
  font-size: 20px;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.no-customer-text {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

/* ============================================
   STORE CREDIT MODAL
   ============================================ */
.store-credit-input {
  width: 50%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  margin-top: 8px;
}

.store-credit-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.store-credit-note {
  font-size: 12px;
  text-align: center;

}
.modal-group {
  display: flex;
  align-items: center;
  justify-content: center;

}
.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-right:10px;
}

/* ============================================
   DELETE MODAL
   ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal {
  background: #ffffff;
  border-radius: 18px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-sm {
  max-width: 400px;
}

.modal-header {
  padding: 0 10px;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #1a1a2e;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.delete-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.delete-text {
  font-size: 16px;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.delete-subtext {
  font-size: 14px;
  color: #6b7280;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e8eaed;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .header-title {
    font-size: 20px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions button {
    width: 100%;
    justify-content: center;
  }

  .customer-info-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .customer-stats {
    width: 100%;
    justify-content: space-around;
  }

  .treatments-header {
    flex-direction: column;
    align-items: stretch;
  }

  .treatments-filters {
    flex-wrap: wrap;
  }

  .treatments-table {
    font-size: 12px;
  }

  .treatments-table th,
  .treatments-table td {
    padding: 8px 10px;
  }

  .pagination-wrapper {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .search-results {
    max-height: 200px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }

  .customer-info-left {
    flex-wrap: wrap;
  }

  .customer-stats {
    flex-wrap: wrap;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }

  .modal {
    margin: 10px;
  }
}
</style>