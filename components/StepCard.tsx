import React from 'react';
import { Check, ChevronRight, FileText, Activity } from 'lucide-react';

interface Props {
  title: string;
  icon: any;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  onShowPrompt?: () => void;
}

const StepCard: React.FC<Props> = ({ title, icon: Icon, isActive, isCompleted, onClick, onShowPrompt }) => (
  <div
    onClick={onClick}
    className={`flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border relative group min-h-[64px] sm:min-h-[72px] ${isActive
      ? 'bg-orange-900/30 border-orange-500 text-orange-100'
      : isCompleted
        ? 'bg-stone-800/50 border-amber-900/50 text-amber-400'
        : 'bg-stone-800/30 border-stone-700 text-stone-500 hover:bg-stone-800'
      }`}
  >
    <div className={`p-2 sm:p-2.5 rounded-lg mr-2 sm:mr-3 ${isActive ? 'bg-orange-500/20' : 'bg-stone-700/20'}`}>
      {Icon ? <Icon size={20} /> : <Activity size={20} />}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-xs sm:text-sm truncate">{title}</h3>
      {isCompleted && <span className="text-[10px] sm:text-xs opacity-70 flex items-center mt-0.5 sm:mt-1"><Check size={12} className="mr-1" /> 已生成</span>}
    </div>

    {onShowPrompt && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowPrompt();
        }}
        className={`p-2.5 rounded-md transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} hover:bg-stone-700 text-stone-400 hover:text-white ml-1 min-w-[36px] flex items-center justify-center`}
        title="查看提示词"
      >
        <FileText size={16} />
      </button>
    )}
    {isActive && <ChevronRight size={16} className="text-orange-400 ml-2 min-w-[32px] flex items-center justify-center" />}
  </div>
);

export default StepCard;