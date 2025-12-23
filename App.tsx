
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Space, AppModel, ApiKey, KeyStatus } from './types';
import { INITIAL_SPACES, INITIAL_APPS, ICONS } from './constants';
import ApiKeyTable from './components/ApiKeyTable';
import CreateKeyModal from './components/CreateKeyModal';
import RevealKeyModal from './components/RevealKeyModal';
import EditKeyModal from './components/EditKeyModal';

const App: React.FC = () => {
  const [spaces] = useState<Space[]>(INITIAL_SPACES);
  const [apps] = useState<AppModel[]>(INITIAL_APPS);
  const [activeSpaceId, setActiveSpaceId] = useState('sp-7');
  const [activeTab, setActiveTab] = useState('api');
  const [searchSpace, setSearchSpace] = useState('');

  // 综合筛选状态
  const [filterText, setFilterText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // 筛选细项
  const [selAppIds, setSelAppIds] = useState<string[]>([]);
  const [expiryFilter, setExpiryFilter] = useState<'all' | '7d' | '30d' | 'expired' | 'permanent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [creatorFilter, setCreatorFilter] = useState<'all' | 'me'>('all');

  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: 'k-1',
      name: '生产环境同步服务',
      prefix: 'dp_a7f298k1l0m9',
      status: KeyStatus.ACTIVE,
      userId: 'user-current',
      userName: '文俊',
      creatorId: 'user-current',
      creatorName: '文俊',
      createdAt: '2024-05-01 10:20:00',
      updaterId: 'user-current',
      updaterName: '文俊',
      updatedAt: '2024-05-01 10:20:00',
      lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      authorizedAppIds: ['app-1', 'app-2'],
      scopes: [],
      appId: 'app-1',
      spaceId: 'sp-7',
      usageCount: 120,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5天后过期，用于测试筛选
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [revealingKey, setRevealingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeSpace = useMemo(() => spaces.find(s => s.id === activeSpaceId), [activeSpaceId, spaces]);
  const filteredSpaces = useMemo(() => spaces.filter(s => s.name.toLowerCase().includes(searchSpace.toLowerCase())), [searchSpace, spaces]);
  const spaceApps = useMemo(() => apps.filter(a => a.spaceId === activeSpaceId), [activeSpaceId, apps]);

  // 点击外部关闭筛选面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSpaceKeys = useMemo(() => {
    return keys
      .filter(k => k.spaceId === activeSpaceId)
      .filter(k => {
        // 1. 文本搜索
        if (filterText && !k.name.toLowerCase().includes(filterText.toLowerCase())) return false;
        
        // 2. 应用过滤 (多选)
        if (selAppIds.length > 0) {
          const isGlobal = k.authorizedAppIds.length === 0;
          const hasMatch = k.authorizedAppIds.some(id => selAppIds.includes(id));
          if (!isGlobal && !hasMatch) return false;
        }

        // 3. 密钥状态过滤
        if (statusFilter === 'active' && k.status !== KeyStatus.ACTIVE) return false;
        if (statusFilter === 'revoked' && k.status !== KeyStatus.REVOKED) return false;

        // 4. 创建人过滤
        if (creatorFilter === 'me' && k.creatorId !== 'user-current') return false;

        // 5. 到期状态过滤
        if (expiryFilter !== 'all') {
          const now = new Date();
          const expiry = k.expiresAt ? new Date(k.expiresAt) : null;
          if (expiryFilter === 'permanent' && expiry) return false;
          if (expiryFilter === 'expired') {
            if (!expiry || expiry > now) return false;
          }
          if (expiryFilter === '7d') {
            if (!expiry || expiry < now || expiry > new Date(now.getTime() + 7*24*60*60*1000)) return false;
          }
          if (expiryFilter === '30d') {
            if (!expiry || expiry < now || expiry > new Date(now.getTime() + 30*24*60*60*1000)) return false;
          }
        }

        return true;
      });
  }, [activeSpaceId, keys, filterText, selAppIds, expiryFilter, statusFilter, creatorFilter]);

  const resetFilters = () => {
    setSelAppIds([]);
    setExpiryFilter('all');
    setStatusFilter('all');
    setCreatorFilter('all');
  };

  const tabs = [
    { id: 'overview', label: '概览' },
    { id: 'app', label: '应用管理' },
    { id: 'component', label: '组件管理' },
    { id: 'member', label: '空间成员' },
    { id: 'api', label: 'API密钥' },
    { id: 'datasource', label: '内置数据源' },
  ];

  const formatDate = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleCreateKey = (newKeyData: any) => {
    const generateRandomStr = (len: number) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let res = '';
      for(let i=0; i<len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    };

    const now = formatDate(new Date());
    const suffix = generateRandomStr(32);
    const longerPrefix = `${newKeyData.prefix}${generateRandomStr(8)}`;
    const fullKey = `${longerPrefix}_${suffix}`;

    const newKey: ApiKey = {
      ...newKeyData,
      prefix: longerPrefix,
      id: `k-${Date.now()}`,
      creatorId: 'user-current',
      creatorName: '文俊',
      createdAt: now,
      updaterId: 'user-current',
      updaterName: '文俊',
      updatedAt: now,
      usageCount: 0,
      fullKey
    };
    
    setKeys([newKey, ...keys]);
    setIsModalOpen(false);
    setRevealingKey(fullKey);
  };

  const handleUpdateKey = (data: Partial<ApiKey>) => {
    if (!editingKey) return;
    const now = formatDate(new Date());
    setKeys(keys.map(k => k.id === editingKey.id ? {
      ...k,
      ...data,
      updaterId: 'user-current',
      updaterName: '文俊',
      updatedAt: now
    } : k));
    setEditingKey(null);
    showToast("密钥配置已更新");
  };

  const handleRevokeKey = (id: string) => {
    if (confirm("确定要禁用该 API 密钥 吗？此操作不可逆。")) {
      const now = formatDate(new Date());
      setKeys(keys.map(k => k.id === id ? { 
        ...k, 
        status: KeyStatus.REVOKED,
        updaterId: 'user-current',
        updaterName: '文俊',
        updatedAt: now
      } : k));
      showToast("密钥已失效");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-900">
      <header className="h-12 bg-[#5d6be5] flex items-center justify-between px-6 shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-8">
          <div className="font-black text-white text-lg tracking-wider flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded text-[#5d6be5] flex items-center justify-center text-xs font-bold">D</div>
            DEEPFOS
          </div>
          <nav className="flex gap-6 h-full">
            {['工作台', '配置管理', '应用市场'].map(item => (
              <button key={item} className={`text-sm font-bold flex items-center h-full px-2 transition-all ${item === '配置管理' ? 'text-white border-b-4 border-white' : 'text-indigo-100 hover:text-white'}`}>
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer border border-white/10">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            先胜业财
            <ICONS.ChevronRight />
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
             <div className="w-8 h-8 bg-indigo-400 rounded-full border-2 border-white/40 flex items-center justify-center font-bold text-xs shadow-inner transition-transform group-hover:scale-105">文</div>
             <span className="text-xs font-bold hidden md:block">文俊</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">空间导航</h3>
              <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><ICONS.Search /></button>
            </div>
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="搜索空间..." 
                value={searchSpace}
                onChange={e => setSearchSpace(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="absolute left-3 top-2.5 text-slate-400"><ICONS.Search /></div>
            </div>
            <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSpaces.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setActiveSpaceId(s.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 group ${
                    activeSpaceId === s.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeSpaceId === s.id ? 'bg-white' : 'bg-slate-300'}`}></div>
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
            <div className="px-10 pt-8 pb-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <ICONS.Box />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeSpace?.name}</h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                    <span>Deepfos 平台</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>空间 ID: {activeSpaceId}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 text-xs font-bold transition-all relative ${
                      activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-10 max-w-full mx-auto w-full space-y-6">
            {activeTab === 'api' ? (
              <>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center h-10 px-6 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
                  >
                    新建密钥
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="relative group flex items-center">
                      <input 
                        type="text" 
                        placeholder="搜索密钥名称..." 
                        value={filterText} 
                        onChange={e => setFilterText(e.target.value)} 
                        className="w-[280px] h-10 pl-4 pr-10 bg-white border border-slate-200 border-r-0 rounded-l-lg text-sm outline-none focus:border-[#5569ff] transition-all placeholder:text-slate-400" 
                      />
                      <button className="h-10 px-3 bg-white border border-slate-200 border-l-0 rounded-r-lg text-slate-400 hover:text-[#5569ff] transition-colors">
                        <ICONS.Search />
                      </button>
                    </div>

                    <div className="relative" ref={filterRef}>
                      <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center h-10 px-4 gap-2 bg-white border ${isFilterOpen ? 'border-indigo-600 text-indigo-600' : 'border-slate-200 text-slate-600'} rounded-lg text-sm font-medium hover:border-slate-300 transition-all`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        筛选
                        {(selAppIds.length > 0 || expiryFilter !== 'all' || statusFilter !== 'all' || creatorFilter !== 'all') && (
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                        )}
                      </button>
                      
                      {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">高级筛选</span>
                            <button onClick={resetFilters} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">重置</button>
                          </div>
                          
                          <div className="p-4 space-y-5 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {/* 应用范围 */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">应用范围</span>
                              <div className="space-y-1">
                                {spaceApps.map(app => (
                                  <label key={app.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                                    <input 
                                      type="checkbox" 
                                      checked={selAppIds.includes(app.id)}
                                      onChange={(e) => {
                                        if(e.target.checked) setSelAppIds([...selAppIds, app.id]);
                                        else setSelAppIds(selAppIds.filter(id => id !== app.id));
                                      }}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className={`text-xs ${selAppIds.includes(app.id) ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}>{app.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* 有效期状态 */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">到期预警</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: 'all', label: '全部' },
                                  { id: '7d', label: '7天内到期' },
                                  { id: '30d', label: '30天内到期' },
                                  { id: 'expired', label: '已过期' },
                                  { id: 'permanent', label: '永久有效' },
                                ].map(opt => (
                                  <button 
                                    key={opt.id}
                                    onClick={() => setExpiryFilter(opt.id as any)}
                                    className={`px-3 py-1.5 text-left text-xs rounded-lg transition-all ${expiryFilter === opt.id ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 密钥状态 */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">密钥状态</span>
                              <div className="flex gap-2">
                                {[
                                  { id: 'all', label: '全部' },
                                  { id: 'active', label: '生效中' },
                                  { id: 'revoked', label: '已禁用' },
                                ].map(opt => (
                                  <button 
                                    key={opt.id}
                                    onClick={() => setStatusFilter(opt.id as any)}
                                    className={`flex-1 py-1.5 text-center text-xs rounded-lg transition-all ${statusFilter === opt.id ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 创建人 */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">创建人</span>
                              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                <button onClick={() => setCreatorFilter('all')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${creatorFilter === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>全部</button>
                                <button onClick={() => setCreatorFilter('me')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${creatorFilter === 'me' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>由我创建</button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-50/50 border-t border-slate-50">
                            <button 
                              onClick={() => setIsFilterOpen(false)}
                              className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                            >
                              应用筛选
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <ApiKeyTable 
                  keys={currentSpaceKeys} 
                  apps={apps}
                  onRevoke={handleRevokeKey}
                  onEdit={(key) => setEditingKey(key)}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6"><ICONS.Box /></div>
                <h3 className="text-lg font-bold text-slate-400 tracking-tight">【{tabs.find(t => t.id === activeTab)?.label}】模块建设中</h3>
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <CreateKeyModal 
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateKey}
          spaceName={activeSpace?.name || ''}
          spaceId={activeSpaceId}
          apps={spaceApps}
        />
      )}

      {editingKey && (
        <EditKeyModal 
          apiKey={editingKey}
          onClose={() => setEditingKey(null)}
          onUpdate={handleUpdateKey}
          apps={spaceApps}
        />
      )}

      {revealingKey && <RevealKeyModal apiKey={revealingKey} onClose={() => setRevealingKey(null)} />}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-3 bg-slate-900 text-white rounded-full shadow-2xl text-xs font-bold border border-white/10 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> 
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
