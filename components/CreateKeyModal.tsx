
import React, { useState, useMemo } from 'react';
import { KeyStatus, AppModel } from '../types';
import { ICONS } from '../constants';

interface CreateKeyModalProps {
  onClose: () => void;
  onCreate: (data: any) => void;
  spaceName: string;
  spaceId: string;
  apps: AppModel[];
}

const CreateKeyModal: React.FC<CreateKeyModalProps> = ({ onClose, onCreate, spaceName, spaceId, apps }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('user-current');
  const [authType, setAuthType] = useState<'all' | 'custom'>('all');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  
  // 有效期逻辑：permanent (永久) | specified (指定期限)
  const [expireType, setExpireType] = useState<'permanent' | 'specified'>('permanent');
  const [expireDate, setExpireDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const remainingDays = useMemo(() => {
    if (expireType === 'permanent' || !expireDate) return null;
    const diff = new Date(expireDate).getTime() - new Date().setHours(0,0,0,0);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  }, [expireType, expireDate]);

  const setShortcut = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setExpireDate(target.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      userId,
      userName: userId === 'user-current' ? '文俊' : '系统管理员',
      authorizedAppIds: authType === 'all' ? [] : selectedApps,
      expiresAt: expireType === 'specified' && expireDate ? new Date(`${expireDate}T23:59:59`).toISOString() : undefined,
      status: KeyStatus.ACTIVE,
      spaceId,
      prefix: 'dp_' + Math.random().toString(36).substring(2, 8)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">创建空间访问密钥</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">目标空间 (只读)</label>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-sm font-bold">{spaceName}</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">密钥标识名称</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" placeholder="如：自动化数据同步" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">授权应用范围</label>
            <div className="flex gap-4 p-1 bg-slate-50 rounded-xl w-fit">
              <button type="button" onClick={() => setAuthType('all')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${authType === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>全部应用</button>
              <button type="button" onClick={() => setAuthType('custom')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${authType === 'custom' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>指定应用</button>
            </div>
            {authType === 'custom' && (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-100 custom-scrollbar mt-2">
                {apps.map(app => (
                  <label key={app.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-indigo-600 transition-colors">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" onChange={(e) => {
                      if (e.target.checked) setSelectedApps([...selectedApps, app.id]);
                      else setSelectedApps(selectedApps.filter(id => id !== app.id));
                    }} /> {app.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">授权有效期</label>
            <div className="flex gap-4 p-1 bg-slate-50 rounded-xl w-fit">
              <button type="button" onClick={() => setExpireType('permanent')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${expireType === 'permanent' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>永久有效</button>
              <button type="button" onClick={() => setExpireType('specified')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${expireType === 'specified' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>指定期限</button>
            </div>

            {expireType === 'specified' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 group relative">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">有效至</span>
                    <div className="text-slate-300 hover:text-slate-400 cursor-help transition-colors">
                      <ICONS.Info />
                    </div>
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-20 pointer-events-none">
                      api-key有效至该日期23:59:59
                      <div className="absolute left-4 top-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800"></div>
                    </div>
                  </div>
                  {remainingDays !== null && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${remainingDays > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      预计还有 {remainingDays} 天失效
                    </span>
                  )}
                </div>
                
                <input 
                  type="date" 
                  value={expireDate} 
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setExpireDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-50 transition-all text-slate-700 bg-white"
                />

                <div className="flex gap-2">
                  {[30, 90, 180, 365].map(days => (
                    <button 
                      key={days}
                      type="button" 
                      onClick={() => setShortcut(days)}
                      className="flex-1 py-1.5 text-[10px] font-bold text-slate-500 border border-slate-200 bg-white rounded-lg hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all"
                    >
                      +{days}天
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">取消</button>
            <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">确认生成密钥</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKeyModal;
