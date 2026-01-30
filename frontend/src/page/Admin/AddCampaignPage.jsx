import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Target,
  Calendar,
  DollarSign,
  FileText,
  Save,
  X,
  Clock,
  TrendingUp,
  Users,
  Briefcase,
} from 'lucide-react';

const AddCampaignPage = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    status: 0, // 0: inactive, 1: active, 2: ended
    // Time Period
    startDate: '',
    endDate: '',
    // Campaign Settings
    maxCv: 0,
    percent: 0,
    // Additional Options
    isActive: false,
    autoStart: false,
    autoEnd: false,
  });
  const [jobs, setJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs(''); // Load all jobs initially
    if (campaignId) {
      loadCampaignData();
    }
  }, [campaignId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showJobDropdown && !event.target.closest('.job-search-container')) {
        setShowJobDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showJobDropdown]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminCampaignById(campaignId);
      if (response.success && response.data?.campaign) {
        const campaign = response.data.campaign;
        setFormData({
          name: campaign.name || '',
          description: campaign.description || '',
          status: campaign.status !== undefined ? campaign.status : 0,
          startDate: campaign.startDate || campaign.start_date 
            ? new Date(campaign.startDate || campaign.start_date).toISOString().split('T')[0]
            : '',
          endDate: campaign.endDate || campaign.end_date
            ? new Date(campaign.endDate || campaign.end_date).toISOString().split('T')[0]
            : '',
          maxCv: campaign.maxCv || campaign.max_cv || 0,
          percent: campaign.percent || 0,
          isActive: campaign.status === 1,
          autoStart: false,
          autoEnd: false,
        });
        
        // Load selected jobs
        if (campaign.jobCampaigns && campaign.jobCampaigns.length > 0) {
          const jobIds = campaign.jobCampaigns.map(jc => jc.jobId || jc.job?.id).filter(Boolean);
          setSelectedJobIds(jobIds.map(id => id.toString()));
          // Also load these jobs into the jobs list for display
          const selectedJobs = campaign.jobCampaigns
            .map(jc => jc.job)
            .filter(Boolean);
          if (selectedJobs.length > 0) {
            setJobs(prev => {
              const existingIds = prev.map(j => j.id);
              const newJobs = selectedJobs.filter(j => !existingIds.includes(j.id));
              return [...prev, ...newJobs];
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
      alert('Lỗi khi tải thông tin chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async (search = '') => {
    try {
      const response = await apiService.getAdminJobs({ 
        limit: 100, 
        search: search,
        status: 1 
      });
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!jobSearchQuery) return true;
    const query = jobSearchQuery.toLowerCase();
    return (
      job.jobCode?.toLowerCase().includes(query) ||
      job.title?.toLowerCase().includes(query)
    );
  });

  const handleJobSearch = (e) => {
    const query = e.target.value;
    setJobSearchQuery(query);
    setShowJobDropdown(true);
    if (query.length > 0) {
      loadJobs(query);
    }
  };

  const handleSelectJob = (job) => {
    if (!selectedJobIds.includes(job.id.toString())) {
      setSelectedJobIds([...selectedJobIds, job.id.toString()]);
    }
    setJobSearchQuery('');
    setShowJobDropdown(false);
  };

  const handleRemoveJob = (jobId) => {
    setSelectedJobIds(selectedJobIds.filter(id => id !== jobId.toString()));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Tên chiến dịch là bắt buộc';
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxCv: parseInt(formData.maxCv) || 0,
        percent: parseInt(formData.percent) || 0,
        status: formData.isActive ? 1 : formData.status,
        jobIds: selectedJobIds.map(id => parseInt(id))
      };

      const response = campaignId 
        ? await apiService.updateAdminCampaign(campaignId, submitData)
        : await apiService.createAdminCampaign(submitData);
      
      if (response.success) {
        alert(campaignId ? 'Chiến dịch đã được cập nhật thành công!' : 'Chiến dịch đã được tạo thành công!');
        navigate(campaignId ? `/admin/campaigns/${campaignId}` : '/admin/campaigns');
      } else {
        alert(response.message || (campaignId ? 'Có lỗi xảy ra khi cập nhật chiến dịch' : 'Có lỗi xảy ra khi tạo chiến dịch'));
      }
    } catch (error) {
      console.error(`Error ${campaignId ? 'updating' : 'creating'} campaign:`, error);
      alert(error.message || (campaignId ? 'Có lỗi xảy ra khi cập nhật chiến dịch' : 'Có lỗi xảy ra khi tạo chiến dịch'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate(campaignId ? `/admin/campaigns/${campaignId}` : '/admin/campaigns');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(campaignId ? `/admin/campaigns/${campaignId}` : '/admin/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{campaignId ? 'Chỉnh sửa chiến dịch' : 'Tạo chiến dịch'}</h1>
            <p className="text-xs text-gray-500 mt-1">{campaignId ? 'Cập nhật thông tin chiến dịch' : 'Thêm thông tin chiến dịch tuyển dụng mới vào hệ thống'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? (campaignId ? 'Đang cập nhật...' : 'Đang lưu...') : (campaignId ? 'Cập nhật chiến dịch' : 'Lưu chiến dịch')}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Target className="w-4 h-4 text-blue-600" />
              Thông tin cơ bản
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="0">Ngừng hoạt động</option>
                  <option value="1">Đang hoạt động</option>
                  <option value="2">Đã kết thúc</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tên chiến dịch <span className="text-red-500">*</span>
                </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Chiến dịch Tuyển dụng Mùa Xuân 2025"
                    required
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Mô tả chiến dịch
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về chiến dịch tuyển dụng, mục tiêu, đối tượng tuyển dụng..."
                  rows="5"
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Time Period */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              Thời gian chiến dịch
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && <p className="text-[10px] text-red-500 mt-1">{errors.startDate}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      min={formData.startDate}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && <p className="text-[10px] text-red-500 mt-1">{errors.endDate}</p>}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="autoStart"
                    checked={formData.autoStart}
                    onChange={handleInputChange}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <label className="text-xs font-semibold text-gray-900">
                    Tự động kích hoạt khi đến ngày bắt đầu
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="autoEnd"
                    checked={formData.autoEnd}
                    onChange={handleInputChange}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <label className="text-xs font-semibold text-gray-900">
                    Tự động kết thúc khi đến ngày kết thúc
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Target className="w-4 h-4 text-blue-600" />
              Cài đặt chiến dịch
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Số CV tối đa
                  </label>
                  <input
                    type="number"
                    name="maxCv"
                    value={formData.maxCv}
                    onChange={handleInputChange}
                    placeholder="VD: 100"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Phần trăm (%)
                  </label>
                  <input
                    type="number"
                    name="percent"
                    value={formData.percent}
                    onChange={handleInputChange}
                    placeholder="VD: 10"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Campaign Statistics Preview */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Thống kê (Dự kiến)
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-medium text-blue-800">Số job</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900">{selectedJobIds.length}</div>
                  <p className="text-[10px] text-blue-700 mt-1">Công việc đã chọn</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[10px] font-medium text-green-800">Ứng tuyển</span>
                  </div>
                  <div className="text-lg font-bold text-green-900">0</div>
                  <p className="text-[10px] text-green-700 mt-1">Sẽ được cập nhật sau</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[10px] font-medium text-purple-800">Tiến cử</span>
                  </div>
                  <div className="text-lg font-bold text-purple-900">0</div>
                  <p className="text-[10px] text-purple-700 mt-1">Sẽ được cập nhật sau</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-[10px] font-medium text-orange-800">Lượt xem</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900">0</div>
                  <p className="text-[10px] text-orange-700 mt-1">Sẽ được cập nhật sau</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Thông tin bổ sung
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Ghi chú nội bộ
                </label>
                <textarea
                  name="notes"
                  placeholder="Ghi chú nội bộ về chiến dịch (chỉ admin mới thấy)..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label className="text-xs font-semibold text-gray-900">
                  Kích hoạt chiến dịch ngay sau khi tạo
                </label>
              </div>
            </div>
          </div>

          {/* Jobs Selection */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Công việc trong chiến dịch
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tìm kiếm và chọn công việc
                </label>
                <div className="relative job-search-container">
                  <input
                    type="text"
                    value={jobSearchQuery}
                    onChange={handleJobSearch}
                    onFocus={() => setShowJobDropdown(true)}
                    placeholder="Nhập mã hoặc tên công việc để tìm kiếm..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {showJobDropdown && filteredJobs.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredJobs
                        .filter(job => !selectedJobIds.includes(job.id.toString()))
                        .map((job) => (
                          <div
                            key={job.id}
                            onClick={() => handleSelectJob(job)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-gray-900">
                                  [{job.jobCode}] {job.title}
                                </p>
                                {job.company && (
                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                    {job.company.name}
                                  </p>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                job.status === 1 
                                  ? 'bg-green-100 text-green-700' 
                                  : job.status === 0 
                                  ? 'bg-gray-100 text-gray-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {job.status === 1 ? 'Published' : job.status === 0 ? 'Draft' : 'Closed'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Nhập mã hoặc tên công việc để tìm kiếm và chọn
                </p>
                {selectedJobIds.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-900">
                      Đã chọn ({selectedJobIds.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedJobIds.map(jobId => {
                        const job = jobs.find(j => j.id === parseInt(jobId));
                        return job ? (
                          <span
                            key={jobId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200"
                          >
                            [{job.jobCode}] {job.title}
                            <button
                              type="button"
                              onClick={() => handleRemoveJob(jobId)}
                              className="hover:text-blue-900 hover:bg-blue-100 rounded p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Cài đặt chiến dịch
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-900 mb-2">Lưu ý:</p>
                <ul className="text-[10px] text-gray-700 space-y-1 list-disc list-inside">
                  <li>Chiến dịch sẽ được hiển thị trên trang công khai sau khi được kích hoạt</li>
                  <li>Bạn có thể chọn công việc để thêm vào chiến dịch ngay khi tạo</li>
                  <li>Thống kê sẽ được cập nhật tự động khi có hoạt động</li>
                  <li>Ngân sách có thể được điều chỉnh sau</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <X className="w-3.5 h-3.5" />
          Hủy
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5" />
          {loading ? (campaignId ? 'Đang cập nhật...' : 'Đang lưu...') : (campaignId ? 'Cập nhật chiến dịch' : 'Lưu chiến dịch')}
        </button>
      </div>
    </div>
  );
};

export default AddCampaignPage;

