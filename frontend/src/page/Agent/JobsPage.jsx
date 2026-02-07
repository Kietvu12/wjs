import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgentJobsPageSession1 from '../../component/Agent/AgentJobsPageSession1';
import AgentJobsPageSession2 from '../../component/Agent/AgentJobsPageSession2';

const JobsPage = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState(null); // Start with null so AgentJobsPageSession2 can load initial jobs
  const [filters, setFilters] = useState(null);

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
    // When searching, reset to null to allow pagination to work with filters
    // The pagination will load jobs with current filters
    setJobs(null);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-3 h-[calc(100vh-100px)] lg:h-[calc(100vh-100px)] overflow-hidden">
      {/* Filter Panel - Full width on mobile, 1/4 on desktop */}
      <div className="w-full lg:w-1/4 flex-shrink-0 h-auto lg:h-full overflow-hidden">
        <AgentJobsPageSession1 
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          compact={true}
        />
      </div>
      
      {/* Job List Area - Full width with pagination */}
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <AgentJobsPageSession2 
          jobs={jobs} 
          filters={filters} 
          showAllJobs={true}
          enablePagination={true}
        />
      </div>
    </div>
  );
};

export default JobsPage;

