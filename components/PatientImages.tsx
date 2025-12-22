
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Maximize2, X, Cloud, Link, FileImage, Download, Loader2, Info, CheckCircle, AlertTriangle, RefreshCw, Key, ShieldCheck, ShieldAlert, ZoomIn, ZoomOut, RotateCw, RotateCcw, DownloadCloud, Maximize } from 'lucide-react';
import { Patient, PatientImage } from '../types';
import { googleDriveService } from '../services/googleDrive';

interface DriveImageItemProps {
    img: PatientImage;
    onMaximize: (img: PatientImage) => void;
    onDelete: () => void;
    t: any;
}

const DriveImageItem: React.FC<DriveImageItemProps> = ({ img, onMaximize, onDelete, t }) => {
    const [displayUrl, setDisplayUrl] = useState<string>(img.url);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
            <img 
                src={img.url} 
                alt={img.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                loading="lazy"
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => onMaximize(img)} className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition transform hover:scale-110">
                    <Maximize2 size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-3 bg-red-500/20 backdrop-blur-md text-white rounded-full hover:bg-red-50 transition transform hover:scale-110">
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(img.date).toLocaleDateString()} - {img.name}
            </div>
            
            {img.driveFileId && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white p-1 rounded-md shadow-sm">
                    <Cloud size={10} />
                </div>
            )}
        </div>
    );
};

interface PatientImagesProps {
  t: any;
  patient: Patient;
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
  googleDriveLinked?: boolean;
  googleDriveRootId?: string;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const PatientImages: React.FC<PatientImagesProps> = ({ t, patient, onUpdatePatient, googleDriveLinked, googleDriveRootId, openConfirm }) => {
  const [selectedImageData, setSelectedImageData] = useState<PatientImage | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDeviceActive, setIsDeviceActive] = useState(googleDriveService.hasActiveToken());
  const [isReactivating, setIsReactivating] = useState(false);

  // Viewer controls state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const images = patient.images || [];

  // التحميل الذكي للصورة داخل المعرض
  useEffect(() => {
    let objectUrl: string | null = null;
    if (!selectedImageData) {
        setViewerUrl(null);
        setIsViewerLoading(false);
        return;
    }

    const loadHighRes = async () => {
        // الخطوة 1: عرض رابط المعاينة فوراً (مضمون العمل)
        setViewerUrl(selectedImageData.url);
        
        if (!selectedImageData.driveFileId || !googleDriveService.hasActiveToken()) {
            return;
        }

        // الخطوة 2: محاولة ترقية الجودة للنسخة الأصلية عبر الدرايف
        setIsViewerLoading(true);
        try {
            const url = await googleDriveService.getFileBlobUrl(selectedImageData.driveFileId);
            objectUrl = url;
            // لا يتم التبديل إلا إذا نجحت العملية تماماً
            setViewerUrl(url);
        } catch (err) {
            console.warn("Failed to upgrade to HD, staying on preview URL.");
            // في حال الفشل، الرابط البديل موجود بالفعل (viewerUrl = selectedImageData.url)
        } finally {
            setIsViewerLoading(false);
        }
    };

    loadHighRes();

    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [selectedImageData]);

  useEffect(() => {
    const checkToken = () => setIsDeviceActive(googleDriveService.hasActiveToken());
    checkToken();
    window.addEventListener('dentro_drive_auth_change', checkToken);
    const interval = setInterval(checkToken, 30000);
    return () => {
      window.removeEventListener('dentro_drive_auth_change', checkToken);
      clearInterval(interval);
    };
  }, []);

  const handleActivateDevice = async () => {
      setIsReactivating(true);
      try {
          const token = await googleDriveService.login('consent');
          if (token) setIsDeviceActive(true);
      } catch (error) {
          console.error("Reactivation failed:", error);
      } finally {
          setIsReactivating(false);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    const oversized = fileList.filter(f => f.size > 15 * 1024 * 1024);
    if (oversized.length > 0) {
        alert(t.currentLang === 'ar' ? "بعض الصور حجمها كبير جداً (الأقصى 15 ميجا)" : "Some files too large (Max 15MB)");
        return;
    }

    setIsUploading(true);
    const newUploadedImages: PatientImage[] = [];
    
    try {
        if (googleDriveLinked && googleDriveRootId) {
            if (!googleDriveService.isReady()) throw new Error("LIBRARY_NOT_READY");
            setUploadProgress(t.syncing || "Connecting...");
            
            const hasToken = await googleDriveService.ensureToken();
            if (!hasToken) {
                const token = await googleDriveService.login('consent');
                if (token) setIsDeviceActive(true);
                else throw new Error("AUTH_FAILED");
            }

            const rootId = await googleDriveService.ensureRootFolder();
            const patientFolderId = await googleDriveService.ensurePatientFolder(rootId, patient);
            
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                setUploadProgress(t.currentLang === 'ar' ? `جاري رفع ${i+1}/${fileList.length}` : `Uploading ${i+1}/${fileList.length}`);
                const result = await googleDriveService.uploadFile(patientFolderId, file);
                newUploadedImages.push({
                    id: (Date.now() + i).toString(),
                    url: result.url,
                    name: file.name,
                    date: new Date().toISOString(),
                    driveFileId: result.id
                });
            }
            onUpdatePatient(patient.id, { images: [...newUploadedImages, ...images] });
        } else {
            const readFiles = fileList.map((file, i) => {
                return new Promise<PatientImage>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve({
                        id: (Date.now() + i).toString(),
                        url: reader.result as string,
                        name: file.name,
                        date: new Date().toISOString()
                    });
                    reader.readAsDataURL(file);
                });
            });
            const results = await Promise.all(readFiles);
            onUpdatePatient(patient.id, { images: [...results, ...images] });
        }
    } catch (error: any) {
        alert(error.message || t.errorDrive);
    } finally {
        setIsUploading(false);
        setUploadProgress('');
        if (e.target) e.target.value = '';
    }
  };

  const handleDeleteImage = (img: PatientImage) => {
    openConfirm(t.images, t.confirmDeleteImage, async () => {
        if (img.driveFileId && googleDriveLinked) {
            try {
                await googleDriveService.deleteFile(img.driveFileId);
            } catch (e) {}
        }
        const updatedImages = images.filter(i => i.id !== img.id);
        onUpdatePatient(patient.id, { images: updatedImages });
    });
  };

  const resetViewer = () => {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setSelectedImageData(null);
  };

  const toggleFullscreen = () => {
      if (!viewerRef.current) return;
      if (!document.fullscreenElement) {
          viewerRef.current.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
      } else {
          document.exitFullscreen();
      }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
      if (zoom <= 1 && rotation === 0) return; 
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
      });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ImageIcon className="text-primary-500" />
                    {t.patientImages}
                </h3>
                {isUploading && (
                    <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800 animate-pulse">
                        <RefreshCw size={14} className="animate-spin text-primary-600" />
                        <span className="text-xs text-primary-700 dark:text-primary-300 font-bold">{uploadProgress}</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary-700 transition cursor-pointer transform hover:-translate-y-0.5 active:scale-95 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload size={18} />
                    <span>{t.uploadImage}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} multiple />
                </label>
            </div>
        </div>

        <div className="animate-fade-in">
            {!googleDriveLinked ? (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-xs md:text-sm text-amber-800 dark:text-amber-300 font-bold leading-relaxed">{t.linkDriveInSettings}</p>
                </div>
            ) : !isDeviceActive ? (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={22} className="text-blue-600 shrink-0" />
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-bold">{t.deviceNeedsActivation}</p>
                            <p className="text-xs text-blue-600/70 dark:text-blue-400/60 font-medium">{t.deviceActivationDesc}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleActivateDevice}
                        disabled={isReactivating}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        {isReactivating ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                        {t.activateDevice || "Activate Connection"}
                    </button>
                </div>
            ) : null}
        </div>

        {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-400">
                <FileImage size={64} className="mb-4 opacity-20" />
                <p className="font-medium">{t.noImages}</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map(img => (
                    <DriveImageItem 
                        key={img.id} 
                        img={img} 
                        t={t} 
                        onMaximize={(data) => setSelectedImageData(data)} 
                        onDelete={() => handleDeleteImage(img)} 
                    />
                ))}
            </div>
        )}

        {/* Full Screen Viewer - التحديث النهائي */}
        {selectedImageData && (
            <div 
                ref={viewerRef}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in select-none"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 md:p-6 text-white shrink-0 border-b border-white/10 bg-black/40">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{selectedImageData.name}</span>
                        <span className="text-[10px] opacity-50 uppercase tracking-widest">{new Date(selectedImageData.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isViewerLoading && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                                <RefreshCw size={12} className="animate-spin text-primary-400" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">HD Loading...</span>
                            </div>
                        )}
                        <button 
                            onClick={toggleFullscreen}
                            className="p-3 hover:bg-white/10 rounded-full transition text-white/80"
                        >
                            <Maximize size={24} />
                        </button>
                        <button onClick={resetViewer} className="p-2 hover:bg-white/10 rounded-full transition group">
                            <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Container مع معالجة Fallback في حال فشل الرابط */}
                <div 
                    className="flex-1 relative flex items-center justify-center overflow-hidden p-4 md:p-10 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {viewerUrl ? (
                        <img 
                            key={selectedImageData.id}
                            src={viewerUrl} 
                            alt="Full view" 
                            draggable={false}
                            onError={() => {
                                // إذا فشل الرابط (خصوصاً رابط الـ Blob)، نعود فوراً للرابط العام
                                if (viewerUrl !== selectedImageData.url) {
                                    setViewerUrl(selectedImageData.url);
                                }
                            }}
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
                            }}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg pointer-events-none" 
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-white/30">
                            <RefreshCw size={48} className="animate-spin" />
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                <div className="p-6 md:p-8 shrink-0 flex justify-center border-t border-white/10 bg-black/60">
                    <div className="flex items-center gap-3 md:gap-6 bg-white/10 backdrop-blur-xl p-2 md:p-3 rounded-3xl border border-white/20 shadow-2xl">
                        <div className="flex items-center gap-1 border-e border-white/10 pe-3 md:pe-5">
                            <button onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))} className="p-3 hover:bg-white/20 rounded-2xl transition text-white">
                                <ZoomOut size={24} />
                            </button>
                            <span className="text-white font-mono font-bold text-xs min-w-[50px] text-center bg-white/5 py-1 rounded-lg">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button onClick={() => setZoom(prev => Math.min(8, prev + 0.25))} className="p-3 hover:bg-white/20 rounded-2xl transition text-white">
                                <ZoomIn size={24} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 border-e border-white/10 pe-3 md:pe-5">
                            <button onClick={() => setRotation(prev => prev - 90)} className="p-3 hover:bg-white/20 rounded-2xl transition text-white">
                                <RotateCcw size={24} />
                            </button>
                            <button onClick={() => setRotation(prev => prev + 90)} className="p-3 hover:bg-white/20 rounded-2xl transition text-white">
                                <RotateCw size={24} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <a 
                                href={viewerUrl || selectedImageData.url} 
                                download={selectedImageData.name} 
                                className="p-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl shadow-lg transition flex items-center gap-2 font-bold"
                            >
                                <DownloadCloud size={24} />
                                <span className="hidden md:inline">{t.download || "Download"}</span>
                            </a>
                            <button 
                                onClick={() => { setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 }); }} 
                                className="p-3 hover:bg-white/20 rounded-2xl transition text-white/70 text-xs font-bold uppercase"
                            >
                                {t.reset}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
