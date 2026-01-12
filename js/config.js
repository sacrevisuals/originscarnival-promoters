// 🎛️ CONFIGURAÇÃO DO GERADOR DE MOCKUP - NEFESH FESTIVAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📍 LOCAIS DE AJUSTE PRINCIPAIS:
//
// 1. POSIÇÃO DA IMAGEM: userPhoto (x, y, width, height)
// 2. POSIÇÃO DO TEXTO: textArea (x, y, width, height)
// 3. CONTROLES DE TIPOGRAFIA: textArea (lineHeightMultiplier, letterSpacing, textScaleFactor)
// 4. INFORMAÇÕES DO LOTE: lote (nome, valor)
//
// ⚠️  PARA REPLICAR EM OUTROS MOCKUPS: Ajustar apenas userPhoto e textArea
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MOCKUP_CONFIG = {
  canvasWidth: 1080,
  canvasHeight: 1920,
  mockupImage: "assets/images/Mockup-origins.png",
  userPhoto: {
    x: 282.5,
    y: 327.5,
    width: 515,
    height: 515,
    borderRadius: 257.5,
  },

  textArea: {
    x: 30.44,
    y: 1050.69,
    width: 1022.1,
    height: 701.58,
    alignment: "center",

    // 🎛️ CONTROLES DE TIPOGRAFIA - AJUSTE AQUI PARA PERSONALIZAR
    lineHeightMultiplier: 2, // Espaçamento entre linhas (1.0 = colado, 1.5 = mais espaçado)
    letterSpacing: 1.5, // Espaço entre caracteres em pixels (0 = normal, 3+ = mais espaçado)
    textScaleFactor: 1.0, // Tamanho geral do texto (1.0 = normal, 1.2 = 20% maior, 0.8 = 20% menor)
  },
  typography: {
    fontFamily: "Druk Wide Bold Bold",
    fontSize: 45,
    fontColor: "#fd9b00",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  whatsappIcon: {
    enabled: true,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    imagePath: "assets/images/whatsapp_icon.png",
  },
  limits: {
    maxLines: 5,
    maxCharsPerLine: 50,
    minFontSize: 25,
    maxFontSize: 40,
    containerHeight: 383,
  },
  lote: {
    nome: "LOTE PROMOCIONAL",
    valor: "R$ 40,00",
  },
};
