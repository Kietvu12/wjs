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
  
  // Hover states
  const [hoveredConnectButton, setHoveredConnectButton] = useState(false);
  const [hoveredSyncButton, setHoveredSyncButton] = useState(false);
  const [hoveredConnectionItemIndex, setHoveredConnectionItemIndex] = useState(null);
  const [hoveredToggleSyncButtonIndex, setHoveredToggleSyncButtonIndex] = useState(null);
  const [hoveredDeleteConnectionButtonIndex, setHoveredDeleteConnectionButtonIndex] = useState(null);
  const [hoveredComposeButton, setHoveredComposeButton] = useState(false);
  const [hoveredEmailItemIndex, setHoveredEmailItemIndex] = useState(null);
  const [hoveredPaginationPrevButton, setHoveredPaginationPrevButton] = useState(false);
  const [hoveredPaginationNextButton, setHoveredPaginationNextButton] = useState(false);
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredCloseComposeButton, setHoveredCloseComposeButton] = useState(false);
  const [hoveredCancelComposeButton, setHoveredCancelComposeButton] = useState(false);
  const [hoveredSendEmailButton, setHoveredSendEmailButton] = useState(false);

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
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Quản lý Email Outlook</h2>
          <p style={{ color: '#4b5563' }}>Đồng bộ và quản lý email từ tài khoản Outlook</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConnect}
            onMouseEnter={() => setHoveredConnectButton(true)}
            onMouseLeave={() => setHoveredConnectButton(false)}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: hoveredConnectButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Plus className="w-4 h-4" />
            Kết nối Outlook
          </button>
          {selectedConnection && (
            <button
              onClick={handleSync}
              disabled={syncing}
              onMouseEnter={() => !syncing && setHoveredSyncButton(true)}
              onMouseLeave={() => setHoveredSyncButton(false)}
              className="px-4 py-2 rounded-lg flex items-center gap-2"
              style={{
                backgroundColor: syncing
                  ? '#9ca3af'
                  : (hoveredSyncButton ? '#15803d' : '#16a34a'),
                color: 'white',
                opacity: syncing ? 0.6 : 1,
                cursor: syncing ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
            </button>
          )}
        </div>
      </div>

      {/* Connections List */}
      {connections.length > 0 && (
        <div className="rounded-lg shadow p-4" style={{ backgroundColor: 'white' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#111827' }}>Tài khoản đã kết nối</h3>
          <div className="space-y-2">
            {connections.map((conn, index) => (
              <div
                key={conn.id}
                className="p-3 border rounded-lg cursor-pointer transition-colors"
                style={{
                  borderColor: selectedConnection === conn.id
                    ? '#2563eb'
                    : (hoveredConnectionItemIndex === index ? '#d1d5db' : '#e5e7eb'),
                  backgroundColor: selectedConnection === conn.id ? '#eff6ff' : 'transparent'
                }}
                onClick={() => {
                  setSelectedConnection(conn.id);
                  setComposeData(prev => ({ ...prev, connectionId: conn.id }));
                }}
                onMouseEnter={() => setHoveredConnectionItemIndex(index)}
                onMouseLeave={() => setHoveredConnectionItemIndex(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: '#6b7280' }} />
                    <div>
                      <p className="font-medium" style={{ color: '#111827' }}>{conn.email}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>
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
                      onMouseEnter={() => setHoveredToggleSyncButtonIndex(index)}
                      onMouseLeave={() => setHoveredToggleSyncButtonIndex(null)}
                      className="p-2 rounded"
                      style={{
                        color: conn.syncEnabled ? '#16a34a' : '#9ca3af',
                        backgroundColor: hoveredToggleSyncButtonIndex === index
                          ? (conn.syncEnabled ? '#dcfce7' : '#f3f4f6')
                          : 'transparent'
                      }}
                      title={conn.syncEnabled ? 'Tắt đồng bộ' : 'Bật đồng bộ'}
                    >
                      {conn.syncEnabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConnection(conn.id);
                      }}
                      onMouseEnter={() => setHoveredDeleteConnectionButtonIndex(index)}
                      onMouseLeave={() => setHoveredDeleteConnectionButtonIndex(null)}
                      className="p-2 rounded"
                      style={{
                        color: '#dc2626',
                        backgroundColor: hoveredDeleteConnectionButtonIndex === index ? '#fef2f2' : 'transparent'
                      }}
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
            <div className="rounded-lg shadow p-4" style={{ backgroundColor: 'white' }}>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <select
                    value={filters.folder}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, folder: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
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
                    <option value="false">Chưa đọc</option>
                    <option value="true">Đã đọc</option>
                  </select>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4" style={{ color: '#6b7280' }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm email..."
                    value={filters.search}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, search: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
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
                <button
                  onClick={() => setShowCompose(true)}
                  onMouseEnter={() => setHoveredComposeButton(true)}
                  onMouseLeave={() => setHoveredComposeButton(false)}
                  className="px-4 py-2 rounded-lg flex items-center gap-2"
                  style={{
                    backgroundColor: hoveredComposeButton ? '#1d4ed8' : '#2563eb',
                    color: 'white'
                  }}
                >
                  <Send className="w-4 h-4" />
                  Soạn email
                </button>
              </div>
            </div>

            {/* Email List */}
            <div className="rounded-lg shadow" style={{ backgroundColor: 'white' }}>
              {loading && emails.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
                  <p style={{ color: '#4b5563' }}>Đang tải...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center" style={{ color: '#6b7280' }}>
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Không có email nào</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {emails.map((email, index) => (
                    <div
                      key={email.id}
                      className="p-4 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: selectedEmail?.id === email.id
                          ? '#dbeafe'
                          : (!email.isRead
                            ? '#eff6ff'
                            : (hoveredEmailItemIndex === index ? '#f9fafb' : 'transparent'))
                      }}
                      onClick={() => handleEmailClick(email)}
                      onMouseEnter={() => setHoveredEmailItemIndex(index)}
                      onMouseLeave={() => setHoveredEmailItemIndex(null)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {email.isRead ? (
                            <Circle className="w-4 h-4" style={{ color: '#9ca3af' }} />
                          ) : (
                            <CheckCircle className="w-4 h-4" style={{ color: '#2563eb' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate" style={{ color: '#111827' }}>
                              {email.fromName || email.fromEmail}
                            </p>
                            <span className="text-xs ml-2" style={{ color: '#6b7280' }}>
                              {formatDate(email.receivedDateTime)}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1 truncate" style={{ color: '#111827' }}>
                            {email.subject || '(Không có tiêu đề)'}
                          </p>
                          <p className="text-sm line-clamp-2" style={{ color: '#4b5563' }}>
                            {email.bodyPreview || email.body?.substring(0, 100) || ''}
                          </p>
                          {email.hasAttachments && (
                            <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#6b7280' }}>
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
                <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-sm" style={{ color: '#4b5563' }}>
                    Trang {pagination.page} / {pagination.totalPages} ({pagination.total} email)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      onMouseEnter={() => pagination.page !== 1 && setHoveredPaginationPrevButton(true)}
                      onMouseLeave={() => setHoveredPaginationPrevButton(false)}
                      className="px-3 py-1 border rounded text-sm"
                      style={{
                        borderColor: '#d1d5db',
                        backgroundColor: hoveredPaginationPrevButton ? '#f9fafb' : 'transparent',
                        color: '#374151',
                        opacity: pagination.page === 1 ? 0.5 : 1,
                        cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      onMouseEnter={() => pagination.page !== pagination.totalPages && setHoveredPaginationNextButton(true)}
                      onMouseLeave={() => setHoveredPaginationNextButton(false)}
                      className="px-3 py-1 border rounded text-sm"
                      style={{
                        borderColor: '#d1d5db',
                        backgroundColor: hoveredPaginationNextButton ? '#f9fafb' : 'transparent',
                        color: '#374151',
                        opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                        cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
                      }}
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
              <div className="rounded-lg shadow p-6 sticky top-4" style={{ backgroundColor: 'white' }}>
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    onMouseEnter={() => setHoveredBackButton(true)}
                    onMouseLeave={() => setHoveredBackButton(false)}
                    className="text-sm"
                    style={{
                      color: hoveredBackButton ? '#111827' : '#4b5563'
                    }}
                  >
                    ← Quay lại
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>{selectedEmail.subject}</h3>
                <div className="space-y-3 mb-4 text-sm">
                  <div>
                    <span style={{ color: '#4b5563' }}>Từ:</span>{' '}
                    <span className="font-medium" style={{ color: '#111827' }}>
                      {selectedEmail.fromName} &lt;{selectedEmail.fromEmail}&gt;
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#4b5563' }}>Đến:</span>{' '}
                    <span className="font-medium" style={{ color: '#111827' }}>
                      {selectedEmail.toRecipients?.map(r => r.email).join(', ') || ''}
                    </span>
                  </div>
                  {selectedEmail.ccRecipients && selectedEmail.ccRecipients.length > 0 && (
                    <div>
                      <span style={{ color: '#4b5563' }}>CC:</span>{' '}
                      <span className="font-medium" style={{ color: '#111827' }}>
                        {selectedEmail.ccRecipients.map(r => r.email).join(', ')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#4b5563' }}>Ngày:</span>{' '}
                    <span className="font-medium" style={{ color: '#111827' }}>
                      {new Date(selectedEmail.receivedDateTime).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div
                  className="prose prose-sm max-w-none border-t pt-4"
                  style={{ borderColor: '#e5e7eb' }}
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body || selectedEmail.bodyPreview }}
                />
              </div>
            ) : (
              <div className="rounded-lg shadow p-6 text-center" style={{ backgroundColor: 'white', color: '#6b7280' }}>
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chọn một email để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'white' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: '#111827' }}>Soạn email mới</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  onMouseEnter={() => setHoveredCloseComposeButton(true)}
                  onMouseLeave={() => setHoveredCloseComposeButton(false)}
                  style={{
                    color: hoveredCloseComposeButton ? '#374151' : '#6b7280'
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Đến</label>
                  <input
                    type="text"
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border rounded-lg"
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
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>CC (tùy chọn)</label>
                  <input
                    type="text"
                    value={composeData.cc}
                    onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border rounded-lg"
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
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>BCC (tùy chọn)</label>
                  <input
                    type="text"
                    value={composeData.bcc}
                    onChange={(e) => setComposeData(prev => ({ ...prev, bcc: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border rounded-lg"
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
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Tiêu đề</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Tiêu đề email"
                    className="w-full px-3 py-2 border rounded-lg"
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
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Nội dung</label>
                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Nội dung email (HTML)"
                    rows={10}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
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
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowCompose(false)}
                    onMouseEnter={() => setHoveredCancelComposeButton(true)}
                    onMouseLeave={() => setHoveredCancelComposeButton(false)}
                    className="px-4 py-2 border rounded-lg"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredCancelComposeButton ? '#f9fafb' : 'transparent',
                      color: '#374151'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={loading}
                    onMouseEnter={() => !loading && setHoveredSendEmailButton(true)}
                    onMouseLeave={() => setHoveredSendEmailButton(false)}
                    className="px-4 py-2 rounded-lg flex items-center gap-2"
                    style={{
                      backgroundColor: loading
                        ? '#9ca3af'
                        : (hoveredSendEmailButton ? '#1d4ed8' : '#2563eb'),
                      color: 'white',
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
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
