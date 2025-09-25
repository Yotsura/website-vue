import imageCompression from './imgCtrl';
import {
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_UPLOAD_PRESET,
	CLOUDINARY_DELETE_API,
	buildPublicId,
	buildDeliveryUrl,
} from '@/cloudinary/config';

// Cloudinary へ画像をアップロードする
// 既存仕様と互換: public_id を `img/<dir>/<name>` にし、
//   - 通常サイズ: .jpg
//   - 大サイズ:   _large.jpg
export async function uploadFile(file: File, dirName: string, name: string): Promise<void> {
	const publicIdBase = buildPublicId(dirName, name);

	const formUpload = async (blob: Blob, publicId: string) => {
		const form = new FormData();
		form.append('file', blob);
		form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
		form.append('public_id', publicId);
		// 既存のjpg運用に合わせる
		form.append('format', 'jpg');

		const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
			method: 'POST',
			body: form,
		});
		if (!res.ok) {
			const t = await res.text().catch(() => '');
			throw new Error(`Cloudinary upload failed: ${res.status} ${t}`);
		}
	};

	// 先に大サイズをアップロード
	const compressedLarge = await imageCompression.getCompressImageFile_large(file);
	await formUpload(compressedLarge, `${publicIdBase}_large`);

	// 通常サイズをアップロード
	const compressed = await imageCompression.getCompressImageFile(file);
	await formUpload(compressed, `${publicIdBase}`);
}

// 画像のダウンロードURLを返す（単に配信用URLを合成）
export async function downloadFile(filename: string, dirName: string): Promise<string> {
	try {
		const publicId = buildPublicId(dirName, filename);
		return buildDeliveryUrl(publicId, 'jpg');
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.log(e.message);
		}
	}
	return '';
}

// 画像削除: Cloudinaryはセキュリティ上、クライアント直叩き削除は推奨されない
// サーバ側(API)を用意した場合のみ実行。未設定なら false を返してスキップ。
export function deleteFile(filename: string, dirName: string): boolean {
	try {
		if (!CLOUDINARY_DELETE_API) return false;
		const publicId = buildPublicId(dirName, filename);
		// 非同期で投げっぱなし（結果はログに出す）
		fetch(CLOUDINARY_DELETE_API, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ publicId }),
		})
			.then(async (r) => {
				if (!r.ok) throw new Error(await r.text());
				return true;
			})
			.catch((e) => {
				console.log(e);
				return false;
			});
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.log(e.message);
		}
	}
	return false;
}