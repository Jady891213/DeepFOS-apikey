
import React from 'react';
import { ApiKey, KeyStatus, AppModel } from '../types';
import { ICONS } from '../constants';

interface ApiKeyTableProps {
  keys: ApiKey[];
  apps: AppModel[];
  onRevoke: (id: string) => void;
  onEdit: (key: ApiKey) => void;
}

const ApiKeyTable: React.FC<ApiKeyTableProps> = ({ keys, apps, onRevoke, onEdit }) => {
  const getValidityInfo = (key: ApiKey) => {
    if (key.status === KeyStatus.REVOKED) return { valid: false, text: '已手动撤回' };
    if (key.expiresAt) {
      const expiry = new Date(key.expiresAt);
      const now = new Date();
      if (expiry < now) return { valid: false, text: '已过期' };
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { valid: true, text: `剩余 ${diffDays} 天` };
    }
    return { valid: true, text: '永久有效' };
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffYear > 0) return `${diffYear}年之前`;
    if (diffMonth > 0) return `${diffMonth}个月前`;
    if (diffDay > 0) return `${diffDay}天前`;
    if (diffHour > 0) return `${diffHour}小时前`;
    if (diffMin > 0) return `${diffMin}分钟前`;
    return '刚刚';
  };

  const maskKeyStr = (str: string) => {
    if (str.length <= 10) return str;
    return `${str.slice(0, 6)}****${str.slice(-4)}`;
  };

  const getAuthorizedAppNames = (ids: string[]) => {
    if (ids.length === 0) return '全部应用';
    const names = ids.map(id => apps.find(a => a.id === id)?.name).filter(Boolean);
    if (names.length <= 3) return names.join('、');
    return `${names.slice(0, 3).join('、')} 等 ${ids.length} 个应用`;
  };

  return (
    <div className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[1200px]">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
          <tr>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider min-w-[200px]">名称 / 密钥掩码</th>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider">状态 / 期限</th>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider">所有者</th>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider">授权范围</th>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider">最后使用时间</th>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider">创建信息</th>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider">修改信息</th>
            <th className="px-6 py-4 text-[11px] uppercase tracking-wider text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {keys.map((key) => {
            const { valid, text } = getValidityInfo(key);
            return (
              <tr key={key.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{key.name}</span>
                    <code className="text-[11px] font-mono text-slate-400 mt-1">{maskKeyStr(key.prefix)}</code>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${valid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                      <span className={`text-xs font-bold ${valid ? 'text-emerald-700' : 'text-rose-700'}`}>{valid ? '生效中' : '已失效'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{text}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px] font-bold border border-indigo-100">
                      {key.userName[0]}
                    </div>
                    <span className="text-xs font-medium">{key.userName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[11px] px-2 py-1 rounded font-medium ${key.authorizedAppIds.length === 0 ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                    {getAuthorizedAppNames(key.authorizedAppIds)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-500 font-medium">
                    {formatRelativeTime(key.lastUsedAt)}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                     <span className="text-xs text-slate-600 font-medium">{key.creatorName}</span>
                     <span className="text-[10px] text-slate-400 mt-0.5">{key.createdAt}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                     <span className="text-xs text-slate-600 font-medium">{key.updaterName || '--'}</span>
                     <span className="text-[10px] text-slate-400 mt-0.5">{key.updatedAt || '--'}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {key.status === KeyStatus.ACTIVE && valid && (
                      <>
                        <button onClick={() => onEdit(key)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="编辑密钥">
                          <ICONS.Edit />
                        </button>
                        <button onClick={() => onRevoke(key.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="立即禁用">
                          <ICONS.Trash />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ApiKeyTable;
