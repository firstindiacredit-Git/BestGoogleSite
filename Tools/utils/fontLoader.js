export const loadFonts = async () => {
  const fontFaces = [
    new FontFace('Helvetica', 'url(/fonts/Helvetica.woff2)'),
    new FontFace('Helvetica-Bold', 'url(/fonts/Helvetica-Bold.woff2)'),
    // Add other font variants as needed
  ];

  try {
    const loadedFonts = await Promise.all(fontFaces.map(font => font.load()));
    loadedFonts.forEach(font => document.fonts.add(font));
  } catch (error) {
    console.error('Failed to load fonts:', error);
  }
}; 