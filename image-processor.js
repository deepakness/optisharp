/**
 * Image Processor - A utility to resize, optimize, and convert images
 * 
 * This script processes all images from the /input directory and saves them to the /output directory.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// =======================================================
// CONFIGURABLE OPTIONS - Modify these as needed
// =======================================================

// Output format: 'jpeg', 'png', 'webp', 'avif', 'tiff', or 'original' to keep the source format
const OUTPUT_FORMAT = 'jpeg';

// Image quality (1-100) - Higher values mean better quality but larger file size
const QUALITY = 80;

// Resize options
const RESIZE = {
  enabled: true,
  width: 1200,  // Set to null to maintain aspect ratio based on height
  height: null, // Set to null to maintain aspect ratio based on width
  fit: 'inside' // 'cover', 'contain', 'fill', 'inside', 'outside'
};

// Apply additional image optimizations
const OPTIMIZATIONS = {
  sharpen: true,      // Apply mild sharpening to the image
  removeMetadata: true // Remove EXIF and other metadata to reduce file size
};

// =======================================================
// DO NOT MODIFY BELOW THIS LINE UNLESS YOU KNOW WHAT YOU'RE DOING
// =======================================================

// Input and output directories
const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all files from input directory
async function processImages() {
  // Start timer
  const startTime = Date.now();
  
  // Stats tracking
  const stats = {
    totalProcessed: 0,
    totalInputSize: 0,
    totalOutputSize: 0,
    successCount: 0,
    errorCount: 0,
    skippedCount: 0,
    formatCounts: {}
  };
  
  try {
    // Read all files from input directory
    const files = fs.readdirSync(INPUT_DIR);
    
    if (files.length === 0) {
      console.log('No files found in the input directory.');
      return;
    }

    console.log(`Found ${files.length} files in the input directory.`);
    console.log('==================================================');
    
    // Process each file
    for (const file of files) {
      const inputPath = path.join(INPUT_DIR, file);
      
      // Skip directories
      if (fs.statSync(inputPath).isDirectory()) {
        console.log(`Skipping directory: ${file}`);
        stats.skippedCount++;
        continue;
      }
      
      try {
        // Get file information
        const fileInfo = path.parse(file);
        const isImageFile = /\.(jpe?g|png|webp|gif|avif|tiff|svg)$/i.test(fileInfo.ext);
        
        if (!isImageFile) {
          console.log(`Skipping non-image file: ${file}`);
          stats.skippedCount++;
          continue;
        }
        
        console.log(`Processing: ${file}`);
        
        // Determine output format
        let outputFormat = OUTPUT_FORMAT;
        if (outputFormat === 'original') {
          outputFormat = fileInfo.ext.replace('.', '');
          // Normalize some extensions
          if (outputFormat === 'jpg') outputFormat = 'jpeg';
        }
        
        // Track format counts
        if (!stats.formatCounts[outputFormat]) {
          stats.formatCounts[outputFormat] = 0;
        }
        stats.formatCounts[outputFormat]++;
        
        // Determine output filename
        const outputFileName = `${fileInfo.name}.${outputFormat}`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);
        
        // Start processing the image
        let pipeline = sharp(inputPath);
        
        // Get image metadata
        const metadata = await pipeline.metadata();
        console.log(`  Original: ${metadata.width}x${metadata.height}, ${metadata.format}`);
        
        // Apply resizing if enabled
        if (RESIZE.enabled) {
          pipeline = pipeline.resize({
            width: RESIZE.width,
            height: RESIZE.height,
            fit: RESIZE.fit,
            withoutEnlargement: true // Don't enlarge images smaller than the target dimensions
          });
        }
        
        // Apply optimizations
        if (OPTIMIZATIONS.sharpen) {
          pipeline = pipeline.sharpen();
        }
        
        if (OPTIMIZATIONS.removeMetadata) {
          pipeline = pipeline.withMetadata(false);
        }
        
        // Set output format and quality
        const formatOptions = {};
        
        // Set quality based on format
        if (['jpeg', 'jpg', 'webp', 'avif', 'tiff'].includes(outputFormat)) {
          formatOptions.quality = QUALITY;
        }
        
        // Additional format-specific optimizations
        if (outputFormat === 'jpeg') {
          formatOptions.mozjpeg = true; // Use mozjpeg for better compression
        } else if (outputFormat === 'png') {
          formatOptions.compressionLevel = 9; // Maximum compression for PNG
        } else if (outputFormat === 'webp') {
          formatOptions.lossless = false; // Use lossy compression for WebP
        }
        
        // Convert to the desired format
        pipeline = pipeline.toFormat(outputFormat, formatOptions);
        
        // Save the processed image
        await pipeline.toFile(outputPath);
        
        // Get processed image metadata
        const processedMetadata = await sharp(outputPath).metadata();
        console.log(`  Processed: ${processedMetadata.width}x${processedMetadata.height}, ${processedMetadata.format}`);
        
        // Calculate file size reduction
        const inputSize = fs.statSync(inputPath).size;
        const outputSize = fs.statSync(outputPath).size;
        const reduction = ((inputSize - outputSize) / inputSize * 100).toFixed(2);
        
        // Update stats
        stats.totalProcessed++;
        stats.successCount++;
        stats.totalInputSize += inputSize;
        stats.totalOutputSize += outputSize;
        
        console.log(`  Size: ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (${reduction}% reduction)`);
        console.log('  Done!');
        console.log('--------------------------------------------------');
        
      } catch (error) {
        stats.errorCount++;
        console.error(`  Error processing ${file}:`, error.message);
        console.log('--------------------------------------------------');
      }
    }
    
    // Calculate time taken
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // in seconds
    
    // Print summary
    console.log('==================================================');
    console.log('                 SUMMARY REPORT                   ');
    console.log('==================================================');
    console.log(`Total files processed: ${stats.totalProcessed} files`);
    console.log(`Successfully processed: ${stats.successCount} files`);
    console.log(`Errors: ${stats.errorCount} files`);
    console.log(`Skipped: ${stats.skippedCount} files`);
    console.log('--------------------------------------------------');
    
    // Print format breakdown if any files were processed
    if (stats.totalProcessed > 0) {
      console.log('Output format breakdown:');
      for (const [format, count] of Object.entries(stats.formatCounts)) {
        const percentage = ((count / stats.totalProcessed) * 100).toFixed(1);
        console.log(`  ${format.toUpperCase()}: ${count} files (${percentage}%)`);
      }
      console.log('--------------------------------------------------');
    }
    
    // Print size information if any files were processed
    if (stats.totalProcessed > 0) {
      const totalReduction = ((stats.totalInputSize - stats.totalOutputSize) / stats.totalInputSize * 100).toFixed(2);
      const savedSpace = stats.totalInputSize - stats.totalOutputSize;
      
      console.log('Size statistics:');
      console.log(`  Total original size: ${formatBytes(stats.totalInputSize)}`);
      console.log(`  Total processed size: ${formatBytes(stats.totalOutputSize)}`);
      console.log(`  Total space saved: ${formatBytes(savedSpace)} (${totalReduction}% reduction)`);
      console.log('--------------------------------------------------');
    }
    
    // Print time information
    console.log('Time statistics:');
    console.log(`  Total processing time: ${timeTaken.toFixed(2)} seconds`);
    if (stats.totalProcessed > 0) {
      console.log(`  Average time per image: ${(timeTaken / stats.totalProcessed).toFixed(2)} seconds`);
    }
    console.log('==================================================');
    
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
  
  return stats;
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the script
processImages()
  .then(() => {
    console.log('✨ Image processing completed successfully! ✨');
  })
  .catch(err => console.error('Error:', err.message)); 