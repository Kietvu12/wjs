import React, { useState, useEffect, useRef } from 'react';
import { Send, Calendar, Clock, MessageCircle } from 'lucide-react';
import apiService from '../../services/api';

const NominationChat = ({ jobApplicationId, userType = 'admin', onScheduleInterview, onScheduleNyusha, collaboratorId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showNyushaModal, setShowNyushaModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [nyushaDate, setNyushaDate] = useState('');
  const messagesEndRef = useRef(null);
  
  // Hover states
  const [hoveredInterviewButton, setHoveredInterviewButton] = useState(false);
  const [hoveredNyushaButton, setHoveredNyushaButton] = useState(false);
  const [hoveredSendButton, setHoveredSendButton] = useState(false);
  const [hoveredInterviewModalCancel, setHoveredInterviewModalCancel] = useState(false);
  const [hoveredInterviewModalConfirm, setHoveredInterviewModalConfirm] = useState(false);
  const [hoveredNyushaModalCancel, setHoveredNyushaModalCancel] = useState(false);
  const [hoveredNyushaModalConfirm, setHoveredNyushaModalConfirm] = useState(false);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [jobApplicationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = userType === 'admin'
        ? await apiService.getAdminMessagesByJobApplication(jobApplicationId)
        : await apiService.getCTVMessagesByJobApplication(jobApplicationId);

      if (response.success && response.data?.messages) {
        setMessages(response.data.messages);
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

    try {
      setSending(true);
      const messageData = {
        jobApplicationId: parseInt(jobApplicationId),
        content: newMessage.trim(),
        type: 'text'
      };

      const response = userType === 'admin'
        ? await apiService.createAdminMessage(messageData)
        : await apiService.createCTVMessage(messageData);

      if (response.success) {
        setNewMessage('');
        loadMessages();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleScheduleInterview = async () => {
    console.log('[Frontend] handleScheduleInterview called', { interviewDate, interviewTime, userType, jobApplicationId });
    
    if (!interviewDate || !interviewTime) {
      alert('Vui lòng nhập đầy đủ ngày và giờ phỏng vấn');
      return;
    }

    try {
      const dateTime = new Date(`${interviewDate}T${interviewTime}`);
      console.log('[Frontend] DateTime created:', dateTime.toISOString());
      console.log('[Frontend] userType:', userType, 'typeof:', typeof userType);
      
      // Create calendar event (for both admin and CTV)
      let calendarResponse = { success: true };
      const calendarData = {
        jobApplicationId: parseInt(jobApplicationId),
        eventType: 1, // Interview
        startAt: dateTime.toISOString(),
        title: 'Phỏng vấn ứng viên',
        description: `Lịch phỏng vấn cho đơn ứng tuyển #${jobApplicationId}`,
        ...(collaboratorId && userType === 'admin' && { collaboratorId: parseInt(collaboratorId) })
      };
      
      console.log('[Frontend] Creating calendar event with data:', calendarData);
      
      try {
        if (userType === 'admin') {
          console.log('[Frontend] User is admin, calling apiService.createAdminCalendar...');
          calendarResponse = await apiService.createAdminCalendar(calendarData);
        } else {
          console.log('[Frontend] User is CTV, calling apiService.createCTVCalendar...');
          calendarResponse = await apiService.createCTVCalendar(calendarData);
        }
        
        console.log('[Frontend] Calendar API called, response:', calendarResponse);
        
        if (!calendarResponse || !calendarResponse.success) {
          console.error('[Frontend] Calendar creation failed:', calendarResponse);
          alert(calendarResponse?.message || 'Có lỗi xảy ra khi tạo lịch');
          return;
        }
      } catch (error) {
        console.error('[Frontend] Error creating calendar:', error);
        console.error('[Frontend] Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        alert(`Lỗi khi tạo lịch: ${error.message || 'Có lỗi xảy ra khi tạo lịch'}`);
        return;
      }

      console.log('[Frontend] Calendar response check:', calendarResponse);
      if (calendarResponse && calendarResponse.success) {
        // Update job application
        let updateResponse;
        if (userType === 'admin') {
          const updateData = {
            interviewDate: dateTime.toISOString(),
            status: 3 // Đang xếp lịch phỏng vấn
          };
          updateResponse = await apiService.updateAdminJobApplication(jobApplicationId, updateData);
        } else {
          // CTV update - use JSON
          const updateData = {
            interviewDate: dateTime.toISOString(),
            status: 3
          };
          updateResponse = await apiService.updateJobApplication(jobApplicationId, updateData);
        }

        if (updateResponse.success) {
          // Send message
          const messageData = {
            jobApplicationId: parseInt(jobApplicationId),
            content: `Đã đặt lịch phỏng vấn: ${interviewDate} ${interviewTime}`,
            type: 'system'
          };

          await (userType === 'admin'
            ? apiService.createAdminMessage(messageData)
            : apiService.createCTVMessage(messageData));

          setShowInterviewModal(false);
          setInterviewDate('');
          setInterviewTime('');
          loadMessages();
          if (onScheduleInterview) onScheduleInterview();
          alert('Đã đặt lịch phỏng vấn thành công!');
        } else {
          alert(updateResponse.message || 'Có lỗi xảy ra khi cập nhật đơn ứng tuyển');
        }
      } else {
        alert(calendarResponse.message || 'Có lỗi xảy ra khi tạo lịch');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Có lỗi xảy ra khi đặt lịch phỏng vấn');
    }
  };

  const handleScheduleNyusha = async () => {
    if (!nyushaDate) {
      alert('Vui lòng nhập ngày nhập công ty');
      return;
    }

    try {
      const date = new Date(nyushaDate);
      console.log('[Frontend] handleScheduleNyusha called', { nyushaDate, userType, jobApplicationId });
      console.log('[Frontend] userType:', userType, 'typeof:', typeof userType);
      
      // Create calendar event (for both admin and CTV)
      let calendarResponse = { success: true };
      const calendarData = {
        jobApplicationId: parseInt(jobApplicationId),
        eventType: 2, // Nyusha
        startAt: date.toISOString(),
        title: 'Ngày nhập công ty',
        description: `Ngày nhập công ty cho đơn ứng tuyển #${jobApplicationId}`,
        ...(collaboratorId && userType === 'admin' && { collaboratorId: parseInt(collaboratorId) })
      };
      
      console.log('[Frontend] Creating nyusha calendar event with data:', calendarData);
      
      try {
        if (userType === 'admin') {
          console.log('[Frontend] User is admin, calling apiService.createAdminCalendar...');
          calendarResponse = await apiService.createAdminCalendar(calendarData);
        } else {
          console.log('[Frontend] User is CTV, calling apiService.createCTVCalendar...');
          calendarResponse = await apiService.createCTVCalendar(calendarData);
        }
        
        console.log('[Frontend] Calendar API called, response:', calendarResponse);
        
        if (!calendarResponse || !calendarResponse.success) {
          console.error('[Frontend] Calendar creation failed:', calendarResponse);
          alert(calendarResponse?.message || 'Có lỗi xảy ra khi tạo lịch');
          return;
        }
      } catch (error) {
        console.error('[Frontend] Error creating calendar:', error);
        console.error('[Frontend] Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        alert(`Lỗi khi tạo lịch: ${error.message || 'Có lỗi xảy ra khi tạo lịch'}`);
        return;
      }

      console.log('[Frontend] Calendar response check:', calendarResponse);
      if (calendarResponse && calendarResponse.success) {
        // Update job application
        let updateResponse;
        if (userType === 'admin') {
          const updateData = {
            nyushaDate: date.toISOString().split('T')[0],
            status: 8 // Đã nyusha
          };
          updateResponse = await apiService.updateAdminJobApplication(jobApplicationId, updateData);
        } else {
          // CTV update - use JSON
          const updateData = {
            nyushaDate: date.toISOString().split('T')[0],
            status: 8
          };
          updateResponse = await apiService.updateJobApplication(jobApplicationId, updateData);
        }

        if (updateResponse.success) {
          // Send message
          const messageData = {
            jobApplicationId: parseInt(jobApplicationId),
            content: `Đã đặt ngày nhập công ty: ${nyushaDate}`,
            type: 'system'
          };

          await (userType === 'admin'
            ? apiService.createAdminMessage(messageData)
            : apiService.createCTVMessage(messageData));

          setShowNyushaModal(false);
          setNyushaDate('');
          loadMessages();
          if (onScheduleNyusha) onScheduleNyusha();
          alert('Đã đặt ngày nhập công ty thành công!');
        } else {
          alert(updateResponse.message || 'Có lỗi xảy ra khi cập nhật đơn ứng tuyển');
        }
      } else {
        alert(calendarResponse.message || 'Có lỗi xảy ra khi tạo lịch');
      }
    } catch (error) {
      console.error('Error scheduling nyusha:', error);
      alert('Có lỗi xảy ra khi đặt ngày nhập công ty');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}>
            <MessageCircle className="w-4 h-4" />
            Chat
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInterviewModal(true)}
              onMouseEnter={() => setHoveredInterviewButton(true)}
              onMouseLeave={() => setHoveredInterviewButton(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              style={{
                color: '#2563eb',
                backgroundColor: hoveredInterviewButton ? '#dbeafe' : '#eff6ff'
              }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Đặt lịch PV
            </button>
            <button
              onClick={() => setShowNyushaModal(true)}
              onMouseEnter={() => setHoveredNyushaButton(true)}
              onMouseLeave={() => setHoveredNyushaButton(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              style={{
                color: '#16a34a',
                backgroundColor: hoveredNyushaButton ? '#bbf7d0' : '#f0fdf4'
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              Đặt Nyusha
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#2563eb' }}></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm py-8" style={{ color: '#6b7280' }}>
            Chưa có tin nhắn nào
          </div>
        ) : (
          messages.map((message) => {
            // senderType: 1 = Admin, 2 = Collaborator, 3 = System
            const isSender = userType === 'admin' 
              ? message.senderType === 1 
              : message.senderType === 2;
            
            let messageStyle = {};
            if (isSender) {
              messageStyle = { backgroundColor: '#2563eb', color: 'white' };
            } else if (message.senderType === 3 || message.type === 'system') {
              messageStyle = { backgroundColor: '#fef9c3', color: '#854d0e', borderColor: '#fde047', borderWidth: '1px', borderStyle: 'solid' };
            } else {
              messageStyle = { backgroundColor: '#f3f4f6', color: '#111827' };
            }
            
            return (
              <div
                key={message.id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[70%] rounded-lg px-3 py-2"
                  style={messageStyle}
                >
                  <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
            style={{ borderColor: '#d1d5db' }}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            onMouseEnter={() => setHoveredSendButton(true)}
            onMouseLeave={() => setHoveredSendButton(false)}
            className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            style={{
              backgroundColor: hoveredSendButton ? '#2563eb' : '#2563eb',
              color: 'white',
              opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
              cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer'
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg p-6 w-96" style={{ backgroundColor: 'white' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>Đặt lịch phỏng vấn</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Ngày</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Giờ</label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowInterviewModal(false);
                  setInterviewDate('');
                  setInterviewTime('');
                }}
                onMouseEnter={() => setHoveredInterviewModalCancel(true)}
                onMouseLeave={() => setHoveredInterviewModalCancel(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
                style={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  backgroundColor: hoveredInterviewModalCancel ? '#f9fafb' : 'transparent'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleScheduleInterview}
                onMouseEnter={() => setHoveredInterviewModalConfirm(true)}
                onMouseLeave={() => setHoveredInterviewModalConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: hoveredInterviewModalConfirm ? '#2563eb' : '#2563eb',
                  color: 'white'
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nyusha Modal */}
      {showNyushaModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg p-6 w-96" style={{ backgroundColor: 'white' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#111827' }}>Đặt ngày nhập công ty</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Ngày nhập công ty</label>
                <input
                  type="date"
                  value={nyushaDate}
                  onChange={(e) => setNyushaDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowNyushaModal(false);
                  setNyushaDate('');
                }}
                onMouseEnter={() => setHoveredNyushaModalCancel(true)}
                onMouseLeave={() => setHoveredNyushaModalCancel(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
                style={{
                  borderColor: '#d1d5db',
                  color: '#374151',
                  backgroundColor: hoveredNyushaModalCancel ? '#f9fafb' : 'transparent'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleScheduleNyusha}
                onMouseEnter={() => setHoveredNyushaModalConfirm(true)}
                onMouseLeave={() => setHoveredNyushaModalConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: hoveredNyushaModalConfirm ? '#16a34a' : '#16a34a',
                  color: 'white'
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NominationChat;

