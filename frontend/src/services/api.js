const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Get authorization header
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  // Backend trả về: { success: true, message: '...', data: {...} }
  // Trả về data trực tiếp để dễ sử dụng
  return data;
};

/**
 * API Service - Centralized API calls
 */
const apiService = {
  /**
   * CTV Authentication
   */
  loginCTV: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  registerCTV: async (data) => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getCTVProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  logoutCTV: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Authentication
   */
  loginAdmin: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  logoutAdmin: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Management APIs
   */
  getAdmins: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/admins?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Dashboard APIs (CTV)
   */
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getDashboardChart: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/dashboard/chart?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CV Statistics API (CTV)
   */
  getCVStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/statistics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CV Management APIs (CTV)
   */
  getCVStorages: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/cvs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCVStorageById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCVStorage: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
      },
      body: formData
    });
    return handleResponse(response);
  },

  updateCVStorage: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/${id}`, {
      method: 'PUT',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
      },
      body: formData
    });
    return handleResponse(response);
  },

  deleteCVStorage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  checkDuplicateCV: async (data) => {
    const response = await fetch(`${API_BASE_URL}/ctv/cvs/check-duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  /**
   * Job Application APIs (CTV)
   */
  getJobApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getJobApplicationById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createJobApplication: async (formData) => {
    // Check if formData is FormData or regular object
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateJobApplication: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteJobApplication: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Dashboard Category Distribution API (CTV)
   */
  getCategoryDistribution: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/dashboard/category-distribution`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Dashboard Offer/Rejection Stats API (CTV)
   */
  getOfferRejectionStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/dashboard/offer-rejection?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Schedule API (CTV)
   */
  getSchedule: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/calendars/schedule?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCTVCalendar: async (calendarData) => {
    console.log('[API Service] createCTVCalendar called with:', calendarData);
    console.log('[API Service] API_BASE_URL:', API_BASE_URL);
    console.log('[API Service] URL:', `${API_BASE_URL}/ctv/calendars`);
    console.log('[API Service] Headers:', getAuthHeaders());
    
    try {
      const response = await fetch(`${API_BASE_URL}/ctv/calendars`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(calendarData)
      });
      console.log('[API Service] Fetch response received:', response.status, response.statusText);
      const result = await handleResponse(response);
      console.log('[API Service] handleResponse result:', result);
      return result;
    } catch (error) {
      console.error('[API Service] Error in createCTVCalendar:', error);
      throw error;
    }
  },

  /**
   * Job Pickups API (CTV)
   */
  getCTVJobPickups: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-pickups?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Campaigns API (CTV)
   */
  getCTVCampaigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/campaigns?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Posts API (CTV)
   */
  getCTVPosts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/posts?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Jobs API (CTV)
   */
  getCTVJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/jobs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get jobs by campaign ID (CTV)
   */
  getCTVJobsByCampaign: async (campaignId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/jobs/by-campaign/${campaignId}?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get jobs by job pickup ID (CTV)
   */
  getCTVJobsByJobPickup: async (jobPickupId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/jobs/by-job-pickup/${jobPickupId}?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get job by ID (CTV)
   */
  getJobById: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/jobs/${jobId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get job categories (CTV)
   * Can be used to get parent categories (parentId: null) or children (parentId: number)
   */
  getJobCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-categories?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get job category tree (CTV)
   * Returns hierarchical tree structure of all categories
   */
  getCTVJobCategoryTree: async () => {
    const response = await fetch(`${API_BASE_URL}/ctv/job-categories/tree`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Get job category children (CTV)
   * Get children categories of a specific parent category
   */
  getJobCategoryChildren: async (parentId, params = {}) => {
    const queryParams = { ...params, parentId };
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/job-categories?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Job Management APIs
   */
  getAdminJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/jobs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminJobById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminJob: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateAdminJob: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  deleteAdminJob: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggleJobPinned: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/toggle-pinned`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggleJobHot: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/toggle-hot`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateJobStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  /**
   * Admin Company APIs
   */
  getCompanies: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/companies?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCompanyById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCompany: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/companies`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateCompany: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteCompany: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggleCompanyStatus: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/companies/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Job Category APIs
   */
  getJobCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/job-categories?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getJobCategoryTree: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories/tree`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getJobCategoryById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createJobCategory: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateJobCategory: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteJobCategory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Type & Value APIs (for job_values)
   */
  getTypes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/types?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAllTypes: async (includeValues = false) => {
    const queryString = new URLSearchParams({ includeValues: includeValues ? 'true' : 'false' }).toString();
    const response = await fetch(`${API_BASE_URL}/admin/types/all?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getValues: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/values?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getValuesByType: async (typeId) => {
    const response = await fetch(`${API_BASE_URL}/admin/values/by-type/${typeId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createType: async (typeData) => {
    const response = await fetch(`${API_BASE_URL}/admin/types`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeData)
    });
    return handleResponse(response);
  },

  createValue: async (valueData) => {
    const response = await fetch(`${API_BASE_URL}/admin/values`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(valueData)
    });
    return handleResponse(response);
  },

  updateType: async (typeId, typeData) => {
    const response = await fetch(`${API_BASE_URL}/admin/types/${typeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(typeData)
    });
    return handleResponse(response);
  },

  deleteType: async (typeId) => {
    const response = await fetch(`${API_BASE_URL}/admin/types/${typeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateValue: async (valueId, valueData) => {
    const response = await fetch(`${API_BASE_URL}/admin/values/${valueId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(valueData)
    });
    return handleResponse(response);
  },

  deleteValue: async (valueId) => {
    const response = await fetch(`${API_BASE_URL}/admin/values/${valueId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin CV (Candidate) APIs
   */
  getAdminCVs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/cvs?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminCVById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminCV: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/cvs`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateAdminCV: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  deleteAdminCV: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminCVHistory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cvs/${id}/history`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Job Application (Nomination) APIs
   */
  getAdminJobApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/job-applications?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminJobApplicationById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminJobApplication: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/job-applications`, {
      method: 'POST',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateAdminJobApplication: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}`, {
      method: 'PUT',
      headers: isFormData 
        ? { ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }) }
        : getAuthHeaders(),
      body: isFormData ? formData : JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  deleteAdminJobApplication: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateJobApplicationStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/job-applications/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  /**
   * Admin Collaborator APIs
   */
  getCollaborators: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/collaborators?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCollaboratorById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborators/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  deleteCollaborator: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/collaborators/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Campaign APIs
   */
  getAdminCampaigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/campaigns?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminCampaignById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminCampaign: async (campaignData) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(response);
  },

  updateAdminCampaign: async (id, campaignData) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(response);
  },

  deleteAdminCampaign: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateCampaignStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  /**
   * Admin Message APIs
   */
  getAdminMessages: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/messages?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminMessagesByJobApplication: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/job-application/${jobApplicationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminMessage: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);
  },

  deleteAdminMessage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markMessageReadByAdmin: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}/mark-read-admin`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAllMessagesReadByAdmin: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/job-application/${jobApplicationId}/mark-all-read-admin`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Calendar APIs
   */
  getAdminCalendars: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/calendars?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createAdminCalendar: async (calendarData) => {
    console.log('[API Service] createAdminCalendar called with:', calendarData);
    console.log('[API Service] API_BASE_URL:', API_BASE_URL);
    console.log('[API Service] URL:', `${API_BASE_URL}/admin/calendars`);
    console.log('[API Service] Headers:', getAuthHeaders());
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/calendars`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(calendarData)
      });
      console.log('[API Service] Fetch response received:', response.status, response.statusText);
      const result = await handleResponse(response);
      console.log('[API Service] handleResponse result:', result);
      return result;
    } catch (error) {
      console.error('[API Service] Error in createAdminCalendar:', error);
      throw error;
    }
  },

  updateAdminCalendar: async (id, calendarData) => {
    const response = await fetch(`${API_BASE_URL}/admin/calendars/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(calendarData)
    });
    return handleResponse(response);
  },

  deleteAdminCalendar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/calendars/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CTV Message APIs
   */
  getCTVMessagesByJobApplication: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/job-application/${jobApplicationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCTVAdminsForMessage: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/messages/admins?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createCTVMessage: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);
  },

  deleteCTVMessage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markCTVMessageRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/${id}/mark-read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAllCTVMessagesRead: async (jobApplicationId) => {
    const response = await fetch(`${API_BASE_URL}/ctv/messages/job-application/${jobApplicationId}/mark-all-read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * CTV Payment Request APIs
   */
  getPaymentRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getPaymentRequestById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createPaymentRequest: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  updatePaymentRequest: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  deletePaymentRequest: async (id) => {
    const response = await fetch(`${API_BASE_URL}/ctv/payment-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  /**
   * Admin Payment Request APIs
   */
  getAdminPaymentRequests: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAdminPaymentRequestById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  approvePaymentRequest: async (id, note) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    });
    return handleResponse(response);
  },

  rejectPaymentRequest: async (id, rejectedReason, note) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejectedReason, note })
    });
    return handleResponse(response);
  },

  markPaymentRequestAsPaid: async (id, note) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/mark-paid`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    });
    return handleResponse(response);
  },

  updateAdminPaymentRequest: async (id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  deleteAdminPaymentRequest: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default apiService;
