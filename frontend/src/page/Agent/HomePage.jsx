import React from 'react';
import AgentHomePageSession1 from '../../component/Agent/AgentHomePageSession1';
import AgentHomePageSession2 from '../../component/Agent/AgentHomePageSession2';
import AgentHomePageSession3 from '../../component/Agent/AgentHomePageSession3';
import AgentHomePageSession4 from '../../component/Agent/AgentHomePageSession4';
import AgentHomePageSession4Floating from '../../component/Agent/AgentHomePageSession4Floating';

const HomePage = () => {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-3 h-full">
        {/* Left Column - Sessions 1, 2, 3 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 lg:pr-2">
          <AgentHomePageSession1 />
          <AgentHomePageSession2 />
          <AgentHomePageSession3 />
        </div>

        {/* Right Column - Session 4 (Desktop only) */}
        <div className="hidden lg:block w-1/3 overflow-y-auto hide-scrollbar">
          <AgentHomePageSession4 />
        </div>
      </div>

      {/* Floating Schedule Button (Mobile only) */}
      <AgentHomePageSession4Floating />
    </>
  );
};

export default HomePage;