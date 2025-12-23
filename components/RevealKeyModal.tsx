
import React from 'react';
import { ICONS } from '../constants';

interface RevealKeyModalProps {
  apiKey: string;
  onClose: () => void;
}

const RevealKeyModal: React.FC<RevealKeyModalProps> = ({ apiKey, onClose }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    alert("密钥已复制到剪贴板");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">API 密钥已成功生成</h3>
            <p className="text-sm text-slate-500 px-4">
              为了您的安全，该密钥<span className="text-rose-600 font-bold">只会显示这一次</span>。请立即复制并妥善保存。
            </p>
          </div>

          <div className="relative group">
            <div className="p-4 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-xl font-mono text-lg text-indigo-700 break-all select-all">
              {apiKey}
            </div>
            <button 
              onClick={handleCopy}
              className="absolute right-2 top-2 p-2 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ICONS.Copy />
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleCopy}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
            >
              一键复制并关闭
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-slate-500 text-sm font-medium hover:text-slate-800"
            >
              我已保存，关闭窗口
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevealKeyModal;
