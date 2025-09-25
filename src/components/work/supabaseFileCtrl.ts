import { supabase, STORAGE_BUCKET } from '@/supabase/config'
import imageCompression from './imgCtrl'

export async function uploadFile(file: File, dirName: string, name: string): Promise<any> {
    try {
        const filePath = `img/${dirName}/${name}.jpg`
        
        // 大きいサイズの画像をアップロード
        const largeFilePath = `img/${dirName}/${name}_large.jpg`
        const compressedImgLarge = await imageCompression.getCompressImageFile_large(file)
        const { error: largeError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(largeFilePath, compressedImgLarge)
        
        if (largeError) {
            console.error('Large image upload error:', largeError)
        }
        
        // 通常サイズの画像をアップロード
        const compressedImg = await imageCompression.getCompressImageFile(file)
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, compressedImg)
        
        if (error) throw error
        return data
    } catch (error) {
        console.error('Upload error:', error)
        throw error
    }
}

export async function downloadFile(filename: string, dirName: string): Promise<string> {
    const filePath = `img/${dirName}/${filename}.jpg`
    
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)
    
    return data.publicUrl
}

export function deleteFile(filename: string, dirName: string): boolean {
    const filePath = `img/${dirName}/${filename}.jpg`
    const largeFilePath = `img/${dirName}/${filename}_large.jpg`
    
    // 両方のサイズを削除
    supabase.storage.from(STORAGE_BUCKET).remove([filePath, largeFilePath])
        .then(() => {
            return true
        })
        .catch((error) => {
            console.error('Delete error:', error)
            return false
        })
    
    return true
}