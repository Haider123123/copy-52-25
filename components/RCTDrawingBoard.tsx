
import React, { useRef, useState, useEffect } from 'react';
import { 
    Pencil, Eraser, Trash2, Download, Save, ZoomIn, ZoomOut, 
    Maximize2, X, RefreshCw, CheckCircle, Cloud, Palette,
    Undo2, Redo2, Maximize, Hand,
    Square, Circle, MoveRight, CornerRightUp, Diamond, RectangleHorizontal, Shapes, ChevronDown, AlertCircle
} from 'lucide-react';
import { googleDriveService } from '../services/googleDrive';

type DrawingTool = 'pen' | 'eraser' | 'pan' | 'rect' | 'square' | 'circle' | 'oval' | 'diamond' | 'arrow' | 'curvedArrow';

interface RCTDrawingBoardProps {
    t: any;
    initialDrawing?: string;
    onSave: (base64: string) => void;
    googleDriveLinked?: boolean;
    patient?: any;
    isRTL: boolean;
}

const RCT_IMAGE_URL = "https://res.cloudinary.com/dvcaqoy2a/image/upload/v1766369901/Root-Canal-Therapy_kjhfao.png";
const SCALE_FACTOR = 2; // High Resolution Scale

export const RCTDrawingBoard: React.FC<RCTDrawingBoardProps> = ({ t, initialDrawing, onSave, googleDriveLinked, patient, isRTL }) => {
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [color, setColor] = useState('#ff0000');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState<DrawingTool>('pen');
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [showShapesMenu, setShowShapesMenu] = useState(false);
    
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showMsg, setShowMsg] = useState('');
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];

    // Logic for the warning: show only if a drawing exists but has no drive ID
    const isUnsynced = patient?.rctDrawing && !patient?.rctDrawingDriveId;

    useEffect(() => {
        const bgCanvas = bgCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        if (!bgCanvas || !drawingCanvas) return;
        
        const bgCtx = bgCanvas.getContext('2d');
        const drawCtx = drawingCanvas.getContext('2d');
        if (!bgCtx || !drawCtx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = RCT_IMAGE_URL;
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const baseWidth = 600;
            const baseHeight = 600 / aspectRatio;
            
            setCanvasSize({ width: baseWidth, height: baseHeight });
            
            bgCanvas.width = baseWidth * SCALE_FACTOR;
            bgCanvas.height = baseHeight * SCALE_FACTOR;
            drawingCanvas.width = baseWidth * SCALE_FACTOR;
            drawingCanvas.height = baseHeight * SCALE_FACTOR;

            bgCtx.scale(SCALE_FACTOR, SCALE_FACTOR);
            drawCtx.scale(SCALE_FACTOR, SCALE_FACTOR);
            
            bgCtx.imageSmoothingEnabled = true;
            bgCtx.imageSmoothingQuality = 'high';
            drawCtx.imageSmoothingEnabled = true;
            drawCtx.imageSmoothingQuality = 'high';

            bgCtx.clearRect(0, 0, baseWidth, baseHeight);
            bgCtx.drawImage(img, 0, 0, baseWidth, baseHeight);
            
            if (initialDrawing) {
                const savedImg = new Image();
                savedImg.src = initialDrawing;
                savedImg.onload = () => {
                    drawCtx.clearRect(0, 0, baseWidth, baseHeight);
                    drawCtx.drawImage(savedImg, 0, 0, baseWidth, baseHeight);
                    saveToHistory();
                };
            } else {
                saveToHistory();
            }
        };
    }, []);

    const saveToHistory = () => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const data = canvas.toDataURL();
        setHistory(prev => {
            const next = prev.slice(0, historyStep + 1);
            return [...next, data];
        });
        setHistoryStep(prev => prev + 1);
    };

    const undo = () => {
        if (historyStep <= 0) return;
        const step = historyStep - 1;
        setHistoryStep(step);
        loadHistoryStep(step);
    };

    const redo = () => {
        if (historyStep >= history.length - 1) return;
        const step = historyStep + 1;
        setHistoryStep(step);
        loadHistoryStep(step);
    };

    const loadHistoryStep = (step: number) => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.src = history[step];
        img.onload = () => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = 'source-over'; // Ensure we can clear properly
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
            
            // CRITICAL FIX: Ensure operation is source-over BEFORE drawing the history image
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
        };
    };

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return { x: 0, y: 0, rawX: 0, rawY: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) / (rect.width / canvasSize.width),
            y: (clientY - rect.top) / (rect.height / canvasSize.height),
            rawX: clientX,
            rawY: clientY
        };
    };

    const drawShape = (ctx: CanvasRenderingContext2D, start: {x: number, y: number}, current: {x: number, y: number}, final: boolean = false) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const dx = current.x - start.x;
        const dy = current.y - start.y;

        switch (tool) {
            case 'rect': ctx.strokeRect(start.x, start.y, dx, dy); break;
            case 'square':
                const size = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                ctx.strokeRect(start.x, start.y, size, size);
                break;
            case 'circle':
                const radius = Math.sqrt(dx * dx + dy * dy);
                ctx.beginPath();
                ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'oval':
                ctx.beginPath();
                ctx.ellipse(start.x + dx/2, start.y + dy/2, Math.abs(dx/2), Math.abs(dy/2), 0, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(start.x + dx/2, start.y);
                ctx.lineTo(start.x + dx, start.y + dy/2);
                ctx.lineTo(start.x + dx/2, start.y + dy);
                ctx.lineTo(start.x, start.y + dy/2);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'arrow':
                const headlen = brushSize * 4;
                const angle = Math.atan2(dy, dx);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(current.x, current.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(current.x, current.y);
                ctx.lineTo(current.x - headlen * Math.cos(angle - Math.PI / 6), current.y - headlen * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(current.x - headlen * Math.cos(angle + Math.PI / 6), current.y - headlen * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
                break;
            case 'curvedArrow':
                const cp1x = start.x + dx / 4;
                const cp1y = start.y + dy;
                const cp2x = start.x + (dx * 3) / 4;
                const cp2y = start.y - dy / 2;
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, current.x, current.y);
                ctx.stroke();
                const cAngle = Math.atan2(current.y - cp2y, current.x - cp2x);
                const cHeadlen = brushSize * 4;
                ctx.beginPath();
                ctx.moveTo(current.x, current.y);
                ctx.lineTo(current.x - cHeadlen * Math.cos(cAngle - Math.PI / 6), current.y - cHeadlen * Math.sin(cAngle - Math.PI / 6));
                ctx.lineTo(current.x - cHeadlen * Math.cos(cAngle + Math.PI / 6), current.y - cHeadlen * Math.sin(cAngle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
                break;
        }
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const { x, y, rawX, rawY } = getCoords(e);
        if (tool === 'pan') {
            setIsPanning(true);
            setLastPosition({ x: rawX, y: rawY });
            return;
        }
        const ctx = drawingCanvasRef.current?.getContext('2d');
        if (!ctx) return;
        setStartPoint({ x, y });
        setIsDrawing(true);
        if (tool === 'pen' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = brushSize * 4; 
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = color;
                ctx.lineWidth = brushSize;
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const coords = getCoords(e);
        if (isPanning) {
            const dx = coords.rawX - lastPosition.x;
            const dy = coords.rawY - lastPosition.y;
            setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastPosition({ x: coords.rawX, y: coords.rawY });
            return;
        }
        if (!isDrawing) return;
        const ctx = drawingCanvasRef.current?.getContext('2d');
        if (!ctx) return;
        if (tool === 'pen' || tool === 'eraser') {
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        } else {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, drawingCanvasRef.current!.width, drawingCanvasRef.current!.height);
            ctx.restore();
            
            // CRITICAL FIX: Ensure operation is source-over BEFORE redrawing history and temporary shape
            ctx.globalCompositeOperation = 'source-over';
            const img = new Image();
            img.src = history[historyStep];
            ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
            drawShape(ctx, startPoint, { x: coords.x, y: coords.y });
        }
    };

    const handleMouseUp = () => {
        if (isPanning) { setIsPanning(false); return; }
        if (isDrawing) { setIsDrawing(false); saveToHistory(); }
    };

    const handleClear = () => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over'; // Reset to safe mode after clear
        saveToHistory();
    };

    const handleSave = async () => {
        const drawCanvas = drawingCanvasRef.current;
        if (!drawCanvas) return;
        onSave(drawCanvas.toDataURL('image/png', 1.0));
        setShowMsg(t.saveSuccessLocal);
        setTimeout(() => setShowMsg(''), 4000);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => setIsFullscreen(true));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const SHAPES_LIST = [
        { id: 'rect', icon: RectangleHorizontal, label: t.rectangle },
        { id: 'square', icon: Square, label: t.square },
        { id: 'circle', icon: Circle, label: t.circle },
        { id: 'oval', icon: Shapes, label: t.oval },
        { id: 'diamond', icon: Diamond, label: t.diamond },
        { id: 'arrow', icon: MoveRight, label: t.arrow },
        { id: 'curvedArrow', icon: CornerRightUp, label: t.curvedArrow },
    ];

    return (
        <div 
            ref={containerRef}
            className={`bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[200] rounded-none' : 'w-full min-h-[600px]'}`}
        >
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 md:gap-4 bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-50">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl"><Maximize size={18} className="md:w-5 md:h-5" /></div>
                    <div>
                        {/* Title visible on mobile as requested */}
                        <h4 className="font-bold text-gray-800 dark:text-white text-[10px] md:text-sm block">{t.rctTool}</h4>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-1 md:gap-2 bg-white dark:bg-gray-700 px-2 py-1.5 rounded-xl border border-gray-100 dark:border-gray-600">
                        <input 
                            type="range" min="1" max="20" 
                            value={brushSize} 
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-12 md:w-24 accent-primary-600 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono font-bold text-primary-600 min-w-[12px]">{brushSize}</span>
                    </div>

                    <div className="flex bg-white dark:bg-gray-700 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                        <button onClick={() => setTool('pen')} className={`p-1.5 md:p-2 rounded-lg transition ${tool === 'pen' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500'}`} title={t.brush}><Pencil size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        <button onClick={() => setTool('eraser')} className={`p-1.5 md:p-2 rounded-lg transition ${tool === 'eraser' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500'}`} title={t.eraser}><Eraser size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setShowShapesMenu(!showShapesMenu)}
                                className={`p-1.5 md:p-2 flex items-center gap-0.5 md:gap-1 rounded-lg transition ${['rect', 'square', 'circle', 'oval', 'diamond', 'arrow', 'curvedArrow'].includes(tool) ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500'}`}
                            >
                                <Shapes size={16} className="md:w-[18px] md:h-[18px]" />
                                <ChevronDown size={10} className={showShapesMenu ? 'rotate-180' : ''} />
                            </button>
                            {showShapesMenu && (
                                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 grid grid-cols-4 sm:grid-cols-7 gap-1 z-[100] animate-scale-up min-w-[180px] md:min-w-[200px]">
                                    {SHAPES_LIST.map(s => (
                                        <button 
                                            key={s.id}
                                            onClick={() => { setTool(s.id as DrawingTool); setShowShapesMenu(false); }}
                                            className={`p-2 rounded-xl transition flex flex-col items-center gap-1 ${tool === s.id ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500'}`}
                                            title={s.label}
                                        >
                                            <s.icon size={18} />
                                            <span className="text-[7px] md:text-[8px] font-bold text-center leading-tight truncate w-full">{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setTool('pan')} className={`p-1.5 md:p-2 rounded-lg transition ${tool === 'pan' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500'}`} title="Move"><Hand size={16} className="md:w-[18px] md:h-[18px]" /></button>
                    </div>

                    {/* Colors visible on mobile as requested */}
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-700 p-1 rounded-xl border border-gray-100 dark:border-gray-600">
                        {colors.map(c => (
                            <button key={c} onClick={() => { setColor(c); }} className={`w-4 h-4 md:w-5 md:h-5 rounded-full border transition-transform hover:scale-110 ${color === c ? 'border-gray-400 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                        ))}
                    </div>

                    <div className="flex gap-1 border-s border-gray-200 dark:border-gray-600 ps-1 md:ps-2">
                        <button onClick={undo} disabled={historyStep <= 0} className="p-1.5 md:p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-30"><Undo2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-1.5 md:p-2 text-gray-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-30"><Redo2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        <button onClick={handleClear} className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title={t.clear}><Trash2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="flex bg-white dark:bg-gray-700 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                        <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="p-1.5 md:p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><ZoomOut size={16} className="md:w-[18px] md:h-[18px]" /></button>
                        <span className="text-[10px] md:text-xs font-mono font-bold flex items-center px-1 text-gray-400">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(prev => Math.min(4, prev + 0.1))} className="p-1.5 md:p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><ZoomIn size={16} className="md:w-[18px] md:h-[18px]" /></button>
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 bg-white dark:bg-gray-700 text-gray-500 rounded-xl shadow-sm hover:bg-gray-50 transition border border-gray-100 dark:border-gray-600"><Maximize2 size={18} className="md:w-5 md:h-5" /></button>
                </div>
            </div>

            <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center p-4 md:p-8">
                <div 
                    className={`relative shadow-2xl transition-transform duration-75 origin-center bg-white ${tool === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`, 
                        width: canvasSize.width, 
                        maxWidth: '100%',
                        height: 'auto',
                        aspectRatio: `${canvasSize.width} / ${canvasSize.height}`,
                        touchAction: 'none'
                    }}
                >
                    <canvas 
                        ref={bgCanvasRef}
                        style={{ width: '100%', height: 'auto', aspectRatio: `${canvasSize.width} / ${canvasSize.height}` }}
                        className="absolute inset-0 pointer-events-none"
                    />
                    <canvas 
                        ref={drawingCanvasRef}
                        style={{ width: '100%', height: 'auto', aspectRatio: `${canvasSize.width} / ${canvasSize.height}`, touchAction: 'none' }}
                        className="absolute inset-0 z-10"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                    />
                    
                    {isSyncing && (
                        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                            <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-primary-100">
                                <RefreshCw className="animate-spin text-primary-600" size={20} />
                                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Syncing...</span>
                            </div>
                        </div>
                    )}

                    {showMsg && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
                            <div className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                                <CheckCircle size={20} />
                                <span className="font-bold text-sm">{showMsg}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer with updated responsive layout */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-4">
                <div className="flex items-center gap-2 w-full">
                    {/* Big Save Button */}
                    <button 
                        onClick={handleSave}
                        disabled={isSyncing}
                        className="flex-1 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        {t.save}
                    </button>

                    {/* Download Button beside Save - Now equal in size */}
                    <button 
                        onClick={() => {
                            const finalCanvas = document.createElement('canvas');
                            finalCanvas.width = canvasSize.width * SCALE_FACTOR;
                            finalCanvas.height = canvasSize.height * SCALE_FACTOR;
                            const fCtx = finalCanvas.getContext('2d');
                            if (fCtx) {
                                fCtx.drawImage(bgCanvasRef.current!, 0, 0);
                                fCtx.drawImage(drawingCanvasRef.current!, 0, 0);
                                const link = document.createElement('a');
                                link.download = `RCT_${patient?.name || 'Chart'}.png`;
                                link.href = finalCanvas.toDataURL('image/png', 1.0);
                                link.click();
                            }
                        }}
                        className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-2xl font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        title={isRTL ? 'تحميل' : 'Download'}
                    >
                        <Download size={20} />
                        <span>{isRTL ? 'تحميل' : 'Download'}</span>
                    </button>
                </div>

                {/* Warning static alert underneath on mobile */}
                {isUnsynced && googleDriveLinked && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-100 dark:border-orange-800 rounded-2xl w-full">
                        <AlertCircle size={20} className="shrink-0" />
                        <span className="text-[11px] md:text-xs font-bold leading-relaxed">{t.rctLocalSaveWarning}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
