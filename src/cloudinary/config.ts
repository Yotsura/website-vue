export const CLOUDINARY_CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '') as string;
export const CLOUDINARY_UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '') as string;
// public_id に含めるベースフォルダ（既存の img/<dir>/<name> と互換にするためのデフォルト）
export const CLOUDINARY_BASE_FOLDER = (import.meta.env.VITE_CLOUDINARY_BASE_FOLDER ?? 'img') as string;
// 画像削除用のサーバ側エンドポイント（任意）。未設定ならクライアントからは削除しない。
export const CLOUDINARY_DELETE_API = (import.meta.env.VITE_CLOUDINARY_DELETE_API ?? '') as string;

export const buildPublicId = (dirName: string, name: string) => `${CLOUDINARY_BASE_FOLDER}/${dirName}/${name}`;
export const buildDeliveryUrl = (publicId: string, format: string = 'jpg') =>
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}.${format}`;
