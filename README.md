# Sharp Image Processor

![License](https://img.shields.io/github/license/deepakness/optisharp)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.17.0-brightgreen.svg)

A high-performance Node.js utility for batch processing images using the [Sharp](https://sharp.pixelplumbing.com/) library. This tool is perfect for optimizing images for web usage, reducing storage requirements, or preparing media for various platforms.

<p align="center">
  <img src="https://user-images.githubusercontent.com/your-user-id/path-to-image/demo.gif" alt="Sharp Image Processor Demo" width="600">
</p>

## 🚀 Features

- **Batch Processing**: Process multiple images at once from an input directory
- **Format Conversion**: Convert between JPEG, PNG, WebP, AVIF, TIFF formats
- **Smart Resizing**: Resize images while maintaining aspect ratio
- **Advanced Optimization**: Apply format-specific optimizations for maximum compression
- **Quality Control**: Adjust output quality to balance file size and image quality
- **Metadata Handling**: Option to strip metadata to further reduce file size
- **Image Enhancement**: Apply sharpening to improve clarity
- **Comprehensive Reports**: Detailed summary statistics on processing results
- **User-Friendly Output**: Clear logging and formatted statistics

## 📋 Requirements

- **Node.js**: v18.17.0 or later
- **NPM**: For installing dependencies

## 🔧 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/deepakness/optisharp.git
   cd optisharp
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

## 📝 Configuration

All configuration options are located at the top of the `image-processor.js` file for easy customization:

### Output Format

```javascript
// Output format: 'jpeg', 'png', 'webp', 'avif', 'tiff', or 'original' to keep the source format
const OUTPUT_FORMAT = 'jpeg';
```

### Quality Settings

```javascript
// Image quality (1-100) - Higher values mean better quality but larger file size
const QUALITY = 80;
```

### Resize Options

```javascript
// Resize options
const RESIZE = {
  enabled: true,
  width: 1200,  // Set to null to maintain aspect ratio based on height
  height: null, // Set to null to maintain aspect ratio based on width
  fit: 'inside' // 'cover', 'contain', 'fill', 'inside', 'outside'
};
```

### Optimizations

```javascript
// Apply additional image optimizations
const OPTIMIZATIONS = {
  sharpen: true,      // Apply mild sharpening to the image
  removeMetadata: true // Remove EXIF and other metadata to reduce file size
};
```

## 🖼️ Supported Image Formats

| Format | Input | Output | Notes |
|--------|-------|--------|-------|
| JPEG   | ✅    | ✅     | Optimized with mozjpeg |
| PNG    | ✅    | ✅     | High compression level |
| WebP   | ✅    | ✅     | Excellent for web usage |
| GIF    | ✅    | ✅     | |
| AVIF   | ✅    | ✅     | Next-gen format with excellent compression |
| TIFF   | ✅    | ✅     | |
| SVG    | ✅    | ❌     | Can be used as input only |

## 📊 Fit Options Explained

| Fit Option | Description |
|------------|-------------|
| `cover`    | Preserves aspect ratio and ensures the image covers both provided dimensions by cropping/clipping to fit |
| `contain`  | Preserves aspect ratio and ensures the image fits within the provided dimensions |
| `fill`     | Ignores the aspect ratio and stretches to the provided dimensions |
| `inside`   | Preserves aspect ratio and resizes to the maximum dimensions that fit within the provided dimensions |
| `outside`  | Preserves aspect ratio and resizes to the minimum dimensions that cover the provided dimensions |

## 💻 Usage

1. Place all your images in the `/input` folder
2. Adjust the configuration options as needed
3. Run the script:
   ```bash
   npm start
   ```
   or
   ```bash
   node image-processor.js
   ```
4. Processed images will be saved in the `/output` folder
5. View the summary report for optimization statistics

## 📈 Example Output

```
Found 3 files in the input directory.
==================================================
Processing: sample.jpg
  Original: 1920x1080, jpeg
  Processed: 1200x675, jpeg
  Size: 2.34 MB → 156.78 KB (93.45% reduction)
  Done!
--------------------------------------------------
Processing: photo.png
  Original: 800x600, png
  Processed: 800x600, jpeg
  Size: 1.12 MB → 89.45 KB (92.01% reduction)
  Done!
--------------------------------------------------
Processing: icon.svg
  Original: 512x512, svg
  Processed: 512x512, jpeg
  Size: 24.56 KB → 18.34 KB (25.33% reduction)
  Done!
--------------------------------------------------
==================================================
                 SUMMARY REPORT                   
==================================================
Total files processed: 3 files
Successfully processed: 3 files
Errors: 0 files
Skipped: 0 files
--------------------------------------------------
Output format breakdown:
  JPEG: 3 files (100.0%)
--------------------------------------------------
Size statistics:
  Total original size: 3.48 MB
  Total processed size: 264.57 KB
  Total space saved: 3.22 MB (92.57% reduction)
--------------------------------------------------
Time statistics:
  Total processing time: 1.25 seconds
  Average time per image: 0.42 seconds
==================================================
✨ Image processing completed successfully! ✨
```

## 📈 How It Works

1. The script scans the `/input` directory for image files
2. For each valid image:
   - Retrieves original metadata and dimensions
   - Applies configured resizing (if enabled)
   - Applies sharpening (if enabled)
   - Removes metadata (if enabled)
   - Converts to the target format with quality settings
   - Applies format-specific optimizations
   - Saves to the `/output` directory
3. Generates a comprehensive summary report

## 🧩 Advanced Usage

### Processing Specific Image Types

To process only specific types of images, you can modify the file pattern check in the script:

```javascript
const isImageFile = /\.(jpe?g|png|webp)$/i.test(fileInfo.ext); // Only process JPG, PNG and WebP
```

### Adding Custom Processing Steps

Sharp offers many image processing capabilities not included in this script. You can add custom operations by modifying the pipeline:

```javascript
// Example: Add a grayscale effect
pipeline = pipeline.grayscale();

// Example: Add a blur effect
pipeline = pipeline.blur(3);

// Example: Rotate an image
pipeline = pipeline.rotate(90);
```

## 🛠️ Troubleshooting

### Common Issues

- **Error: Input buffer contains unsupported image format**: The input file is not a valid image or is corrupted.
- **Error: Installation issues**: Try reinstalling with `npm install sharp --unsafe-perm=true`.

### Performance Tips

- Processing many large images can consume significant memory. Consider processing in smaller batches.
- If speed is critical, disable sharpening or reduce the quality settings.

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📣 Acknowledgements

- [Sharp](https://sharp.pixelplumbing.com/) - The high-performance Node.js image processing library that powers this tool
- [Node.js](https://nodejs.org/) - The JavaScript runtime