import React, { useState, useEffect } from 'react';
import { ShoppingCart, Hand, Calendar, Headphones, Flag, MoreVertical, TrendingUp, TrendingDown, Eye, DollarSign, Users } from 'lucide-react';


const AdminDashboardSession2 = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [summaryData, setSummaryData] = useState({ checkout: 0, click: 0 });

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminDashboard();
      if (response.success && response.data?.charts) {
        const applicationsByDate = response.data.charts.applicationsByDate || [];
        const paymentsByDate = response.data.charts.paymentsByDate || [];

        // Chuyển đổi dữ liệu từ API sang format cho chart
        const formattedData = applicationsByDate.map((item, index) => {
          const date = new Date(item.date);
          const dayLabel = date.getDate();
          
          // Lấy số lượng ứng tuyển (click) và thanh toán (checkout)
          const click = parseInt(item.count || 0);
          const paymentItem = paymentsByDate.find(p => p.date === item.date);
          const checkout = paymentItem ? parseInt(paymentItem.count || 0) : 0;
          const revenue = paymentItem ? parseFloat(paymentItem.totalAmount || 0) / 1000 : 0; // Chia 1000 để hiển thị đẹp hơn
          
          return {
            label: dayLabel.toString(),
            click: click,
            checkout: checkout,
            views: click * 1.5, // Ước tính views
            conversions: checkout,
            revenue: Math.round(revenue),
          };
        });

        // Nếu không có dữ liệu, tạo dữ liệu mẫu cho 12 ngày gần nhất
        if (formattedData.length === 0) {
          const today = new Date();
          const sampleData = [];
          for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            sampleData.push({
              label: date.getDate().toString(),
              click: 0,
              checkout: 0,
              views: 0,
              conversions: 0,
              revenue: 0,
            });
          }
          setChartData(sampleData);
        } else {
          setChartData(formattedData);
        }

        // Tính tổng
        const totalCheckout = formattedData.reduce((sum, item) => sum + item.checkout, 0);
        const totalClick = formattedData.reduce((sum, item) => sum + item.click, 0);
        setSummaryData({ checkout: totalCheckout, click: totalClick });
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Dữ liệu mẫu nếu có lỗi
      setChartData([
        { label: '1', click: 0, checkout: 0, views: 0, conversions: 0, revenue: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = Math.max(
    1200,
    ...chartData.map(d => Math.max(d.click, d.checkout, d.views, d.conversions, d.revenue))
  );
  const yAxisLabels = [];
  const step = Math.ceil(maxValue / 6);
  for (let i = 0; i <= maxValue; i += step) {
    yAxisLabels.push(i);
  }

  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    // Lấy danh sách jobs hot làm campaigns
    const fetchCampaigns = async () => {
      try {
        const response = await api.getJobStatistics();
        if (response.success && response.data?.hotJobs) {
          const hotJobs = response.data.hotJobs.slice(0, 3);
          const campaignData = hotJobs.map((job, index) => {
            const icons = [Calendar, Headphones, Flag];
            const iconColors = [
              { bg: 'bg-purple-100', text: 'text-purple-600' },
              { bg: 'bg-green-100', text: 'text-green-600' },
              { bg: 'bg-orange-100', text: 'text-orange-600' },
            ];
            const progressColors = [
              { bg: 'bg-purple-600', text: 'text-purple-600' },
              { bg: 'bg-green-600', text: 'text-green-600' },
              { bg: 'bg-orange-600', text: 'text-orange-600' },
            ];
            
            return {
              id: job.id,
              name: job.title,
              icon: icons[index] || Calendar,
              iconColor: iconColors[index]?.bg || 'bg-purple-100',
              iconBg: iconColors[index]?.text || 'text-purple-600',
              dateRange: 'Đang hoạt động',
              budget: `${(job.applicationsCount || 0).toLocaleString('en-US')} ứng tuyển`,
              progress: Math.min(100, ((job.applicationsCount || 0) / 50) * 100),
              progressColor: progressColors[index]?.bg || 'bg-purple-600',
              progressTextColor: progressColors[index]?.text || 'text-purple-600',
            };
          });
          setCampaigns(campaignData);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      }
    };

    fetchCampaigns();
  }, []);

  const getYPosition = (value) => {
    return 100 - (value / maxValue) * 100;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Left Section: Statistic */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Statistic</h3>
          <p className="text-sm text-gray-500">Click vs Checkout</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Checkout Card */}
          <div className="bg-teal-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-teal-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-0.5">
              {summaryData.checkout.toLocaleString('en-US')}
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">Thanh toán</span>
            </div>
          </div>

          {/* Click Card */}
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Hand className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-0.5">
              {summaryData.click.toLocaleString('en-US')}
            </p>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-600" />
              <span className="text-xs font-semibold text-red-600">Ứng tuyển</span>
            </div>
          </div>
        </div>

        {/* Line Graph */}
        <div className="relative">
          {/* Y-axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500 pr-2">
            {yAxisLabels.map((label) => (
              <span key={label} className="text-right">
                {label === 0 ? '' : label}
              </span>
            ))}
          </div>

          {/* Chart Area */}
          <div className="ml-8 relative" style={{ height: '350px' }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 350" preserveAspectRatio="none">
              {/* Grid Lines */}
              {yAxisLabels.slice(1).map((label) => {
                const y = (getYPosition(label) / 100) * 350;
                return (
                  <line
                    key={label}
                    x1="0"
                    y1={y}
                    x2="1000"
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Lines */}
              {/* Click Line (Red) - Smooth Curve */}
              {chartData.length > 0 && (
                <path
                  d={(() => {
                    const points = chartData.map((data, index) => {
                      const divisor = chartData.length > 1 ? (chartData.length - 1) : 1;
                      const x = (index / divisor) * 1000;
                      const y = (getYPosition(data.click) / 100) * 350;
                      return { x, y };
                    });
                    if (points.length === 0) return '';
                    let path = `M ${points[0].x},${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
                      const cp1y = points[i - 1].y;
                      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) * 2 / 3;
                      const cp2y = points[i].y;
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
                    }
                    return path;
                  })()}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
              )}

              {/* Checkout Line (Teal) - Smooth Curve */}
              {chartData.length > 0 && (
                <path
                  d={(() => {
                    const points = chartData.map((data, index) => {
                      const divisor = chartData.length > 1 ? (chartData.length - 1) : 1;
                      const x = (index / divisor) * 1000;
                      const y = (getYPosition(data.checkout) / 100) * 350;
                      return { x, y };
                    });
                    if (points.length === 0) return '';
                    let path = `M ${points[0].x},${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
                      const cp1y = points[i - 1].y;
                      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) * 2 / 3;
                      const cp2y = points[i].y;
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
                    }
                    return path;
                  })()}
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
              )}

              {/* Views Line (Blue) - Smooth Curve */}
              {chartData.length > 0 && (
                <path
                  d={(() => {
                    const points = chartData.map((data, index) => {
                      const divisor = chartData.length > 1 ? (chartData.length - 1) : 1;
                      const x = (index / divisor) * 1000;
                      const y = (getYPosition(data.views) / 100) * 350;
                      return { x, y };
                    });
                    if (points.length === 0) return '';
                    let path = `M ${points[0].x},${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
                      const cp1y = points[i - 1].y;
                      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) * 2 / 3;
                      const cp2y = points[i].y;
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
                    }
                    return path;
                  })()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
              )}

              {/* Conversions Line (Purple) - Smooth Curve */}
              {chartData.length > 0 && (
                <path
                  d={(() => {
                    const points = chartData.map((data, index) => {
                      const divisor = chartData.length > 1 ? (chartData.length - 1) : 1;
                      const x = (index / divisor) * 1000;
                      const y = (getYPosition(data.conversions) / 100) * 350;
                      return { x, y };
                    });
                    if (points.length === 0) return '';
                    let path = `M ${points[0].x},${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
                      const cp1y = points[i - 1].y;
                      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) * 2 / 3;
                      const cp2y = points[i].y;
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
                    }
                    return path;
                  })()}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
              )}

              {/* Revenue Line (Green) - Smooth Curve */}
              {chartData.length > 0 && (
                <path
                  d={(() => {
                    const points = chartData.map((data, index) => {
                      const divisor = chartData.length > 1 ? (chartData.length - 1) : 1;
                      const x = (index / divisor) * 1000;
                      const y = (getYPosition(data.revenue) / 100) * 350;
                      return { x, y };
                    });
                    if (points.length === 0) return '';
                    let path = `M ${points[0].x},${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
                      const cp1y = points[i - 1].y;
                      const cp2x = points[i - 1].x + (points[i].x - points[i - 1].x) * 2 / 3;
                      const cp2y = points[i].y;
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
                    }
                    return path;
                  })()}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
              )}

              {/* Data Points and Hover Effects */}
              {chartData.map((data, index) => {
                const divisor = chartData.length > 1 ? (chartData.length - 1) : 1;
                const x = (index / divisor) * 1000;
                const clickY = (getYPosition(data.click) / 100) * 350;
                const checkoutY = (getYPosition(data.checkout) / 100) * 350;
                const viewsY = (getYPosition(data.views) / 100) * 350;
                const conversionsY = (getYPosition(data.conversions) / 100) * 350;
                const revenueY = (getYPosition(data.revenue) / 100) * 350;
                const isHovered = hoveredIndex === index;

                return (
                  <g key={index}>
                    {/* Hover Line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1="0"
                        x2={x}
                        y2="350"
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.5"
                      />
                    )}

                    {/* Click Point */}
                    <circle
                      cx={x}
                      cy={clickY}
                      r="5"
                      fill="#ef4444"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Checkout Point */}
                    <circle
                      cx={x}
                      cy={checkoutY}
                      r="5"
                      fill="#14b8a6"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Views Point */}
                    <circle
                      cx={x}
                      cy={viewsY}
                      r="5"
                      fill="#3b82f6"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Conversions Point */}
                    <circle
                      cx={x}
                      cy={conversionsY}
                      r="5"
                      fill="#a855f7"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Revenue Point */}
                    <circle
                      cx={x}
                      cy={revenueY}
                      r="5"
                      fill="#10b981"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredIndex !== null && chartData.length > 0 && chartData[hoveredIndex] && (
              <div
                className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
                style={{
                  left: `${chartData.length > 1 ? (hoveredIndex / (chartData.length - 1)) * 100 : 0}%`,
                  top: '10px',
                  transform: `translateX(${chartData.length > 1 && (hoveredIndex / (chartData.length - 1)) * 100 > 50 ? '-100%' : '0'})`,
                  minWidth: '160px',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-red-600">
                    Click : {chartData[hoveredIndex]?.click || 0}
                  </span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-teal-600">
                    Checkout : {chartData[hoveredIndex]?.checkout || 0}
                  </span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-blue-600">
                    Views : {chartData[hoveredIndex]?.views || 0}
                  </span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-purple-600">
                    Conversions : {chartData[hoveredIndex]?.conversions || 0}
                  </span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600">
                    Revenue : ${chartData[hoveredIndex]?.revenue || 0}
                  </span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
            )}
          </div>

          {/* X-axis Labels */}
          <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500">
            {chartData.map((data, index) => (
              <span key={index}>{data.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section: Campaign */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Campaign</h3>
          <p className="text-sm text-gray-500">Active Campaign</p>
        </div>

        {/* Campaign Cards */}
        <div className="space-y-4">
          {campaigns.length === 0 && !loading && (
            <p className="text-sm text-gray-500 text-center py-4">Không có chiến dịch nào</p>
          )}
          {campaigns.map((campaign) => {
            const Icon = campaign.icon;
            return (
              <div
                key={campaign.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${campaign.iconColor} p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${campaign.iconBg}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{campaign.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{campaign.dateRange}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{campaign.budget}</span>
                    <span className={`text-xs font-semibold ${campaign.progressTextColor}`}>
                      {campaign.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${campaign.progressColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSession2;

