import React, { useState, useEffect } from 'react';
import { X, Send, User, Search } from 'lucide-react';
import apiService from '../../services/api';

const SendMessageModal = ({ 
  jobApplicationId, 
  collaboratorId, 
  userType = 'ctv', // 'ctv' or 'admin'
  onClose, 
  onSuccess 
}) => {
  const [message, setMessage] = useState('');
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [admins, setAdmins] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Set default message with @{jobApplicationId}
    setMessage(`@${jobApplicationId} `);
    
    // Load admins if CTV
    if (userType === 'ctv') {
      loadAdmins();
    }
  }, [jobApplicationId, userType]);

  // Reload admins when search changes
  useEffect(() => {
    if (userType === 'ctv' && adminSearch) {
      const timeoutId = setTimeout(() => {
        loadAdmins();
      }, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [adminSearch]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      // Get super admin (role = 1) and backoffice (role = 2) for CTV
      const response = await apiService.getCTVAdminsForMessage({ 
        status: 1, // Only active admins
        search: adminSearch || ''
      });
      
      if (response.success && response.data) {
        setAdmins(response.data.admins || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      // If error, try to show a helpful message
      if (error.message && error.message.includes('403')) {
        alert('Bạn không có quyền truy cập danh sách admin. Vui lòng liên hệ quản trị viên.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const searchLower = adminSearch.toLowerCase();
    return (
      (admin.name || '').toLowerCase().includes(searchLower) ||
      (admin.email || '').toLowerCase().includes(searchLower)
    );
  });

  const handleSelectAdmin = (admin) => {
    setSelectedAdminId(admin.id);
    setAdminSearch(admin.name || admin.email);
    setShowAdminDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    if (userType === 'ctv' && !selectedAdminId) {
      alert('Vui lòng chọn admin để gửi tin nhắn');
      return;
    }

    try {
      setSending(true);
      
      if (userType === 'ctv') {
        // CTV sends message - adminId will be set by backend based on selectedAdminId
        // But we need to check if backend supports adminId in createCTVMessage
        // For now, we'll send the message and backend will handle routing
        const response = await apiService.createCTVMessage({
          jobApplicationId: parseInt(jobApplicationId),
          content: message.trim(),
          senderType: 2, // Collaborator
          adminId: selectedAdminId ? parseInt(selectedAdminId) : null // Try to specify admin
        });

        if (response.success) {
          alert('Gửi tin nhắn thành công!');
          onSuccess && onSuccess();
          onClose();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi gửi tin nhắn');
        }
      } else {
        // Admin sends message - default to collaborator who created the job application
        const response = await apiService.createAdminMessage({
          jobApplicationId: parseInt(jobApplicationId),
          collaboratorId: collaboratorId ? parseInt(collaboratorId) : null,
          content: message.trim(),
          senderType: 1 // Admin
        });

        if (response.success) {
          alert('Gửi tin nhắn thành công!');
          onSuccess && onSuccess();
          onClose();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi gửi tin nhắn');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Gửi tin nhắn
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Admin Selection (only for CTV) */}
          {userType === 'ctv' && (
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                Gửi đến Admin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm admin..."
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    setShowAdminDropdown(true);
                  }}
                  onFocus={() => setShowAdminDropdown(true)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {showAdminDropdown && filteredAdmins.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredAdmins.map((admin) => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => handleSelectAdmin(admin)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-xs text-gray-500">
                            {admin.email} • {admin.role === 1 ? 'Super Admin' : 'Backoffice'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedAdminId && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs font-medium text-blue-900">
                    Đã chọn: {admins.find(a => a.id === parseInt(selectedAdminId))?.name || 'Admin'}
                  </div>
                </div>
              )}
              {loading && (
                <p className="text-xs text-gray-500 mt-1">Đang tải danh sách admin...</p>
              )}
            </div>
          )}

          {/* Collaborator Info (only for Admin) */}
          {userType === 'admin' && collaboratorId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-blue-900 mb-1">Gửi đến CTV</div>
              <div className="text-sm text-blue-800">
                Tin nhắn sẽ được gửi đến CTV tạo đơn tiến cử này
              </div>
            </div>
          )}

          {/* Message Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Nội dung tin nhắn <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Gợi ý: Sử dụng "@{jobApplicationId} đặt lịch hẹn phỏng vấn/nyusha vào ngày DD/MM/YYYY HH:mm nhé" để đặt lịch
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={sending || (userType === 'ctv' && !selectedAdminId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;

