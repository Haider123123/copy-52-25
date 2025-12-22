
import { Patient, PatientImage } from '../types';

const CLIENT_ID = '911370288886-cchv6ighe95ii10rdom1g7ufso2rafeg.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const STORAGE_KEY = 'dentro_gd_token';

let tokenClient: any = null;
let isLibraryReady = false;

export const googleDriveService = {
    
    init: (onInited: () => void) => {
        const checkScripts = () => {
            const gapi = (window as any).gapi;
            const google = (window as any).google;

            if (!gapi || !google || !google.accounts) {
                setTimeout(checkScripts, 500);
                return;
            }

            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        discoveryDocs: [DISCOVERY_DOC],
                    });
                    
                    tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: CLIENT_ID,
                        scope: SCOPES,
                        callback: '', 
                    });
                    
                    isLibraryReady = true;
                    googleDriveService.loadPersistedToken();
                    onInited();
                } catch (error: any) {
                    console.error("GAPI Init Error:", error);
                }
            });
        };

        checkScripts();
    },

    isReady: () => isLibraryReady && tokenClient !== null,

    saveToken: (tokenObj: any) => {
        if (!tokenObj) return;
        const expiry = Date.now() + (tokenObj.expires_in * 1000) - 60000;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...tokenObj,
            expires_at: expiry
        }));
        window.dispatchEvent(new CustomEvent('dentro_drive_auth_change'));
    },

    loadPersistedToken: () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.expires_at > Date.now()) {
                    (window as any).gapi.client.setToken(data);
                    return true;
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (e) {
            console.error("Failed to load persisted token", e);
        }
        return false;
    },

    hasActiveToken: () => {
        try {
            const gapi = (window as any).gapi;
            if (!gapi || !gapi.client) return false;
            const token = gapi.client.getToken();
            if (!token || !token.access_token) return false;
            
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                return data.expires_at > Date.now();
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    ensureToken: async (): Promise<boolean> => {
        if (googleDriveService.hasActiveToken()) return true;
        return googleDriveService.loadPersistedToken();
    },

    login: (prompt: 'consent' | 'none' = 'consent'): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!tokenClient) {
                reject("LIBRARY_NOT_READY");
                return;
            }

            const timeout = setTimeout(() => reject("AUTH_TIMEOUT"), 60000);

            tokenClient.callback = (resp: any) => {
                clearTimeout(timeout);
                if (resp.error !== undefined) {
                    reject(resp.error);
                    return;
                }
                (window as any).gapi.client.setToken(resp);
                googleDriveService.saveToken(resp);
                resolve(resp.access_token);
            };

            try {
                tokenClient.requestAccessToken({ prompt: prompt });
            } catch (err) {
                clearTimeout(timeout);
                reject(err);
            }
        });
    },

    ensureRootFolder: async (): Promise<string> => {
        const gapi = (window as any).gapi;
        try {
            const response = await gapi.client.drive.files.list({
                q: "name = 'Dentro_Clinic_Files' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                fields: 'files(id)',
            });

            if (response.result.files && response.result.files.length > 0) {
                return response.result.files[0].id;
            }

            const createResp = await gapi.client.drive.files.create({
                resource: {
                    name: 'Dentro_Clinic_Files',
                    mimeType: 'application/vnd.google-apps.folder',
                },
                fields: 'id',
            });
            return createResp.result.id;
        } catch (error: any) {
            throw new Error(`DRIVE_API_ERROR: ${error.result?.error?.message || error.message || "Unknown"}`);
        }
    },

    ensurePatientFolder: async (rootId: string, patient: Patient): Promise<string> => {
        const gapi = (window as any).gapi;
        const folderName = `Patient_${patient.id}_${patient.name.replace(/\s+/g, '_')}`;
        
        try {
            const response = await gapi.client.drive.files.list({
                q: `name = '${folderName}' and '${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id)',
            });

            if (response.result.files && response.result.files.length > 0) {
                return response.result.files[0].id;
            }

            const createResp = await gapi.client.drive.files.create({
                resource: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [rootId]
                },
                fields: 'id',
            });
            return createResp.result.id;
        } catch (error: any) {
            throw new Error(`DRIVE_API_ERROR: ${error.result?.error?.message || error.message || "Unknown"}`);
        }
    },

    uploadFile: async (folderId: string, file: File): Promise<{ id: string, url: string }> => {
        const gapi = (window as any).gapi;
        const token = gapi.client.getToken();
        if (!token) throw new Error("AUTH_REQUIRED");
        
        const accessToken = token.access_token;
        const boundary = '-------dentro_upload_boundary';
        const metadata = { name: file.name, mimeType: file.type, parents: [folderId] };

        const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
        const fileHeader = `--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`;
        const footer = `\r\n--${boundary}--`;

        const requestBody = new Blob([metadataPart, fileHeader, file, footer], { type: 'multipart/related; boundary=' + boundary });

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + accessToken },
            body: requestBody
        });

        if (!response.ok) {
            const errBody = await response.json();
            throw new Error(`UPLOAD_ERROR: ${errBody.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const fileId = result.id;
        
        try {
            await gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: { role: 'reader', type: 'anyone', allowFileDiscovery: false },
            });
        } catch (permError) {}

        return { 
            id: fileId, 
            url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` 
        };
    },

    getFileBlobUrl: async (fileId: string): Promise<string> => {
        const gapi = (window as any).gapi;
        const token = gapi.client.getToken();
        if (!token) throw new Error("AUTH_REQUIRED");

        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': 'Bearer ' + token.access_token }
        });

        if (!response.ok) throw new Error("FETCH_FAILED");

        // التأكد من أن النتيجة هي صورة فعلاً
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.startsWith('image/')) {
            throw new Error("NOT_AN_IMAGE");
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },

    deleteFile: async (fileId: string) => {
        try {
            const gapi = (window as any).gapi;
            await gapi.client.drive.files.delete({ fileId: fileId });
        } catch (e) {
            console.error("Delete Error:", e);
        }
    }
};
