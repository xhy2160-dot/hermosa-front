import axios from 'axios'

const baseURL = 'http://localhost:3000/api'
// const baseURL = 'https://xoxy.cc/api'
// 1. 创建 axios 实例
const http = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
    // 🔑 全局配置：允许携带 cookie（这里配置后，下方的方法无需重复编写）
    withCredentials: true
})

// 2. 🚀 核心：添加响应拦截器，自动剥离两层 data
http.interceptors.response.use(
    (response) => {
        // response.data 是 Axios 包装的底层数据，即后端的 { success, code, message, data }
        const serverJson = response.data

        // 依据后端自定义的 success 字段显式判断
        if (serverJson && serverJson.success === false) {
            // 如果后端明确返回失败，丢进 catch 块，并带上后端的错误提示
            return Promise.reject(new Error(serverJson.message || '请求失败'))
        }

        // ✨ 关键点：直接返回后端定义的 data 核心数据！
        // 如果后端某些接口成功时没有返回 data 字段（例如只有 message），则回退返回整个 serverJson
        return serverJson.data !== undefined ? serverJson.data : serverJson
    },
    (error) => {
        // 这里处理 HTTP 状态码超出 2xx 的硬件级错误（如 401, 422, 500 或网络断开）
        let errMsg = error.message
        if (error.response && error.response.data && error.response.data.message) {
            // 尽量抓取后端抛出的自定义错误信息
            errMsg = error.response.data.message
        }
        console.error('HTTP 请求异常:', errMsg)
        return Promise.reject(new Error(errMsg))
    }
)

const staffName = localStorage.getItem('staffName')

// 3. 封装请求方法（已去除重复的 withCredentials）
export const get = (url, params = {}, config = {}) => {
    return http.get(url, { params, ...config })
}

export const post = (url, data = {}, config = {}) => {
    const payload = staffName ? { ...data, staffName } : data;
    return http.post(url, payload, config)
}

export const put = (url, data = {}, config = {}) => {
    if(staffName){
        data.staffName = staffName
    }
    return http.put(url, data, config)
}

export const del = (url, params = {}, config = {}) => {
    return http.delete(url, { params, ...config })
}

export const patch = (url, data = {}, config = {}) => {
    return http.patch(url, data, config)
}

export const upload = (url, data = {}, config = {}) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
        const val = data[key];
        if (val !== undefined && val !== null) {
            if (Array.isArray(val)) {
                val.forEach((v, i) => formData.append(`${key}[${i}]`, v));
            } else {
                formData.append(key, val);
            }
        }
    });

    if (staffName) {
        formData.append('staffName', staffName);
    }

    // ✅ 关键：删除 axios 实例默认的 Content-Type，让浏览器自动设置 multipart boundary
    return http.post(url, formData, {
        ...config,
        headers: {
            ...config.headers,
            'Content-Type': undefined   // 覆盖实例默认值，浏览器会自动生成正确的 multipart/form-data; boundary=...
        }
    });
};

// 4. 工具函数：Cookie 操作
export const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return parts.pop().split(';').shift()
    }
    return null
}

export const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}