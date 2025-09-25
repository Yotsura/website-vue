import { supabase } from '@/supabase/client';
import imageCompression from './imgCtrl';

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET ?? 'images';
const BASE_DIR = 'img';

const buildPath = (dir: string, name: string) => `${BASE_DIR}/${dir}/${name}.jpg`;
const buildLargePath = (dir: string, name: string) => `${BASE_DIR}/${dir}/${name}_large.jpg`;

export async function uploadFile(file: File, dirName: string, name: string): Promise<void> {
  const img = await imageCompression.getCompressImageFile(file);
  const large = await imageCompression.getCompressImageFile_large(file);

  const [r1, r2] = await Promise.all([
    supabase.storage.from(BUCKET).upload(buildPath(dirName, name), img, { upsert: true, contentType: 'image/jpeg' }),
    supabase.storage.from(BUCKET).upload(buildLargePath(dirName, name), large, { upsert: true, contentType: 'image/jpeg' }),
  ]);
  if (r1.error) throw r1.error;
  if (r2.error) throw r2.error;
}

export async function downloadFile(filename: string, dirName: string): Promise<string> {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(buildPath(dirName, filename));
  return data.publicUrl;
}

export function deleteFile(filename: string, dirName: string): boolean {
  supabase.storage
    .from(BUCKET)
    .remove([buildPath(dirName, filename)])
    .then(({ error }) => {
      if (error) console.error(error);
    });
  return true;
}
