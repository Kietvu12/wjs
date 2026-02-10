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
} from 'lucide-react';
import apiService from '../../services/api';
import AddCandidate from '../Agent/AddCandidate';

const AdminNominationPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
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
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredBackToSelectButton, setHoveredBackToSelectButton] = useState(false);
  const [hoveredEditCVButton, setHoveredEditCVButton] = useState(false);
  const [hoveredCancelCVButton, setHoveredCancelCVButton] = useState(false);
  const [hoveredSaveCVButton, setHoveredSaveCVButton] = useState(false);
  const [hoveredBackToSelectConfirmButton, setHoveredBackToSelectConfirmButton] = useState(false);
  const [hoveredConfirmNominationButton, setHoveredConfirmNominationButton] = useState(false);
  const [hoveredTabExisting, setHoveredTabExisting] = useState(false);
  const [hoveredTabNew, setHoveredTabNew] = useState(false);
  const [hoveredCvCardIndex, setHoveredCvCardIndex] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  useEffect(() => {
    if (activeTab === 'existing' && step === 'select') {
      loadCVStorages();
    }
  }, [jobId, activeTab, step, currentPage, itemsPerPage, searchTerm]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminJobById(jobId);
      
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
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await apiService.getAdminCVs(params);
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
      const cvResponse = await apiService.getAdminCVById(cvId);
      
      if (!cvResponse.success || !cvResponse.data?.cv) {
        alert('Không tìm thấy thông tin ứng viên');
        return;
      }

      const cv = cvResponse.data.cv;

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
        name: cv.name || cv.fullName || '',
        furigana: cv.furigana || '',
        email: cv.email || '',
        phone: cv.phone || '',
        birthDate: cv.birthDate || '',
        age: cv.ages || cv.age || '',
        gender: genderValue,
        addressCurrent: cv.addressCurrent || cv.address || '',
        currentIncome: cv.currentIncome || cv.currentSalary || '',
        desiredIncome: cv.desiredIncome || cv.desiredSalary || '',
        desiredWorkLocation: cv.desiredWorkLocation || cv.desiredLocation || '',
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

      const response = await apiService.updateAdminCV(selectedCvId, formData);
      
      if (response.success) {
        // Reload CV data
        const cvResponse = await apiService.getAdminCVById(selectedCvId);
        if (cvResponse.success && cvResponse.data?.cv) {
          setSelectedCV(cvResponse.data.cv);
          setCvEditData({
            name: cvResponse.data.cv.name || cvResponse.data.cv.fullName || '',
            furigana: cvResponse.data.cv.furigana || '',
            email: cvResponse.data.cv.email || '',
            phone: cvResponse.data.cv.phone || '',
            birthDate: cvResponse.data.cv.birthDate || '',
            age: cvResponse.data.cv.ages || cvResponse.data.cv.age || '',
            gender: cvResponse.data.cv.gender?.toString() || '',
            addressCurrent: cvResponse.data.cv.addressCurrent || cvResponse.data.cv.address || '',
            currentIncome: cvResponse.data.cv.currentIncome || cvResponse.data.cv.currentSalary || '',
            desiredIncome: cvResponse.data.cv.desiredIncome || cvResponse.data.cv.desiredSalary || '',
            desiredWorkLocation: cvResponse.data.cv.desiredWorkLocation || cvResponse.data.cv.desiredLocation || '',
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
        name: selectedCV.name || selectedCV.fullName || '',
        furigana: selectedCV.furigana || '',
        email: selectedCV.email || '',
        phone: selectedCV.phone || '',
        birthDate: selectedCV.birthDate || '',
        ages: selectedCV.ages || selectedCV.age || '',
        gender: selectedCV.gender?.toString() || '',
        addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
        currentIncome: selectedCV.currentIncome || selectedCV.currentSalary || '',
        desiredIncome: selectedCV.desiredIncome || selectedCV.desiredSalary || '',
        desiredWorkLocation: selectedCV.desiredWorkLocation || selectedCV.desiredLocation || '',
        nyushaTime: selectedCV.nyushaTime || '',
        strengths: selectedCV.strengths || '',
        motivation: selectedCV.motivation || '',
      };

      // Create job application with CV storage
      // Send as JSON since backend expects req.body (not FormData)
      const requestData = {
        jobId: parseInt(jobId), // Backend expects integer
        cvCode: selectedCV.code || selectedCV.id?.toString() || '', // Backend expects cvCode, not cvId
      };

      // Debug: Log request data to check jobId
      console.log('Submitting nomination with jobId:', requestData.jobId);
      console.log('Full request data:', requestData);

      const response = await apiService.createAdminJobApplication(requestData);

      if (response.success) {
        alert('Tiến cử thành công!');
        navigate(`/admin/jobs/${jobId}`);
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tiến cử');
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

  if (loading && step === 'select') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (step === 'confirm' && selectedCV) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setStep('select');
                setSelectedCvId(null);
                setSelectedCV(null);
                setEditingCV(false);
              }}
              onMouseEnter={() => setHoveredBackToSelectButton(true)}
              onMouseLeave={() => setHoveredBackToSelectButton(false)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: hoveredBackToSelectButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Xác nhận tiến cử</h1>
              <p className="text-sm mt-1" style={{ color: '#4b5563' }}>Kiểm tra và chỉnh sửa thông tin trước khi tiến cử</p>
            </div>
          </div>
        </div>

        {/* Job Information */}
        {job && (
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6" style={{ color: '#2563eb' }} />
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Thông tin công việc</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tiêu đề</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{job.title}</p>
              </div>
              {job.company && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Công ty</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{job.company.name}</p>
                </div>
              )}
              {job.recruitingCompany?.companyName && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Công ty tuyển dụng</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{job.recruitingCompany.companyName}</p>
                </div>
              )}
              {job.workLocation && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa điểm</label>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {job.workLocation}
                  </p>
                </div>
              )}
              {job.estimatedSalary && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương ước tính</label>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                    <DollarSign className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                    {job.estimatedSalary}
                  </p>
                </div>
              )}
              {job.category && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Danh mục</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{job.category.name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Information */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" style={{ color: '#2563eb' }} />
              <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Thông tin ứng viên</h2>
            </div>
            {!editingCV ? (
              <button
                onClick={() => setEditingCV(true)}
                onMouseEnter={() => setHoveredEditCVButton(true)}
                onMouseLeave={() => setHoveredEditCVButton(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: hoveredEditCVButton ? '#1d4ed8' : '#2563eb',
                  color: 'white'
                }}
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
                      name: selectedCV.name || selectedCV.fullName || '',
                      furigana: selectedCV.furigana || '',
                      email: selectedCV.email || '',
                      phone: selectedCV.phone || '',
                      birthDate: selectedCV.birthDate || '',
                      age: selectedCV.ages || selectedCV.age || '',
                      gender: selectedCV.gender?.toString() || '',
                      addressCurrent: selectedCV.addressCurrent || selectedCV.address || '',
                      currentIncome: selectedCV.currentIncome || selectedCV.currentSalary || '',
                      desiredIncome: selectedCV.desiredIncome || selectedCV.desiredSalary || '',
                      desiredWorkLocation: selectedCV.desiredWorkLocation || selectedCV.desiredLocation || '',
                      nyushaTime: selectedCV.nyushaTime || '',
                      strengths: selectedCV.strengths || '',
                      motivation: selectedCV.motivation || '',
                    });
                  }}
                  onMouseEnter={() => setHoveredCancelCVButton(true)}
                  onMouseLeave={() => setHoveredCancelCVButton(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  style={{
                    backgroundColor: hoveredCancelCVButton ? '#e5e7eb' : '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  Hủy
                </button>
                <button
                  onClick={handleSaveCVEdit}
                  disabled={savingCV}
                  onMouseEnter={() => !savingCV && setHoveredSaveCVButton(true)}
                  onMouseLeave={() => setHoveredSaveCVButton(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  style={{
                    backgroundColor: savingCV
                      ? '#86efac'
                      : (hoveredSaveCVButton ? '#15803d' : '#16a34a'),
                    color: 'white',
                    opacity: savingCV ? 0.5 : 1,
                    cursor: savingCV ? 'not-allowed' : 'pointer'
                  }}
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
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Họ tên (Kanji) *</label>
                <input
                  type="text"
                  value={cvEditData.name}
                  onChange={(e) => setCvEditData({ ...cvEditData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Họ tên (Kana)</label>
                <input
                  type="text"
                  value={cvEditData.furigana}
                  onChange={(e) => setCvEditData({ ...cvEditData, furigana: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Email</label>
                <input
                  type="email"
                  value={cvEditData.email}
                  onChange={(e) => setCvEditData({ ...cvEditData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Số điện thoại</label>
                <input
                  type="tel"
                  value={cvEditData.phone}
                  onChange={(e) => setCvEditData({ ...cvEditData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Ngày sinh</label>
                <input
                  type="date"
                  value={cvEditData.birthDate}
                  onChange={(e) => setCvEditData({ ...cvEditData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Tuổi</label>
                <input
                  type="number"
                  value={cvEditData.age}
                  onChange={(e) => setCvEditData({ ...cvEditData, age: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Giới tính *</label>
                <select
                  value={cvEditData.gender}
                  onChange={(e) => setCvEditData({ ...cvEditData, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Chọn</option>
                  <option value="1">Nam</option>
                  <option value="2">Nữ</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Địa chỉ</label>
                <input
                  type="text"
                  value={cvEditData.addressCurrent}
                  onChange={(e) => setCvEditData({ ...cvEditData, addressCurrent: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Lương hiện tại</label>
                <input
                  type="text"
                  value={cvEditData.currentIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, currentIncome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Lương mong muốn</label>
                <input
                  type="text"
                  value={cvEditData.desiredIncome}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredIncome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Địa điểm mong muốn</label>
                <input
                  type="text"
                  value={cvEditData.desiredWorkLocation}
                  onChange={(e) => setCvEditData({ ...cvEditData, desiredWorkLocation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Thời gian nhập công ty</label>
                <input
                  type="text"
                  value={cvEditData.nyushaTime}
                  onChange={(e) => setCvEditData({ ...cvEditData, nyushaTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Điểm mạnh</label>
                <textarea
                  value={cvEditData.strengths}
                  onChange={(e) => setCvEditData({ ...cvEditData, strengths: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#111827' }}>Động lực</label>
                <textarea
                  value={cvEditData.motivation}
                  onChange={(e) => setCvEditData({ ...cvEditData, motivation: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã CV</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{selectedCV.code || selectedCV.id || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kanji)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.name || selectedCV.name || selectedCV.fullName || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kana)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.furigana || selectedCV.furigana || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {cvEditData.email || selectedCV.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Số điện thoại</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {cvEditData.phone || selectedCV.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày sinh</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(cvEditData.birthDate || selectedCV.birthDate)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tuổi</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.age || selectedCV.ages || selectedCV.age || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Giới tính</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatGender(cvEditData.gender || selectedCV.gender)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa chỉ</label>
                <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.addressCurrent || selectedCV.addressCurrent || selectedCV.address || '—'}</p>
              </div>
              {cvEditData.currentIncome || selectedCV.currentIncome || selectedCV.currentSalary ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương hiện tại</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.currentIncome || selectedCV.currentIncome || selectedCV.currentSalary}</p>
                </div>
              ) : null}
              {cvEditData.desiredIncome || selectedCV.desiredIncome || selectedCV.desiredSalary ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương mong muốn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.desiredIncome || selectedCV.desiredIncome || selectedCV.desiredSalary}</p>
                </div>
              ) : null}
              {cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation || selectedCV.desiredLocation ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa điểm mong muốn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.desiredWorkLocation || selectedCV.desiredWorkLocation || selectedCV.desiredLocation}</p>
                </div>
              ) : null}
              {cvEditData.nyushaTime || selectedCV.nyushaTime ? (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Thời gian nhập công ty</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cvEditData.nyushaTime || selectedCV.nyushaTime}</p>
                </div>
              ) : null}
              {cvEditData.strengths || selectedCV.strengths ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Điểm mạnh</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{cvEditData.strengths || selectedCV.strengths}</p>
                </div>
              ) : null}
              {cvEditData.motivation || selectedCV.motivation ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Động lực</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{cvEditData.motivation || selectedCV.motivation}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="rounded-2xl p-4 border flex items-center justify-end gap-3" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <button
            onClick={() => {
              setStep('select');
              setSelectedCvId(null);
              setSelectedCV(null);
              setEditingCV(false);
            }}
            onMouseEnter={() => setHoveredBackToSelectConfirmButton(true)}
            onMouseLeave={() => setHoveredBackToSelectConfirmButton(false)}
            className="px-4 py-2 border rounded-lg font-medium transition-colors"
            style={{
              borderColor: '#d1d5db',
              color: '#374151',
              backgroundColor: hoveredBackToSelectConfirmButton ? '#f3f4f6' : 'transparent'
            }}
          >
            Quay lại
          </button>
          <button
            onClick={handleSubmitNomination}
            disabled={submitting || editingCV}
            onMouseEnter={() => !(submitting || editingCV) && setHoveredConfirmNominationButton(true)}
            onMouseLeave={() => setHoveredConfirmNominationButton(false)}
            className="px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: (submitting || editingCV)
                ? '#fde047'
                : (hoveredConfirmNominationButton ? '#eab308' : '#facc15'),
              color: '#1e40af',
              opacity: (submitting || editingCV) ? 0.5 : 1,
              cursor: (submitting || editingCV) ? 'not-allowed' : 'pointer'
            }}
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
      <div className="rounded-2xl p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/jobs/${jobId}`)}
            onMouseEnter={() => setHoveredBackButton(true)}
            onMouseLeave={() => setHoveredBackButton(false)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
          </button>
        </div>
      </div>

      {/* Job Summary Section */}
      {job && (
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#dbeafe' }}>
              <Briefcase className="w-8 h-8" style={{ color: '#2563eb' }} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-2" style={{ color: '#111827' }}>{job.title}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {job.company && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <Building2 className="w-4 h-4" />
                    <span>{job.company.name}</span>
                  </div>
                )}
                {job.workLocation && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <MapPin className="w-4 h-4" />
                    <span>{job.workLocation}</span>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <DollarSign className="w-4 h-4" />
                    <span>{job.estimatedSalary}</span>
                  </div>
                )}
                {job.category && (
                  <div className="flex items-center gap-2" style={{ color: '#4b5563' }}>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f3f4f6' }}>{job.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-2xl border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
          <button
            onClick={() => setActiveTab('existing')}
            onMouseEnter={() => activeTab !== 'existing' && setHoveredTabExisting(true)}
            onMouseLeave={() => setHoveredTabExisting(false)}
            className="flex-1 px-6 py-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'existing' ? '#eff6ff' : (hoveredTabExisting ? '#f9fafb' : 'transparent'),
              color: activeTab === 'existing' ? '#1d4ed8' : (hoveredTabExisting ? '#111827' : '#4b5563'),
              borderBottom: activeTab === 'existing' ? '2px solid #1d4ed8' : '2px solid transparent'
            }}
          >
            Chọn ứng viên có sẵn
          </button>
          <button
            onClick={() => setActiveTab('new')}
            onMouseEnter={() => activeTab !== 'new' && setHoveredTabNew(true)}
            onMouseLeave={() => setHoveredTabNew(false)}
            className="flex-1 px-6 py-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'new' ? '#eff6ff' : (hoveredTabNew ? '#f9fafb' : 'transparent'),
              color: activeTab === 'new' ? '#1d4ed8' : (hoveredTabNew ? '#111827' : '#4b5563'),
              borderBottom: activeTab === 'new' ? '2px solid #1d4ed8' : '2px solid transparent'
            }}
          >
            Tạo hồ sơ mới
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'existing' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* CV List */}
              {loadingCVs ? (
                <div className="text-center py-8" style={{ color: '#6b7280' }}>
                  Đang tải...
                </div>
              ) : filteredCVStorages.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#6b7280' }}>
                  Không tìm thấy ứng viên nào
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-200 overflow-y-auto">
                    {filteredCVStorages.map((cv, index) => {
                      return (
                        <div
                          key={cv.id}
                          onClick={() => handleSelectCV(cv.id)}
                          onMouseEnter={() => setHoveredCvCardIndex(index)}
                          onMouseLeave={() => setHoveredCvCardIndex(null)}
                          className="p-4 border-2 rounded-lg transition-all cursor-pointer"
                          style={{
                            borderColor: selectedCvId === cv.id
                              ? '#2563eb'
                              : (hoveredCvCardIndex === index ? '#9ca3af' : '#e5e7eb'),
                            backgroundColor: selectedCvId === cv.id
                              ? '#eff6ff'
                              : (hoveredCvCardIndex === index ? '#f9fafb' : 'transparent')
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#2563eb' }}>
                                {(cv.name || cv.fullName || '?').charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold" style={{ color: '#111827' }}>{cv.name || cv.fullName || 'N/A'}</p>
                                <p className="text-sm" style={{ color: '#4b5563' }}>{cv.email || 'N/A'}</p>
                                <p className="text-xs" style={{ color: '#6b7280' }}>{cv.code || cv.id}</p>
                              </div>
                            </div>
                            {selectedCvId === cv.id && (
                              <CheckCircle className="w-6 h-6" style={{ color: '#2563eb' }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                          }}
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
                              onMouseEnter={() => currentPage !== pageNum && setHoveredPaginationButtonIndex(pageNum)}
                              onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                              className="px-3 py-1 rounded text-sm font-bold transition-colors"
                              style={{
                                backgroundColor: currentPage === pageNum
                                  ? '#2563eb'
                                  : (hoveredPaginationButtonIndex === pageNum ? '#f9fafb' : 'white'),
                                border: currentPage === pageNum ? 'none' : '1px solid #d1d5db',
                                color: currentPage === pageNum ? 'white' : '#374151'
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('next')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('last')}
                          onMouseLeave={() => setHoveredPaginationNavButton(null)}
                          className="px-2 py-1 border rounded text-sm font-bold transition-colors"
                          style={{
                            backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'white',
                            borderColor: '#d1d5db',
                            color: '#374151',
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: '#4b5563' }}>
                          Trang {currentPage} / {totalPages} ({totalItems} kết quả)
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 border rounded text-sm"
                          style={{
                            borderColor: '#d1d5db'
                          }}
                        >
                          <option value="10">10 / trang</option>
                          <option value="20">20 / trang</option>
                          <option value="50">50 / trang</option>
                          <option value="100">100 / trang</option>
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <AddCandidate 
              jobId={jobId}
              onSuccess={() => navigate(`/admin/jobs/${jobId}`)}
              onCancel={() => navigate(`/admin/jobs/${jobId}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNominationPage;

