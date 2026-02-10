# Yacht Photos Directory

This directory contains photos for all yachts in the Imperial Yachting fleet.

## 📁 Directory Structure

```
public/media/yachts/
├── monte-carlo-6/
│   ├── hero.jpg
│   ├── exterior-1.jpg
│   ├── interior-1.jpg
│   ├── flybridge.jpg
│   ├── cabin.jpg
│   └── dining.jpg
├── van-dutch-40/
│   ├── hero.jpg
│   ├── exterior-1.jpg
│   ├── interior-1.jpg
│   ├── cockpit.jpg
│   ├── cabin.jpg
│   └── sunpad.jpg
└── evo-43/
    ├── hero.jpg
    ├── exterior-1.jpg
    ├── interior-1.jpg
    ├── flybridge.jpg
    ├── cabin.jpg
    └── dining.jpg
```

## 📸 Required Photos per Yacht

### Monte Carlo 6
- `hero.jpg` - Main hero image (best angle of the yacht)
- `exterior-1.jpg` - Exterior side view
- `interior-1.jpg` - Main salon interior
- `flybridge.jpg` - Flybridge area
- `cabin.jpg` - Master cabin
- `dining.jpg` - Dining area

### Van Dutch 40
- `hero.jpg` - Main hero image (best angle of the yacht)
- `exterior-1.jpg` - Exterior side view
- `interior-1.jpg` - Cabin interior
- `cockpit.jpg` - Cockpit area
- `cabin.jpg` - Cabin view
- `sunpad.jpg` - Sun pad/lounging area

### EVO 43
- `hero.jpg` - Main hero image (best angle of the yacht)
- `exterior-1.jpg` - Exterior side view
- `interior-1.jpg` - Interior salon
- `flybridge.jpg` - Flybridge area
- `cabin.jpg` - Cabin view
- `dining.jpg` - Dining area

## 🎨 Photo Specifications

- **Format**: JPEG (.jpg or .jpeg)
- **Recommended dimensions**: 1920x1080px minimum (Full HD)
- **Aspect ratio**: 16:10 or 16:9 preferred
- **Max file size**: 2MB per photo (for web optimization)
- **Color profile**: sRGB
- **Quality**: High quality, well-lit professional photos

## 📤 How to Upload Photos

### Method 1: Via GitHub Web Interface (Easiest)

1. Go to https://github.com/aylisrg/imperialyachting.com
2. Navigate to `public/media/yachts/[yacht-slug]/`
3. Click "Add file" → "Upload files"
4. Drag and drop your photos (make sure they match the required filenames)
5. Add commit message: "Add photos for [yacht-name]"
6. Click "Commit changes"

### Method 2: Via Git Command Line

```bash
# 1. Clone the repository (if not already cloned)
git clone https://github.com/aylisrg/imperialyachting.com.git
cd imperialyachting.com

# 2. Copy your photos to the correct directory
cp /path/to/your/photos/hero.jpg public/media/yachts/monte-carlo-6/

# 3. Add, commit, and push
git add public/media/yachts/
git commit -m "Add yacht photos"
git push origin main
```

### Method 3: Via GitHub Desktop

1. Open GitHub Desktop
2. Open the repository
3. Copy photos to `public/media/yachts/[yacht-slug]/` folder
4. Review changes in GitHub Desktop
5. Write commit message: "Add yacht photos"
6. Click "Commit to main"
7. Click "Push origin"

## ✅ Verification

After uploading, verify photos appear correctly:

1. Wait 1-2 minutes for GitHub Pages to rebuild
2. Visit: `https://aylisrg.github.io/imperialyachting.com/fleet/monte-carlo-6`
3. Check that all images load properly

## 🚨 Important Notes

- **Exact filenames required** - Photos must match the exact names listed above (case-sensitive!)
- **All photos needed** - Each yacht requires all 6 photos to display properly
- **GitHub Pages deployment** - Changes may take 1-2 minutes to appear on the live site
- **Optimize photos** - Use tools like TinyJPG or ImageOptim to compress photos before uploading

## 🆘 Troubleshooting

**Photos not showing on website?**
- Check filenames match exactly (including `.jpg` extension)
- Wait 2-3 minutes for GitHub Pages to rebuild
- Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Verify photos are in correct subdirectory

**Upload failed?**
- Check file size (max 2MB per photo)
- Ensure you have write access to the repository
- Try Method 1 (GitHub web interface) if command line fails

## 📞 Need Help?

Contact the development team if you encounter issues uploading photos.
