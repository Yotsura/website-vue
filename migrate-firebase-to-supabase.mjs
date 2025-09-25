// Firebase Storage to Supabase Storage Migration Script
// 
// Usage:
//   1. Copy this file to your project root
//   2. Install dependencies: npm install firebase @supabase/supabase-js node-fetch dotenv
//   3. Create .env.local with:
//      VITE_SUPABASE_URL=your_supabase_url
//      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
//   4. Update firebaseConfig below with your Firebase config
//   5. Run: node migrate-firebase-to-supabase.mjs
//
// This script will:
//   - List all files in Firebase Storage under 'img/' folder
//   - Download each file from Firebase Storage
//   - Upload to Supabase Storage maintaining same folder structure
//   - Provide progress updates and error handling

import { initializeApp } from 'firebase/app'
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Firebase configuration - UPDATE THIS WITH YOUR FIREBASE CONFIG
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID",
//   measurementId: "YOUR_MEASUREMENT_ID"
// }

// Current project config:
const firebaseConfig = {
  apiKey: "AIzaSyDywqklfOhMjAhjY8hsEmTIZxwUhrFH-wE",
  authDomain: "website-84eb0.firebaseapp.com",
  projectId: "website-84eb0",
  storageBucket: "website-84eb0.appspot.com",
  messagingSenderId: "175592466303",
  appId: "1:175592466303:web:6c4f8f3ca0efaac6361c4a",
  measurementId: "G-ZG541ENL1Z"
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const storage = getStorage(firebaseApp)

// Configuration options
const MIGRATION_CONFIG = {
  // Source folder in Firebase Storage (change if your images are in a different folder)
  FIREBASE_SOURCE_FOLDER: 'img',
  
  // Target bucket in Supabase Storage
  SUPABASE_BUCKET: 'images',
  
  // Rate limiting (milliseconds between file transfers)
  RATE_LIMIT_MS: 200,
  
  // File content type (change if needed)
  CONTENT_TYPE: 'image/jpeg'
}

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local file')
  console.log('Please add:')
  console.log('VITE_SUPABASE_URL=your_supabase_url')
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listFirebaseFiles() {
  console.log(`🔍 Listing Firebase Storage files in '${MIGRATION_CONFIG.FIREBASE_SOURCE_FOLDER}' folder...`)
  
  const imgRef = ref(storage, MIGRATION_CONFIG.FIREBASE_SOURCE_FOLDER)
  const result = await listAll(imgRef)
  
  const allFiles = []
  
  // Check all subfolders
  for (const folderRef of result.prefixes) {
    console.log(`📁 Checking folder: ${folderRef.name}`)
    
    const folderResult = await listAll(folderRef)
    
    for (const fileRef of folderResult.items) {
      allFiles.push(fileRef.fullPath)
      console.log(`📄 Found: ${fileRef.fullPath}`)
    }
  }
  
  // Check root level files
  for (const fileRef of result.items) {
    allFiles.push(fileRef.fullPath)
    console.log(`📄 Found root file: ${fileRef.fullPath}`)
  }
  
  console.log(`✅ Total files found: ${allFiles.length}`)
  return allFiles
}

async function migrateFile(filePath) {
  try {
    console.log(`📤 Migrating: ${filePath}`)
    
    // Download from Firebase Storage
    const fileRef = ref(storage, filePath)
    const downloadURL = await getDownloadURL(fileRef)
    
    const response = await fetch(downloadURL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const buffer = await response.buffer()
    console.log(`📦 Downloaded ${buffer.length} bytes`)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(MIGRATION_CONFIG.SUPABASE_BUCKET)
      .upload(filePath, buffer, {
        contentType: MIGRATION_CONFIG.CONTENT_TYPE,
        upsert: true
      })
    
    if (error) {
      throw error
    }
    
    console.log(`✅ Successfully migrated: ${filePath}`)
    return true
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${filePath}:`, error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🚀 Starting Firebase to Supabase migration...')
    
    // List all files in Firebase Storage
    const files = await listFirebaseFiles()
    
    if (files.length === 0) {
      console.log('❌ No files found to migrate')
      return
    }
    
    console.log(`📋 Found ${files.length} files to migrate`)
    
    let success = 0
    let failed = 0
    
    // Migrate each file
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i]
      console.log(`\n[${i + 1}/${files.length}] Processing: ${filePath}`)
      
      const result = await migrateFile(filePath)
      
      if (result) {
        success++
      } else {
        failed++
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.RATE_LIMIT_MS))
    }
    
    console.log('\n🎉 Migration completed!')
    console.log(`✅ Success: ${success}`)
    console.log(`❌ Failed: ${failed}`)
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

main()