import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  FileText,
  DollarSign,
  BarChart3,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import apiService from '../../services/api';

const MyGroupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load group info and statistics in parallel
      const [groupResponse, statsResponse] = await Promise.all([
        apiService.getMyGroup(),
        apiService.getMyGroupStatistics()
      ]);

      if (groupResponse.success) {
        setGroup(groupResponse.data.group);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }
    } catch (err) {
      console.error('Error loading group data:', err);
      setError(err.message || 'Không thể tải thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Bạn chưa được gán vào nhóm nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông tin nhóm</h1>
          <p className="text-sm text-gray-600 mt-1">Xem thông tin và thống kê nhóm của bạn</p>
        </div>
      </div>

      {/* Group Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin nhóm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tên nhóm</label>
            <p className="text-sm text-gray-900 mt-1">{group.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mã nhóm</label>
            <p className="text-sm text-gray-900 mt-1">{group.code}</p>
          </div>
          {group.referralCode && (
            <div>
              <label className="text-sm font-medium text-gray-700">Mã giới thiệu</label>
              <p className="text-sm text-gray-900 mt-1">{group.referralCode}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Trạng thái</label>
            <div className="mt-1">
              {group.status === 1 ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3" />
                  Đang hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="w-3 h-3" />
                  Không hoạt động
                </span>
              )}
            </div>
          </div>
          {group.description && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Mô tả</label>
              <p className="text-sm text-gray-900 mt-1">{group.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <>
          {/* Group Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhóm</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số CTV</p>
                    <p className="text-xl font-bold text-gray-900">
                      {statistics.groupStatistics?.collaboratorCount || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số đơn ứng tuyển</p>
                    <p className="text-xl font-bold text-gray-900">
                      {statistics.groupStatistics?.jobApplicationCount || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số CV</p>
                    <p className="text-xl font-bold text-gray-900">
                      {statistics.groupStatistics?.cvCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CTV được phân công</p>
                    <p className="text-xl font-bold text-gray-900">
                      {statistics.personalStatistics?.collaboratorCount || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đơn đã xử lý</p>
                    <p className="text-xl font-bold text-gray-900">
                      {statistics.personalStatistics?.jobApplicationCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admins in Group */}
      {group.admins && group.admins.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thành viên nhóm</h2>
          <div className="space-y-3">
            {group.admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{admin.name || admin.email}</p>
                    <p className="text-xs text-gray-600">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.isActive && admin.status === 1 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3" />
                      Không hoạt động
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/group-collaborators')}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Xem CTV của nhóm</span>
          </button>
          <button
            onClick={() => navigate('/admin/nominations')}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <FileCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Xem đơn ứng tuyển</span>
          </button>
          <button
            onClick={() => navigate('/admin/payments')}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Xem thanh toán</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyGroupPage;

