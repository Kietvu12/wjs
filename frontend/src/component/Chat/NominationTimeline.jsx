import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, MessageCircle, FileText } from 'lucide-react';
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';

const NominationTimeline = ({ nomination, messages = [] }) => {
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    if (!nomination) return;

    const events = [];

    // Event: Đơn được tạo
    if (nomination.appliedAt || nomination.applied_at) {
      events.push({
        id: 'created',
        type: 'created',
        title: 'Đơn tiến cử được tạo',
        date: nomination.appliedAt || nomination.applied_at,
        icon: FileText,
        color: 'blue',
      });
    }

    // Event: Phỏng vấn vòng 1
    if (nomination.interviewDate || nomination.interview_date) {
      const statusInfo = getJobApplicationStatus(nomination.status);
      events.push({
        id: 'interview1',
        type: 'interview',
        title: 'Phỏng vấn vòng 1',
        date: nomination.interviewDate || nomination.interview_date,
        icon: Calendar,
        color: 'yellow',
        status: nomination.status,
      });
    }

    // Event: Phỏng vấn vòng 2
    if (nomination.interviewRound2Date || nomination.interview_round2_date) {
      events.push({
        id: 'interview2',
        type: 'interview',
        title: 'Phỏng vấn vòng 2',
        date: nomination.interviewRound2Date || nomination.interview_round2_date,
        icon: Calendar,
        color: 'orange',
        status: nomination.status,
      });
    }

    // Event: Nyusha
    if (nomination.nyushaDate || nomination.nyusha_date) {
      events.push({
        id: 'nyusha',
        type: 'nyusha',
        title: 'Ngày nhập công ty',
        date: nomination.nyushaDate || nomination.nyusha_date,
        icon: CheckCircle,
        color: 'green',
        status: nomination.status,
      });
    }

    // Event: Trạng thái hiện tại
    const statusInfo = getJobApplicationStatus(nomination.status);
    events.push({
      id: 'current_status',
      type: 'status',
      title: `Trạng thái: ${statusInfo.label}`,
      date: nomination.updatedAt || nomination.updated_at || nomination.appliedAt || nomination.applied_at,
      icon: nomination.status === 8 || nomination.status === 10 || nomination.status === 12 || nomination.status === 13 
        ? CheckCircle 
        : nomination.status === 15 || nomination.status === 16 || nomination.status === 7 || nomination.status === 9 || nomination.status === 14
        ? XCircle
        : AlertCircle,
      color: nomination.status === 8 || nomination.status === 10 || nomination.status === 12 || nomination.status === 13 
        ? 'green'
        : nomination.status === 15 || nomination.status === 16 || nomination.status === 7 || nomination.status === 9 || nomination.status === 14
        ? 'red'
        : 'yellow',
      status: nomination.status,
      isCurrent: true,
    });

    // Sắp xếp theo thời gian
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTimelineEvents(events);
  }, [nomination]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      red: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timeline
        </h3>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {timelineEvents.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">
            Chưa có sự kiện nào
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-4">
              {timelineEvents.map((event, index) => {
                const Icon = event.icon;
                const isLast = index === timelineEvents.length - 1;
                
                return (
                  <div key={event.id} className="relative flex items-start gap-3">
                    {/* Icon */}
                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getColorClasses(event.color)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className={`p-3 rounded-lg border ${getColorClasses(event.color)} ${event.isCurrent ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}>
                        <h4 className="text-xs font-semibold text-gray-900 mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-600">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NominationTimeline;

