import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Search,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Edit,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  History,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import AddCandidate from './AddCandidate';

const NominationPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [activeTab, setActiveTab] = useState('existing'); // 'existing', 'new', 'history', 'recent'
  const [step, setStep] = useState('select'); // 'select' or 'confirm'
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvStorages, setCvStorages] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [selectedCV, setSelectedCV] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingCV, setEditingCV] = useState(false);
  const [cvEditData, setCvEditData] = useState({});
  const [savingCV, setSavingCV] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // New states for history and recent CVs
  const [nominationHistory, setNominationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [recentCVs, setRecentCVs] = useState([]);
  const [loadingRecentCVs, setLoadingRecentCVs] = useState(false);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotalItems, setRecentTotalItems] = useState(0);
  const [recentTotalPages, setRecentTotalPages] = useState(0);

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  useEffect(() => {
    if (activeTab === 'existing' && step === 'select') {
      loadCVStorages();
    } else if (activeTab === 'history') {
      loadNominationHistory();
    } else if (activeTab === 'recent') {
      loadRecentCVs();
    }
  }, [jobId, activeTab, step, currentPage, itemsPerPage, searchTerm, historySearchTerm, recentPage]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobById(jobId);
      
      if (response.success && response.data?.job) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Error loading job detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCVStorages = async () => {
    try {
      setLoadingCVs(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        isDuplicate: '0' // Only show non-duplicate CVs
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await apiService.getCVStorages(params);
      if (response.success && response.data) {
        setCvStorages(response.data.cvs || []);
        setTotalItems(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading CV storages:', error);
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleSelectCV = async (cvId) => {
    try {
      setLoading(true);
      const cvResponse = await apiService.getCVStorageById(cvId);
      
      if (!cvResponse.success || !cvResponse.data?.cv) {
        alert('Không tìm thấy thông tin ứng viên');
        return;
      }

      const cv = cvResponse.data.cv;

      // Check if CV is duplicate
      if (cv.isDuplicate) {
        alert(t.duplicateCVWarning || 'Hồ sơ này đã được đánh dấu là trùng lặp. Không thể tiến cử.');
        return;
      }

      // Get gender value (default to empty string if not valid)
      let genderValue = '';
      if (cv.gender) {
        const parsedGender = parseInt(cv.gender);
        if (!isNaN(parsedGender) && (parsedGender === 1 || parsedGender === 2)) {
          genderValue = parsedGender.toString();
        }
      }

      setSelectedCvId(cvId);
      setSelectedCV(cv);
      setCvEditData({
        name: cv.name || '',
        furigana: cv.furigana || '',
        email: cv.email || '',
        phone: cv.phone || '',
        birthDate: cv.birthDate || '',
        age: cv.ages || cv.age || '',
        gender: genderValue,
        addressCurrent: cv.addressCurrent || cv.address || '',
        currentIncome: cv.currentIncome || '',
        desiredIncome: cv.desiredIncome || '',
        desiredWorkLocation: cv.desiredWorkLocation || '',
        nyushaTime: cv.nyushaTime || '',
        strengths: cv.strengths || '',
        motivation: cv.motivation || '',
      });
      setStep('confirm');
    } catch (error) {
      console.error('Error loading CV:', error);
      alert('Có lỗi xảy ra khi tải thông tin ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCVEdit = async () => {
    if (!selectedCvId) return;

    try {
      setSavingCV(true);
      const formData = new FormData();
      
      // Map edited data to form fields
      formData.append('nameKanji', cvEditData.name || '');
      formData.append('nameKana', cvEditData.furigana || '');
      formData.append('email', cvEditData.email || '');
      formData.append('phone', cvEditData.phone || '');
      formData.append('birthDate', cvEditData.birthDate || '');
      formData.append('age', cvEditData.age || '');
      formData.append('gender', cvEditData.gender || '');
      formData.append('address', cvEditData.addressCurrent || '');
      formData.append('currentSalary', cvEditData.currentIncome || '');
      formData.append('desiredSalary', cvEditData.desiredIncome || '');
      formData.append('desiredLocation', cvEditData.desiredWorkLocation || '');
      formData.append('nyushaTime', cvEditData.nyushaTime || '');
      formData.append('strengths', cvEditData.strengths || '');
      formData.append('motivation', cvEditData.motivation || '');

      const response = await apiService.updateCVStorage(selectedCvId, formData);
      
      if (response.success) {
        // Reload CV data
        const cvResponse = await apiService.getCVStorageById(selectedCvId);
        if (cvResponse.success && cvResponse.data?.cv) {
          setSelectedCV(cvResponse.data.cv);
          setCvEditData({
            name: cvResponse.data.cv.name || '',
            furigana: cvResponse.data.cv.furigana || '',
            email: cvResponse.data.cv.email || '',
            phone: cvResponse.data.cv.phone || '',
            birthDate: cvResponse.data.cv.birthDate || '',
            age: cvResponse.data.cv.ages || cvResponse.data.cv.age || '',
            gender: cvResponse.data.cv.gender?.toString() || '',
            addressCurrent: cvResponse.data.cv.addressCurrent || cvResponse.data.cv.address || '',
            currentIncome: cvResponse.data.cv.currentIncome || '',
            desiredIncome: cvResponse.data.cv.desiredIncome || '',
            desiredWorkLocation: cvResponse.data.cv.desiredWorkLocation || '',
            nyushaTime: cvResponse.data.cv.nyushaTime || '',
            strengths: cvResponse.data.cv.strengths || '',
            motivation: cvResponse.data.cv.motivation || '',
          });
        }
        setEditingCV(false);
        alert('Đã cập nhật thông tin ứng viên thành công!');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error saving CV edit:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSavingCV(false);
    }
  };

  const handleSubmitNomination = async () => {
    if (!selectedCV) {
      alert('Vui lòng chọn ứng viên');
      return;
    }

    if (!jobId) {
      alert('ID việc làm là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      
      // Use edited data if available, otherwise use original CV data
      const cvData = editingCV ? cvEditData : {
        name: selectedCV.name || '',
        furigana: selectedCV.furigana || '',
        email: selectedCV.email || '',
        phone: selectedCV.phone || '',
        birthDate: selectedCV.birthDate || '',
        ages: selectedCV.ages || selectedCV.age || '',
        gender: selectedCV.gender?.toString() || '',
        addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
        currentIncome: selectedCV.currentIncome || '',
        desiredIncome: selectedCV.desiredIncome || '',
        desiredWorkLocation: selectedCV.desiredWorkLocation || '',
        nyushaTime: selectedCV.nyushaTime || '',
        strengths: selectedCV.strengths || '',
        motivation: selectedCV.motivation || '',
      };

      // Create job application with CV storage
      // Send as JSON instead of FormData since backend expects req.body
      const requestData = {
        jobId: String(jobId || ''), // Ensure jobId is a string
        cvCode: selectedCV.code || '',
        name: cvData.name,
        furigana: cvData.furigana,
        email: cvData.email,
        phone: cvData.phone,
        addressCurrent: cvData.addressCurrent,
        birthDate: cvData.birthDate,
        ages: cvData.ages || cvData.age || '',
        gender: cvData.gender,
        currentIncome: cvData.currentIncome,
        desiredIncome: cvData.desiredIncome,
        desiredWorkLocation: cvData.desiredWorkLocation,
        nyushaTime: cvData.nyushaTime,
        selfPromotion: cvData.strengths,
        reasonApply: cvData.motivation,
        cvType: 1 // Existing CV
      };

      // Debug: Log request data to check jobId
      console.log('Submitting nomination with jobId:', requestData.jobId);
      console.log('Full request data:', requestData);

      const response = await apiService.createJobApplication(requestData);

      if (response.success) {
        alert(t.nominationSuccess || 'Tiến cử thành công!');
        navigate(`/agent/jobs/${jobId}`);
      }
    } catch (error) {
      console.error('Error submitting nomination:', error);
      alert(error.message || 'Có lỗi xảy ra khi tiến cử');
    } finally {
      setSubmitting(false);
    }
  };

  // Note: Filtering is now done on backend via search param, but we keep this for client-side filtering if needed
  const filteredCVStorages = cvStorages;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const formatGender = (gender) => {
    if (gender === '1' || gender === 1) return 'Nam';
    if (gender === '2' || gender === 2) return 'Nữ';
    return '—';
  };

  const loadNominationHistory = async () => {
    try {
      setLoadingHistory(true);
      const params = {
        limit: 100 // Get more records to group properly
      };
      if (historySearchTerm) {
        params.search = historySearchTerm;
      }
      // Get history for all candidates
      const response = await apiService.getJobApplications(params);
      if (response.success && response.data) {
        // Group by company (recruitingCompany takes priority, then company)
        const grouped = {};
        (response.data.jobApplications || []).forEach(app => {
          const companyName = app.job?.recruitingCompany?.companyName || 
                             app.job?.company?.name || 
                             'N/A';
          if (!grouped[companyName]) {
            grouped[companyName] = [];
          }
          grouped[companyName].push(app);
        });
        // Sort companies by number of applications (descending)
        const sortedGroups = Object.entries(grouped)
          .map(([company, apps]) => ({
            company,
            applications: apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          }))
          .sort((a, b) => b.applications.length - a.applications.length);
        setNominationHistory(sortedGroups);
      }
    } catch (error) {
      console.error('Error loading nomination history:', error);
      setNominationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadRecentCVs = async () => {
    try {
      setLoadingRecentCVs(true);
      const params = {
        page: recentPage,
        limit: itemsPerPage,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        isDuplicate: '0'
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await apiService.getRecentUpdatedCVs(params);
      if (response.success && response.data) {
        setRecentCVs(response.data.cvs || []);
        setRecentTotalItems(response.data.pagination?.total || 0);
        setRecentTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading recent CVs:', error);
      setRecentCVs([]);
    } finally {
      setLoadingRecentCVs(false);
    }
  };

  if (loading && step === 'select') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (step === 'confirm' && selectedCV) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setStep('select');
                setSelectedCvId(null);
                setSelectedCV(null);
                setEditingCV(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Xác nhận tiến cử</h1>
              <p className="text-sm text-gray-600 mt-1">Kiểm tra và chỉnh sửa thông tin trước khi tiến cử</p>
            </div>
          </div>
        </div>

        {/* Job Information */}
        {job && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Thông tin công việc</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tiêu đề</label>
                <p className="text-sm text-gray-900 font-medium">{job.title}</p>
              </div>
              {job.company && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Công ty</label>
                  <p className="text-sm text-gray-900">{job.company.name}</p>
                </div>
              )}
              {job.recruitingCompany?.companyName && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Công ty tuyển dụng</label>
                  <p className="text-sm text-gray-900">{job.recruitingCompany.companyName}</p>
                </div>
              )}
              {job.workLocation && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Địa điểm</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {job.workLocation}
                  </p>
                </div>
              )}
              {job.estimatedSalary && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lương ước tính</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    {job.estimatedSalary}
                  </p>
                </div>
              )}
              {job.category && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Danh mục</label>
                  <p className="text-sm text-gray-900">{job.category.name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Thông tin ứng viên</h2>
            </div>
            {!editingCV ? (
              <button
                onClick={() => setEditingCV(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Sửa nhanh
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCV(false);
                    // Reset to original data
                    setCvEditData({
                      name: selectedCV.name || '',
                      furigana: selectedCV.furigana || '',
                      email: selectedCV.email || '',
                      phone: selectedCV.phone || '',
                      birthDate: selectedCV.birthDate || '',
                      age: selectedCV.ages || selectedCV.age || '',
                      gender: selectedCV.gender?.toString() || '',
                      addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
                      currentIncome: selectedCV.currentIncome || '',
                      desiredIncome: selectedCV.desiredIncome || '',
                      desiredWorkLocation: selectedCV.desiredWorkLocation || '',
                      nyushaTime: selectedCV.nyushaTime || '',
                      strengths: selectedCV.strengths || '',
                      motivation: selectedCV.motivation || '',
                    });
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Hủy
                </button>
                <button
                  onClick={handleSaveCVEdit}
                  disabled={savingCV}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingCV ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          {editingCV ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Họ tên (Kanji) *</label>
                <input
                  type="text"
                  value={cvEditData.name}
                  onChange={(e) => setCvEditData({ ...cvEditData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Họ tên (Kana)</label>
                <input
                  type="text"
                  value={cvEditData.furigana}
                  onChange={(e) => setCvEditData({ ...cvEditData, furigana: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  value={cvEditData.email}
                  onChange={(e) => setCvEditData({ ...cvEditData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={cvEditData.phone}
                  onChange={(e) => setCvEditData({ ...cvEditData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={cvEditData.birthDate}
                  onChange={(e) => setCvEditData({ ...cvEditData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Tuổi</label>
                <input
                  type="number"
                  value={cvEditData.age}
                  onChange={(e) => setCvEditData({ ...cvEditData, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Giới tính *</label>
                <select
                  value={cvEditData.gender}
                  onChange={(e) => setCvEditData({ ...cvEditData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Chọn</option>
                  <option value="1">Nam</option>
                  <option value="2">Nữ</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={cvEditData.addressCurrent}
                  onChange={(e) => setCvEditData({ ...cvEditData, addressCurrent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Lương hiện tại</label>
                <input
                  type="text"
                  value={cvEditData.currentIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, currentIncome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Lương mong muốn</label>
                <input
                  type="text"
                  value={cvEditData.desiredIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredIncome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Địa điểm mong muốn</label>
                <input
                  type="text"
                  value={cvEditData.desiredWorkLocation}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredWorkLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Thời gian nhập công ty</label>
                <input
                  type="text"
                  value={cvEditData.nyushaTime}
                  onChange={(e) => setCvEditData({ ...cvEditData, nyushaTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Điểm mạnh</label>
                <textarea
                  value={cvEditData.strengths}
                  onChange={(e) => setCvEditData({ ...cvEditData, strengths: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Động lực</label>
                <textarea
                  value={cvEditData.motivation}
                  onChange={(e) => setCvEditData({ ...cvEditData, motivation: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mã CV</label>
                <p className="text-sm text-gray-900 font-medium">{selectedCV.code || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên (Kanji)</label>
                <p className="text-sm text-gray-900">{cvEditData.name || selectedCV.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên (Kana)</label>
                <p className="text-sm text-gray-900">{cvEditData.furigana || selectedCV.furigana || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {cvEditData.email || selectedCV.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {cvEditData.phone || selectedCV.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày sinh</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(cvEditData.birthDate || selectedCV.birthDate)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tuổi</label>
                <p className="text-sm text-gray-900">{cvEditData.age || selectedCV.ages || selectedCV.age || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Giới tính</label>
                <p className="text-sm text-gray-900">{formatGender(cvEditData.gender || selectedCV.gender)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ</label>
                <p className="text-sm text-gray-900">{cvEditData.addressCurrent || selectedCV.addressCurrent || selectedCV.address || '—'}</p>
              </div>
              {cvEditData.currentIncome || selectedCV.currentIncome ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lương hiện tại</label>
                  <p className="text-sm text-gray-900">{cvEditData.currentIncome || selectedCV.currentIncome}</p>
                </div>
              ) : null}
              {cvEditData.desiredIncome || selectedCV.desiredIncome ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lương mong muốn</label>
                  <p className="text-sm text-gray-900">{cvEditData.desiredIncome || selectedCV.desiredIncome}</p>
                </div>
              ) : null}
              {cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Địa điểm mong muốn</label>
                  <p className="text-sm text-gray-900">{cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation}</p>
                </div>
              ) : null}
              {cvEditData.nyushaTime || selectedCV.nyushaTime ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Thời gian nhập công ty</label>
                  <p className="text-sm text-gray-900">{cvEditData.nyushaTime || selectedCV.nyushaTime}</p>
                </div>
              ) : null}
              {cvEditData.strengths || selectedCV.strengths ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Điểm mạnh</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{cvEditData.strengths || selectedCV.strengths}</p>
                </div>
              ) : null}
              {cvEditData.motivation || selectedCV.motivation ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Động lực</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{cvEditData.motivation || selectedCV.motivation}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setStep('select');
              setSelectedCvId(null);
              setSelectedCV(null);
              setEditingCV(false);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={handleSubmitNomination}
            disabled={submitting || editingCV}
            className="px-6 py-2 bg-yellow-400 text-blue-700 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận tiến cử'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Selection Step
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/agent/jobs/${jobId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Job Summary Section */}
      {job && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {job.company && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{job.company.name}</span>
                  </div>
                )}
                {job.workLocation && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{job.workLocation}</span>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.estimatedSalary}</span>
                  </div>
                )}
                {job.category && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{job.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('existing')}
            className={`px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'existing'
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
            }`}
          >
            {t.selectExistingCV || 'Chọn ứng viên có sẵn'}
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'recent'
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              CV được cập nhật gần nhất
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'history'
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Lịch sử tiến cử
            </div>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'new'
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
            }`}
          >
            {t.createNewCV || 'Tạo hồ sơ mới'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'existing' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchCV || 'Tìm kiếm ứng viên...'}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CV List */}
              {loadingCVs ? (
                <div className="text-center py-8 text-gray-500">
                  {t.loading || 'Đang tải...'}
                </div>
              ) : filteredCVStorages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t.noCVFound || 'Không tìm thấy ứng viên nào'}
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-200 overflow-y-auto">
                    {filteredCVStorages.map((cv) => {
                      const canSelect = !cv.isDuplicate;
                      
                      return (
                        <div
                          key={cv.id}
                          onClick={() => canSelect && handleSelectCV(cv.id)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            !canSelect
                              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                              : selectedCvId === cv.id
                              ? 'border-blue-500 bg-blue-50 cursor-pointer'
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {cv.name ? cv.name.charAt(0) : '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{cv.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{cv.email || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-gray-500">{cv.code}</p>
                                  {cv.status !== undefined && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">
                                        Loại hồ sơ: {
                                          cv.status === 0 ? 'Draft' :
                                          cv.status === 1 ? 'Active' :
                                          cv.status === 2 ? 'Archived' : '—'
                                        }
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedCvId === cv.id && canSelect && (
                              <CheckCircle className="w-6 h-6 text-blue-500" />
                            )}
                          </div>
                          {cv.isDuplicate && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{t.duplicateCVWarning || 'Hồ sơ trùng lặp'}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(7, totalPages))].map((_, i) => {
                          // Calculate page numbers to show
                          let pageNum;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (currentPage <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 3 + i;
                          }
                          
                          if (pageNum < 1 || pageNum > totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {t.page || 'Trang'} {currentPage} / {totalPages} ({totalItems} {t.results || 'kết quả'})
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="10">10 / {t.page || 'trang'}</option>
                          <option value="20">20 / {t.page || 'trang'}</option>
                          <option value="50">50 / {t.page || 'trang'}</option>
                          <option value="100">100 / {t.page || 'trang'}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'recent' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm CV được cập nhật gần nhất..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setRecentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recent CVs List */}
              {loadingRecentCVs ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Đang tải...
                </div>
              ) : recentCVs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Không có CV nào được cập nhật gần đây
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {recentCVs.map((cv) => {
                      const canSelect = !cv.isDuplicate;
                      
                      return (
                        <div
                          key={cv.id}
                          onClick={() => canSelect && handleSelectCV(cv.id)}
                          className={`p-3 border rounded-lg transition-all ${
                            !canSelect
                              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                              : selectedCvId === cv.id
                              ? 'border-blue-500 bg-blue-50 cursor-pointer'
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {cv.name ? cv.name.charAt(0) : '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{cv.name || 'N/A'}</p>
                                <p className="text-xs text-gray-600 truncate">{cv.email || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-gray-500">{cv.code}</p>
                                  {cv.updatedAt && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-500">
                                        Cập nhật: {formatDate(cv.updatedAt)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedCvId === cv.id && canSelect && (
                              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            )}
                            {!canSelect && (
                              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {recentTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setRecentPage(1)}
                          disabled={recentPage === 1}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronsLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRecentPage(recentPage - 1)}
                          disabled={recentPage === 1}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-gray-600 px-2">
                          Trang {recentPage} / {recentTotalPages}
                        </span>
                        <button
                          onClick={() => setRecentPage(recentPage + 1)}
                          disabled={recentPage === recentTotalPages}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRecentPage(recentTotalPages)}
                          disabled={recentPage === recentTotalPages}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronsRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-600">
                        {recentTotalItems} kết quả
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên ứng viên, công ty..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* History List */}
              {loadingHistory ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Đang tải lịch sử...
                </div>
              ) : nominationHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Chưa có lịch sử tiến cử
                </div>
              ) : (
                <div className="space-y-2">
                  {nominationHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <p className="font-semibold text-gray-900 text-sm mb-2">
                        Cty {index + 1}: {item.company}
                      </p>
                      <div className="space-y-1.5 pl-2 border-l-2 border-gray-200">
                        {item.applications.map((app) => (
                          <div key={app.id} className="text-xs text-gray-600">
                            <span className="font-medium">{app.cv?.name || app.name || 'N/A'}</span>
                            {app.job?.title && (
                              <span className="text-gray-500"> - {app.job.title}</span>
                            )}
                            {app.status && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                                app.status >= 2 && app.status <= 11
                                  ? 'bg-green-100 text-green-800'
                                  : app.status === 12 || app.status === 15 || app.status === 16 || app.status === 17
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {app.status === 1 ? 'Đang xử lý' :
                                 app.status === 2 ? 'Đang tiến cử' :
                                 app.status === 8 ? 'Đã nhận việc' :
                                 app.status === 11 ? 'Đã thanh toán' :
                                 app.status === 15 ? 'Trượt' :
                                 app.status === 16 ? 'Hủy' :
                                 app.status === 17 ? 'Không shodaku' :
                                 `Status ${app.status}`}
                              </span>
                            )}
                            <span className="text-gray-400 ml-2">
                              ({formatDate(app.createdAt)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <AddCandidate 
              jobId={jobId}
              onSuccess={() => navigate(`/agent/jobs/${jobId}`)}
              onCancel={() => navigate(`/agent/jobs/${jobId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NominationPage;
