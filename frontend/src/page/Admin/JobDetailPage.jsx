import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Briefcase, UserPlus, MapPin, DollarSign, Settings, User, Search, CheckCircle } from 'lucide-react';
import apiService from '../../services/api';

const AdminJobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Save referrer to sessionStorage when entering this page
    // Priority: location.state > existing sessionStorage > document.referrer
    console.log('JobDetailPage useEffect:', {
      locationState: location.state,
      existingReferrer: sessionStorage.getItem('jobDetailReferrer'),
      documentReferrer: document.referrer
    });
    
    if (location.state?.from === 'group-jobs') {
      sessionStorage.setItem('jobDetailReferrer', '/admin/group-jobs');
      console.log('Set referrer from location.state to /admin/group-jobs');
    } else {
      const existingReferrer = sessionStorage.getItem('jobDetailReferrer');
      if (!existingReferrer) {
        // Only set from referrer if not already set
        const referrer = document.referrer || '';
        if (referrer.includes('/admin/group-jobs')) {
          sessionStorage.setItem('jobDetailReferrer', '/admin/group-jobs');
          console.log('Set referrer from document.referrer to /admin/group-jobs');
        } else if (referrer.includes('/admin/jobs') && !referrer.includes('/admin/jobs/')) {
          sessionStorage.setItem('jobDetailReferrer', '/admin/jobs');
          console.log('Set referrer from document.referrer to /admin/jobs');
        }
      } else {
        console.log('Using existing referrer:', existingReferrer);
      }
    }
    
    loadJobDetail();
    loadAdminProfile();
  }, [jobId, location.state]);

  const loadAdminProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await apiService.getAdminProfile();
      if (response.success && response.data?.admin) {
        setAdminProfile(response.data.admin);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminJobById(jobId);
      
      if (response.success && response.data?.job) {
        setJob(response.data.job);
      } else {
        setError('Không tìm thấy thông tin việc làm');
      }
    } catch (err) {
      console.error('Error loading job detail:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải thông tin việc làm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin việc làm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {!loadingProfile && isSuperAdminOrBackOffice() && (
            <button
              onClick={() => {
                const backUrl = getBackUrl();
                navigate(backUrl);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại danh sách việc làm
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const handleNominate = () => {
    // Load candidates when button is clicked
    loadCandidates();
  };

  const loadCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const response = await apiService.getAdminCVs({
        page: 1,
        limit: 100,
        search: searchTerm
      });
      if (response.success && response.data?.cvs) {
        setCandidates(response.data.cvs);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        loadCandidates();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const handleSubmitNomination = async () => {
    if (!selectedCandidateId) {
      alert('Vui lòng chọn ứng viên');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get candidate to get cvCode
      const candidate = candidates.find(c => c.id === selectedCandidateId);
      if (!candidate || !candidate.code) {
        alert('Không tìm thấy mã CV của ứng viên');
        return;
      }

      const response = await apiService.createAdminJobApplication({
        jobId: parseInt(jobId),
        cvCode: candidate.code,
        status: 1 // Admin đang xử lý hồ sơ
      });

      if (response.success) {
        alert('Tiến cử ứng viên thành công!');
        setSelectedCandidateId(null);
        setSearchTerm('');
        setCandidates([]);
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tiến cử ứng viên');
      }
    } catch (error) {
      console.error('Error submitting nomination:', error);
      alert(error.message || 'Có lỗi xảy ra khi tiến cử ứng viên');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average salary if available
  const getAverageSalary = () => {
    // TODO: Implement salary calculation if needed
    return 'Thỏa thuận';
  };

  const getRecruitmentTypeText = (type) => {
    const types = {
      1: 'Nhân viên chính thức',
      2: 'Nhân viên chính thức (công ty haken; hợp đồng vô thời hạn)',
      3: 'Nhân viên haken (hợp đồng có thời hạn)',
      4: 'Nhân viên hợp đồng'
    };
    return types[type] || 'Không xác định';
  };

  // Helper function to check if admin is SuperAdmin or AdminBackOffice
  const isSuperAdminOrBackOffice = () => {
    return adminProfile?.role === 1 || adminProfile?.role === 2;
  };

  // Helper function to determine where to navigate back to
  const getBackUrl = () => {
    // Priority 1: Check location.state
    if (location.state?.from === 'group-jobs') {
      return '/admin/group-jobs';
    }
    
    // Priority 2: Check sessionStorage
    const referrer = sessionStorage.getItem('jobDetailReferrer');
    if (referrer === '/admin/group-jobs') {
      return '/admin/group-jobs';
    }
    
    // Priority 3: Check admin role (if profile is loaded)
    if (adminProfile?.role === 3) {
      return '/admin/group-jobs';
    }
    
    // Default: go to regular jobs page
    return '/admin/jobs';
  };

  return (
    <div className="flex gap-8 h-full overflow-hidden bg-white">
      {/* Main Content - Left Column */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-none py-8 px-8 space-y-8">
          {/* Header */}
          <div className="mb-8">
          {!loadingProfile && isSuperAdminOrBackOffice() && (
            <button
              onClick={() => {
                const backUrl = getBackUrl();
                console.log('Navigating back to:', backUrl, {
                  locationState: location.state,
                  sessionStorage: sessionStorage.getItem('jobDetailReferrer'),
                  adminRole: adminProfile?.role
                });
                navigate(backUrl);
              }}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
          )}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    N/A
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {getAverageSalary()}
                  </span>
                </div>
              </div>
              {/* Only show edit button for Super Admin and Admin Backoffice, not for Admin CA Team */}
              {/* Wait for profile to load before showing/hiding button */}
              {!loadingProfile && isSuperAdminOrBackOffice() && (
                <button
                  onClick={() => navigate(`/admin/jobs/${jobId}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                Thông tin cơ bản
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Mã việc làm:</span>
                  <span className="ml-2 font-medium">{job.jobCode || job.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Danh mục:</span>
                  <span className="ml-2 font-medium">{job.category?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Công ty nguồn:</span>
                  <span className="ml-2 font-medium">{job.company?.name || 'N/A'}</span>
                </div>
                {job.recruitmentType && (
                  <div>
                    <span className="text-gray-500">Loại tuyển dụng:</span>
                    <span className="ml-2 font-medium">{getRecruitmentTypeText(job.recruitmentType)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recruiting Company Information */}
            {job.recruitingCompany && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  Thông tin công ty tuyển dụng
                </h2>
            <div className="space-y-4">
              {job.recruitingCompany.companyName && (
                <div>
                  <span className="text-xs font-semibold text-gray-500">Tên công ty:</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{job.recruitingCompany.companyName}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {job.recruitingCompany.revenue && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Doanh thu:</span>
                    <p className="text-sm text-gray-700 mt-1">{job.recruitingCompany.revenue}</p>
                  </div>
                )}
                {job.recruitingCompany.numberOfEmployees && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Số nhân viên:</span>
                    <p className="text-sm text-gray-700 mt-1">{job.recruitingCompany.numberOfEmployees}</p>
                  </div>
                )}
                {job.recruitingCompany.headquarters && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Trụ sở tại:</span>
                    <p className="text-sm text-gray-700 mt-1">{job.recruitingCompany.headquarters}</p>
                  </div>
                )}
                {job.recruitingCompany.establishedDate && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Thành lập:</span>
                    <p className="text-sm text-gray-700 mt-1">{job.recruitingCompany.establishedDate}</p>
                  </div>
                )}
                {job.recruitingCompany.stockExchangeInfo && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Sàn chứng khoán:</span>
                    <p className="text-sm text-gray-700 mt-1">{job.recruitingCompany.stockExchangeInfo}</p>
                  </div>
                )}
                {job.recruitingCompany.investmentCapital && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Vốn đầu tư:</span>
                    <p className="text-sm text-gray-700 mt-1">{job.recruitingCompany.investmentCapital}</p>
                  </div>
                )}
              </div>
              {job.recruitingCompany.companyIntroduction && (
                <div>
                  <span className="text-xs font-semibold text-gray-500">Giới thiệu:</span>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{job.recruitingCompany.companyIntroduction}</p>
                </div>
              )}
              {job.recruitingCompany.services && job.recruitingCompany.services.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-500">Dịch vụ cung cấp:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.recruitingCompany.services.map((service, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {service.serviceName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.recruitingCompany.businessSectors && job.recruitingCompany.businessSectors.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-500">Lĩnh vực kinh doanh:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.recruitingCompany.businessSectors.map((sector, index) => (
                      <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        {sector.sectorName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Sidebar - Right Column */}
      <div className="w-96 flex-shrink-0 bg-white border-l border-gray-100 p-6">
        <div className="sticky top-6 space-y-6">
          {/* Nomination Section - Đặt đầu tiên để dễ thấy */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-green-600" />
              Tiến cử ứng viên
            </h3>
            
            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleNominate}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-xs bg-white"
                />
              </div>
            </div>

            {/* Candidate List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loadingCandidates ? (
                <div className="text-center py-4 text-gray-500 text-xs">Đang tải...</div>
              ) : candidates.length === 0 && searchTerm ? (
                <div className="text-center py-4 text-gray-500 text-xs">Không tìm thấy ứng viên</div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs">Nhập tên để tìm kiếm</div>
              ) : (
                candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`p-2 border rounded-lg cursor-pointer transition-colors bg-white ${
                      selectedCandidateId === candidate.id
                        ? 'border-green-600 bg-green-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                        {(candidate.name || candidate.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-xs truncate">
                          {candidate.name || candidate.fullName || 'N/A'}
                        </div>
                        {candidate.code && (
                          <div className="text-[10px] text-gray-500">Mã: {candidate.code}</div>
                        )}
                      </div>
                      {selectedCandidateId === candidate.id && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submit Button */}
            {selectedCandidateId && (
              <button
                onClick={handleSubmitNomination}
                disabled={submitting}
                className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xử lý...' : 'Tiến cử ứng viên'}
              </button>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-2">Details</div>
            {job.category && (
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Industry</div>
                  <div className="text-sm font-medium text-gray-900">{job.category.name}</div>
                </div>
              </div>
            )}
            {job.recruitmentType && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Employment Type</div>
                  <div className="text-sm font-medium text-gray-900">{getRecruitmentTypeText(job.recruitmentType)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Recruiting Company Information */}
          {job.recruitingCompany && (
            <div className="pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-3">Công ty tuyển dụng</div>
              <div className="space-y-3">
                {job.recruitingCompany.companyName && (
                  <div className="font-semibold text-gray-900">{job.recruitingCompany.companyName}</div>
                )}
                <div className="space-y-2 text-sm text-gray-600">
                  {job.recruitingCompany.revenue && (
                    <div>
                      <span className="font-medium">Doanh thu:</span> {job.recruitingCompany.revenue}
                    </div>
                  )}
                  {job.recruitingCompany.numberOfEmployees && (
                    <div>
                      <span className="font-medium">Số nhân viên:</span> {job.recruitingCompany.numberOfEmployees}
                    </div>
                  )}
                  {job.recruitingCompany.headquarters && (
                    <div>
                      <span className="font-medium">Trụ sở:</span> {job.recruitingCompany.headquarters}
                    </div>
                  )}
                  {job.recruitingCompany.establishedDate && (
                    <div>
                      <span className="font-medium">Thành lập:</span> {job.recruitingCompany.establishedDate}
                    </div>
                  )}
                </div>
                {job.recruitingCompany.companyIntroduction && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {job.recruitingCompany.companyIntroduction.substring(0, 150)}
                    {job.recruitingCompany.companyIntroduction.length > 150 ? '...' : ''}
                  </p>
                )}
                {job.recruitingCompany.services && job.recruitingCompany.services.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Dịch vụ:</div>
                    <div className="flex flex-wrap gap-1">
                      {job.recruitingCompany.services.map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {service.serviceName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {job.recruitingCompany.businessSectors && job.recruitingCompany.businessSectors.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Lĩnh vực:</div>
                    <div className="flex flex-wrap gap-1">
                      {job.recruitingCompany.businessSectors.map((sector, index) => (
                        <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          {sector.sectorName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job posted by */}
          {job.company && (
            <div className="pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-3">Công ty nguồn (Job posted by)</div>
              <div className="flex items-start gap-3">
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{job.company.name}</div>
                  {job.company.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {job.company.description.substring(0, 150)}
                      {job.company.description.length > 150 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminJobDetailPage;

