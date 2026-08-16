import { defineStore } from 'pinia';
import { loginPost, authMeGet, logoutPost } from '@/api/index.js';
import { useToast } from '@/composables/useToast';
const { showToast } = useToast();

const extractUser = (payload) => {
    if (!payload || typeof payload !== 'object') return null;

    if (payload.user && typeof payload.user === 'object') return payload.user;
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        if (payload.data.user && typeof payload.data.user === 'object') return payload.data.user;
        return payload.data;
    }
    if (payload.id || payload.email || payload.role || payload.name) return payload;
    return null;
};

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false,
        error: null,
        initialized: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.user
    },

    actions: {
        async login(formdata) {
            this.loading = true;
            this.error = null;
            try {
                const response = await loginPost(formdata);
                const payload = response?.data ?? response;
                this.user = extractUser(payload);

                if (!this.user) {
                    await this.checkAuth();
                }
                localStorage.setItem('staffName', this.user.name);
                showToast('Login successfully', 'success');
                return !!this.user;
            } catch (err) {
                console.log(err);
                this.error = err.response?.data?.message || 'Login failed';
                showToast(err, 'error');
                return false;
            } finally {
                this.loading = false;
            }
        },
        async checkAuth() {
            try {
                const response = await authMeGet();
                const payload = response?.data ?? response;
                this.user = extractUser(payload);
            } catch (error) {
                this.user = null;
                localStorage.removeItem('staffName');
            } finally {
                this.initialized = true;
            }
        },
        async logout() {
            try {
                await logoutPost();
            } catch (err) {
                console.error('Logout error', err);
            } finally {
                this.user = null;
                localStorage.removeItem('staffName');
            }
        }
    }
});

