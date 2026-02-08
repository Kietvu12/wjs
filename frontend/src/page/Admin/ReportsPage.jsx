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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo thống kê</h2>
          <p className="text-gray-600">
            {isSuperAdmin ? 'Thống kê toàn bộ hệ thống' : 'Báo cáo thành tích xử lý đơn'}
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Từ ngày:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Đến ngày:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {!isSuperAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white rounded-lg shadow">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('nomination')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'nomination'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Hiệu quả tiến cử
              </button>
              <button
                onClick={() => setActiveTab('platform')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'platform'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Hiệu quả vận hành platform
              </button>
              <button
                onClick={() => setActiveTab('hr')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'hr'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
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
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Tổng doanh thu</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {nominationData.totalRevenue?.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">CV hiệu quả</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {nominationData.effectiveCVs || 0}
                          </p>
                        </div>
                        <FileText className="w-10 h-10 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Tổng đơn ứng tuyển</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {Object.values(nominationData.applicationsByStatus || {}).reduce((a, b) => a + b, 0)}
                          </p>
                        </div>
                        <Briefcase className="w-10 h-10 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Applications by Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn ứng tuyển theo trạng thái</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(nominationData.applicationsByStatus || {}).map(([status, count]) => (
                        <div key={status} className="border border-gray-200 rounded p-3">
                          <p className="text-xs text-gray-600 mb-1">{getStatusLabel(parseInt(status))}</p>
                          <p className="text-xl font-bold text-gray-900">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Jobs */}
                  {nominationData.jobEffectiveness && nominationData.jobEffectiveness.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top công việc hiệu quả</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Job Code</th>
                              <th className="px-4 py-2 text-left">Tiêu đề</th>
                              <th className="px-4 py-2 text-right">Tổng đơn</th>
                              <th className="px-4 py-2 text-right">Đã nyusha</th>
                              <th className="px-4 py-2 text-right">Đã thanh toán</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {nominationData.jobEffectiveness.slice(0, 10).map((job) => (
                              <tr key={job.id}>
                                <td className="px-4 py-2">{job.jobCode}</td>
                                <td className="px-4 py-2">{job.title}</td>
                                <td className="px-4 py-2 text-right">{job.totalApplications}</td>
                                <td className="px-4 py-2 text-right">{job.nyushaCount}</td>
                                <td className="px-4 py-2 text-right">{job.paidCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category Distribution */}
                  {nominationData.categoryDistribution && nominationData.categoryDistribution.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ theo ngành</h3>
                      <div className="space-y-2">
                        {nominationData.categoryDistribution.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{cat.name}</span>
                            <span className="text-sm font-semibold text-gray-900">{cat.applicationCount} đơn</span>
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
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Tổng CTV</p>
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{platformData.totalCollaborators || 0}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Job mới</p>
                        <Briefcase className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{platformData.newJobs || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hr' && hrData && (
                <div className="space-y-6">
                  {/* Admin Performance Table */}
                  {hrData.adminPerformance && hrData.adminPerformance.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu quả từng admin</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Tên</th>
                              <th className="px-4 py-2 text-left">Email</th>
                              <th className="px-4 py-2 text-right">Tổng đơn được giao</th>
                              <th className="px-4 py-2 text-right">Đơn thành công</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {hrData.adminPerformance.map((admin) => (
                              <tr key={admin.id}>
                                <td className="px-4 py-2">{admin.name}</td>
                                <td className="px-4 py-2">{admin.email}</td>
                                <td className="px-4 py-2 text-right">{admin.totalAssigned}</td>
                                <td className="px-4 py-2 text-right">{admin.successfulApplications}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Average per day */}
                  {hrData.avgApplicationsPerDay && hrData.avgApplicationsPerDay.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trung bình đơn/ngày</h3>
                      <div className="space-y-2">
                        {hrData.avgApplicationsPerDay.map((item) => (
                          <div key={item.adminId} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{item.adminName}</span>
                            <span className="text-sm font-semibold text-gray-900">
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
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {myPerformanceData.totalRevenue?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng đơn xử lý</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {myPerformanceData.totalApplications || 0}
                    </p>
                  </div>
                  <Briefcase className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tốc độ xử lý TB</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {myPerformanceData.avgProcessingHours || 0}h
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Applications by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Đơn ứng tuyển theo trạng thái</h3>
                <button
                  onClick={() => exportData(myPerformanceData, `bao-cao-${new Date().toISOString().split('T')[0]}.csv`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Xuất tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(myPerformanceData.applicationsByStatus || {}).map(([status, count]) => (
                  <div key={status} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">{getStatusLabel(parseInt(status))}</p>
                    <p className="text-xl font-bold text-gray-900">{count}</p>
                    <button
                      onClick={() => {
                        const filtered = myPerformanceData.applications.filter(app => app.status === parseInt(status));
                        exportData({ applications: filtered }, `bao-cao-status-${status}-${new Date().toISOString().split('T')[0]}.csv`);
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
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
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Job</th>
                        <th className="px-4 py-2 text-left">Ứng viên</th>
                        <th className="px-4 py-2 text-left">Trạng thái</th>
                        <th className="px-4 py-2 text-left">Ngày tạo</th>
                        <th className="px-4 py-2 text-left">Cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {myPerformanceData.applications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-4 py-2">{app.id}</td>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">{app.jobTitle}</p>
                              <p className="text-xs text-gray-500">{app.jobCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">{app.candidateName}</p>
                              <p className="text-xs text-gray-500">{app.candidateCode}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                              {getStatusLabel(app.status)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-600">
                            {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-600">
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
