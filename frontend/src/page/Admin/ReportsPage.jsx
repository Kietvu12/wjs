import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import apiService from '../../services/api';

const ReportsPage = () => {
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nomination');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Super Admin data
  const [nominationData, setNominationData] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [hrData, setHrData] = useState(null);
  
  // Regular Admin data
  const [myPerformanceData, setMyPerformanceData] = useState(null);

  // Hover states
  const [hoveredTabNomination, setHoveredTabNomination] = useState(false);
  const [hoveredTabPlatform, setHoveredTabPlatform] = useState(false);
  const [hoveredTabHr, setHoveredTabHr] = useState(false);
  const [hoveredExportAllButton, setHoveredExportAllButton] = useState(false);
  const [hoveredExportStatusButton, setHoveredExportStatusButton] = useState({});

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    if (adminProfile) {
      if (adminProfile.role === 1) {
        // Super Admin
        loadSuperAdminReports();
      } else {
        // Regular Admin
        loadMyPerformance();
      }
    }
  }, [adminProfile, startDate, endDate, statusFilter, activeTab]);

  const loadAdminProfile = async () => {
    try {
      const response = await apiService.getAdminProfile();
      if (response.success && response.data?.admin) {
        setAdminProfile(response.data.admin);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuperAdminReports = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      if (activeTab === 'nomination') {
        const response = await apiService.getNominationEffectiveness(params);
        if (response.success) {
          setNominationData(response.data);
        }
      } else if (activeTab === 'platform') {
        const response = await apiService.getPlatformEffectiveness(params);
        if (response.success) {
          setPlatformData(response.data);
        }
      } else if (activeTab === 'hr') {
        const response = await apiService.getHREffectiveness(params);
        if (response.success) {
          setHrData(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadMyPerformance = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (statusFilter) params.status = statusFilter;

      const response = await apiService.getMyPerformance(params);
      if (response.success) {
        setMyPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error loading my performance:', error);
    }
  };

  const exportData = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const convertToCSV = (data) => {
    if (!data || !data.applications) return '';
    const headers = ['ID', 'Job Title', 'Job Code', 'Candidate Name', 'Candidate Code', 'Status', 'Created At', 'Updated At'];
    const rows = data.applications.map(app => [
      app.id,
      app.jobTitle || '',
      app.jobCode || '',
      app.candidateName || '',
      app.candidateCode || '',
      app.status,
      app.createdAt,
      app.updatedAt
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      1: 'Admin đang xử lý',
      2: 'Đang tiến cử',
      3: 'Đang xếp lịch PV',
      4: 'Đang phỏng vấn',
      5: 'Đang đợi naitei',
      6: 'Đang thương lượng naitei',
      7: 'Đang đợi nyusha',
      8: 'Đã nyusha',
      9: 'Đang chờ thanh toán',
      10: 'Gửi yêu cầu thanh toán',
      11: 'Đã thanh toán',
      12: 'Hồ sơ không hợp lệ',
      15: 'Kết quả trượt',
      16: 'Hủy giữa chừng',
      17: 'Không shodaku'
    };
    return statusMap[status] || `Status ${status}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = adminProfile?.role === 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Báo cáo thống kê</h2>
          <p style={{ color: '#4b5563' }}>
            {isSuperAdmin ? 'Thống kê toàn bộ hệ thống' : 'Báo cáo thành tích xử lý đơn'}
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-lg shadow p-4 flex items-center gap-4" style={{ backgroundColor: 'white' }}>
        <Filter className="w-5 h-5" style={{ color: '#6b7280' }} />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#374151' }}>Từ ngày:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
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
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#374151' }}>Đến ngày:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
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
        {!isSuperAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" style={{ color: '#374151' }}>Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
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
              <option value="">Tất cả</option>
              <option value="1">Admin đang xử lý</option>
              <option value="2">Đang tiến cử</option>
              <option value="8">Đã nyusha</option>
              <option value="11">Đã thanh toán</option>
              <option value="15">Kết quả trượt</option>
            </select>
          </div>
        )}
      </div>

      {isSuperAdmin ? (
        /* Super Admin Reports */
        <div className="space-y-6">
          {/* Tabs */}
          <div className="rounded-lg shadow" style={{ backgroundColor: 'white' }}>
            <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
              <button
                onClick={() => setActiveTab('nomination')}
                onMouseEnter={() => activeTab !== 'nomination' && setHoveredTabNomination(true)}
                onMouseLeave={() => setHoveredTabNomination(false)}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === 'nomination' ? '#2563eb' : 'transparent',
                  color: activeTab === 'nomination' ? '#2563eb' : (hoveredTabNomination ? '#111827' : '#4b5563')
                }}
              >
                Hiệu quả tiến cử
              </button>
              <button
                onClick={() => setActiveTab('platform')}
                onMouseEnter={() => activeTab !== 'platform' && setHoveredTabPlatform(true)}
                onMouseLeave={() => setHoveredTabPlatform(false)}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === 'platform' ? '#2563eb' : 'transparent',
                  color: activeTab === 'platform' ? '#2563eb' : (hoveredTabPlatform ? '#111827' : '#4b5563')
                }}
              >
                Hiệu quả vận hành platform
              </button>
              <button
                onClick={() => setActiveTab('hr')}
                onMouseEnter={() => activeTab !== 'hr' && setHoveredTabHr(true)}
                onMouseLeave={() => setHoveredTabHr(false)}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === 'hr' ? '#2563eb' : 'transparent',
                  color: activeTab === 'hr' ? '#2563eb' : (hoveredTabHr ? '#111827' : '#4b5563')
                }}
              >
                Hiệu quả quản lý nhân sự
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'nomination' && nominationData && (
                <div className="space-y-6">
                  {/* Revenue Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#4b5563' }}>Tổng doanh thu</p>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                            {nominationData.totalRevenue?.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <DollarSign className="w-10 h-10" style={{ color: '#16a34a' }} />
                      </div>
                    </div>
                    <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#4b5563' }}>CV hiệu quả</p>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                            {nominationData.effectiveCVs || 0}
                          </p>
                        </div>
                        <FileText className="w-10 h-10" style={{ color: '#2563eb' }} />
                      </div>
                    </div>
                    <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: '#4b5563' }}>Tổng đơn ứng tuyển</p>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                            {Object.values(nominationData.applicationsByStatus || {}).reduce((a, b) => a + b, 0)}
                          </p>
                        </div>
                        <Briefcase className="w-10 h-10" style={{ color: '#9333ea' }} />
                      </div>
                    </div>
                  </div>

                  {/* Applications by Status */}
                  <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Đơn ứng tuyển theo trạng thái</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(nominationData.applicationsByStatus || {}).map(([status, count]) => (
                        <div key={status} className="border rounded p-3" style={{ borderColor: '#e5e7eb' }}>
                          <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{getStatusLabel(parseInt(status))}</p>
                          <p className="text-xl font-bold" style={{ color: '#111827' }}>{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Jobs */}
                  {nominationData.jobEffectiveness && nominationData.jobEffectiveness.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Top công việc hiệu quả</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Job Code</th>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Tiêu đề</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>Tổng đơn</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>Đã nyusha</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>Đã thanh toán</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                            {nominationData.jobEffectiveness.slice(0, 10).map((job) => (
                              <tr key={job.id}>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{job.jobCode}</td>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{job.title}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{job.totalApplications}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{job.nyushaCount}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{job.paidCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category Distribution */}
                  {nominationData.categoryDistribution && nominationData.categoryDistribution.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Phân bổ theo ngành</h3>
                      <div className="space-y-2">
                        {nominationData.categoryDistribution.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#374151' }}>{cat.name}</span>
                            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{cat.applicationCount} đơn</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'platform' && platformData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm" style={{ color: '#4b5563' }}>Tổng CTV</p>
                        <Users className="w-5 h-5" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-2xl font-bold" style={{ color: '#111827' }}>{platformData.totalCollaborators || 0}</p>
                    </div>
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm" style={{ color: '#4b5563' }}>Job mới</p>
                        <Briefcase className="w-5 h-5" style={{ color: '#9ca3af' }} />
                      </div>
                      <p className="text-2xl font-bold" style={{ color: '#111827' }}>{platformData.newJobs || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hr' && hrData && (
                <div className="space-y-6">
                  {/* Admin Performance Table */}
                  {hrData.adminPerformance && hrData.adminPerformance.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Hiệu quả từng admin</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Tên</th>
                              <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Email</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>Tổng đơn được giao</th>
                              <th className="px-4 py-2 text-right" style={{ color: '#111827' }}>Đơn thành công</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                            {hrData.adminPerformance.map((admin) => (
                              <tr key={admin.id}>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{admin.name}</td>
                                <td className="px-4 py-2" style={{ color: '#111827' }}>{admin.email}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{admin.totalAssigned}</td>
                                <td className="px-4 py-2 text-right" style={{ color: '#111827' }}>{admin.successfulApplications}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Average per day */}
                  {hrData.avgApplicationsPerDay && hrData.avgApplicationsPerDay.length > 0 && (
                    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Trung bình đơn/ngày</h3>
                      <div className="space-y-2">
                        {hrData.avgApplicationsPerDay.map((item) => (
                          <div key={item.adminId} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#374151' }}>{item.adminName}</span>
                            <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                              {item.avgPerDay} đơn/ngày ({item.totalAssigned} tổng)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Admin Reports */
        myPerformanceData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Tổng doanh thu</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                      {myPerformanceData.totalRevenue?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10" style={{ color: '#16a34a' }} />
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Tổng đơn xử lý</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                      {myPerformanceData.totalApplications || 0}
                    </p>
                  </div>
                  <Briefcase className="w-10 h-10" style={{ color: '#2563eb' }} />
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#4b5563' }}>Tốc độ xử lý TB</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#111827' }}>
                      {myPerformanceData.avgProcessingHours || 0}h
                    </p>
                  </div>
                  <Clock className="w-10 h-10" style={{ color: '#9333ea' }} />
                </div>
              </div>
            </div>

            {/* Applications by Status */}
            <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>Đơn ứng tuyển theo trạng thái</h3>
                <button
                  onClick={() => exportData(myPerformanceData, `bao-cao-${new Date().toISOString().split('T')[0]}.csv`)}
                  onMouseEnter={() => setHoveredExportAllButton(true)}
                  onMouseLeave={() => setHoveredExportAllButton(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: hoveredExportAllButton ? '#1d4ed8' : '#2563eb',
                    color: 'white'
                  }}
                >
                  <Download className="w-4 h-4" />
                  Xuất tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(myPerformanceData.applicationsByStatus || {}).map(([status, count]) => (
                  <div key={status} className="rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
                    <p className="text-xs mb-1" style={{ color: '#4b5563' }}>{getStatusLabel(parseInt(status))}</p>
                    <p className="text-xl font-bold" style={{ color: '#111827' }}>{count}</p>
                    <button
                      onClick={() => {
                        const filtered = myPerformanceData.applications.filter(app => app.status === parseInt(status));
                        exportData({ applications: filtered }, `bao-cao-status-${status}-${new Date().toISOString().split('T')[0]}.csv`);
                      }}
                      onMouseEnter={() => setHoveredExportStatusButton(prev => ({ ...prev, [status]: true }))}
                      onMouseLeave={() => setHoveredExportStatusButton(prev => ({ ...prev, [status]: false }))}
                      className="mt-2 text-xs"
                      style={{
                        color: hoveredExportStatusButton[status] ? '#1e40af' : '#2563eb'
                      }}
                    >
                      Xuất theo trạng thái
                    </button>
                  </div>
                ))}
              </div>

              {/* Applications List */}
              {myPerformanceData.applications && myPerformanceData.applications.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>ID</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Job</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Ứng viên</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Trạng thái</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Ngày tạo</th>
                        <th className="px-4 py-2 text-left" style={{ color: '#111827' }}>Cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                      {myPerformanceData.applications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-4 py-2" style={{ color: '#111827' }}>{app.id}</td>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium" style={{ color: '#111827' }}>{app.jobTitle}</p>
                              <p className="text-xs" style={{ color: '#6b7280' }}>{app.jobCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium" style={{ color: '#111827' }}>{app.candidateName}</p>
                              <p className="text-xs" style={{ color: '#6b7280' }}>{app.candidateCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}>
                              {getStatusLabel(app.status)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs" style={{ color: '#4b5563' }}>
                            {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-2 text-xs" style={{ color: '#4b5563' }}>
                            {new Date(app.updatedAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ReportsPage;
