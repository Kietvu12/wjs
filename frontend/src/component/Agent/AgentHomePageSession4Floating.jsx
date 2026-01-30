import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Calendar, MoreVertical, User, Grid3x3, List, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const AgentHomePageSession4Floating = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('interview');
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [viewMode, setViewMode] = useState('line');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [naitei, setNaitei] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Button dragging state (for floating button)
  const [buttonPosition, setButtonPosition] = useState({ x: 16, y: window.innerHeight - 100 });
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [buttonDragStart, setButtonDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  // Update button position on window resize
  useEffect(() => {
    const handleResize = () => {
      setButtonPosition(prev => {
        const maxX = window.innerWidth - 56; // 56 = button width (w-14)
        const maxY = window.innerHeight - 100; // Account for bottom navbar
        return {
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY)
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load schedule data
  useEffect(() => {
    if (isOpen) {
      loadSchedule();
    }
  }, [currentMonth, isOpen]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await apiService.getSchedule({ month, year });
      
      if (response.success && response.data) {
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

  // Handle button drag start
  const handleButtonDragStart = (e) => {
    setIsDraggingButton(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setButtonDragStart({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle button drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingButton) return;
      
      const newX = e.clientX - buttonDragStart.x;
      const newY = e.clientY - buttonDragStart.y;
      
      // Constrain to viewport (account for button size and bottom navbar)
      const buttonSize = 56; // w-14 = 56px
      const bottomNavbarHeight = 80;
      const maxX = window.innerWidth - buttonSize;
      const maxY = window.innerHeight - buttonSize - bottomNavbarHeight;
      
      setButtonPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
      e.preventDefault();
    };

    const handleTouchMove = (e) => {
      if (!isDraggingButton) return;
      const touch = e.touches[0];
      const newX = touch.clientX - buttonDragStart.x;
      const newY = touch.clientY - buttonDragStart.y;
      
      const buttonSize = 56;
      const bottomNavbarHeight = 80;
      const maxX = window.innerWidth - buttonSize;
      const maxY = window.innerHeight - buttonSize - bottomNavbarHeight;
      
      setButtonPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsDraggingButton(false);
    };

    const handleTouchEnd = () => {
      setIsDraggingButton(false);
    };

    if (isDraggingButton) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingButton, buttonDragStart]);

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
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

  // Calculate total events count
  const totalEvents = interviews.length + naitei.length;

  return (
    <>
      {/* Floating Button - Only on mobile, draggable */}
      <div 
        className="lg:hidden fixed z-40"
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          cursor: isDraggingButton ? 'grabbing' : 'grab'
        }}
      >
        <button
          ref={buttonRef}
          onMouseDown={handleButtonDragStart}
          onTouchStart={handleButtonDragStart}
          onClick={(e) => {
            // Only open/close if not dragging
            if (!isDraggingButton) {
              setIsOpen(!isOpen);
            }
          }}
          className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all flex items-center justify-center relative group select-none touch-none"
          style={{
            cursor: isDraggingButton ? 'grabbing' : 'grab'
          }}
        >
          <Calendar className="w-6 h-6 pointer-events-none" />
          {totalEvents > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-red-600 rounded-full text-xs font-bold flex items-center justify-center pointer-events-none">
              {totalEvents > 9 ? '9+' : totalEvents}
            </span>
          )}
        </button>
      </div>

      {/* Modal - Draggable */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 z-40"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal - Always centered */}
          <div
            ref={modalRef}
            className="lg:hidden fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: '400px',
              maxHeight: '80vh',
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white select-none"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-gray-900">{t.schedule}</h3>
                {totalEvents > 0 && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full">
                    {totalEvents}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3" style={{ overflowX: 'hidden' }}>
              {/* Month Navigation */}
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

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200 mb-3">
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors text-xs ${
                    activeTab === 'interview'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  <MessageCircle className={`w-3.5 h-3.5 ${activeTab === 'interview' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span>{t.interview} {interviews.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('naitei')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors text-xs ${
                    activeTab === 'naitei'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  <Calendar className={`w-3.5 h-3.5 ${activeTab === 'naitei' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span>{t.naitei} {naitei.length}</span>
                </button>
              </div>

              {/* Events List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-4 text-xs text-gray-500">
                    {t.loading || 'Loading...'}
                  </div>
                ) : events.length > 0 ? (
                  events.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-gray-300 transition-colors"
                      style={{
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <div className="text-xs font-medium text-gray-500 pt-0.5 min-w-[40px]">
                        {event.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 truncate">{event.name || event.role}</h4>
                        <p className="text-xs text-gray-600 truncate">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500">
                    {t.noEvents || 'No events'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AgentHomePageSession4Floating;

