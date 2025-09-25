import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import imageCompression from './imgCtrl';

export async function uploadFile (file: File ,dirName: string , name: string): Promise<firebase.storage.UploadTask> {
    const imageURL = `img/${dirName}/${name}`;
	const compressedImg_large = await imageCompression.getCompressImageFile_large(file);
	firebase.storage().ref().child(imageURL + '_large.jpg').put(compressedImg_large);

    const compressedImg = await imageCompression.getCompressImageFile(file);
    return  firebase.storage().ref().child(imageURL + '.jpg').put(compressedImg);
}

export async function downloadFile (filename: string ,dirName: string ): Promise<string> {
	try {
		const imageURL = `img/${dirName}/${filename}.jpg`;
		return firebase.storage().ref().child(imageURL).getDownloadURL();
	} catch( e:unknown ) {
		if (e instanceof Error) {
			console.log(e.message);
		}
	}
	return '';
}

export function deleteFile (filename:string ,dirName: string): boolean  {
	try {
		const imageURL = `img/${dirName}/${filename}.jpg`;
		const postref = firebase.storage().ref().child(imageURL);
		postref.delete().then(() => {
		// File deleted successfully
			return true;
		}).catch((e: unknown) => {
		// Uh-oh, an error occurred!
			if (e instanceof Error) {
				console.log(e.message);
			}
			return false;
		});
	} catch( e: unknown ) {
		if (e instanceof Error) {
			console.log(e.message);
		}
	}
	return false;
}