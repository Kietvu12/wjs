import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Calendar, MoreVertical, User, Grid3x3, List } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const AgentHomePageSession4 = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('interview');
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [viewMode, setViewMode] = useState('line'); // 'line' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [naitei, setNaitei] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load schedule data
  useEffect(() => {
    loadSchedule();
  }, [currentMonth]);

  // Listen for calendar created events
  useEffect(() => {
    const handleCalendarCreated = () => {
      loadSchedule(); // Reload schedule when calendar is created
    };
    window.addEventListener('calendarCreated', handleCalendarCreated);
    return () => {
      window.removeEventListener('calendarCreated', handleCalendarCreated);
    };
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await apiService.getSchedule({ month, year });
      
      if (response.success && response.data) {
        // Process interviews
        const processedInterviews = (response.data.interviews || []).map(item => {
          const interviewDate = new Date(item.interviewDate);
          return {
            ...item,
            date: interviewDate.getDate(),
            time: item.interviewTime || '00:00',
            description: item.job?.company?.name || item.description || '',
            role: item.job?.title || item.role || '',
            isActive: new Date(item.interviewDate) >= new Date()
          };
        });
        
        // Process naitei
        const processedNaitei = (response.data.naitei || []).map(item => {
          const naiteiDate = new Date(item.naiteiDate || item.interviewDate);
          return {
            ...item,
            date: naiteiDate.getDate(),
            time: item.naiteiTime || item.interviewTime || '00:00',
            description: item.job?.company?.name || item.description || '',
            role: item.job?.title || item.role || '',
            isActive: naiteiDate >= new Date()
          };
        });
        
        setInterviews(processedInterviews);
        setNaitei(processedNaitei);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      setInterviews([]);
      setNaitei([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate dates for date picker (next 7 days)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dates.push({
        day: dayNames[date.getDay()],
        date: date.getDate()
      });
    }
    return dates;
  };

  const dates = generateDates();

  const allEvents = activeTab === 'interview' ? interviews : naitei;
  const events = viewMode === 'calendar' 
    ? allEvents.filter(event => event.date === selectedDate)
    : allEvents;

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getDaysWithEvents = () => {
    const eventDates = new Set(allEvents.map(event => event.date));
    return eventDates;
  };

  const daysWithEvents = getDaysWithEvents();
  const calendarDays = getDaysInMonth(currentMonth);

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newMonth);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.schedule}</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'line' ? 'calendar' : 'line')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded transition-colors"
              title={viewMode === 'line' ? 'Switch to Calendar' : 'Switch to List'}
            >
              {viewMode === 'line' ? (
                <Grid3x3 className="w-4 h-4 text-gray-600" />
              ) : (
                <List className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              {t.seeAll}
            </button>
          </div>
        </div>

        {/* Month Navigation - Always visible */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => handleMonthChange(-1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button 
            onClick={() => handleMonthChange(1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Date Picker - Only in line mode */}
        {viewMode === 'line' && (
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-1">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center overflow-x-auto scrollbar-hide">
              {dates.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(item.date)}
                  className={`flex flex-col items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors min-w-[50px] sm:min-w-[60px] flex-shrink-0 ${
                    selectedDate === item.date
                      ? 'bg-red-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-medium">{item.day}</span>
                  <span className={`text-sm font-semibold ${selectedDate === item.date ? 'text-white' : 'text-gray-900'}`}>
                    {item.date}
                  </span>
                </button>
              ))}
            </div>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('interview')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'interview'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className={`w-4 h-4 ${activeTab === 'interview' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">{t.interview} {interviews.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('naitei')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'naitei'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'naitei' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">{t.naitei} {naitei.length}</span>
          </button>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {/* Calendar View - Only in calendar mode */}
          {viewMode === 'calendar' && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square"></div>;
                  }
                  const hasEvent = daysWithEvents.has(day);
                  const isSelected = selectedDate === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-colors relative ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {day}
                      </span>
                      {hasEvent && (
                        <span className={`absolute bottom-1 w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-red-600'
                        }`}></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-sm text-gray-500">
                {t.loading || 'Loading...'}
              </div>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex gap-3">
                  {/* Time */}
                  <div className="text-xs font-medium text-gray-500 pt-1 min-w-[50px]">
                    {event.time}
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow relative">
                    <button className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>

                    <div className="flex items-start gap-3 pr-8">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-red-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{event.name}</h4>
                          <p className="text-xs text-gray-600">{event.role}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                        <button
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            event.isActive
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {t.goToMeeting}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">
                {viewMode === 'calendar' ? t.noEventsForDate : t.noEvents}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHomePageSession4;
