const fs = require('fs');
const path = require('path');

const fontsDir = './assets/fonts';
const cssFile = './css/fonts.css';

function getExistingFonts(cssContent) {
  const regex = /font-family:\s*['"`]([^'"`]+)['"`]/g;
  const fonts = new Set();
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    fonts.add(match[1]);
  }
  return fonts;
}

function generateFontFace(fontFile) {
  const fontName = path.parse(fontFile).name;
  const ext = path.extname(fontFile).substring(1);
  return `
@font-face {
  font-family: '${fontName}';
  src: url('../assets/fonts/${fontFile}') format('${ext}');
  font-weight: normal;
  font-style: normal;
}`;
}

function updateFontsCss() {
  if (!fs.existsSync(cssFile)) {
    fs.writeFileSync(cssFile, '', 'utf8');
  }

  let cssContent = fs.readFileSync(cssFile, 'utf8');
  const existingFonts = getExistingFonts(cssContent);

  const fontFiles = fs.readdirSync(fontsDir).filter(file => {
    return ['woff', 'woff2', 'ttf', 'otf'].includes(path.extname(file).substring(1));
  });

  let newFontFaces = '';
  fontFiles.forEach(fontFile => {
    const fontName = path.parse(fontFile).name;
    if (!existingFonts.has(fontName)) {
      newFontFaces += generateFontFace(fontFile);
      console.log(`Adicionando fonte: ${fontName}`);
    }
  });

  if (newFontFaces.length > 0) {
    cssContent += '\n' + newFontFaces;
    fs.writeFileSync(cssFile, cssContent, 'utf8');
    console.log('Arquivo CSS atualizado.');
  } else {
    console.log('Nenhuma fonte nova para adicionar.');
  }
}

updateFontsCss();