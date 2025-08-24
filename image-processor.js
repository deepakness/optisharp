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

// Watermark options
const WATERMARK = {
  enabled: false,               // Enable/disable watermarking
  type: 'text',                // 'image' or 'text'
  
  // Image watermark options (used when type is 'image')
  imagePath: './assets/watermark.png', // Path to watermark image
  
  // Text watermark options (used when type is 'text')
  text: 'Copyright © 2025',     // Text to use as watermark
  font: 'Arial',                // Font family
  fontSize: 20,                 // Font size
  fontColor: '#ffffff',         // Font color
  
  // Common watermark options
  position: 'bottomRight',      // Position: topLeft, topRight, bottomLeft, bottomRight, center
  opacity: 0.6,                 // Opacity (0-1)
  margin: 20,                   // Margin from edges in pixels
  size: 0.2,                    // Size ratio (percent of main image width) - for image watermarks only
  angle: 0                      // Rotation angle in degrees - for text watermarks only
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

// Helper function to convert position to Sharp's gravity (case-insensitive)
function positionToGravity(position) {
  const p = String(position || '').toLowerCase();
  const gravityMap = {
    topleft: 'northwest',
    top: 'north',
    topright: 'northeast',
    left: 'west',
    center: 'center',
    right: 'east',
    bottomleft: 'southwest',
    bottom: 'south',
    bottomright: 'southeast'
  };

  return gravityMap[p] || 'southeast'; // Default to southeast if position is invalid
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
    formatCounts: {},
    watermarked: 0
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
        
        // Start processing the image
        let pipeline = sharp(inputPath);

        // Respect EXIF orientation
        pipeline = pipeline.rotate();
        
        // Get image metadata
        const metadata = await pipeline.metadata();
        console.log(`  Original: ${metadata.width}x${metadata.height}, ${metadata.format}`);

        // Determine output format (with safeguards for unsupported originals)
        let outputFormat = OUTPUT_FORMAT;
        if (outputFormat === 'original') {
          outputFormat = fileInfo.ext.replace('.', '').toLowerCase();
          if (outputFormat === 'jpg') outputFormat = 'jpeg';
        }
        const supportedOutputs = new Set(['jpeg', 'png', 'webp', 'avif', 'tiff']);
        if (!supportedOutputs.has(outputFormat)) {
          // Fallback: prefer PNG when alpha is present, otherwise JPEG
          outputFormat = metadata.hasAlpha ? 'png' : 'jpeg';
        }

        // Determine output filename and path
        const outputFileName = `${fileInfo.name}.${outputFormat}`;
        const outputPath = path.join(OUTPUT_DIR, outputFileName);
        
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
        
        // Metadata handling: default strips metadata; preserve only if explicitly requested
        if (!OPTIMIZATIONS.removeMetadata) {
          pipeline = pipeline.withMetadata();
        }

        // Flatten transparency when outputting JPEG
        if (outputFormat === 'jpeg' && metadata.hasAlpha) {
          pipeline = pipeline.flatten({ background: '#ffffff' });
        }
        
        // Apply watermark if enabled
        if (WATERMARK.enabled) {
          // Get current dimensions for watermark sizing
          const processedMetadata = await pipeline.clone().toBuffer({ resolveWithObject: true }).then(({ info }) => info);
          
          if (WATERMARK.type === 'image' && fs.existsSync(WATERMARK.imagePath)) {
            // Image watermarking
            stats.watermarked++;
            
            // Calculate watermark size based on main image width
            const watermarkWidth = Math.round(processedMetadata.width * WATERMARK.size);
            
            // Prepare watermark image
            const watermarkBuffer = await sharp(WATERMARK.imagePath)
              .resize(watermarkWidth) // Resize watermark
              .ensureAlpha() // Ensure alpha channel exists
              .composite([{
                // Apply opacity to the watermark
                input: Buffer.from([255, 255, 255, Math.round(WATERMARK.opacity * 255)]),
                raw: { width: 1, height: 1, channels: 4 },
                tile: true,
                blend: 'dest-in'
              }])
              .toBuffer();
            
            // Calculate position with margin
            const gravity = positionToGravity(WATERMARK.position);
            
            // Determine top, bottom, left, right margins based on position
            let top, bottom, left, right;
            
            const posLower = String(WATERMARK.position || '').toLowerCase();
            if (posLower.includes('top')) {
              top = WATERMARK.margin;
            } else if (posLower.includes('bottom')) {
              bottom = WATERMARK.margin;
            }
            
            if (posLower.includes('left')) {
              left = WATERMARK.margin;
            } else if (posLower.includes('right')) {
              right = WATERMARK.margin;
            }
            
            // Apply watermark to main image
            pipeline = pipeline.composite([{
              input: watermarkBuffer,
              gravity: gravity,
              blend: 'over',
              top: top,
              bottom: bottom,
              left: left,
              right: right
            }]);
            
            console.log(`  Applied image watermark (${WATERMARK.position}, ${Math.round(WATERMARK.opacity * 100)}% opacity)`);
          } 
          else if (WATERMARK.type === 'text' && WATERMARK.text) {
            // Text watermarking
            stats.watermarked++;
            
            // Determine text size based on image dimensions
            const fontSize = WATERMARK.fontSize || Math.max(16, Math.round(processedMetadata.width * 0.02));
            
            // Get gravity for positioning
            const gravity = positionToGravity(WATERMARK.position);
            
            // Create text SVG with proper positioning
            // For text watermarks, we need to position the text in the SVG based on the gravity
            let x, y, textAnchor, alignmentBaseline;
            
            // Set positioning for x
            if (gravity.includes('west')) {
              x = WATERMARK.margin;
              textAnchor = 'start';
            } else if (gravity.includes('east')) {
              x = processedMetadata.width - WATERMARK.margin;
              textAnchor = 'end';
            } else {
              x = processedMetadata.width / 2;
              textAnchor = 'middle';
            }
            
            // Set positioning for y
            if (gravity.includes('north')) {
              y = WATERMARK.margin + fontSize;
              alignmentBaseline = 'hanging';
            } else if (gravity.includes('south')) {
              y = processedMetadata.height - WATERMARK.margin;
              alignmentBaseline = 'alphabetic';
            } else {
              y = processedMetadata.height / 2;
              alignmentBaseline = 'middle';
            }
            
            // Escape text for safe SVG embedding
            const escapeXml = (s) => String(s)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');

            // Create an SVG with the text positioned according to gravity
            const svgText = Buffer.from(`
              <svg width="${processedMetadata.width}" height="${processedMetadata.height}">
                <style>
                  .text {
                    fill: ${WATERMARK.fontColor || 'white'};
                    font-family: ${WATERMARK.font || 'Arial'};
                    font-size: ${fontSize}px;
                    font-weight: normal;
                    opacity: ${WATERMARK.opacity};
                  }
                </style>
                <text
                  x="${x}"
                  y="${y}"
                  text-anchor="${textAnchor}"
                  alignment-baseline="${alignmentBaseline}"
                  transform="rotate(${WATERMARK.angle || 0}, ${x}, ${y})"
                  class="text">${escapeXml(WATERMARK.text)}</text>
              </svg>
            `);
            
            // Apply text watermark
            pipeline = pipeline.composite([{
              input: svgText,
              gravity: 'northwest', // Use northwest as we're already positioning within the SVG
              blend: 'over'
            }]);
            
            console.log(`  Applied text watermark: "${WATERMARK.text}"`);
          }
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
        
        // Update stats (only after success)
        stats.totalProcessed++;
        stats.successCount++;
        stats.totalInputSize += inputSize;
        stats.totalOutputSize += outputSize;
        if (!stats.formatCounts[outputFormat]) {
          stats.formatCounts[outputFormat] = 0;
        }
        stats.formatCounts[outputFormat]++;
        
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
    if (WATERMARK.enabled) {
      console.log(`Watermarked: ${stats.watermarked} files`);
    }
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
    console.log('✨ Image processing completed successfully! ✨');
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
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Start processing
processImages().then(() => {
  // Processing complete
}); 
