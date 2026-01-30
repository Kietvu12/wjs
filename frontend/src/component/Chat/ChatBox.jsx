import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Search, ChevronRight } from 'lucide-react';
import ChatMessageComponent from './ChatMessageComponent';
import apiService from '../../services/api';

const ChatBox = ({ userType = 'ctv', onClose, initialJobApplicationId = null }) => {
  const [showChatList, setShowChatList] = useState(!initialJobApplicationId); // Nếu có initialJobApplicationId thì không hiển thị danh sách
  const [selectedJobApplicationId, setSelectedJobApplicationId] = useState(initialJobApplicationId);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Nếu có initialJobApplicationId, set trực tiếp vào chat và không hiển thị danh sách
    if (initialJobApplicationId) {
      setSelectedJobApplicationId(initialJobApplicationId);
      setShowChatList(false);
    } else if (showChatList) {
      loadJobApplications();
    }
  }, [initialJobApplicationId]); // Chỉ phụ thuộc vào initialJobApplicationId

  // Separate effect for loading job applications when showing list
  useEffect(() => {
    if (showChatList && !initialJobApplicationId) {
      loadJobApplications();
    }
  }, [showChatList, userType]);

  const loadJobApplications = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        sortBy: 'applied_at',
        sortOrder: 'DESC'
      };

      const response = userType === 'ctv'
        ? await apiService.getJobApplications(params)
        : await apiService.getAdminJobApplications(params);

      if (response.success && response.data) {
        const apps = response.data.jobApplications || response.data.applications || [];
        setJobApplications(apps);
      }
    } catch (error) {
      console.error('Error loading job applications:', error);
      setJobApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJobApplication = (jobApplicationId) => {
    setSelectedJobApplicationId(jobApplicationId);
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedJobApplicationId(null);
  };

  const filteredApplications = jobApplications.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const candidateName = app.name || app.cv?.fullName || '';
    const jobTitle = app.job?.title || '';
    const companyName = app.job?.company?.name || '';
    return (
      candidateName.toLowerCase().includes(query) ||
      jobTitle.toLowerCase().includes(query) ||
      companyName.toLowerCase().includes(query) ||
      app.id.toString().includes(query)
    );
  });

  return (
    <div className="fixed bottom-4 right-4 w-[90vw] sm:w-96 max-w-[500px] h-[70vh] sm:h-[600px] max-h-[700px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold text-sm">
            {showChatList ? 'Tin nhắn' : 'Chat'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {!showChatList && (
            <button
              onClick={handleBackToList}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Quay lại danh sách"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {showChatList ? (
          <>
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn ứng tuyển..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Job Applications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  {searchQuery ? 'Không tìm thấy đơn ứng tuyển' : 'Chưa có đơn ứng tuyển nào'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredApplications.map((app) => {
                    const candidateName = app.name || app.cv?.fullName || 'N/A';
                    const jobTitle = app.job?.title || 'N/A';
                    const companyName = app.job?.company?.name || '';
                    
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleSelectJobApplication(app.id)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {candidateName}
                            </div>
                            <div className="text-xs text-gray-600 truncate mt-1">
                              {jobTitle}
                            </div>
                            {companyName && (
                              <div className="text-xs text-gray-500 truncate mt-1">
                                {companyName}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {app.id}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : selectedJobApplicationId ? (
          <ChatMessageComponent
            jobApplicationId={selectedJobApplicationId}
            userType={userType}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            Vui lòng chọn đơn ứng tuyển để xem tin nhắn
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;

