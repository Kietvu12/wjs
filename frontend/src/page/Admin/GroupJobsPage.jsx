import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgentJobsPageSession1 from '../../component/Agent/AgentJobsPageSession1';
import AgentJobsPageSession2 from '../../component/Agent/AgentJobsPageSession2';
import apiService from '../../services/api';

const GroupJobsPage = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState(null);
  const [filters, setFilters] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  // Load group info
  useEffect(() => {
    const loadGroupInfo = async () => {
      try {
        const response = await apiService.getMyGroup();
        if (response.success && response.data?.group) {
          setGroupInfo(response.data.group);
        }
      } catch (error) {
        console.error('Error loading group info:', error);
      }
    };
    loadGroupInfo();
  }, []);

  // Read query parameters from URL and set initial filters
  useEffect(() => {
    const campaignId = searchParams.get('campaignId');
    const articleId = searchParams.get('articleId');
    const eventId = searchParams.get('eventId');
    const pickupId = searchParams.get('pickupId');
    const postId = searchParams.get('postId');
    const isHot = searchParams.get('isHot') === 'true';
    const isPinned = searchParams.get('isPinned') === 'true';

    if (campaignId || articleId || eventId || pickupId || postId || isHot || isPinned) {
      setFilters({
        campaignId: campaignId ? parseInt(campaignId) : null,
        articleId: articleId ? parseInt(articleId) : null,
        eventId: eventId ? parseInt(eventId) : null,
        pickupId: pickupId ? parseInt(pickupId) : null,
        postId: postId ? parseInt(postId) : null,
        isHot: isHot || false,
        isPinned: isPinned || false,
      });
    }
  }, [searchParams]);

  const handleSearch = (searchResults) => {
    setJobs(null);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      {groupInfo && (
        <div className="mb-4 rounded-lg p-4" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', border: '1px solid' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#1e3a8a' }}>
            Nhóm: {groupInfo.name}
          </h2>
          <p className="text-sm" style={{ color: '#1d4ed8' }}>
            Mã nhóm: {groupInfo.code} | Số admin: {groupInfo.admins?.length || 0}
          </p>
        </div>
      )}
      <div className="flex gap-3 h-[calc(100vh-200px)]">
        {/* Filter Panel - 1/4 screen width, compact mode */}
        <div className="w-1/4 flex-shrink-0">
          <AgentJobsPageSession1 
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            compact={true}
            useAdminAPI={true}
          />
        </div>
        
        {/* Job List Area - Full width with pagination */}
        <div className="flex-1 min-w-0">
          <AgentJobsPageSession2 
            jobs={jobs} 
            filters={filters} 
            showAllJobs={true}
            enablePagination={true}
            useAdminAPI={true}
          />
        </div>
      </div>
    </div>
  );
};

export default GroupJobsPage;

