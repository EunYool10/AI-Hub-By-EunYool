import React, { useState, useEffect, useRef } from 'react';
import { Search, Dices, Bookmark, X, Flame, Clock, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { Category } from '../types';
import { CategoryTabs, CATEGORIES } from './CategoryTabs';
import { getCategoryLabel, getPriceLabel, Language, UI_TEXT } from '../lib/translations';

interface ControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: Category;
  onCategoryChange: (cat: Category) => void;
  selectedPrice: string;
  onPriceChange: (price: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
  onOpenRandomModal: () => void;
  lang?: Language;
}

const TRENDING_KEYWORDS = [
  { rank: 1, keyword: 'ChatGPT', tag: 'HOT' },
  { rank: 2, keyword: 'Claude 3.5', tag: 'HOT' },
  { rank: 3, keyword: 'DeepSeek', tag: 'NEW' },
  { rank: 4, keyword: 'Midjourney', tag: 'POPULAR' },
  { rank: 5, keyword: 'Cursor', tag: 'POPULAR' },
  { rank: 6, keyword: 'n8n 자동화', tag: 'TREND' },
];

const AUTO_SUGGESTIONS = [
  'ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Midjourney', 'Cursor',
  'Perplexity', 'Wrtn', 'n8n', 'Adobe Firefly', 'Sora', 'Suno AI',
  '프롬프트 작성', '코드 생성', '이미지 생성', 'PPT 제작'
];

export const Controls: React.FC<ControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPrice,
  onPriceChange,
  selectedSort,
  onSortChange,
  showBookmarksOnly,
  onToggleBookmarksOnly,
  onOpenRandomModal,
  lang = 'ko',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ai_hub_recent_searches');
      return saved ? JSON.parse(saved).slice(0, 5) : ['ChatGPT', 'DeepSeek', 'Claude 3.5', 'Midjourney', 'Cursor'];
    } catch {
      return ['ChatGPT', 'DeepSeek', 'Claude 3.5', 'Midjourney', 'Cursor'];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const filtered = recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('ai_hub_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    onSearchChange(keyword);
    saveRecentSearch(keyword);
    setIsDropdownOpen(false);
  };

  const handleDeleteRecent = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== keyword);
    setRecentSearches(updated);
    try {
      localStorage.setItem('ai_hub_recent_searches', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('ai_hub_recent_searches');
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      setIsDropdownOpen(false);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // Filtered auto-suggestions when typing
  const filteredSuggestions = searchQuery.trim()
    ? AUTO_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Row 1: Search, Filter, Sort, Bookmarks, Random Button */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 sm:gap-3">
        {/* Search input with Dropdown (Prominent flex-1) */}
        <div ref={searchContainerRef} className="relative w-full lg:flex-1 z-30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              aria-label={UI_TEXT.controls.searchPlaceholder[lang]}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsDropdownOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={UI_TEXT.controls.searchPlaceholder[lang]}
              className="w-full h-11 sm:h-12 bg-[#12141f] border border-white/15 text-white placeholder-gray-400/80 text-xs sm:text-sm rounded-xl pl-10 sm:pl-11 pr-9 py-2.5 focus:outline-none focus:border-[#6c63ff] focus:ring-4 focus:ring-[#6c63ff]/20 focus:shadow-[0_0_24px_rgba(108,99,255,0.25)] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setIsDropdownOpen(true);
                }}
                aria-label={lang === 'ko' ? '검색어 지우기' : 'Clear search query'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title={lang === 'ko' ? '지우기' : 'Clear'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Overlay */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#13151f] border border-white/15 rounded-2xl shadow-2xl shadow-black p-4 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              {/* If typing: show matching suggestions */}
              {searchQuery.trim() ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00d4aa] px-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'ko' ? '추천 검색어' : 'Suggested Keywords'}</span>
                  </div>

                  {filteredSuggestions.length > 0 ? (
                    <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                      {filteredSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectKeyword(suggestion)}
                          className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:text-white hover:bg-[#6c63ff]/20 rounded-xl transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#00d4aa]" />
                            <span>{suggestion}</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-[#00d4aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-3 text-center">
                      {lang === 'ko' ? (
                        <>'<strong className="text-white">{searchQuery}</strong>' 키워드로 검색하기 (엔터)</>
                      ) : (
                        <>Search for '<strong className="text-white">{searchQuery}</strong>' (Enter)</>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Standard View: Recent Searches + Trending Keywords */
                <div className="space-y-4">
                  {/* Recent Searches */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold px-1 mb-2">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#6c63ff]" />
                        <span>{UI_TEXT.controls.recentTitle[lang]}</span>
                      </span>

                      {recentSearches.length > 0 && (
                        <button
                          onClick={handleClearAllRecent}
                          className="text-[11px] text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{UI_TEXT.controls.clearRecent[lang]}</span>
                        </button>
                      )}
                    </div>

                    {recentSearches.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectKeyword(term)}
                            className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1d2a] hover:bg-[#6c63ff]/20 text-xs text-gray-300 hover:text-white border border-white/10 hover:border-[#6c63ff]/40 transition-all cursor-pointer"
                          >
                            <span>{term}</span>
                            <button
                              onClick={(e) => handleDeleteRecent(term, e)}
                              className="text-gray-400 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                              title={lang === 'ko' ? '삭제' : 'Delete'}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 px-1 py-1 italic">
                        {lang === 'ko' ? '최근 검색 내역이 없습니다.' : 'No recent searches.'}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    {/* Trending Keywords */}
                    <div className="flex items-center justify-between text-xs font-semibold px-1 mb-2">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{UI_TEXT.controls.trendingTitle[lang]}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">AI Hub LIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {TRENDING_KEYWORDS.map((item) => (
                        <button
                          key={item.rank}
                          onClick={() => handleSelectKeyword(item.keyword)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 text-xs text-left transition-colors cursor-pointer group"
                        >
                          <span className={`font-bold w-4 text-center ${item.rank <= 3 ? 'text-amber-400' : 'text-gray-400'}`}>
                            {item.rank}
                          </span>
                          <span className="text-gray-200 group-hover:text-white truncate font-medium flex-1">
                            {item.keyword}
                          </span>
                          {item.tag && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                              {item.tag}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Controls Toolbar: [ Price ] [ Sort ] [ Bookmarks ] [ Random Tool ] */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          {/* Price filter select dropdown */}
          <select
            value={selectedPrice}
            aria-label={lang === 'ko' ? '가격 필터' : 'Price filter'}
            onChange={(e) => onPriceChange(e.target.value)}
            className="h-11 sm:h-12 bg-[#1a1d2a] hover:bg-[#222636] border border-white/10 hover:border-white/20 text-white text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#6c63ff] cursor-pointer shrink-0 transition-colors"
          >
            <option value="all">{getPriceLabel('all', lang)}</option>
            <option value="무료">{getPriceLabel('무료', lang)}</option>
            <option value="유료">{getPriceLabel('유료', lang)}</option>
            <option value="무료/유료">{getPriceLabel('무료/유료', lang)}</option>
          </select>

          {/* Sort select dropdown */}
          <select
            value={selectedSort}
            aria-label={lang === 'ko' ? '정렬 옵션' : 'Sort option'}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 sm:h-12 bg-[#1a1d2a] hover:bg-[#222636] border border-white/10 hover:border-white/20 text-white text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#6c63ff] cursor-pointer shrink-0 transition-colors"
          >
            <option value="default">{UI_TEXT.controls.sortDefault[lang]}</option>
            <option value="abc">{UI_TEXT.controls.sortAbc[lang]}</option>
          </select>

          {/* Bookmark toggle filter */}
          <button
            onClick={onToggleBookmarksOnly}
            aria-label={UI_TEXT.controls.bookmarkFilter[lang]}
            className={`h-11 sm:h-12 inline-flex items-center gap-1.5 px-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              showBookmarksOnly
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-[#1a1d2a] hover:bg-[#222636] border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{showBookmarksOnly ? (lang === 'ko' ? '전체 보기' : 'Show All') : UI_TEXT.controls.bookmarkFilter[lang]}</span>
          </button>

          {/* Random Tool Picker Button */}
          <button
            onClick={onOpenRandomModal}
            aria-label={UI_TEXT.controls.randomBtn[lang]}
            className="h-11 sm:h-12 inline-flex items-center gap-1.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#6c63ff]/20 to-[#00d4aa]/20 border border-[#6c63ff]/40 text-[#6c63ff] hover:border-[#6c63ff] hover:from-[#6c63ff]/30 hover:to-[#00d4aa]/30 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
          >
            <Dices className="w-4 h-4 text-[#00d4aa]" />
            <span>{UI_TEXT.controls.randomBtn[lang]}</span>
          </button>
        </div>
      </div>

      {/* Row 2: Category Tabs */}
      <CategoryTabs
        activeCategory={selectedCategory}
        onSelectCategory={onCategoryChange}
        lang={lang}
      />
    </div>
  );
};

