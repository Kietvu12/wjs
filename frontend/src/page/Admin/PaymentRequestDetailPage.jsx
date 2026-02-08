import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Building2,
  FileText,
  Edit,
  Eye,
} from 'lucide-react';

const PaymentRequestDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    status: '',
    note: '',
    rejectedReason: '',
  });

  useEffect(() => {
    if (id) {
      loadPaymentRequest();
    }
  }, [id]);

  const loadPaymentRequest = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminPaymentRequestById(id);
      if (response.success && response.data?.paymentRequest) {
        const pr = response.data.paymentRequest;
        setPaymentRequest(pr);
        setFormData({
          amount: pr.amount || '',
          status: pr.status !== undefined ? pr.status.toString() : '',
          note: pr.note || '',
          rejectedReason: pr.rejectedReason || '',
        });
      } else {
        alert('Không tìm thấy đơn yêu cầu thanh toán');
        navigate('/admin/payments');
      }
    } catch (error) {
      console.error('Error loading payment request:', error);
      alert('Lỗi khi tải thông tin đơn yêu cầu thanh toán');
      navigate('/admin/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        status: formData.status ? parseInt(formData.status) : undefined,
        note: formData.note || undefined,
        rejectedReason: formData.rejectedReason || undefined,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const response = await apiService.updateAdminPaymentRequest(id, updateData);
      if (response.success) {
        alert('Cập nhật đơn yêu cầu thanh toán thành công!');
        setIsEditing(false);
        await loadPaymentRequest();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật đơn yêu cầu thanh toán');
      }
    } catch (error) {
      console.error('Error updating payment request:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật đơn yêu cầu thanh toán');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (window.confirm('Bạn có chắc muốn duyệt yêu cầu thanh toán này?')) {
      try {
        setSaving(true);
        const response = await apiService.approvePaymentRequest(id, formData.note);
        if (response.success) {
          alert('Duyệt yêu cầu thanh toán thành công!');
          await loadPaymentRequest();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi duyệt yêu cầu thanh toán');
        }
      } catch (error) {
        console.error('Error approving payment request:', error);
        alert(error.message || 'Có lỗi xảy ra khi duyệt yêu cầu thanh toán');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleReject = async () => {
    if (!formData.rejectedReason || !formData.rejectedReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    if (window.confirm('Bạn có chắc muốn từ chối yêu cầu thanh toán này?')) {
      try {
        setSaving(true);
        const response = await apiService.rejectPaymentRequest(id, formData.rejectedReason.trim(), formData.note);
        if (response.success) {
          alert('Từ chối yêu cầu thanh toán thành công!');
          await loadPaymentRequest();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi từ chối yêu cầu thanh toán');
        }
      } catch (error) {
        console.error('Error rejecting payment request:', error);
        alert(error.message || 'Có lỗi xảy ra khi từ chối yêu cầu thanh toán');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleMarkAsPaid = async () => {
    if (window.confirm('Bạn có chắc muốn đánh dấu đã thanh toán cho yêu cầu này?')) {
      try {
        setSaving(true);
        const response = await apiService.markPaymentRequestAsPaid(id, formData.note);
        if (response.success) {
          alert('Đánh dấu đã thanh toán thành công!');
          await loadPaymentRequest();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi đánh dấu đã thanh toán');
        }
      } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert(error.message || 'Có lỗi xảy ra khi đánh dấu đã thanh toán');
      } finally {
        setSaving(false);
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      0: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      1: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      2: { label: 'Đã từ chối', color: 'bg-red-100 text-red-800', icon: XCircle },
      3: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };
    return statusMap[status] || { label: 'Không xác định', color: 'bg-gray-100 text-gray-800', icon: Clock };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-xs text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!paymentRequest) {
    return null;
  }

  const statusInfo = getStatusLabel(paymentRequest.status);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/payments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chi tiết đơn yêu cầu thanh toán</h1>
            <p className="text-xs text-gray-500 mt-1">ID: {id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    amount: paymentRequest.amount || '',
                    status: paymentRequest.status !== undefined ? paymentRequest.status.toString() : '',
                    note: paymentRequest.note || '',
                    rejectedReason: paymentRequest.rejectedReason || '',
                  });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Payment Request Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Thông tin đơn yêu cầu
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Số tiền <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="VD: 500000"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {paymentRequest.amount ? parseFloat(paymentRequest.amount).toLocaleString('vi-VN') : '0'}đ
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Trạng thái
                  </label>
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="0">Chờ duyệt</option>
                      <option value="1">Đã duyệt</option>
                      <option value="2">Đã từ chối</option>
                      <option value="3">Đã thanh toán</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${statusInfo.color}`}>
                      {React.createElement(statusInfo.icon, { className: "w-3.5 h-3.5" })}
                      {statusInfo.label}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Ghi chú
                </label>
                {isEditing ? (
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                ) : (
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                    {paymentRequest.note || '—'}
                  </p>
                )}
              </div>
              {paymentRequest.status === 2 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Lý do từ chối
                  </label>
                  {isEditing ? (
                    <textarea
                      name="rejectedReason"
                      value={formData.rejectedReason}
                      onChange={handleInputChange}
                      placeholder="Nhập lý do từ chối..."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  ) : (
                    <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg">
                      {paymentRequest.rejectedReason || '—'}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Ngày yêu cầu
                  </label>
                  <div className="flex items-center gap-1 text-xs text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {paymentRequest.createdAt ? new Date(paymentRequest.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Ngày duyệt
                  </label>
                  <div className="flex items-center gap-1 text-xs text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {paymentRequest.approvedAt ? new Date(paymentRequest.approvedAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Ngày thanh toán
                  </label>
                  <div className="flex items-center gap-1 text-xs text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {paymentRequest.status === 3 && paymentRequest.updatedAt ? new Date(paymentRequest.updatedAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Cập nhật lần cuối
                  </label>
                  <div className="flex items-center gap-1 text-xs text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {paymentRequest.updatedAt ? new Date(paymentRequest.updatedAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collaborator Information */}
          {paymentRequest.collaborator && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <User className="w-4 h-4 text-blue-600" />
                Thông tin CTV
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Tên CTV
                  </label>
                  <button
                    onClick={() => navigate(`/admin/collaborators/${paymentRequest.collaboratorId}`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    {paymentRequest.collaborator.name || '—'}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1">ID: {paymentRequest.collaboratorId}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Job Application Information */}
          {paymentRequest.jobApplication && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Thông tin đơn ứng tuyển
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    ID đơn ứng tuyển
                  </label>
                  <button
                    onClick={() => navigate(`/admin/nominations/${paymentRequest.jobApplicationId}`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {paymentRequest.jobApplicationId}
                  </button>
                </div>
                {paymentRequest.jobApplication.job && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Công việc
                    </label>
                    <button
                      onClick={() => navigate(`/admin/jobs/${paymentRequest.jobApplication.jobId}`)}
                      className="text-xs font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      {paymentRequest.jobApplication.job.title || '—'}
                    </button>
                  </div>
                )}
                {paymentRequest.jobApplication.job?.company && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Công ty
                    </label>
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {paymentRequest.jobApplication.job.company.name || '—'}
                    </div>
                  </div>
                )}
                {paymentRequest.jobApplication.cv && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Ứng viên
                    </label>
                    <button
                      onClick={() => navigate(`/admin/candidates/${paymentRequest.jobApplication.cvId || paymentRequest.jobApplication.cv.id}`)}
                      className="text-xs font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {paymentRequest.jobApplication.cv.name || paymentRequest.jobApplication.cv.fullName || '—'}
                    </button>
                    {paymentRequest.jobApplication.cv.code && (
                      <p className="text-[10px] text-gray-500 mt-1">Mã CV: {paymentRequest.jobApplication.cv.code}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">Thao tác</h2>
              <div className="space-y-2">
                {paymentRequest.status === 0 && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={saving}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Duyệt yêu cầu
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={saving}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Từ chối yêu cầu
                    </button>
                  </>
                )}
                {paymentRequest.status === 1 && (
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={saving}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Đánh dấu đã thanh toán
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestDetailPage;

