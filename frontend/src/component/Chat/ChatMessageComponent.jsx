import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Trash2, Calendar, X } from 'lucide-react';
import apiService from '../../services/api';
import CreateCalendarModal from './CreateCalendarModal';

const ChatMessageComponent = ({ jobApplicationId, userType = 'ctv', initialAdminId = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedMessageForCalendar, setSelectedMessageForCalendar] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState(initialAdminId);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAdminSelect, setShowAdminSelect] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    loadMessages();
    
    // Load admins for CTV if needed
    if (userType === 'ctv' && !selectedAdminId) {
      loadAdmins();
    }
    
    // Start polling for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [jobApplicationId, userType, selectedAdminId]);

  // Check if admin selection is needed (CTV, no messages, no admin selected)
  useEffect(() => {
    if (userType === 'ctv' && !loading && messages.length === 0 && !selectedAdminId) {
      setShowAdminSelect(true);
    } else if (selectedAdminId) {
      setShowAdminSelect(false);
    }
  }, [userType, loading, messages.length, selectedAdminId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedMessageId && !event.target.closest('.message-menu-container')) {
        setSelectedMessageId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedMessageId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await apiService.getCTVAdminsForMessage({ 
        status: 1, // Only active admins
        search: ''
      });
      
      if (response.success && response.data) {
        setAdmins(response.data.admins || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = userType === 'ctv'
        ? await apiService.getCTVMessagesByJobApplication(jobApplicationId)
        : await apiService.getAdminMessagesByJobApplication(jobApplicationId);
      
      if (response.success && response.data?.messages) {
        setMessages(response.data.messages);
        // Mark all messages as read
        if (userType === 'ctv') {
          await apiService.markAllCTVMessagesRead(jobApplicationId);
        } else {
          await apiService.markAllMessagesReadByAdmin(jobApplicationId);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // For CTV, require admin selection if no admin is selected
    if (userType === 'ctv' && !selectedAdminId) {
      alert('Vui lòng chọn Admin để gửi tin nhắn');
      setShowAdminSelect(true);
      return;
    }

    try {
      setSending(true);
      const response = userType === 'ctv'
        ? await apiService.createCTVMessage({
            jobApplicationId,
            content: newMessage.trim(),
            senderType: 2, // Collaborator
            adminId: selectedAdminId || undefined // Include adminId if selected
          })
        : await apiService.createAdminMessage({
            jobApplicationId,
            content: newMessage.trim(),
            senderType: 1 // Admin
          });

      if (response.success) {
        setNewMessage('');
        setShowAdminSelect(false); // Hide admin select after first message
        loadMessages(); // Reload to get the new message
      } else {
        alert(response.message || 'Có lỗi xảy ra khi gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      return;
    }

    try {
      const response = userType === 'ctv'
        ? await apiService.deleteCTVMessage(messageId)
        : await apiService.deleteAdminMessage(messageId);

      if (response.success) {
        loadMessages();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa tin nhắn');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa tin nhắn');
    }
    setSelectedMessageId(null);
  };

  const handleCreateCalendar = (message) => {
    setSelectedMessageForCalendar(message);
    setShowCalendarModal(true);
    setSelectedMessageId(null);
  };

  const handleCalendarCreated = () => {
    setShowCalendarModal(false);
    setSelectedMessageForCalendar(null);
    // Trigger window event to reload schedules in other components
    window.dispatchEvent(new CustomEvent('calendarCreated', { 
      detail: { jobApplicationId } 
    }));
  };

  // Parse message content to extract job application ID and date
  const parseScheduleMessage = (content) => {
    // Format: "@job_application_id đặt lịch hẹn phỏng vấn / nyusha vào ngày ... nhé"
    const match = content.match(/@(\d+)\s+đặt lịch hẹn\s+(phỏng vấn|nyusha)\s+vào ngày\s+(.+?)\s+nhé/i);
    if (match) {
      return {
        jobApplicationId: match[1],
        eventType: match[2].toLowerCase().includes('nyusha') ? 2 : 1,
        dateText: match[3]
      };
    }
    return null;
  };

  const formatMessageContent = (content, message) => {
    // Check if message contains schedule info
    const scheduleInfo = parseScheduleMessage(content);
    const canCreateCalendar = scheduleInfo && (
      (userType === 'admin' && message.senderType === 2) || // Admin can create from CTV messages
      (userType === 'ctv' && message.senderType === 1) // CTV can create from Admin replies
    );

    // Highlight @job_application_id and make it clickable if schedule info exists
    const parts = content.split(/(@\d+)/g);
    return parts.map((part, index) => {
      if (part.match(/^@\d+$/)) {
        if (canCreateCalendar) {
          return (
            <button
              key={index}
              onClick={() => handleCreateCalendar(message)}
              className="font-semibold text-blue-600 bg-blue-50 px-1 rounded hover:bg-blue-100 cursor-pointer underline"
              title="Bấm để tạo lịch hẹn nhanh"
            >
              {part}
            </button>
          );
        } else {
          return (
            <span key={index} className="font-semibold text-blue-600 bg-blue-50 px-1 rounded">
              {part}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getSenderName = (message) => {
    if (message.senderType === 1) {
      return message.admin?.name || 'Admin';
    } else if (message.senderType === 2) {
      return message.collaborator?.name || message.collaborator?.code || 'CTV';
    } else {
      return 'Hệ thống';
    }
  };

  const isOwnMessage = (message) => {
    if (userType === 'ctv') {
      return message.senderType === 2; // Collaborator
    } else {
      return message.senderType === 1; // Admin
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          messages.map((message) => {
            const ownMessage = isOwnMessage(message);
            const scheduleInfo = parseScheduleMessage(message.content);
            // Admin can create calendar from CTV's schedule messages, CTV can create from Admin's replies
            const canCreateCalendar = scheduleInfo && (
              (userType === 'admin' && message.senderType === 2) || // Admin can create from CTV messages
              (userType === 'ctv' && message.senderType === 1) // CTV can create from Admin replies
            );

            return (
              <div
                key={message.id}
                className={`flex ${ownMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative max-w-[70%] ${ownMessage ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      ownMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 opacity-80">
                      {getSenderName(message)}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {formatMessageContent(message.content, message)}
                    </div>
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {/* Message Actions Menu */}
                  <div className="absolute top-0 right-0 -mt-1 -mr-1 message-menu-container">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessageId(selectedMessageId === message.id ? null : message.id);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          ownMessage
                            ? 'bg-blue-700 hover:bg-blue-800 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      
                      {selectedMessageId === message.id && (
                        <div 
                          className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ownMessage && (
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          )}
                          {canCreateCalendar && (
                            <button
                              onClick={() => handleCreateCalendar(message)}
                              className="w-full px-3 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Tạo lịch hẹn nhanh
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Admin Selection for CTV */}
      {userType === 'ctv' && showAdminSelect && (
        <div className="border-t border-gray-200 p-3 bg-yellow-50">
          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Chọn Admin để gửi tin nhắn *
            </label>
            {loadingAdmins ? (
              <div className="text-sm text-gray-500">Đang tải danh sách Admin...</div>
            ) : (
              <select
                value={selectedAdminId || ''}
                onChange={(e) => {
                  setSelectedAdminId(e.target.value ? parseInt(e.target.value) : null);
                  setShowAdminSelect(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">-- Chọn Admin --</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Vui lòng chọn Admin để gửi tin nhắn về đơn tiến cử này
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 p-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={userType === 'ctv' && !selectedAdminId ? "Vui lòng chọn Admin trước..." : "Nhập tin nhắn..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={sending || (userType === 'ctv' && !selectedAdminId)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || (userType === 'ctv' && !selectedAdminId)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {userType === 'ctv' && selectedAdminId && (
          <div className="mt-2 text-xs text-gray-500">
            Gợi ý: Gửi "@{jobApplicationId} đặt lịch hẹn phỏng vấn vào ngày DD/MM/YYYY HH:mm nhé" để đặt lịch
          </div>
        )}
      </div>

      {/* Create Calendar Modal */}
      {showCalendarModal && selectedMessageForCalendar && (
        <CreateCalendarModal
          message={selectedMessageForCalendar}
          jobApplicationId={jobApplicationId}
          userType={userType}
          onClose={() => {
            setShowCalendarModal(false);
            setSelectedMessageForCalendar(null);
          }}
          onSuccess={handleCalendarCreated}
        />
      )}
    </div>
  );
};

export default ChatMessageComponent;

