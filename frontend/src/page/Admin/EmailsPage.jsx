import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail,
  Plus,
  RefreshCw,
  Send,
  Search,
  Filter,
  Trash2,
  Power,
  PowerOff,
  ExternalLink,
  CheckCircle,
  Circle,
  Download,
  Paperclip,
  Calendar,
  User
} from 'lucide-react';
import apiService from '../../services/api';

const EmailsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [connections, setConnections] = useState([]);
  const [emails, setEmails] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    folder: 'inbox',
    isRead: '',
    search: ''
  });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    connectionId: '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    // Xử lý OAuth callback
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const email = searchParams.get('email');

    if (success === 'connected' && email) {
      alert(`Đã kết nối thành công với ${email}`);
      setSearchParams({});
      loadConnections();
    } else if (error) {
      alert(`Lỗi kết nối: ${error}`);
      setSearchParams({});
    } else {
      loadConnections();
    }
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      loadEmails();
    }
  }, [selectedConnection, pagination.page, filters]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOutlookConnections();
      if (response.success) {
        setConnections(response.data);
        if (response.data.length > 0 && !selectedConnection) {
          setSelectedConnection(response.data[0].id);
          setComposeData(prev => ({ ...prev, connectionId: response.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmails = async () => {
    try {
      setLoading(true);
      const params = {
        connectionId: selectedConnection,
        folder: filters.folder,
        page: pagination.page,
        limit: pagination.limit
      };
      if (filters.isRead !== '') params.isRead = filters.isRead;
      if (filters.search) params.search = filters.search;

      const response = await apiService.getSyncedEmails(params);
      if (response.success) {
        setEmails(response.data.emails);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await apiService.getOutlookAuthorizationUrl();
      if (response.success) {
        window.location.href = response.data.authorizationUrl;
      }
    } catch (error) {
      console.error('Error getting authorization URL:', error);
      alert('Lỗi khi kết nối với Outlook: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSync = async () => {
    if (selectedConnection) {
      try {
        setSyncing(true);
        const response = await apiService.syncOutlookEmails({
          connectionId: selectedConnection,
          folder: filters.folder,
          limit: 100
        });
        if (response.success) {
          alert(`Đồng bộ thành công: ${response.data.syncedCount} email mới, ${response.data.updatedCount} email cập nhật`);
          loadEmails();
          loadConnections();
        }
      } catch (error) {
        console.error('Error syncing emails:', error);
        alert('Lỗi khi đồng bộ email: ' + (error.message || 'Unknown error'));
      } finally {
        setSyncing(false);
      }
    }
  };

  const handleEmailClick = async (email) => {
    try {
      const response = await apiService.getSyncedEmailDetail(email.id);
      if (response.success) {
        setSelectedEmail(response.data);
        if (!email.isRead) {
          await apiService.markEmailAsRead(email.id);
          loadEmails();
        }
      }
    } catch (error) {
      console.error('Error loading email detail:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!composeData.to || !composeData.subject || !composeData.body) {
        alert('Vui lòng điền đầy đủ thông tin: To, Subject, Body');
        return;
      }

      setLoading(true);
      const response = await apiService.sendOutlookEmail({
        connectionId: composeData.connectionId,
        to: composeData.to.split(',').map(e => e.trim()),
        cc: composeData.cc ? composeData.cc.split(',').map(e => e.trim()) : undefined,
        bcc: composeData.bcc ? composeData.bcc.split(',').map(e => e.trim()) : undefined,
        subject: composeData.subject,
        body: composeData.body,
        bodyType: 'HTML'
      });

      if (response.success) {
        alert('Email đã được gửi thành công!');
        setShowCompose(false);
        setComposeData({
          connectionId: selectedConnection || '',
          to: '',
          cc: '',
          bcc: '',
          subject: '',
          body: ''
        });
        // Đồng bộ lại để lấy email vừa gửi
        setTimeout(() => {
          handleSync();
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Lỗi khi gửi email: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kết nối này?')) return;

    try {
      const response = await apiService.deleteOutlookConnection(id);
      if (response.success) {
        alert('Đã xóa kết nối thành công');
        loadConnections();
        if (selectedConnection === id) {
          setSelectedConnection(null);
          setEmails([]);
        }
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
      alert('Lỗi khi xóa kết nối: ' + (error.message || 'Unknown error'));
    }
  };

  const handleToggleSync = async (id) => {
    try {
      const response = await apiService.toggleOutlookSync(id);
      if (response.success) {
        loadConnections();
      }
    } catch (error) {
      console.error('Error toggling sync:', error);
      alert('Lỗi khi thay đổi trạng thái đồng bộ: ' + (error.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Email Outlook</h2>
          <p className="text-gray-600">Đồng bộ và quản lý email từ tài khoản Outlook</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Kết nối Outlook
          </button>
          {selectedConnection && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
            </button>
          )}
        </div>
      </div>

      {/* Connections List */}
      {connections.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tài khoản đã kết nối</h3>
          <div className="space-y-2">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedConnection === conn.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedConnection(conn.id);
                  setComposeData(prev => ({ ...prev, connectionId: conn.id }));
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{conn.email}</p>
                      <p className="text-xs text-gray-500">
                        {conn.lastSyncAt
                          ? `Đồng bộ lần cuối: ${formatDate(conn.lastSyncAt)}`
                          : 'Chưa đồng bộ'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSync(conn.id);
                      }}
                      className={`p-2 rounded ${
                        conn.syncEnabled
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={conn.syncEnabled ? 'Tắt đồng bộ' : 'Bật đồng bộ'}
                    >
                      {conn.syncEnabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConnection(conn.id);
                      }}
                      className="p-2 rounded text-red-600 hover:bg-red-50"
                      title="Xóa kết nối"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {selectedConnection && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filters.folder}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, folder: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="inbox">Inbox</option>
                    <option value="sentitems">Sent</option>
                    <option value="drafts">Drafts</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filters.isRead}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, isRead: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="false">Chưa đọc</option>
                    <option value="true">Đã đọc</option>
                  </select>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm email..."
                    value={filters.search}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, search: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowCompose(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Soạn email
                </button>
              </div>
            </div>

            {/* Email List */}
            <div className="bg-white rounded-lg shadow">
              {loading && emails.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Không có email nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !email.isRead ? 'bg-blue-50' : ''
                      } ${selectedEmail?.id === email.id ? 'bg-blue-100' : ''}`}
                      onClick={() => handleEmailClick(email)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {email.isRead ? (
                            <Circle className="w-4 h-4 text-gray-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 truncate">
                              {email.fromName || email.fromEmail}
                            </p>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDate(email.receivedDateTime)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                            {email.subject || '(Không có tiêu đề)'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {email.bodyPreview || email.body?.substring(0, 100) || ''}
                          </p>
                          {email.hasAttachments && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <Paperclip className="w-3 h-3" />
                              <span>Có đính kèm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Trang {pagination.page} / {pagination.totalPages} ({pagination.total} email)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email Detail */}
          <div className="lg:col-span-1">
            {selectedEmail ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Quay lại
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedEmail.subject}</h3>
                <div className="space-y-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Từ:</span>{' '}
                    <span className="font-medium">
                      {selectedEmail.fromName} &lt;{selectedEmail.fromEmail}&gt;
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đến:</span>{' '}
                    <span className="font-medium">
                      {selectedEmail.toRecipients?.map(r => r.email).join(', ') || ''}
                    </span>
                  </div>
                  {selectedEmail.ccRecipients && selectedEmail.ccRecipients.length > 0 && (
                    <div>
                      <span className="text-gray-600">CC:</span>{' '}
                      <span className="font-medium">
                        {selectedEmail.ccRecipients.map(r => r.email).join(', ')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Ngày:</span>{' '}
                    <span className="font-medium">
                      {new Date(selectedEmail.receivedDateTime).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div
                  className="prose prose-sm max-w-none border-t border-gray-200 pt-4"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body || selectedEmail.bodyPreview }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chọn một email để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Soạn email mới</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến</label>
                  <input
                    type="text"
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CC (tùy chọn)</label>
                  <input
                    type="text"
                    value={composeData.cc}
                    onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BCC (tùy chọn)</label>
                  <input
                    type="text"
                    value={composeData.bcc}
                    onChange={(e) => setComposeData(prev => ({ ...prev, bcc: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Tiêu đề email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Nội dung email (HTML)"
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailsPage;
