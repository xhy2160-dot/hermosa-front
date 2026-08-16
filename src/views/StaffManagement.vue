<!-- views/StaffManagement.vue -->
<template>
  <div class="staff-management">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div>
            <h1 class="header-title">Staff Management</h1>
            <p class="header-subtitle">Manage your team members and their roles</p>
          </div>
          <button @click="openCreateModal" class="btn-primary">
            <span class="btn-icon">+</span>
            Add Staff
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Filters & Search -->
        <div class="filters-card">
          <div class="filters-row">
            <div class="filters-left">
              <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search staff..."
                    class="search-input"
                />
              </div>
              <select v-model="statusFilter" class="filter-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div class="filters-right">
              <span class="staff-count">{{ filteredStaff.length }} staff members</span>
              <button @click="refreshList" class="refresh-btn" title="Refresh">
                ⟳
              </button>
            </div>
          </div>
        </div>

        <!-- Staff Table -->
        <div class="table-card">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading staff...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredStaff.length === 0" class="empty-state">
            <div class="empty-icon">👥</div>
            <h3 class="empty-title">No staff members found</h3>
            <p class="empty-text">Get started by adding your first team member.</p>
            <button @click="openCreateModal" class="btn-primary empty-btn">
              <span class="btn-icon">+</span>
              Add Staff
            </button>
          </div>

          <!-- Table -->
          <div v-else class="table-responsive">
            <table class="staff-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="staff in paginatedStaff" :key="staff.id" class="table-row">
                <td class="text-muted">#{{ staff.id }}</td>
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ getInitials(staff.name) }}</div>
                    <span class="user-name">{{ staff.name }}</span>
                  </div>
                </td>
                <td>{{ staff.email }}</td>
                <td>{{ staff.phone || '—' }}</td>
                <td>
                  <span class="badge badge-role">{{ staff.role }}</span>
                </td>
                <td>
                    <span class="badge" :class="staff.status === 'active' ? 'badge-active' : 'badge-inactive'">
                      <span class="status-dot" :class="staff.status === 'active' ? 'dot-active' : 'dot-inactive'"></span>
                      {{ staff.status }}
                    </span>
                </td>
                <td class="text-right">
                  <div class="action-buttons" v-if="user.role==='manager'">
                    <button @click="openEditModal(staff)" class="action-btn action-edit" title="Edit">
                      ✏️
                    </button>
                    <button
                        @click="toggleStatus(staff)"
                        class="action-btn"
                        :class="staff.status === 'active' ? 'action-deactivate' : 'action-activate'"
                        :title="staff.status === 'active' ? 'Deactivate' : 'Activate'"
                    >
                      {{ staff.status === 'active' ? '⏹' : '▶️' }}
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredStaff.length > 0" class="pagination-wrapper">
            <span class="pagination-info">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to
              {{ Math.min(currentPage * pageSize, filteredStaff.length) }} of
              {{ filteredStaff.length }}
            </span>
            <div class="pagination-controls">
              <button
                  @click="currentPage > 1 && currentPage--"
                  :disabled="currentPage === 1"
                  class="pagination-btn"
              >
                Previous
              </button>
              <span class="pagination-page">Page {{ currentPage }} of {{ totalPages }}</span>
              <button
                  @click="currentPage < totalPages && currentPage++"
                  :disabled="currentPage === totalPages"
                  class="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" >
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ modalMode === 'create' ? 'Add Staff' : 'Edit Staff' }}
          </h3>
          <button @click="closeModal" class="modal-close">×</button>
        </div>

        <form  class="modal-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input
                v-model="form.name"
                type="text"
                required
                class="form-input"
                placeholder="John Doe"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
                v-model="form.email"
                type="email"
                required
                class="form-input"
                placeholder="john@example.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Phone</label>
            <input
                v-model="form.phone"
                type="tel"
                class="form-input"
                placeholder="+1 234 567 890"
            />
          </div>

          <div  class="form-group">
            <label class="form-label">Password</label>
            <input
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="••••••••"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <select v-model="form.role" class="form-select">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="form.status" class="form-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Cancel
            </button>
            <button type="button" :disabled="loading" class="btn-submit" @click="handleAddStaff">
              {{ loading ? 'Saving...' : (modalMode === 'create' ? 'Add Staff' : 'Save Changes') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, } from 'vue';
import { useStaffStore } from '@/stores/staff';
import {useAuthStore} from "@/stores/auth.js";
import { useToast } from '@/composables/useToast';
import {storeToRefs} from "pinia";

const staffStore = useStaffStore();
const authStore = useAuthStore();
const { showToast } = useToast();

const {user} = storeToRefs(authStore)
// State
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

const showModal = ref(false);
const modalMode = ref('create');
const form = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff',
  status: 'active'
});

// Computed
const staffList = computed(() => staffStore.staff || []);

const filteredStaff = computed(() => {
  let result = staffList.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(staff =>
        staff.name.toLowerCase().includes(query) ||
        staff.email.toLowerCase().includes(query) ||
        staff.phone?.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value) {
    result = result.filter(staff => staff.status === statusFilter.value);
  }

  return result;
});

const paginatedStaff = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredStaff.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredStaff.value.length / pageSize.value);
});

// Methods
const fetchStaff = async () => {
  loading.value = true;
  try {
    await staffStore.fetchStaff();
  } catch (error) {
    showToast('Failed to load staff', 'error');
  } finally {
    loading.value = false;
  }
};

const refreshList = () => fetchStaff();

const getInitials = (name) => {
  if (!name) return '?';
  return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
};

const openCreateModal = () => {
  modalMode.value = 'create';
  form.value = {
    id: null,
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    status: 'active'
  };
  showModal.value = true;
};

const openEditModal = (staff) => {
  modalMode.value = 'edit';
  form.value = {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    phone: staff.phone || '',
    password: '',
    role: staff.role,
    status: staff.status
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = {
    id: null,
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    status: 'active'
  };
};

const handleAddStaff = async () => {
  loading.value = true;
  try {
    if (modalMode.value === 'create') {
      await staffStore.createStaff(form.value);
      showToast('Staff member added successfully!', 'success');
    } else {
      await staffStore.updateStaff(form.value);
      showToast('Staff member updated successfully!', 'success');
    }
    closeModal();
    await fetchStaff();
  } catch (error) {
    console.log(error)
    showToast(error.message || 'Operation failed', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async (staff) => {

  const newStatus = staff.status === 'active' ? 'inactive' : 'active';
  const action = newStatus === 'active' ? 'activate' : 'deactivate';

  if (!confirm(`Are you sure you want to ${action} ${staff.name}?`)) {
    return;
  }

  loading.value = true;
  staff.status = newStatus
  console.log(staff);
  try {
    await staffStore.updateStaff(staff);
    showToast(`Staff ${action}d successfully!`, 'success');
    await fetchStaff();
  } catch (error) {
    showToast(`Failed to ${action} staff`, 'error');
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchStaff();
});

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
/* ============================================
   GLOBAL RESET & BASE
   ============================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.staff-management {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f7f8fa;
  min-height: 100vh;
  color: #1a1a2e;
}

.container {
  max-width: 1200px;
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

.btn-submit {
  padding: 10px 24px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #4338ca;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================
   FILTERS CARD
   ============================================ */
.filters-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 24px;
  border: 1px solid #e8eaed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.filters-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.filters-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.filters-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 9px 12px 9px 36px;
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

.filter-select {
  padding: 9px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  background: #fafbfc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.staff-count {
  font-size: 13px;
  color: #6b7280;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fafbfc;
  cursor: pointer;
  font-size: 18px;
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
   TABLE CARD
   ============================================ */
.table-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e8eaed;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.table-responsive {
  overflow-x: auto;
}

/* ============================================
   STAFF TABLE
   ============================================ */
.staff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.staff-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e8eaed;
}

.staff-table th {
  padding: 14px 20px;
  text-align: left;
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.staff-table td {
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
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

/* ============================================
   USER CELL
   ============================================ */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #1a1a2e;
}

/* ============================================
   BADGES
   ============================================ */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-role {
  background: #eef2ff;
  color: #4f46e5;
}

.badge-active {
  background: #ecfdf5;
  color: #065f46;
}

.badge-inactive {
  background: #fef2f2;
  color: #991b1b;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
}

.dot-active {
  background: #10b981;
}

.dot-inactive {
  background: #ef4444;
}

/* ============================================
   ACTION BUTTONS
   ============================================ */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.action-edit:hover {
  background: #eef2ff;
}

.action-deactivate:hover {
  background: #fef2f2;
}

.action-activate:hover {
  background: #ecfdf5;
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination-wrapper {
  padding: 16px 20px;
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
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
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
   LOADING STATE
   ============================================ */
.loading-state {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   EMPTY STATE
   ============================================ */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 20px;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
}

/* ============================================
   MODAL
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
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #ffffff;
  border-radius: 18px;
  width: 100%;
  max-width: 480px;
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

.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
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

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group:last-of-type {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  background: #ffffff;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 4px;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .header-title {
    font-size: 20px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-left {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    min-width: unset;
  }

  .staff-table {
    font-size: 13px;
  }

  .staff-table th,
  .staff-table td {
    padding: 10px 14px;
  }

  .pagination-wrapper {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .action-buttons {
    justify-content: center;
  }

  .modal {
    margin: 10px;
    max-width: 100%;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .staff-table {
    font-size: 12px;
  }

  .staff-table th,
  .staff-table td {
    padding: 8px 10px;
  }

  .avatar {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .badge {
    font-size: 10px;
    padding: 2px 8px;
  }
}
</style>