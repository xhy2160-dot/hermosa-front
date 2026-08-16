import dayjs from 'dayjs';

export const toDateString = dateString => {
    // dayjs 默认会把 "2026-07-07" 当作本地时间解析
    return dayjs(dateString).format('YYYY-MM-DD');
}

export const toTimeString = timeString => {
    return dayjs(timeString).format('HH:mm:ss');
}

export const today = toDateString(new Date());

export const past5years = () => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 5 }, (_, index) => {
        return String(currentYear - index);
    });
};
/**
 * 生成指定时间范围内的持续时间插槽（Time Slots）
 * @param {string} startTime 开始时间，格式 "HH:mm" (例如 "09:00")
 * @param {string} endTime 结束时间，格式 "HH:mm" (例如 "18:00")
 * @param {number} intervalMinutes 时间间隔（分钟数），如 15, 30, 45, 60
 * @returns {Array<string>} 返回生成的格式化时间数组
 */
export const generateDurationSlots = (startTime='10:00', endTime='20:00', intervalMinutes = 30) => {
    const slots = [];

    // 1. 将 "HH:mm" 转换为自当天 00:00 开始的总分钟数，方便计算
    const toTotalMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // 2. 将总分钟数还原回标准的 "HH:mm" 字符串
    const toTimeString = (totalMinutes) => {
        const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
        const minutes = String(totalMinutes % 60).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    let currentMinutes = toTotalMinutes(startTime);
    const endMinutes = toTotalMinutes(endTime);

    // 3. 循环步进生成插槽
    while (currentMinutes <= endMinutes) {
        slots.push(toTimeString(currentMinutes));
        currentMinutes += intervalMinutes; // 每次加上指定的间隔（15 或 30 分钟）
    }

    return slots;
};

 // 💡 辅助函数：根据开始时间，自动计算并填充 30 分钟后的结束时间
export const calculateEndTime = (startTimeStr) => {
    if (!startTimeStr) return '';
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 30; // 默认加 30 分钟
    const endHours = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const endMinutes = String(totalMinutes % 60).padStart(2, '0');
    return `${endHours}:${endMinutes}`;
};