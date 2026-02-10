import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const AgentHomePageSession2 = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFilterButtonHovered, setIsFilterButtonHovered] = useState(false);
  const [donutData, setDonutData] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [chartData, setChartData] = useState({
    months: [],
    offerData: [],
    rejectionData: [],
  });

  useEffect(() => {
    loadChartData();
  }, [language]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const [categoryRes, offerRejectionRes] = await Promise.all([
        apiService.getCategoryDistribution(),
        apiService.getOfferRejectionStats({ type: 'month' })
      ]);

      console.log('Category Response:', categoryRes);
      console.log('Offer/Rejection Response:', offerRejectionRes);

      // Load donut chart data (phân bố theo nhóm ngành nghề)
      // Backend trả về: { success: true, data: { categories: [...] } }
      // Mỗi category có: { id, name, slug, count }
      let categories = categoryRes?.success && categoryRes?.data?.categories 
        ? categoryRes.data.categories 
        : [];
      
      console.log('Categories (raw):', categories);
      
      // Xử lý trường hợp categories là object thay vì array (khi chỉ có 1 kết quả)
      if (!Array.isArray(categories)) {
        // Nếu là object, chuyển thành array
        if (categories && typeof categories === 'object' && categories.id) {
          categories = [categories];
          console.log('Converted object to array:', categories);
        } else {
          console.error('Categories is not an array or valid object:', categories);
          categories = []; // Set to empty array if invalid
        }
      }
      
      // Đảm bảo categories là array
      if (Array.isArray(categories) && categories.length > 0) {
        const colors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
        
        // Tạo dữ liệu cho biểu đồ phân bố theo nhóm ngành nghề
        const donutItems = categories.map((category, index) => ({
          label: category.name || '',
          value: parseInt(category.count || 0),
          color: colors[index % colors.length],
        })).filter(item => item.value > 0 && item.label); // Chỉ hiển thị các item có giá trị > 0 và có label

        console.log('Donut Items:', donutItems);
        setDonutData(donutItems);
        
        // Tính tổng số đơn ứng tuyển
        const total = donutItems.reduce((sum, item) => sum + item.value, 0);
        setTotalApplications(total);
      } else {
        console.log('No categories data or empty array');
        setDonutData([]);
        setTotalApplications(0);
      }

      // Load line chart data (offer và rejection)
      if (offerRejectionRes?.success && offerRejectionRes?.data) {
        const offers = offerRejectionRes.data.offers || [];
        const rejections = offerRejectionRes.data.rejections || [];
        
        console.log('Offers:', offers);
        console.log('Rejections:', rejections);
        
        // Merge all periods from both offers and rejections
        const allPeriods = new Set();
        offers.forEach(item => {
          if (item.period) allPeriods.add(item.period);
        });
        rejections.forEach(item => {
          if (item.period) allPeriods.add(item.period);
        });
        
        // Sort periods and get last 7 months
        const sortedPeriods = Array.from(allPeriods).sort().slice(-7);
        
        console.log('Sorted Periods:', sortedPeriods);
        
        const months = sortedPeriods.map(period => {
          // Handle both YYYY-MM and YYYY-WW formats
          if (period && period.includes('-')) {
            const parts = period.split('-');
            if (parts.length === 2) {
              const date = new Date(parts[0], parseInt(parts[1]) - 1, 1);
              return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'en' ? 'en-US' : 'ja-JP', { month: 'short' });
            }
          }
          return period || '';
        });
        
        // Map data for each period
        const offerData = sortedPeriods.map(period => {
          const offer = offers.find(o => o.period === period);
          return offer ? (parseInt(offer.count) || 0) : 0;
        });
        
        const rejectionData = sortedPeriods.map(period => {
          const rejection = rejections.find(r => r.period === period);
          return rejection ? (parseInt(rejection.count) || 0) : 0;
        });

        console.log('Chart Data:', { months, offerData, rejectionData });

        setChartData({
          months,
          offerData,
          rejectionData,
        });
      } else {
        console.warn('Offer/Rejection response is invalid:', offerRejectionRes);
        // Set empty data if response is invalid
        setChartData({
          months: [],
          offerData: [],
          rejectionData: [],
        });
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Set empty data on error
      setDonutData([]);
      setTotalApplications(0);
      setChartData({
        months: [],
        offerData: [],
        rejectionData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate arc segments with gaps
  const calculateArcSegments = (data, gapDegrees = 24) => {
    if (!data || data.length === 0) return [];
    
    const radius = 70;
    const centerX = 100;
    const centerY = 100;
    const strokeWidth = 20;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) return [];
    
    const totalGaps = gapDegrees * data.length;
    const availableDegrees = 360 - totalGaps;
    
    let currentAngle = -90;
    const arcs = [];
    
    data.forEach((item) => {
      const percentage = item.value / total;
      const sweepAngle = (percentage * availableDegrees);
      
      const startAngleRad = (currentAngle * Math.PI) / 180;
      const endAngleRad = ((currentAngle + sweepAngle) * Math.PI) / 180;
      
      const largeArcFlag = sweepAngle > 180 ? 1 : 0;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      arcs.push({
        path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        color: item.color,
        label: item.label,
        value: item.value,
        strokeWidth: strokeWidth,
      });
      
      currentAngle += sweepAngle + gapDegrees;
    });
    
    return arcs;
  };

  const arcSegments = calculateArcSegments(donutData, 30);

  const chartHeight = 180;
  const chartWidth = 800;
  const barWidth = 60;

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6">
          <div className="rounded-lg shadow-sm p-3 border" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
            <div className="animate-pulse h-64"></div>
          </div>
          <div className="rounded-lg shadow-sm p-3 border" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
            <div className="animate-pulse h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6">
        {/* Card 1: Phân bố theo nhóm ngành nghề */}
        <div className="rounded-lg shadow-sm p-3 sm:p-4 border flex flex-col" style={{ backgroundColor: 'white', borderColor: '#f3f4f6' }}>
          <h3 className="text-sm sm:text-base font-semibold mb-2" style={{ color: '#111827' }}>
            {language === 'vi' ? 'Phân bố theo nhóm ngành nghề' : language === 'en' ? 'Distribution by Job Category' : '職種別分布'}
          </h3>
          
          {donutData.length > 0 ? (
            <div className="flex flex-col items-center flex-1">
              {/* Arc Segmented Ring Chart */}
              <div className="relative mb-3 flex-shrink-0" style={{ padding: '8px', overflow: 'visible' }}>
                <svg width="200" height="200" viewBox="-20 -20 240 240" className="drop-shadow-sm" style={{ overflow: 'visible' }}>
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  {arcSegments.map((arc, index) => {
                    const isHovered = hoveredIndex === index;
                    return (
                      <g 
                        key={index}
                        style={{
                          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                          transformOrigin: '100px 100px',
                          transition: 'transform 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <path
                          d={arc.path}
                          fill="none"
                          stroke={arc.color}
                          strokeWidth={isHovered ? arc.strokeWidth + 4 : arc.strokeWidth}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            filter: isHovered ? 'url(#glow) drop-shadow(0 6px 12px rgba(0,0,0,0.25))' : 'none',
                            transition: 'stroke-width 0.3s ease, filter 0.3s ease',
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-bold" style={{ color: '#111827' }}>{totalApplications}</p>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    {language === 'vi' ? 'Đơn ứng tuyển' : language === 'en' ? 'Applications' : '応募'}
                  </p>
                </div>
                
                {/* Tooltip Card */}
                {hoveredIndex !== null && hoveredIndex < donutData.length && (
                  <div 
                    className="absolute rounded-lg shadow-xl border p-2.5 z-10 pointer-events-none animate-fadeIn"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -130%)',
                      minWidth: '110px',
                      backgroundColor: 'white',
                      borderColor: '#e5e7eb'
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: donutData[hoveredIndex].color }}
                        />
                        <span className="text-xs font-medium" style={{ color: '#374151' }}>
                          {donutData[hoveredIndex].label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold" style={{ color: '#111827' }}>
                          {donutData[hoveredIndex].value}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>
                          {totalApplications > 0 ? ((donutData[hoveredIndex].value / totalApplications) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 w-full mt-auto">
                {donutData.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium" style={{ color: '#111827' }}>{item.value}</span>
                    </div>
                    <span className="text-xs text-center leading-tight" style={{ color: '#4b5563' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: '#6b7280' }}>
              {t.noData}
            </div>
          )}
        </div>

        {/* Card 2: Offer và Rejection */}
        <div className="rounded-lg shadow-sm p-3 sm:p-4 border" style={{ overflow: 'visible', backgroundColor: 'white', borderColor: '#f3f4f6' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
            <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#111827' }}>
              {language === 'vi' ? 'Đơn được Offer và Bị Từ chối' : language === 'en' ? 'Offers and Rejections' : 'オファーと拒否'}
            </h3>
            <button 
              onMouseEnter={() => setIsFilterButtonHovered(true)}
              onMouseLeave={() => setIsFilterButtonHovered(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{
                color: '#374151',
                backgroundColor: isFilterButtonHovered ? '#e5e7eb' : '#f3f4f6'
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              {t.filters || 'Filters'}
            </button>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5" style={{ backgroundColor: '#16a34a' }}></div>
              <span className="text-xs" style={{ color: '#4b5563' }}>
                {language === 'vi' ? 'Được Offer (Status 8)' : language === 'en' ? 'Offered (Status 8)' : 'オファー (ステータス8)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5" style={{ backgroundColor: '#dc2626' }}></div>
              <span className="text-xs" style={{ color: '#4b5563' }}>
                {language === 'vi' ? 'Bị Từ chối (Status 15, 16)' : language === 'en' ? 'Rejected (Status 15, 16)' : '拒否 (ステータス15, 16)'}
              </span>
            </div>
          </div>
          
          {/* Line Chart */}
          {chartData.months.length > 0 ? (
            <div className="relative overflow-x-auto" style={{ overflow: 'visible' }}>
              <svg width="100%" minWidth="600" height={chartHeight + 30} viewBox={`-20 -50 ${chartWidth + 40} ${chartHeight + 100}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                {/* Calculate max value for scaling */}
                {(() => {
                  const maxValue = Math.max(...chartData.offerData, ...chartData.rejectionData, 1);
                  const spacing = chartData.months.length > 0 ? (chartWidth - (barWidth * chartData.months.length)) / (chartData.months.length + 1) : 0;
                  
                  return (
                    <>
                      {/* Offer Line */}
                      <polyline
                        points={chartData.months.map((month, index) => {
                          const x = spacing + index * (barWidth + spacing) + barWidth / 2;
                          const y = chartHeight - (maxValue > 0 ? (chartData.offerData[index] / maxValue) * chartHeight : 0);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Rejection Line */}
                      <polyline
                        points={chartData.months.map((month, index) => {
                          const x = spacing + index * (barWidth + spacing) + barWidth / 2;
                          const y = chartHeight - (maxValue > 0 ? (chartData.rejectionData[index] / maxValue) * chartHeight : 0);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Offer points */}
                      {chartData.months.map((month, index) => {
                        const x = spacing + index * (barWidth + spacing) + barWidth / 2;
                        const y = chartHeight - (maxValue > 0 ? (chartData.offerData[index] / maxValue) * chartHeight : 0);
                        const isHovered = hoveredPointIndex === index;
                        
                        return (
                          <g key={`offer-point-${index}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? 8 : 6}
                              fill="#10B981"
                              stroke="white"
                              strokeWidth={isHovered ? 3 : 2.5}
                              style={{
                                cursor: 'pointer',
                                transition: 'r 0.2s ease, stroke-width 0.2s ease',
                              }}
                              onMouseEnter={() => setHoveredPointIndex(index)}
                              onMouseLeave={() => setHoveredPointIndex(null)}
                            />
                            {isHovered && (
                              <g>
                                <rect
                                  x={x - 60}
                                  y={y - 60}
                                  width="120"
                                  height="48"
                                  fill="#1F2937"
                                  rx="4"
                                />
                                <text
                                  x={x}
                                  y={y - 40}
                                  fill="white"
                                  fontSize="11"
                                  fontWeight="500"
                                  textAnchor="middle"
                                >
                                  {language === 'vi' ? 'Offer:' : language === 'en' ? 'Offer:' : 'オファー:'} {chartData.offerData[index]}
                                </text>
                                <text
                                  x={x}
                                  y={y - 25}
                                  fill="white"
                                  fontSize="11"
                                  fontWeight="500"
                                  textAnchor="middle"
                                >
                                  {language === 'vi' ? 'Từ chối:' : language === 'en' ? 'Reject:' : '拒否:'} {chartData.rejectionData[index]}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                      
                      {/* Rejection points */}
                      {chartData.months.map((month, index) => {
                        const x = spacing + index * (barWidth + spacing) + barWidth / 2;
                        const y = chartHeight - (maxValue > 0 ? (chartData.rejectionData[index] / maxValue) * chartHeight : 0);
                        const isHovered = hoveredPointIndex === index;
                        
                        return (
                          <g key={`rejection-point-${index}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? 8 : 6}
                              fill="#EF4444"
                              stroke="white"
                              strokeWidth={isHovered ? 3 : 2.5}
                              style={{
                                cursor: 'pointer',
                                transition: 'r 0.2s ease, stroke-width 0.2s ease',
                              }}
                              onMouseEnter={() => setHoveredPointIndex(index)}
                              onMouseLeave={() => setHoveredPointIndex(null)}
                            />
                          </g>
                        );
                      })}
                      
                      {/* X-axis labels */}
                      {chartData.months.map((month, index) => {
                        const x = spacing + index * (barWidth + spacing) + barWidth / 2;
                        return (
                          <text
                            key={`label-${index}`}
                            x={x}
                            y={chartHeight + 20}
                            textAnchor="middle"
                            fill="#6B7280"
                            fontSize="11"
                          >
                            {month}
                          </text>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64" style={{ color: '#6b7280' }}>
              {t.noData || 'No data'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentHomePageSession2;
