/**
 * Job Application Status Utility
 * Maps status numbers (1-17) to Vietnamese labels and colors
 * Based on structure.sql: job_applications.status
 */

export const JOB_APPLICATION_STATUS = {
  1: {
    label: 'Admin đang xử lý hồ sơ',
    value: 'admin_processing',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    category: 'processing'
  },
  2: {
    label: 'Đang tiến cử',
    value: 'nominating',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'processing'
  },
  3: {
    label: 'Đang xếp lịch phỏng vấn',
    value: 'scheduling_interview',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'interview'
  },
  4: {
    label: 'Đang phỏng vấn',
    value: 'interviewing',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    category: 'interview'
  },
  5: {
    label: 'Đang đợi naitei',
    value: 'waiting_naitei',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    category: 'waiting'
  },
  6: {
    label: 'Đang thương lượng naitei',
    value: 'negotiating_naitei',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    category: 'waiting'
  },
  7: {
    label: 'Đang đợi nyusha',
    value: 'waiting_nyusha',
    color: 'bg-sky-100 text-sky-800 border-sky-300',
    category: 'waiting'
  },
  8: {
    label: 'Đã nyusha',
    value: 'nyusha_completed',
    color: 'bg-green-100 text-green-800 border-green-300',
    category: 'success'
  },
  9: {
    label: 'Đang chờ thanh toán với công ty',
    value: 'waiting_payment_company',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'payment'
  },
  10: {
    label: 'Gửi yêu cầu thanh toán',
    value: 'payment_requested',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    category: 'payment'
  },
  11: {
    label: 'Đã thanh toán',
    value: 'payment_completed',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'success'
  },
  12: {
    label: 'Hồ sơ không hợp lệ',
    value: 'invalid',
    color: 'bg-red-100 text-red-800 border-red-300',
    category: 'rejected'
  },
  13: {
    label: 'Hồ sơ bị trùng',
    value: 'duplicate',
    color: 'bg-red-100 text-red-800 border-red-300',
    category: 'rejected'
  },
  14: {
    label: 'Hồ sơ không đạt',
    value: 'not_qualified',
    color: 'bg-red-100 text-red-800 border-red-300',
    category: 'rejected'
  },
  15: {
    label: 'Kết quả trượt',
    value: 'rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    category: 'rejected'
  },
  16: {
    label: 'Hủy giữa chừng',
    value: 'cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    category: 'cancelled'
  },
  17: {
    label: 'Không shodaku',
    value: 'no_shodaku',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    category: 'cancelled'
  }
};

/**
 * Get status information by status number
 * @param {number} status - Status number (1-17)
 * @returns {object} Status information with label, value, color, and category
 */
export const getJobApplicationStatus = (status) => {
  if (!status || status === null || status === undefined) {
    return {
      label: 'Không xác định',
      value: 'unknown',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      category: 'unknown'
    };
  }
  
  return JOB_APPLICATION_STATUS[status] || {
    label: `Status ${status}`,
    value: `status_${status}`,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    category: 'unknown'
  };
};

/**
 * Get status label only
 * @param {number} status - Status number (1-17)
 * @returns {string} Status label
 */
export const getJobApplicationStatusLabel = (status) => {
  return getJobApplicationStatus(status).label;
};

/**
 * Get status color classes
 * @param {number} status - Status number (1-17)
 * @returns {string} Tailwind CSS color classes
 */
export const getJobApplicationStatusColor = (status) => {
  return getJobApplicationStatus(status).color;
};

/**
 * Get all status options for select/dropdown
 * @returns {array} Array of {value, label} objects
 */
export const getJobApplicationStatusOptions = () => {
  return Object.keys(JOB_APPLICATION_STATUS).map(status => ({
    value: parseInt(status),
    label: JOB_APPLICATION_STATUS[status].label,
    ...JOB_APPLICATION_STATUS[status]
  }));
};

/**
 * Get statuses by category
 * @param {string} category - Category: 'processing', 'interview', 'waiting', 'success', 'payment', 'rejected', 'cancelled'
 * @returns {array} Array of status objects
 */
export const getJobApplicationStatusesByCategory = (category) => {
  return Object.keys(JOB_APPLICATION_STATUS)
    .filter(status => JOB_APPLICATION_STATUS[status].category === category)
    .map(status => ({
      value: parseInt(status),
      ...JOB_APPLICATION_STATUS[status]
    }));
};

