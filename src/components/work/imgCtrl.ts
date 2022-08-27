import imageCompression from 'browser-image-compression'

export default {
    async getCompressImageFile(file:File): Promise<File> {
        const options = {
            maxSizeMB: 0.05, //最大ファイルサイズ
            maxWidthOrHeight: 400, //最大縦横値
        }
        return await imageCompression(file, options)
    },
    async getCompressImageFile_large(file:File): Promise<File> {
        const options = {
            maxSizeMB: 0.3, //最大ファイルサイズ
            maxWidthOrHeight: 1500, //最大縦横値
        }
        return await imageCompression(file, options)
    },
}