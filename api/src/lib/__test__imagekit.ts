// api/src/lib/__test__imagekit.ts
import { IMAGE_CONFIG, imagekit } from './imagekit';

async function testConnection() {
  try {
    console.log('🔍 Testing ImageKit connection...\n');
    
    // Test: List files (works even if empty)
    const files = await imagekit.listFiles({
      path: IMAGE_CONFIG.FOLDER_PREFIX,
      limit: 1
    });
    
    console.log('✅ Connection successful!\n');
    console.log('📊 Configuration:');
    console.log(`   - URL Endpoint: ${process.env.IMAGEKIT_URL_ENDPOINT}`);
    console.log(`   - Public Key: ${process.env.IMAGEKIT_PUBLIC_KEY}`);
    console.log(`   - Max file size: ${IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    console.log(`   - Allowed types: ${IMAGE_CONFIG.ALLOWED_TYPES.join(', ')}`);
    console.log(`\n📁 Found ${files.length} files in ImageKit`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();