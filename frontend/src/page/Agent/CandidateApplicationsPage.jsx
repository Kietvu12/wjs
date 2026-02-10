import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import apiService from '../../services/api';

const CandidateApplicationsPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);

  useEffect(() => {
    loadCandidate();
  }, [candidateId]);

  useEffect(() => {
    if (candidate?.code) {
      loadApplications();
    }
  }, [candidate?.code, currentPage]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCVStorageById(candidateId);
      if (response.success && response.data?.cv) {
        setCandidate(response.data.cv);
      }
    } catch (error) {
      console.error('Error loading candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!candidate?.code) return;
    
    try {
      setLoading(true);
      const response = await apiService.getJobApplications({
        page: currentPage,
        limit: itemsPerPage,
        cvCode: candidate.code
      });
      
      if (response.success && response.data) {
        setApplications(response.data.jobApplications || []);
        setTotalItems(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      1: 'Admin đang xử lý hồ sơ',
      2: 'Đang tiến cử',
      3: 'Đang xếp lịch phỏng vấn',
      4: 'Đang phỏng vấn',
      5: 'Đang đợi naitei',
      6: 'Đang thương lượng naitei',
      7: 'Đang đợi nyusha',
      8: 'Đã nyusha',
      9: 'Đang chờ thanh toán với công ty',
      10: 'Gửi yêu cầu thanh toán',
      11: 'Đã thanh toán',
      12: 'Hồ sơ không hợp lệ',
      15: 'Kết quả trượt',
      16: 'Hủy giữa chừng',
      17: 'Không shodaku'
    };
    return statusLabels[status] || `Status ${status}`;
  };

  const getStatusColor = (status) => {
    if (status >= 2 && status <= 11) {
      return { backgroundColor: '#dcfce7', color: '#166534' };
    }
    if (status === 12 || status === 15 || status === 16 || status === 17) {
      return { backgroundColor: '#fee2e2', color: '#991b1b' };
    }
    return { backgroundColor: '#f3f4f6', color: '#1f2937' };
  };

  if (loading && !candidate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/agent/candidates/${candidateId}`)}
              onMouseEnter={() => setHoveredBackButton(true)}
              onMouseLeave={() => setHoveredBackButton(false)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Danh sách ứng tuyển</h1>
              {candidate && (
                <p className="text-sm mt-1" style={{ color: '#4b5563' }}>
                  Ứng viên: {candidate.name || candidate.nameKanji || 'N/A'} ({candidate.code})
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="rounded-xl border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: '#6b7280' }}>
            Đang tải danh sách ứng tuyển...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#6b7280' }}>
            Chưa có đơn ứng tuyển nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: '#111827' }}>Vị trí công việc</th>
                    <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: '#111827' }}>Công ty</th>
                    <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: '#111827' }}>Ngày ứng tuyển</th>
                    <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: '#111827' }}>Trạng thái</th>
                    <th className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#111827' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {applications.map((app, index) => (
                    <tr 
                      key={app.id} 
                      className="transition-colors"
                      style={{
                        backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" style={{ color: '#9ca3af' }} />
                          <span className="text-sm font-medium" style={{ color: '#111827' }}>
                            {app.job?.title || app.title || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" style={{ color: '#9ca3af' }} />
                          <span className="text-sm" style={{ color: '#374151' }}>
                            {app.job?.recruitingCompany?.companyName || 
                             app.job?.company?.name || 
                             'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                          <span className="text-sm" style={{ color: '#374151' }}>
                            {formatDate(app.appliedAt || app.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium" style={getStatusColor(app.status)}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/agent/nominations/${app.id}`)}
                          onMouseEnter={() => setHoveredViewButtonIndex(index)}
                          onMouseLeave={() => setHoveredViewButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredViewButtonIndex === index ? '#1e40af' : '#2563eb',
                            backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                          }}
                          title="Xem chi tiết"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="px-2 py-1 border rounded text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'white',
                      borderColor: '#d1d5db',
                      color: '#374151',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="px-2 py-1 border rounded text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'white',
                      borderColor: '#d1d5db',
                      color: '#374151',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs px-2" style={{ color: '#4b5563' }}>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('next')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="px-2 py-1 border rounded text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'white',
                      borderColor: '#d1d5db',
                      color: '#374151',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('last')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="px-2 py-1 border rounded text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'white',
                      borderColor: '#d1d5db',
                      color: '#374151',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs" style={{ color: '#4b5563' }}>
                  {totalItems} kết quả
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateApplicationsPage;

