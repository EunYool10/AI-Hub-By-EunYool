import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Tag,
  DollarSign,
  Download,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { AITool, Category, PriceType } from '../../types';
import { safeFetchJson } from '../../lib/api';

interface AdminToolsTabProps {
  currentUserEmail: string;
  lang: 'ko' | 'en';
  tools: AITool[];
  onUpdateTools: (tools: AITool[]) => void;
  showToast: (msg: string) => void;
}

const CATEGORIES: Category[] = [
  '전체',
  '기획/글쓰기',
  '디자인/이미지',
  '디자인 생성',
  '영상/오디오',
  '음성 변환(TTS/STT)',
  '번역/어학',
  '개발/데이터',
  '코드 최적화',
  '생산성/협업',
  '마케팅/분석',
  '학술/리서치',
  '3D/공간',
  '에이전트/자동화',
  '금융/투자',
  '교육/튜터',
  '비즈니스/법률',
];

export const AdminToolsTab: React.FC<AdminToolsTabProps> = ({
  currentUserEmail,
  lang,
  tools,
  onUpdateTools,
  showToast,
}) => {
  const isKo = lang === 'ko';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED'>('ALL');

  // Modal states for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    price: string;
    url: string;
    description: string;
    descriptionEn: string;
    tags: string;
    keyFeatures: string;
    useCases: string;
  }>({
    name: '',
    category: '기획/글쓰기',
    price: '무료/유료',
    url: '',
    description: '',
    descriptionEn: '',
    tags: '',
    keyFeatures: '',
    useCases: '',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleOpenAdd = () => {
    setEditingTool(null);
    setFormData({
      name: '',
      category: '기획/글쓰기',
      price: '무료/유료',
      url: '',
      description: '',
      descriptionEn: '',
      tags: '',
      keyFeatures: '',
      useCases: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tool: AITool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name || '',
      category: tool.category || '기획/글쓰기',
      price: tool.price || '무료/유료',
      url: tool.url || '',
      description: tool.description || '',
      descriptionEn: tool.descriptionEn || '',
      tags: tool.tags ? tool.tags.join(', ') : '',
      keyFeatures: tool.keyFeatures ? tool.keyFeatures.join('\n') : '',
      useCases: tool.useCases || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim() || !formData.description.trim()) {
      showToast('도구 이름, URL, 설명은 필수 입력 항목입니다.');
      return;
    }

    const tagList = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const featureList = formData.keyFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingTool) {
      // Update existing tool
      const updatedList = tools.map((t) => {
        if (t.id === editingTool.id) {
          return {
            ...t,
            name: formData.name.trim(),
            category: formData.category,
            price: formData.price,
            url: formData.url.trim(),
            description: formData.description.trim(),
            descriptionEn: formData.descriptionEn.trim(),
            tags: tagList,
            keyFeatures: featureList,
            useCases: formData.useCases.trim(),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      onUpdateTools(updatedList);
      saveToStorage(updatedList);
      showToast(isKo ? `✅ AI 도구 [${formData.name}] 정보가 수정되었습니다.` : 'Tool updated successfully.');

      // Record audit log
      safeFetchJson('/api/admin/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
        },
        body: JSON.stringify({
          action: 'Tool Updated',
          target: formData.name,
          details: `카테고리: ${formData.category}, 가격: ${formData.price}`,
        }),
      });
    } else {
      // Create new tool
      const maxId = tools.reduce((max, t) => (t.id > max ? t.id : max), 0);
      const newTool: AITool = {
        id: maxId + 1,
        name: formData.name.trim(),
        category: formData.category,
        price: formData.price,
        url: formData.url.trim(),
        description: formData.description.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        tags: tagList,
        keyFeatures: featureList,
        useCases: formData.useCases.trim(),
        isCustom: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [newTool, ...tools];
      onUpdateTools(updatedList);
      saveToStorage(updatedList);
      showToast(isKo ? `✅ 신규 AI 도구 [${formData.name}]가 추가되었습니다.` : 'New tool added successfully.');

      // Record audit log
      safeFetchJson('/api/admin/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUserEmail,
        },
        body: JSON.stringify({
          action: 'Tool Created',
          target: formData.name,
          details: `카테고리: ${formData.category}, URL: ${formData.url}`,
        }),
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (tool: AITool) => {
    const isCurrentlyActive = tool.status !== 'inactive' && !tool.isDeleted;
    const nextStatus = isCurrentlyActive ? 'inactive' : 'active';

    const updatedList = tools.map((t) => {
      if (t.id === tool.id) {
        return {
          ...t,
          status: nextStatus as any,
          isDeleted: false,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    onUpdateTools(updatedList);
    saveToStorage(updatedList);
    showToast(
      isKo
        ? `도구 [${tool.name}]의 상태가 [${nextStatus === 'active' ? '활성' : '비활성'}]로 변경되었습니다.`
        : `Tool status updated.`
    );
  };

  const handleDeleteTool = (tool: AITool, softDelete = true) => {
    let updatedList: AITool[];
    if (softDelete) {
      updatedList = tools.map((t) => {
        if (t.id === tool.id) {
          return { ...t, isDeleted: true, status: 'discontinued' as any };
        }
        return t;
      });
      showToast(isKo ? `도구 [${tool.name}]가 삭제(보관) 처리되었습니다.` : 'Tool soft deleted.');
    } else {
      updatedList = tools.filter((t) => t.id !== tool.id);
      showToast(isKo ? `도구 [${tool.name}]가 영구 삭제되었습니다.` : 'Tool permanently deleted.');
    }

    onUpdateTools(updatedList);
    saveToStorage(updatedList);
    setDeleteConfirmId(null);
  };

  const handleRestoreTool = (tool: AITool) => {
    const updatedList = tools.map((t) => {
      if (t.id === tool.id) {
        return { ...t, isDeleted: false, status: 'active' as any };
      }
      return t;
    });
    onUpdateTools(updatedList);
    saveToStorage(updatedList);
    showToast(isKo ? `도구 [${tool.name}]가 정상 복구되었습니다.` : 'Tool restored.');
  };

  const saveToStorage = (updatedList: AITool[]) => {
    try {
      const customOnly = updatedList.filter((t) => t.isCustom || t.isDeleted || t.status === 'inactive');
      localStorage.setItem('aiCustomTools', JSON.stringify(customOnly));
      window.dispatchEvent(new Event('aihub_tools_changed'));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tools, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai-hub-tools-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(isKo ? '📁 전체 도구 카탈로그 백업 JSON 다운로드 완료' : 'Backup exported.');
  };

  const filteredTools = tools.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.descriptionEn?.toLowerCase().includes(q) ||
      t.url?.toLowerCase().includes(q) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)));

    const matchesCategory = selectedCategory === '전체' || t.category === selectedCategory;
    const matchesPrice =
      selectedPrice === 'all' ||
      (selectedPrice === 'free' && t.price === '무료') ||
      (selectedPrice === 'paid' && t.price === '유료') ||
      (selectedPrice === 'freemium' && t.price === '무료/유료');

    const isDeleted = Boolean(t.isDeleted);
    const isInactive = t.status === 'inactive';

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = !isDeleted && !isInactive;
    else if (statusFilter === 'INACTIVE') matchesStatus = isInactive && !isDeleted;
    else if (statusFilter === 'DELETED') matchesStatus = isDeleted;

    return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface-2 to-surface border border-amber-400/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-extrabold uppercase rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              AI TOOLS CATALOG
            </span>
            <span className="text-xs text-muted">
              {isKo ? '전체 도구 데이터베이스 관리 및 실시간 동기화' : 'Catalog Manager & Live Sync'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-fg mt-1">
            {isKo ? 'AI 도구 카탈로그 관리' : 'AI Tools Management'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {isKo
              ? `등록 도구: 총 ${tools.length}개 (활성: ${tools.filter((t) => !t.isDeleted && t.status !== 'inactive').length}개)`
              : `Total Tools: ${tools.length} (Active: ${tools.filter((t) => !t.isDeleted && t.status !== 'inactive').length})`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 bg-surface-3 hover:bg-surface-3 border border-line text-fg-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer inline-flex items-center gap-1.5"
            title="JSON 백업 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isKo ? 'JSON 백업' : 'Export JSON'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isKo ? '신규 도구 등록' : 'Add AI Tool'}</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Controls */}
      <div className="p-4 rounded-2xl bg-surface border border-line space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKo ? '도구 이름, 설명, 태그 검색...' : 'Search tools, tags, url...'}
              className="w-full pl-9 pr-3.5 py-2 bg-surface-2 border border-line rounded-xl text-xs text-fg placeholder:text-subtle focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-xs text-fg-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-xs text-fg-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">{isKo ? '전체 가격' : 'All Prices'}</option>
              <option value="free">{isKo ? '무료' : 'Free'}</option>
              <option value="freemium">{isKo ? '무료/유료' : 'Freemium'}</option>
              <option value="paid">{isKo ? '유료' : 'Paid'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-xs text-fg-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">{isKo ? '전체 상태' : 'All Status'}</option>
              <option value="ACTIVE">{isKo ? '활성 (Active)' : 'Active'}</option>
              <option value="INACTIVE">{isKo ? '비활성 (Inactive)' : 'Inactive'}</option>
              <option value="DELETED">{isKo ? '삭제됨 (Deleted)' : 'Deleted'}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted pt-1">
          <span>
            {isKo ? '검색 결과:' : 'Filtered:'} <span className="text-amber-300 font-bold">{filteredTools.length}</span>개
          </span>
          {(searchQuery || selectedCategory !== '전체' || selectedPrice !== 'all' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('전체');
                setSelectedPrice('all');
                setStatusFilter('ALL');
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              {isKo ? '필터 초기화' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Tools Table */}
      <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 text-muted font-bold border-b border-line uppercase text-[0.6875rem]">
              <tr>
                <th className="py-3 px-4 w-12">ID</th>
                <th className="py-3 px-4">AI 도구 명 (Name)</th>
                <th className="py-3 px-4">카테고리 (Category)</th>
                <th className="py-3 px-4">가격 (Price)</th>
                <th className="py-3 px-4">상태 (Status)</th>
                <th className="py-3 px-4 text-right">관리 제어 (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-subtle">
                    {isKo ? '조건에 맞는 AI 도구가 없습니다.' : 'No tools match the criteria.'}
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => {
                  const isDeleted = Boolean(tool.isDeleted);
                  const isInactive = tool.status === 'inactive';

                  return (
                    <tr
                      key={tool.id}
                      className={`hover:bg-fg/[0.02] transition-colors ${
                        isDeleted ? 'opacity-50 bg-rose-950/10' : isInactive ? 'opacity-70 bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-muted">#{tool.id}</td>

                      {/* Tool Name & Desc */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-fg text-sm">{tool.name}</span>
                            {tool.isCustom && (
                              <span className="px-1.5 py-0.5 rounded text-[0.6875rem] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                CUSTOM
                              </span>
                            )}
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted hover:text-fg"
                              title="웹사이트 열기"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-xs text-muted line-clamp-1 mt-0.5 max-w-md">
                            {tool.description}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-fg/5 text-fg-2 font-medium text-xs">
                          {tool.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold text-xs ${
                            tool.price === '무료'
                              ? 'text-emerald-400'
                              : tool.price === '유료'
                              ? 'text-rose-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {tool.price}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isDeleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            삭제됨 (Deleted)
                          </span>
                        ) : isInactive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            비활성 (Inactive)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            활성 (Active)
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(tool)}
                            className="p-1.5 hover:bg-fg/10 rounded-lg text-fg-2 hover:text-fg transition-colors cursor-pointer"
                            title={isInactive ? '활성화하기' : '비활성화하기'}
                          >
                            {isInactive ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(tool)}
                            className="p-1.5 hover:bg-indigo-500/20 rounded-lg text-fg-2 hover:text-indigo-300 transition-colors cursor-pointer"
                            title="수정하기"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete or Restore */}
                          {isDeleted ? (
                            <button
                              onClick={() => handleRestoreTool(tool)}
                              className="p-1.5 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors cursor-pointer"
                              title="복구하기"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(tool.id)}
                              className="p-1.5 hover:bg-rose-500/20 rounded-lg text-muted hover:text-rose-400 transition-colors cursor-pointer"
                              title="삭제하기"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface-2 border border-amber-400/30 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Wrench className="w-5 h-5" />
                <h3 className="text-base font-bold text-fg">
                  {editingTool ? `AI 도구 정보 수정: ${editingTool.name}` : '신규 AI 도구 등록'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-fg/10 rounded-lg text-muted hover:text-fg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTool} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-fg-2 font-bold mb-1">
                    도구 이름 (Tool Name) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: ChatGPT, Claude, Midjourney"
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-fg-2 font-bold mb-1">
                    카테고리 (Category) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== '전체').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-fg-2 font-bold mb-1">
                    가격 정책 (Price) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="무료">무료 (Free)</option>
                    <option value="무료/유료">무료/유료 (Freemium)</option>
                    <option value="유료">유료 (Paid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-fg-2 font-bold mb-1">
                    웹사이트 URL (URL) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-fg-2 font-bold mb-1">
                  한국어 설명 (Korean Description) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="AI 도구에 대한 핵심 소개 문장을 작성하세요."
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-fg-2 font-bold mb-1">영어 설명 (English Description)</label>
                <textarea
                  rows={2}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="English summary for international users."
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-fg-2 font-bold mb-1">태그 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="예: LLM, 생성AI, 글쓰기, 기획"
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-fg-2 font-bold mb-1">추천 활용 사례 (Use Cases)</label>
                  <input
                    type="text"
                    value={formData.useCases}
                    onChange={(e) => setFormData({ ...formData, useCases: e.target.value })}
                    placeholder="예: 기획서 초안, 마케팅 문구 작성"
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-fg-2 font-bold mb-1">주요 기능 (한 줄에 하나씩 입력)</label>
                <textarea
                  rows={2}
                  value={formData.keyFeatures}
                  onChange={(e) => setFormData({ ...formData, keyFeatures: e.target.value })}
                  placeholder="고급 문맥 추론 지원&#10;멀티모달 이미지 분석&#10;실시간 웹 검색 통합"
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-fg focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-fg/10 hover:bg-fg/15 text-fg-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  취소 (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  {editingTool ? '수정 내용 저장' : '새 도구 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-2 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-fg">도구 삭제 확인</h3>
            </div>

            <p className="text-xs text-fg-2 leading-relaxed">
              선택한 AI 도구를 카탈로그에서 삭제하시겠습니까?
              <br />
              <span className="text-muted">
                '보관(소프트 삭제)'을 선택하면 카탈로그에서 숨겨지며 언제든 복구할 수 있습니다.
              </span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 bg-fg/10 hover:bg-fg/15 text-fg-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                취소
              </button>

              {(() => {
                const targetTool = tools.find((t) => t.id === deleteConfirmId);
                if (!targetTool) return null;

                return (
                  <>
                    <button
                      onClick={() => handleDeleteTool(targetTool, true)}
                      className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      보관 처리 (소프트 삭제)
                    </button>
                    <button
                      onClick={() => handleDeleteTool(targetTool, false)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
                    >
                      영구 삭제
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
