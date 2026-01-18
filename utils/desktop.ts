


export const desktop = {
    IsLocalFile: () => true,
    OpenFilenameDialog: () => {
        console.log("OpenFilenameDialog");
    },
    LocalFileGetImageUrl: (file: string) => {
        console.log("LocalFileGetImageUrl: ", file);
    },
    loadLocalFile: (file: string, callback: (data: string) => void) => {
        console.log("loadLocalFile: ", file);
    },
    convertFile: (...args: unknown[]) => {
        console.log("convertFile", args);
    },
    onFileLockedClose: (...args: unknown[]) => {
        console.log("onFileLockedClose", args);
    },
    OnSave: (...args: unknown[]) => {
        console.log("OnSave", args);
    },
    OpenWorkbook: (...args: unknown[]) => {
        console.log("OpenWorkbook", args);
    },
    onDocumentModifiedChanged: (...args: unknown[]) => {
        console.log("onDocumentModifiedChanged", args);
    },
    Print_Start: (...args: unknown[]) => {
        console.log("Print_Start", args);
    },
    Print_Page: (...args: unknown[]) => {
        console.log("Print_Page", args);
    },
    Print_End: (...args: unknown[]) => {
        console.log("Print_End", args);
    },
    SetAdvancedOptions: (...args: unknown[]) => {
        console.log("SetAdvancedOptions", args);
    },
    LocalFileGetOpenChangesCount: (...args: unknown[]) => {
        console.log("LocalFileGetOpenChangesCount", args);
    },
    LocalFileGetSaved: (...args: unknown[]) => {
        console.log("LocalFileGetSaved", args);
    },
    LocalFileSave: (...args: unknown[]) => {
        console.log("LocalFileSave", args);
    },
    buildCryptedStart: (...args: unknown[]) => {
        console.log("buildCryptedStart", args);
    },
    buildCryptedEnd: (...args: unknown[]) => {
        console.log("buildCryptedEnd", args);
    },
    LocalFileGetSourcePath: (...args: unknown[]) => {
        console.log("LocalFileGetSourcePath", args);
    },
    CheckNeedWheel: (...args: unknown[]) => {
        console.log("CheckNeedWheel", args);
    },
    NativeViewerOpen: (...args: unknown[]) => {
        console.log("NativeViewerOpen", args);
    },
    PluginInstall: (...args: unknown[]) => {
        console.log("PluginInstall", args);
    },
    GetInstallPlugins: (...args: unknown[]) => {
        console.log("GetInstallPlugins", args);
        return JSON.stringify([
            { url: "", pluginsData: [] },
            { url: "", pluginsData: [] },
        ])
    },
    CreateEditorApi: (...args: unknown[]) => {
        console.log("CreateEditorApi", args);
    },
    execCommand: (...args: unknown[]) => {
        console.log("execCommand", args)
    },
    SetDocumentName: (...args: unknown[]) => {
        console.log("SetDocumentName", args)
    },
    OpenFileCrypt: (...args: unknown[]) => {
        console.log("OpenFileCrypt", args)
    },
    onDocumentContentReady: (...args: unknown[]) => {
        console.log("onDocumentContentReady", args)
    },
    SpellCheck: (...args: unknown[]) => {
        console.log("SpellCheck", args)
    },
    MediaStart: (...args: unknown[]) => {
        console.log("MediaStart", args)
    },
    CallMediaPlayerCommand: (...args: unknown[]) => {
        console.log("CallMediaPlayerCommand", args)
    },
    Sign: (...args: unknown[]) => {
        console.log("Sign", args)
    },
    ViewCertificate: (...args: unknown[]) => {
        console.log("ViewCertificate", args)
    },
    SelectCertificate: (...args: unknown[]) => {
        console.log("SelectCertificate", args)
    },
    GetDefaultCertificate: (...args: unknown[]) => {
        console.log("GetDefaultCertificate", args)
    },
    RemoveSignature: (...args: unknown[]) => {
        console.log("RemoveSignature", args)
    },
    RemoveAllSignatures: (...args: unknown[]) => {
        console.log("RemoveAllSignatures", args)
    },
    IsSignaturesSupport: (...args: unknown[]) => {
        console.log("IsSignaturesSupport", args)
    },
    IsProtectionSupport: (...args: unknown[]) => {
        console.log("IsProtectionSupport", args)
    },
    isSupportMacroses: (...args: unknown[]) => {
        console.log("isSupportMacroses", args)
    },
    emulateCloudPrinting: (...args: unknown[]) => {
        console.log("emulateCloudPrinting", args)
    },
    localSaveToDrawingFormat: (...args: unknown[]) => {
        console.log("localSaveToDrawingFormat", args)
    },
    GetImageOriginalSize: (...args: unknown[]) => {
        console.log("GetImageOriginalSize", args)
    },
    getEngineVersion: (...args: unknown[]) => {
        console.log("getEngineVersion", args)
    },
    LoadJS: (...args: unknown[]) => {
        console.log("LoadJS", args)
    },
    GetImageBase64: (...args: unknown[]) => {
        console.log("GetImageBase64", args)
    },
    // GetEncryptedHeader: (...args: unknown[]) => {
    //     console.log("GetEncryptedHeader", args)
    // },
    GetImageFormat: (...args: unknown[]) => {
        console.log("GetImageFormat", args)
    },
    RemoveFile: (...args: unknown[]) => {
        console.log("RemoveFile", args)
    },
    ResaveFile: (...args: unknown[]) => {
        console.log("ResaveFile", args)
    },
    GetOpenedFile: (...args: unknown[]) => {
        console.log("GetOpenedFile", args)
    },
    sendSystemMessage: (...args: unknown[]) => {
        console.log("sendSystemMessage", args)
    },
    CallInAllWindows: (...args: unknown[]) => {
        console.log("CallInAllWindows", args)
    },
    openExternalReference: (...args: unknown[]) => {
        console.log("openExternalReference", args)
    },
    PreloadCryptoImage: (...args: unknown[]) => {
        console.log("PreloadCryptoImage", args)
    },
    getDictionariesPath: (...args: unknown[]) => {
        console.log("getDictionariesPath", args)
    },
    LocalStartOpen: (...args: unknown[]) => {
        console.log("LocalStartOpen", args)
    },
    startExternalConvertation: (...args: unknown[]) => {
        console.log("startExternalConvertation", args)
    },
    CheckUserId: (...args: unknown[]) => {
        console.log("CheckUserId", args)
    },
    LoadFontBase64: (name: string) => {
        console.log("LoadFontBase64", name)
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `/v9.3.0.24-1/fonts/${name}`, false);
        xhr.send();

        let binary = '';
        const bytes = new Uint8Array(xhr.response);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },
    LocalFileRecents: (...args: unknown[]) => {
        console.log("LocalFileRecents", args)
    },



    CryptoMode: 0,
    isBlockchainSupport: () => false,
    isSupportNetworkFunctionality: () => false,


    // editor\sdkjs\common\clipboard_base.js
    // window["AscDesktopEditor"][_method]();
    // GetFontThumbnailHeight
    // GetSupportedScaleValues
    // UpdateSystemPlugins
    // IsSupportMedia
    // SetLocalRestrictions
}

export const RendererProcessVariable = {
    localthemes: [],
}