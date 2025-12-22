
import React from 'react';
import { Plus, StickyNote, Pin, Check, Trash2 } from 'lucide-react';
import { MEMO_COLORS } from '../constants';
import { getLocalizedDate } from '../utils';
import { ClinicData, Memo, TodoItem } from '../types';

interface MemosViewProps {
  t: any;
  data: ClinicData;
  setSelectedMemo: (memo: Memo | null) => void;
  setShowMemoModal: (show: boolean) => void;
  setMemoType: (type: 'text' | 'todo' | null) => void;
  setTempTodos: (todos: TodoItem[]) => void;
  handleDeleteMemo: (id: string) => void;
  currentLang: any;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const MemosView: React.FC<MemosViewProps> = ({
  t, data, setSelectedMemo, setShowMemoModal, setMemoType, setTempTodos, handleDeleteMemo, currentLang, openConfirm
}) => {
  return (
    <div className="w-full animate-fade-in pb-10">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.memos}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.manageMemos}</p>
        </div>
        <button 
          onClick={() => { setSelectedMemo(null); setShowMemoModal(true); setMemoType(null); setTempTodos([]); }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition"
        >
          <Plus size={20} />
          <span>{t.newMemo}</span>
        </button>
      </div>

      {(!data.memos || data.memos.length === 0) ? (
         <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
           <StickyNote size={64} className="mb-4 opacity-20" />
           <p>{t.noMemos}</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.memos.map(memo => {
            const colorStyle = MEMO_COLORS.find(c => c.id === memo.color) || MEMO_COLORS[0];
            const s = memo.style || {};
            
            return (
              <div 
                key={memo.id} 
                onClick={() => { setSelectedMemo(memo); setMemoType(memo.type || 'text'); setShowMemoModal(true); setTempTodos(memo.todos || []); }}
                className={`p-6 rounded-3xl shadow-sm border relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer bg-gradient-to-br ${colorStyle.class}`}
              >
                 <div className="absolute top-4 right-4 text-black/20">
                    <Pin size={20} className="transform rotate-45" fill="currentColor" />
                 </div>
                 <div className="flex justify-between items-start mb-4 pr-6">
                   <h3 
                      className="font-bold leading-tight"
                      style={{ 
                          fontSize: s.titleFontSize ? `${s.titleFontSize}px` : '1.25rem', // Default to xl (20px)
                          color: s.titleColor || '#111827' // Default gray-900 equivalent
                      }}
                   >
                       {memo.title}
                   </h3>
                 </div>
                 
                 {memo.type === 'todo' && memo.todos ? (
                     <div className="space-y-1.5 min-h-[80px]">
                         {memo.todos.slice(0, 4).map(todo => (
                             <div key={todo.id} className="flex items-center gap-2 text-sm text-gray-800">
                                 <div className={`w-4 h-4 rounded border flex items-center justify-center ${todo.done ? 'bg-black/20 border-transparent' : 'border-black/30'}`}>
                                     {todo.done && <Check size={10} />}
                                 </div>
                                 <span className={todo.done ? 'line-through opacity-50' : ''}>{todo.text}</span>
                             </div>
                         ))}
                         {memo.todos.length > 4 && <div className="text-xs opacity-50 font-bold text-gray-800">+{memo.todos.length - 4} more...</div>}
                     </div>
                 ) : (
                     <p 
                        className="whitespace-pre-wrap leading-relaxed min-h-[80px]"
                        style={{
                            fontSize: s.fontSize ? `${s.fontSize}px` : '0.875rem', // Default to text-sm
                            color: s.textColor || '#374151', // Default gray-700
                            fontStyle: s.isItalic ? 'italic' : 'normal',
                            direction: s.direction || 'inherit'
                        }}
                     >
                         {memo.content}
                     </p>
                 )}

                 <div className="mt-4 pt-4 border-t border-black/5 text-xs opacity-70 flex justify-between items-center font-medium text-gray-800">
                    <span>{getLocalizedDate(new Date(memo.date), 'full', currentLang)}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); openConfirm(t.deleteMemo, t.deleteMemoConfirm, () => handleDeleteMemo(memo.id)); }}
                        className="p-2 bg-white/40 rounded-full hover:bg-red-500 hover:text-white transition group-hover:opacity-100 opacity-0"
                    >
                        <Trash2 size={14} />
                    </button>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
