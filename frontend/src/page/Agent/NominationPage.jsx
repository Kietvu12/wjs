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
  
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvStorages, setCvStorages] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJobDetail();
    if (activeTab === 'existing') {
      loadCVStorages();
    }
  }, [jobId, activeTab]);

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
      const response = await apiService.getCVStorages({ 
        page: 1, 
        limit: 100,
        isDuplicate: '0' // Only show non-duplicate CVs
      });
      if (response.success && response.data?.cvs) {
        setCvStorages(response.data.cvs);
      }
    } catch (error) {
      console.error('Error loading CV storages:', error);
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleSubmitExisting = async () => {
    if (!selectedCvId) {
      alert(t.selectCV || 'Vui lòng chọn một ứng viên');
      return;
    }

    try {
      setSubmitting(true);
      // Get CV storage details first
      const cvResponse = await apiService.getCVStorageById(selectedCvId);
      
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

      // Validate required fields
      if (!cv.birthDate || cv.birthDate === null || cv.birthDate === 'null' || cv.birthDate === '') {
        alert('Ứng viên này chưa có thông tin ngày sinh (生年月日). Vui lòng cập nhật thông tin trước khi tiến cử.');
        return;
      }

      if (!cv.gender || cv.gender === 0 || cv.gender === null || cv.gender === 'null' || cv.gender === '') {
        alert('Ứng viên này chưa có thông tin giới tính (性別). Vui lòng cập nhật thông tin trước khi tiến cử.');
        return;
      }

      // Validate gender value (should be 1 or 2)
      const genderValue = parseInt(cv.gender);
      if (isNaN(genderValue) || (genderValue !== 1 && genderValue !== 2)) {
        alert('Giới tính không hợp lệ. Giới tính phải là 1 (Nam) hoặc 2 (Nữ).');
        return;
      }

      // Create job application with existing CV storage
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('cvCode', cv.code || ''); // Add cvCode to link with CV storage
      formData.append('name', cv.name || '');
      formData.append('furigana', cv.furigana || '');
      formData.append('email', cv.email || '');
      formData.append('phone', cv.phone || '');
      formData.append('addressCurrent', cv.addressCurrent || '');
      formData.append('birthDate', cv.birthDate);
      formData.append('ages', cv.ages || '');
      formData.append('gender', genderValue.toString());
      formData.append('currentIncome', cv.currentIncome || '');
      formData.append('desiredIncome', cv.desiredIncome || '');
      formData.append('desiredWorkLocation', cv.desiredWorkLocation || '');
      formData.append('nyushaTime', cv.nyushaTime || '');
      formData.append('selfPromotion', cv.strengths || '');
      formData.append('reasonApply', cv.motivation || '');
      formData.append('cvType', 1); // Existing CV

      const response = await apiService.createJobApplication(formData);

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

  const filteredCVStorages = cvStorages.filter(cv => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (cv.name && cv.name.toLowerCase().includes(search)) ||
      (cv.email && cv.email.toLowerCase().includes(search)) ||
      (cv.code && cv.code.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Back button only */}
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
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('existing')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'existing'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t.selectExistingCV || 'Chọn ứng viên có sẵn'}
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t.createNewCV || 'Tạo hồ sơ mới'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'existing' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchCV || 'Tìm kiếm ứng viên...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredCVStorages.map((cv) => {
                    const hasRequiredFields = cv.birthDate && cv.gender && (cv.gender === 1 || cv.gender === 2);
                    const canSelect = hasRequiredFields && !cv.isDuplicate;
                    
                    return (
                      <div
                        key={cv.id}
                        onClick={() => canSelect && setSelectedCvId(cv.id)}
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
                              <p className="text-xs text-gray-500">{cv.code}</p>
                            </div>
                          </div>
                          {selectedCvId === cv.id && canSelect && (
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          )}
                        </div>
                        {!hasRequiredFields && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Thiếu thông tin: {!cv.birthDate && 'Ngày sinh'} {!cv.birthDate && !cv.gender && 'và'} {(!cv.gender || cv.gender === 0) && 'Giới tính'}</span>
                          </div>
                        )}
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
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/agent/jobs/${jobId}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  {t.cancel || 'Hủy'}
                </button>
                <button
                  onClick={handleSubmitExisting}
                  disabled={submitting || !selectedCvId}
                  className="px-6 py-2 bg-yellow-400 text-blue-700 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (t.submitting || 'Đang xử lý...') : (t.submitNomination || 'Tiến cử')}
                </button>
              </div>
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

