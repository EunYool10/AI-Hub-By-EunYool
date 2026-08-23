import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  BarChart2,
  PieChart as PieIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { AITool, Category } from '../types';
import { getCategoryLabel, Language } from '../lib/translations';

interface CategoryChartDashboardProps {
  tools: AITool[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  lang?: Language;
}

const COLORS = [
  '#6c63ff',
  '#00d4aa',
  '#ff6b6b',
  '#f59e0b',
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#10b981',
  '#06b6d4',
  '#f43f5e',
  '#a855f7',
  '#64748b',
];

export const CategoryChartDashboard: React.FC<CategoryChartDashboardProps> = ({
  tools,
  selectedCategory,
  onSelectCategory,
  lang = 'ko',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Compute category statistics
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    tools.forEach((tool) => {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    });

    const data = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        displayName: getCategoryLabel(name as Category, lang),
        count,
        percentage: ((count / tools.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    return data;
  }, [tools, lang]);

  // Price Distribution stats
  const priceStats = useMemo(() => {
    let free = 0;
    let freemium = 0;
    let paid = 0;

    tools.forEach((t) => {
      if (t.price === '무료') free++;
      else if (t.price === '유료') paid++;
      else freemium++;
    });

    return { free, freemium, paid };
  }, [tools]);

  const topCategory = categoryStats[0] || { name: '전체', displayName: lang === 'ko' ? '없음' : 'None', count: 0 };

  return (
    <div className="bg-[#13151f] border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 transition-all duration-300 shadow-xl shadow-black/40">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#6c63ff]/20 border border-[#6c63ff]/30 text-[#00d4aa]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{lang === 'ko' ? 'AI 도구 카테고리 분포 대시보드' : 'AI Tools Distribution Dashboard'}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30">
                {lang === 'ko' ? '실시간 통계' : 'Live Analytics'}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              {lang === 'ko'
                ? `전체 ${tools.length}개 AI 도구의 분야별 분포 및 요약 분석`
                : `Distribution and analytics across ${tools.length} total AI tools`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          {isExpanded && (
            <div className="flex items-center bg-[#1a1d2a] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-[#6c63ff] text-white font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{lang === 'ko' ? '막대' : 'Bar'}</span>
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'pie'
                    ? 'bg-[#6c63ff] text-white font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span>{lang === 'ko' ? '원형' : 'Pie'}</span>
              </button>
            </div>
          )}

          {/* Expand / Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-[#1a1d2a] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium px-2.5"
            title={isExpanded ? (lang === 'ko' ? '접기' : 'Collapse') : (lang === 'ko' ? '펼치기' : 'Expand')}
          >
            <span>{isExpanded ? (lang === 'ko' ? '차트 접기' : 'Hide Chart') : (lang === 'ko' ? '차트 보기' : 'Show Chart')}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-white/10 space-y-5 animate-in fade-in duration-200">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1a1d2a] p-3 rounded-xl border border-white/5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#6c63ff] shrink-0" />
                <span className="truncate">{lang === 'ko' ? '총 등록 도구' : 'Total Tools'}</span>
              </span>
              <p className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">
                {tools.length} <span className="text-xs text-gray-400 font-normal">{lang === 'ko' ? '개' : 'items'}</span>
              </p>
            </div>

            <div className="bg-[#1a1d2a] p-3 rounded-xl border border-white/5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium truncate">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{lang === 'ko' ? '최다 보유 분야' : 'Top Category'}</span>
              </span>
              <div className="flex items-baseline justify-between gap-1 overflow-hidden">
                <span className="text-xs sm:text-sm font-bold text-amber-400 truncate font-['Space_Grotesk']" title={topCategory.displayName}>
                  {topCategory.displayName}
                </span>
                <span className="text-xs text-gray-400 font-normal shrink-0">
                  ({topCategory.count}{lang === 'ko' ? '개' : ''})
                </span>
              </div>
            </div>

            <div className="bg-[#1a1d2a] p-3 rounded-xl border border-white/5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00d4aa] shrink-0" />
                <span className="truncate">{lang === 'ko' ? '무료 제공 도구' : 'Free Tools'}</span>
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-[#00d4aa] font-['Space_Grotesk']">
                  {priceStats.free}{lang === 'ko' ? '개' : ''}
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  ({((priceStats.free / (tools.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="bg-[#1a1d2a] p-3 rounded-xl border border-white/5 flex flex-col justify-between space-y-1">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium truncate">
                <TrendingUp className="w-3.5 h-3.5 text-[#ec4899] shrink-0" />
                <span className="truncate">{lang === 'ko' ? '무료체험 / 유료' : 'Freemium / Paid'}</span>
              </span>
              <p className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">
                {priceStats.freemium + priceStats.paid} <span className="text-xs text-gray-400 font-normal">{lang === 'ko' ? '개' : 'items'}</span>
              </p>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="bg-[#0c0e14]/70 p-4 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>{lang === 'ko' ? '💡 차트 요소나 하단 카테고리 태그를 클릭하면 즉시 필터링됩니다.' : '💡 Click chart bars or category tags below to filter tools.'}</span>
              {selectedCategory !== '전체' && (
                <button
                  onClick={() => onSelectCategory('전체')}
                  className="text-[#00d4aa] hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                >
                  {lang === 'ko' ? '전체 카테고리로 해제 (필터 초기화)' : 'Reset Category Filter'}
                </button>
              )}
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={categoryStats}
                    margin={{ top: 10, right: 10, left: -15, bottom: 60 }}
                  >
                    <XAxis
                      dataKey="displayName"
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-40}
                      textAnchor="end"
                      height={65}
                    />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isCur = selectedCategory === data.name;
                          return (
                            <div className="bg-[#13151f] border border-white/20 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-white">{data.displayName || data.name}</p>
                              <p className="text-[#00d4aa]">
                                {lang === 'ko' ? '등록 수:' : 'Count:'} <strong>{data.count}{lang === 'ko' ? '개' : ''}</strong> ({data.percentage}%)
                              </p>
                              <p className="text-gray-400 text-[10px]">
                                {isCur 
                                  ? (lang === 'ko' ? '클릭 시 전체보기로 해제' : 'Click to reset filter')
                                  : (lang === 'ko' ? '클릭하여 카테고리 선택' : 'Click to filter category')}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      cursor="pointer"
                      onClick={(data) => {
                        if (data && data.name) {
                          const catName = data.name as Category;
                          if (selectedCategory === catName) {
                            onSelectCategory('전체');
                          } else {
                            onSelectCategory(catName);
                          }
                        }
                      }}
                    >
                      {categoryStats.map((entry, index) => {
                        const isSelected = selectedCategory === entry.name;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isSelected ? '#00d4aa' : COLORS[index % COLORS.length]}
                            opacity={selectedCategory === '전체' || isSelected ? 1 : 0.35}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="count"
                      nameKey="displayName"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={45}
                      paddingAngle={3}
                      cursor="pointer"
                      onClick={(data) => {
                        if (data && data.name) {
                          const catName = data.name as Category;
                          if (selectedCategory === catName) {
                            onSelectCategory('전체');
                          } else {
                            onSelectCategory(catName);
                          }
                        }
                      }}
                      label={(props: any) => 
                        props.percent >= 0.045 ? `${props.displayName} (${props.percentage}%)` : ''
                      }
                      labelLine={false}
                    >
                      {categoryStats.map((entry, index) => {
                        const isSelected = selectedCategory === entry.name;
                        return (
                          <Cell
                            key={`pie-cell-${index}`}
                            fill={isSelected ? '#00d4aa' : COLORS[index % COLORS.length]}
                            opacity={selectedCategory === '전체' || isSelected ? 1 : 0.35}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isCur = selectedCategory === data.name;
                          return (
                            <div className="bg-[#13151f] border border-white/20 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-white">{data.displayName || data.name}</p>
                              <p className="text-[#00d4aa]">
                                {lang === 'ko' ? '등록 수:' : 'Count:'} <strong>{data.count}{lang === 'ko' ? '개' : ''}</strong> ({data.percentage}%)
                              </p>
                              <p className="text-gray-400 text-[10px]">
                                {isCur 
                                  ? (lang === 'ko' ? '클릭 시 전체보기로 해제' : 'Click to reset filter')
                                  : (lang === 'ko' ? '클릭하여 카테고리 선택' : 'Click to filter category')}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Category Tool Count Breakdown Text Chips */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                <span>{lang === 'ko' ? '📊 카테고리별 도구 수치 요약' : '📊 Category Summary Breakdown'}</span>
                <span className="text-[11px] text-gray-400">{lang === 'ko' ? '클릭 시 해당 카테고리로 이동' : 'Click tag to filter'}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {categoryStats.map((item, index) => {
                  const isSelected = selectedCategory === item.name;
                  const itemColor = COLORS[index % COLORS.length];

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (isSelected) {
                          onSelectCategory('전체');
                        } else {
                          onSelectCategory(item.name as Category);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-[#00d4aa]/20 border-[#00d4aa] text-white shadow-md shadow-[#00d4aa]/20 font-bold'
                          : 'bg-[#1a1d2a] border-white/10 text-gray-300 hover:text-white hover:border-white/30'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? '#00d4aa' : itemColor }}
                      />
                      <span>{item.displayName || item.name}</span>
                      <span className="font-bold px-1.5 py-0.2 rounded-full bg-black/40 text-[#00d4aa] text-[11px] shrink-0">
                        {item.count}{lang === 'ko' ? '개' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
