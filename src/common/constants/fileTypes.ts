export enum FileTypes {
    IMAGE_PNG = 'image/png',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_JPG = 'image/jpg',
    IMAGE_GIF = 'image/gif',
    IMAGE_WEBP = 'image/webp',
    IMAGE_SVG = 'image/svg+xml',

    APPLICATION_PDF = 'application/pdf',
    APPLICATION_MSWORD = 'application/msword', // Supports .doc files
    APPLICATION_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Supports .docx files
    APPLICATION_XLS = 'application/vnd.ms-excel',
    APPLICATION_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    TEXT_PLAIN = 'text/plain',
    TEXT_CSV = 'text/csv',
    APPLICATION_RTF = 'application/rtf',

    APPLICATION_ZIP = 'application/zip',
    APPLICATION_RAR = 'application/x-rar-compressed',
    APPLICATION_TAR = 'application/x-tar',

    APPLICATION_JSON = 'application/json',
    APPLICATION_XML = 'application/xml',
    APPLICATION_YAML = 'application/x-yaml',
    TEXT_HTML = 'text/html'
}

export const IMAGE_FILE_TYPES = [
    FileTypes.IMAGE_PNG,
    FileTypes.IMAGE_JPEG,
    FileTypes.IMAGE_GIF,
    FileTypes.IMAGE_WEBP,
    FileTypes.IMAGE_SVG
];

export const DOCUMENT_FILE_TYPES = [
    FileTypes.APPLICATION_PDF,
    FileTypes.APPLICATION_MSWORD,
    FileTypes.APPLICATION_DOCX,
    FileTypes.APPLICATION_XLS,
    FileTypes.APPLICATION_XLSX,
    FileTypes.TEXT_PLAIN
];

export const OTHER_FILE_TYPES = [FileTypes.APPLICATION_ZIP, FileTypes.APPLICATION_RAR, FileTypes.APPLICATION_TAR];

export const ALL_FILE_TYPES = [...IMAGE_FILE_TYPES, ...DOCUMENT_FILE_TYPES, ...OTHER_FILE_TYPES];
