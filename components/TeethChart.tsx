
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooth, Language, ToothSurfaces, ToothNote } from '../types';
import { Baby, User, Grid, BoxSelect, Palette, MessageSquare, X, AlignLeft, AlignCenter, AlignRight, Check, Type } from 'lucide-react';

interface TeethChartProps {
  teeth: Record<number, Tooth>;
  headMap?: Record<string, string>;
  bodyMap?: Record<string, string>;
  onToothClick: (id: number, action: Tooth['status']) => void;
  onToothSurfaceClick: (id: number, surface: keyof ToothSurfaces | 'all', action: string) => void;
  onToothNoteUpdate?: (id: number, note: ToothNote) => void; // New prop for saving note
  onHeadClick: (region: string, action: string) => void;
  onBodyClick: (region: string, action: string) => void;
  readOnly?: boolean;
  language: Language;
  t: any;
}

// ISO 3950 Notation
const ADULT_Q1 = [18, 17, 16, 15, 14, 13, 12, 11]; 
const ADULT_Q2 = [21, 22, 23, 24, 25, 26, 27, 28]; 
const ADULT_Q3 = [31, 32, 33, 34, 35, 36, 37, 38]; 
const ADULT_Q4 = [48, 47, 46, 45, 44, 43, 42, 41]; 

const CHILD_Q1 = [55, 54, 53, 52, 51]; 
const CHILD_Q2 = [61, 62, 63, 64, 65]; 
const CHILD_Q3 = [71, 72, 73, 74, 75]; 
const CHILD_Q4 = [85, 84, 83, 82, 81]; 

// Updated Colors Map for Statuses (Darker/Deeper as requested)
const STATUS_FILLS: any = {
  // Medical Statuses
  healthy: 'fill-white dark:fill-gray-700',
  decay: 'fill-red-400 dark:fill-red-600', // Darker Red
  filled: 'fill-blue-400 dark:fill-blue-600', // Darker Blue
  missing: 'fill-gray-100 dark:fill-gray-800 opacity-30', 
  crown: 'fill-yellow-400 dark:fill-yellow-600', // Darker Yellow
  rct: 'fill-green-400 dark:fill-green-600', // Darker Green (used for bg if needed, though RCT is a line)
  extraction: 'fill-red-100 dark:fill-red-900/20',
  bridge: 'fill-purple-400 dark:fill-purple-600',
  veneer: 'fill-teal-400 dark:fill-teal-600',
  
  // Paint Colors (Occlusal View)
  red: 'fill-red-500',
  green: 'fill-green-500',
  blue: 'fill-blue-500',
  yellow: 'fill-yellow-400',
  black: 'fill-gray-900',
  none: 'fill-white dark:fill-gray-800'
};

const TOOTH_PATHS = {
  incisor: {
    root: "M30,80 C30,60 40,0 50,0 C60,0 70,60 70,80 Z",
    crown: "M30,80 L70,80 L75,140 C75,160 65,170 50,170 C35,170 25,160 25,140 L30,80 Z"
  },
  canine: {
    root: "M25,70 C25,40 40,0 50,0 C60,0 75,40 75,70 Z",
    crown: "M25,70 L75,70 L80,110 C80,110 85,130 50,175 C15,130 20,110 20,110 L25,70 Z"
  },
  premolar: {
    root: "M20,60 C20,30 35,0 50,0 C65,0 80,30 80,60 Z",
    crown: "M20,60 L80,60 L85,100 C90,130 80,160 50,160 C20,160 10,130 15,100 L20,60 Z"
  },
  molar: {
    root: "M10,60 C10,20 30,0 30,0 L50,20 L70,0 C70,0 90,20 90,60 Z",
    crown: "M10,60 L90,60 L95,100 C100,140 90,155 50,155 C10,155 0,140 5,100 L10,60 Z"
  }
};

const getToothType = (id: number): 'incisor' | 'canine' | 'premolar' | 'molar' => {
  const n = id > 50 ? id - 40 : id;
  const num = n % 10;
  
  if (num === 1 || num === 2) return 'incisor';
  if (num === 3) return 'canine';
  if (num === 4 || num === 5) return 'premolar'; 
  return 'molar';
};

const getDisplayNumber = (iso: number, isChild: boolean) => {
  const str = iso.toString();
  const index = parseInt(str[1]);
  if (isChild) {
    return String.fromCharCode(64 + index);
  }
  return index.toString();
};

/* --- SUB COMPONENTS --- */

const RealisticTooth: React.FC<{
  id: number;
  display: string;
  status?: string;
  note?: ToothNote; // Add note prop
  isUpper: boolean;
  isLeft: boolean; 
  onClick: () => void;
  onNoteClick: () => void; // Handler for note indicator click
}> = ({ id, display, status = 'healthy', note, isUpper, isLeft, onClick, onNoteClick }) => {
  
  const type = getToothType(id);
  const visualType = (id > 50 && (type === 'premolar')) ? 'molar' : type;
  const paths = TOOTH_PATHS[visualType];
  
  const statusClass = STATUS_FILLS[status] || STATUS_FILLS.healthy;
  const isMissing = status === 'missing';

  const baseBorderStyle = "stroke-gray-400 dark:stroke-gray-500 stroke-[1.5px]"; 
  const rootFill = "fill-amber-100 dark:fill-amber-900/40"; 

  // Determine Letter for Status
  let statusLetter = null;
  if (status === 'filled') statusLetter = 'F';
  else if (status === 'decay') statusLetter = 'D';
  else if (status === 'crown') statusLetter = 'C';

  return (
    <div 
      className="flex flex-col items-center group relative cursor-pointer p-0.5"
      onClick={onClick}
      title={`Tooth ${id} - ${status}`}
    >
      <div 
        className={`relative w-10 h-16 md:w-12 md:h-20 transition-transform duration-300 ease-out group-hover:scale-110 ${isMissing ? 'opacity-30' : ''}`}
      >
        <svg 
          viewBox="0 0 100 180" 
          className="w-full h-full drop-shadow-sm overflow-visible"
          style={{
            transform: `${!isUpper ? 'scaleY(-1)' : ''} ${isLeft ? 'scaleX(-1)' : ''}`
          }}
        >
          {/* ROOT */}
          <path d={paths.root} className={`${rootFill} ${baseBorderStyle}`} vectorEffect="non-scaling-stroke" />

          {/* CROWN */}
          <path d={paths.crown} className={`${statusClass} ${baseBorderStyle}`} vectorEffect="non-scaling-stroke" />
          
          {/* Hover Outline */}
          <path 
            d={`${paths.root} ${paths.crown}`} 
            className="fill-transparent stroke-primary-400 stroke-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* STATUS LETTER OVERLAY */}
          {statusLetter && (
             <text 
               x="50" 
               y="120" 
               className="fill-white font-bold text-4xl" 
               textAnchor="middle" 
               dominantBaseline="middle"
               style={{ 
                   transformOrigin: 'center', 
                   transform: `${!isUpper ? 'scaleY(-1)' : ''} ${isLeft ? 'scaleX(-1)' : ''}`, // Cancel out parent transform for text
                   filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))'
               }}
             >
               {statusLetter}
             </text>
          )}

          {/* EXTRACTION X */}
          {status === 'extraction' && (
             <path d="M20,40 L80,140 M80,40 L20,140" className="stroke-red-600 stroke-[6px]" />
          )}
        </svg>
        
        {/* RCT LINE (Wider & Clearer) */}
        {status === 'rct' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-1 h-[70%] bg-green-600 rounded-full shadow-sm ${!isUpper ? 'mb-auto mt-2' : 'mt-auto mb-2'}`}></div>
            </div>
        )}

        {/* NOTE INDICATOR */}
        {note && (
            <div 
                onClick={(e) => { e.stopPropagation(); onNoteClick(); }}
                className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center shadow-md border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                title="View Note"
            >
                <MessageSquare size={10} fill="currentColor" />
            </div>
        )}
      </div>
      
      <span className="text-[10px] md:text-xs font-bold text-gray-400 font-mono mt-1 group-hover:text-primary-600 transition-colors">
        {display}
      </span>
    </div>
  );
};

const NoteEditorModal = ({ isOpen, onClose, onSave, initialNote, t }: any) => {
    const [noteText, setNoteText] = useState(initialNote?.text || '');
    const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialNote?.align || 'center');
    const [fontSize, setFontSize] = useState<number>(initialNote?.fontSize || 14);
    const [bgColor, setBgColor] = useState(initialNote?.bgColor || '#ffffff');
    const [textColor, setTextColor] = useState(initialNote?.textColor || '#000000');

    // Reset state when modal opens with new data
    React.useEffect(() => {
        if(isOpen) {
            setNoteText(initialNote?.text || '');
            setAlign(initialNote?.align || 'center');
            setFontSize(initialNote?.fontSize || 14);
            setBgColor(initialNote?.bgColor || '#ffffff');
            setTextColor(initialNote?.textColor || '#000000');
        }
    }, [isOpen, initialNote]);

    if (!isOpen) return null;

    const colors = ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#f3e8ff', '#fee2e2', '#e5e7eb'];
    const textColors = ['#000000', '#dc2626', '#1d4ed8', '#047857', '#7e22ce', '#ffffff'];

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Type size={18} className="text-primary-500"/>
                        {t.editToothNote}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X size={20}/></button>
                </div>

                <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-xl justify-center">
                        <button onClick={() => setAlign('left')} className={`p-1.5 rounded ${align === 'left' ? 'bg-white shadow text-black' : 'text-gray-500'}`}><AlignLeft size={16}/></button>
                        <button onClick={() => setAlign('center')} className={`p-1.5 rounded ${align === 'center' ? 'bg-white shadow text-black' : 'text-gray-500'}`}><AlignCenter size={16}/></button>
                        <button onClick={() => setAlign('right')} className={`p-1.5 rounded ${align === 'right' ? 'bg-white shadow text-black' : 'text-gray-500'}`}><AlignRight size={16}/></button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <input 
                            type="range" min="10" max="30" 
                            value={fontSize} 
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-20 accent-primary-600"
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                        <span>{t.bgColor}</span>
                        <div className="flex gap-1">
                            {colors.map(c => (
                                <button 
                                    key={c} 
                                    onClick={() => setBgColor(c)}
                                    className={`w-5 h-5 rounded-full border border-gray-200 ${bgColor === c ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                        <span>{t.textColor}</span>
                        <div className="flex gap-1">
                            {textColors.map(c => (
                                <button 
                                    key={c} 
                                    onClick={() => setTextColor(c)}
                                    className={`w-5 h-5 rounded-full border border-gray-200 ${textColor === c ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Preview/Editor Area */}
                    <textarea 
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-600 resize-none outline-none shadow-inner transition-all duration-200"
                        placeholder={t.writeNoteHere}
                        style={{
                            textAlign: align,
                            fontSize: `${fontSize}px`,
                            backgroundColor: bgColor,
                            color: textColor,
                        }}
                    />

                    <button 
                        onClick={() => {
                            onSave({
                                text: noteText,
                                align,
                                fontSize,
                                bgColor,
                                textColor
                            });
                            onClose();
                        }}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> {t.save}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

/* --- OCCHUSAL COMPONENT --- */
const OcclusalTooth: React.FC<{ id: number, display: string, surfaces?: ToothSurfaces, onClick: (part: string) => void }> = ({ id, display, surfaces, onClick }) => {
    const s = surfaces || { top: 'none', bottom: 'none', left: 'none', right: 'none', center: 'none' };
    return (
        <div className="flex flex-col items-center gap-1 group p-1">
             <div className="relative w-12 h-12 md:w-14 md:h-14 transition-transform hover:scale-105">
                 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm stroke-gray-400 stroke-[1px]">
                      <path d="M15,15 Q50,0 85,15 L70,30 Q50,25 30,30 Z" className={`${STATUS_FILLS[s.top] || STATUS_FILLS.healthy} hover:opacity-80 cursor-pointer transition`} onClick={() => onClick('top')} />
                      <path d="M15,85 Q50,100 85,85 L70,70 Q50,75 30,70 Z" className={`${STATUS_FILLS[s.bottom] || STATUS_FILLS.healthy} hover:opacity-80 cursor-pointer transition`} onClick={() => onClick('bottom')} />
                      <path d="M15,15 Q0,50 15,85 L30,70 Q25,50 30,30 Z" className={`${STATUS_FILLS[s.left] || STATUS_FILLS.healthy} hover:opacity-80 cursor-pointer transition`} onClick={() => onClick('left')} />
                      <path d="M85,15 Q100,50 85,85 L70,70 Q75,50 70,30 Z" className={`${STATUS_FILLS[s.right] || STATUS_FILLS.healthy} hover:opacity-80 cursor-pointer transition`} onClick={() => onClick('right')} />
                      <path d="M30,30 Q50,25 70,30 Q75,50 70,70 Q50,75 30,70 Q25,50 30,30 Z" className={`${STATUS_FILLS[s.center] || STATUS_FILLS.healthy} hover:opacity-80 cursor-pointer transition`} onClick={() => onClick('center')} onDoubleClick={(e) => { e.stopPropagation(); onClick('all'); }} />
                 </svg>
             </div>
             <span className="text-xs font-bold text-gray-500">{display}</span>
        </div>
    )
};

export const TeethChart: React.FC<TeethChartProps> = ({ teeth, onToothClick, onToothSurfaceClick, onToothNoteUpdate, readOnly, language, t }) => {
  const [isChild, setIsChild] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('healthy');
  const [selectedColor, setSelectedColor] = useState<string>('red');
  const [viewMode, setViewMode] = useState<'general' | 'occlusal'>('general');
  
  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNoteToothId, setEditingNoteToothId] = useState<number | null>(null);

  // Tools configuration
  const medicalTools = [
    { id: 'healthy', label: 'Healthy', color: 'bg-white border-gray-300 text-gray-700', en: 'Healthy', ar: 'سليم', ku: 'ساغ' },
    { id: 'decay', label: 'Decay', color: 'bg-red-500 text-white', en: 'Decay', ar: 'تسوس', ku: 'كلۆبوون' },
    { id: 'filled', label: 'Filled', color: 'bg-blue-500 text-white', en: 'Filled', ar: 'حشوة', ku: 'پڕكردنەوە' },
    { id: 'rct', label: 'RCT', color: 'bg-green-500 text-white', en: 'RCT', ar: 'عصب', ku: 'دەمار' },
    { id: 'crown', label: 'Crown', color: 'bg-yellow-500 text-white', en: 'Crown', ar: 'تغليف', ku: 'رووپۆش' },
    { id: 'extraction', label: 'Extract', color: 'bg-red-700 text-white', en: 'Extraction', ar: 'قلع', ku: 'كێشان' },
    { id: 'missing', label: 'Missing', color: 'bg-gray-400 text-white', en: 'Missing', ar: 'مفقود', ku: 'لێبۆوە' },
    { id: 'note', label: 'Note', color: 'bg-purple-500 text-white', en: 'Note', ar: 'ملاحظة', ku: 'تێبینی' }, // New Tool
  ];

  const paintColors = [
      { id: 'red', color: 'bg-red-500' },
      { id: 'green', color: 'bg-green-500' },
      { id: 'blue', color: 'bg-blue-500' },
      { id: 'yellow', color: 'bg-yellow-400' },
      { id: 'black', color: 'bg-gray-900' },
  ];

  const getToolLabel = (tool: any) => {
      if (language === 'ar') return tool.ar;
      if (language === 'ku') return tool.ku;
      return tool.en;
  };

  const handleToothClickWrapper = (id: number) => {
      if (selectedTool === 'note') {
          setEditingNoteToothId(id);
          setIsNoteModalOpen(true);
      } else {
          onToothClick(id, selectedTool as any);
      }
  };

  const handleNoteSave = (note: ToothNote) => {
      if (editingNoteToothId !== null && onToothNoteUpdate) {
          onToothNoteUpdate(editingNoteToothId, note);
      }
  };

  const labelPermanent = language === 'ar' ? "الدائمية" : language === 'ku' ? "هەمیشەیی" : "Permanent";
  const labelDeciduous = language === 'ar' ? "اللبنية" : language === 'ku' ? "شیری" : "Deciduous";

  const renderQuadrant = (ids: number[], isUpper: boolean, isLeft: boolean) => (
      <div className={`flex gap-0.5 md:gap-1 flex-nowrap px-2 justify-${isLeft ? 'start' : 'end'}`}>
        {ids.map(id => (
          <RealisticTooth 
            key={id} 
            id={id} 
            display={getDisplayNumber(id, isChild)}
            status={teeth[id]?.status} 
            note={teeth[id]?.specialNote}
            isUpper={isUpper}
            isLeft={isLeft}
            onClick={() => !readOnly && handleToothClickWrapper(id)} 
            onNoteClick={() => { setEditingNoteToothId(id); setIsNoteModalOpen(true); }}
          />
        ))}
      </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 select-none w-full overflow-hidden">
      
      {/* Note Editor Modal */}
      <NoteEditorModal 
          isOpen={isNoteModalOpen} 
          onClose={() => setIsNoteModalOpen(false)} 
          onSave={handleNoteSave}
          initialNote={editingNoteToothId ? teeth[editingNoteToothId]?.specialNote : null}
          t={t}
      />

      {!readOnly && (
        <div className="mb-8 space-y-6">
          {/* View Switcher */}
          <div className="flex flex-wrap justify-center gap-2">
             <button onClick={() => setViewMode('general')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition shadow-sm ${viewMode === 'general' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                <Grid size={18}/> {t.generalChart}
             </button>
             <button onClick={() => setViewMode('occlusal')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition shadow-sm ${viewMode === 'occlusal' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                <BoxSelect size={18}/> {t.occlusalSurface}
             </button>
          </div>

          {/* Tools / Colors Palette */}
          <div className="flex flex-wrap justify-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
            {viewMode === 'general' ? (
                medicalTools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold border transition transform active:scale-95 ${
                    selectedTool === tool.id 
                        ? `${tool.color} shadow-lg ring-2 ring-offset-2 ring-primary-500` 
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                >
                    {getToolLabel(tool)}
                </button>
                ))
            ) : (
                <div className="flex gap-4 items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-2xl">
                    <Palette className="text-gray-500 ml-2" size={20} />
                    {paintColors.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedColor(p.id)}
                            className={`w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 border-2 ${p.color} ${selectedColor === p.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 border-white' : 'border-transparent'}`}
                        />
                    ))}
                </div>
            )}
          </div>
          
          <div className="flex justify-center">
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl">
                <button 
                    onClick={() => setIsChild(false)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${!isChild ? 'bg-white dark:bg-gray-600 shadow-md text-primary-600 dark:text-white' : 'text-gray-500'}`}
                >
                    <User size={18} /> {labelPermanent}
                </button>
                <button 
                    onClick={() => setIsChild(true)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${isChild ? 'bg-white dark:bg-gray-600 shadow-md text-primary-600 dark:text-white' : 'text-gray-500'}`}
                >
                    <Baby size={18} /> {labelDeciduous}
                </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Chart Rendering */}
      <div className="flex flex-col items-center w-full overflow-x-auto pb-4">
          <div className="min-w-max mx-auto border-2 border-gray-200 dark:border-gray-600 rounded-3xl p-2 bg-gray-50 dark:bg-gray-900/50">
                {/* Upper Arch */}
                <div className="flex gap-0 border-b-2 border-gray-200 dark:border-gray-600 divide-x divide-gray-200 dark:divide-gray-600">
                    {/* Q1 */}
                    <div className="p-2 md:p-4 flex justify-end min-w-[150px] md:min-w-[300px]">
                        {viewMode === 'general' 
                            ? renderQuadrant(isChild ? CHILD_Q1 : ADULT_Q1, true, false) 
                            : (
                                <div className="flex gap-1 flex-nowrap px-2">
                                    {(isChild ? CHILD_Q1 : ADULT_Q1).map(id => (
                                        <OcclusalTooth 
                                            key={id} 
                                            id={id} 
                                            display={getDisplayNumber(id, isChild)} 
                                            surfaces={teeth[id]?.surfaces} 
                                            onClick={(part) => !readOnly && onToothSurfaceClick(id, part as any, selectedColor)} 
                                        />
                                    ))}
                                </div>
                            )
                        }
                    </div>
                    {/* Q2 */}
                    <div className="p-2 md:p-4 flex justify-start min-w-[150px] md:min-w-[300px]">
                        {viewMode === 'general' 
                            ? renderQuadrant(isChild ? CHILD_Q2 : ADULT_Q2, true, true) 
                            : (
                                <div className="flex gap-1 flex-nowrap px-2">
                                    {(isChild ? CHILD_Q2 : ADULT_Q2).map(id => (
                                        <OcclusalTooth 
                                            key={id} 
                                            id={id} 
                                            display={getDisplayNumber(id, isChild)} 
                                            surfaces={teeth[id]?.surfaces} 
                                            onClick={(part) => !readOnly && onToothSurfaceClick(id, part as any, selectedColor)} 
                                        />
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* Lower Arch */}
                <div className="flex gap-0 divide-x divide-gray-200 dark:divide-gray-600">
                    {/* Q4 */}
                    <div className="p-2 md:p-4 flex justify-end min-w-[150px] md:min-w-[300px]">
                        {viewMode === 'general' 
                            ? renderQuadrant(isChild ? CHILD_Q4 : ADULT_Q4, false, false) 
                            : (
                                <div className="flex gap-1 flex-nowrap px-2">
                                    {(isChild ? CHILD_Q4 : ADULT_Q4).map(id => (
                                        <OcclusalTooth 
                                            key={id} 
                                            id={id} 
                                            display={getDisplayNumber(id, isChild)} 
                                            surfaces={teeth[id]?.surfaces} 
                                            onClick={(part) => !readOnly && onToothSurfaceClick(id, part as any, selectedColor)} 
                                        />
                                    ))}
                                </div>
                            )
                        }
                    </div>
                     {/* Q3 */}
                     <div className="p-2 md:p-4 flex justify-start min-w-[150px] md:min-w-[300px]">
                        {viewMode === 'general' 
                            ? renderQuadrant(isChild ? CHILD_Q3 : ADULT_Q3, false, true) 
                            : (
                                <div className="flex gap-1 flex-nowrap px-2">
                                    {(isChild ? CHILD_Q3 : ADULT_Q3).map(id => (
                                        <OcclusalTooth 
                                            key={id} 
                                            id={id} 
                                            display={getDisplayNumber(id, isChild)} 
                                            surfaces={teeth[id]?.surfaces} 
                                            onClick={(part) => !readOnly && onToothSurfaceClick(id, part as any, selectedColor)} 
                                        />
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>
          </div>
      </div>

    </div>
  );
};
