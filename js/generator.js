// Elementos do DOM
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const infoText = document.getElementById("infoText");
const generateBtn = document.getElementById("generateBtn");
const preview = document.getElementById("preview");
const canvas = document.getElementById("canvas-promo");
const ctx = canvas.getContext("2d", { alpha: true });
const loading = document.getElementById("loading");
const buttons = document.getElementById("buttons");
const error = document.getElementById("error");

// FUNÇÃO INTELIGENTE: Calcula centro automaticamente baseado nas medidas do Photoshop
function calculateCenter(x, y, width, height) {
  return {
    centerX: x + (width / 2),
    centerY: y + (height / 2)
  };
}

// Calcular centros automaticamente
const photoCenter = calculateCenter(
  MOCKUP_CONFIG.userPhoto.x,
  MOCKUP_CONFIG.userPhoto.y,
  MOCKUP_CONFIG.userPhoto.width,
  MOCKUP_CONFIG.userPhoto.height
);

const textCenter = calculateCenter(
  MOCKUP_CONFIG.textArea.x,
  MOCKUP_CONFIG.textArea.y,
  MOCKUP_CONFIG.textArea.width,
  MOCKUP_CONFIG.textArea.height
);

let templateImg = null;
let userImage = null;
let whatsappIcon = null;

// Carregar recursos ao iniciar
window.addEventListener("load", () => {
  // Carregar template
  templateImg = new Image();
  templateImg.onload = () => {
    console.log("Template carregado com sucesso!");
  };
  templateImg.onerror = () => {
    showError(
      "Erro ao carregar o template. Verifique se o arquivo está na pasta correta."
    );
  };
  templateImg.src = MOCKUP_CONFIG.mockupImage;

  // Carregar ícone do WhatsApp
  if (MOCKUP_CONFIG.whatsappIcon.enabled) {
    whatsappIcon = new Image();
    whatsappIcon.onload = () => {
      console.log("Ícone do WhatsApp carregado!");
    };
    whatsappIcon.onerror = () => {
      console.log(
        "Ícone do WhatsApp não encontrado - continuando sem ícone"
      );
    };
    whatsappIcon.src = MOCKUP_CONFIG.whatsappIcon.imagePath;
  }
});

// Eventos de upload
uploadArea.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    handleImageUpload(file);
  }
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    handleImageUpload(file);
  }
});

// Habilitar botão quando houver imagem
function checkCanGenerate() {
  generateBtn.disabled = !userImage;
}

function showError(message) {
  error.textContent = message;
  error.style.display = "block";
  setTimeout(() => {
    error.style.display = "none";
  }, 5000);
}

function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      userImage = img;
      uploadArea.innerHTML =
        '<div class="upload-icon">✅</div><div class="upload-text">Foto carregada!</div><div class="upload-subtext">Clique para trocar</div>';
      checkCanGenerate();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Função para calcular o melhor tamanho de fonte para cada linha
function calculateOptimalFontSize(ctx, text, maxWidth, baseSize) {
  let fontSize = baseSize;
  const spacedText = text.split("").join(" "); // Adicionar espaços entre letras

  // Margem de segurança de 10% para garantir que não vaze
  const safeWidth = maxWidth * 0.85;

  ctx.font = `${fontSize}px "${MOCKUP_CONFIG.typography.fontFamily}", Arial Black, sans-serif`;
  let textWidth = ctx.measureText(spacedText).width;

  // Reduzir fonte até caber com folga
  while (textWidth > safeWidth && fontSize > MOCKUP_CONFIG.limits.minFontSize) {
    fontSize -= 1;
    ctx.font = `${fontSize}px "${MOCKUP_CONFIG.typography.fontFamily}", Arial Black, sans-serif`;
    textWidth = ctx.measureText(spacedText).width;
  }

  // Só aumentar se tiver MUITO espaço sobrando (texto muito curto)
  while (textWidth < safeWidth * 0.6 && fontSize < MOCKUP_CONFIG.limits.maxFontSize) {
    const testSize = fontSize + 1;
    ctx.font = `${testSize}px "${MOCKUP_CONFIG.typography.fontFamily}", Arial Black, sans-serif`;
    const testWidth = ctx.measureText(spacedText).width;

    // Se ainda couber com folga, aumentar
    if (testWidth < safeWidth) {
      fontSize = testSize;
      textWidth = testWidth;
    } else {
      break;
    }
  }

  return fontSize;
}

// Gerar arte
generateBtn.addEventListener("click", () => {
  if (!userImage || !templateImg) return;

  loading.style.display = "block";
  generateBtn.style.display = "none";

  // Configurar canvas
  canvas.width = MOCKUP_CONFIG.canvasWidth;
  canvas.height = MOCKUP_CONFIG.canvasHeight;

  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Calcular crop da imagem do usuário
  let srcX = 0,
    srcY = 0,
    srcSize = Math.min(userImage.width, userImage.height);

  if (userImage.width > userImage.height) {
    srcX = (userImage.width - userImage.height) / 2;
  } else {
    srcY = (userImage.height - userImage.width) / 2;
  }

  // Desenhar foto do usuário no círculo (usando centro calculado automaticamente)
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCenter.centerX, photoCenter.centerY, MOCKUP_CONFIG.userPhoto.borderRadius, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
          userImage,
          srcX,
          srcY,
          srcSize,
          srcSize,
          photoCenter.centerX - MOCKUP_CONFIG.userPhoto.borderRadius,
          photoCenter.centerY - MOCKUP_CONFIG.userPhoto.borderRadius,
          MOCKUP_CONFIG.userPhoto.borderRadius * 2,
          MOCKUP_CONFIG.userPhoto.borderRadius * 2
        );
        ctx.restore();

  // Desenhar template por cima
  ctx.drawImage(templateImg, 0, 0);

  // Adicionar texto com sistema auto-ajustável
  const text = infoText.value.trim();
  if (text) {
    ctx.save();
    ctx.fillStyle = MOCKUP_CONFIG.typography.fontColor;
    ctx.textAlign = MOCKUP_CONFIG.textArea.alignment;
    ctx.textBaseline = "middle";

    const lines = text.split("\n").map((line) => line.trim());

    // Preparar linhas com LOTE PROMOCIONAL fixo
    const preparedLines = [];

    // Processar linhas do usuário (nome, cidade, telefone)
    let userLineCount = 0;
    lines.forEach((line, index) => {
      if (line.trim() === "") return; // Ignorar linhas vazias

      let finalText = line.toUpperCase();

      // Primeira linha: Nome (limitar a 2 palavras)
      if (userLineCount === 0) {
        const words = finalText.split(" ");
        if (words.length > 2) {
          finalText = words.slice(0, 2).join(" ");
        }
        preparedLines.push({ text: finalText, isPhone: false });
      }
      // Segunda linha: Cidade
      else if (userLineCount === 1) {
        preparedLines.push({ text: finalText, isPhone: false });
      }
      // Terceira linha: Telefone
      else if (userLineCount === 2) {
        const isPhone = /\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/.test(line);
        preparedLines.push({ text: finalText, isPhone: isPhone });
      }

      userLineCount++;
    });

    // SEMPRE adicionar LOTE e VALOR no final (automático)
    preparedLines.push({ text: MOCKUP_CONFIG.lote.nome, isPhone: false });
    preparedLines.push({ text: MOCKUP_CONFIG.lote.valor, isPhone: false });

    // Calcular tamanho de fonte ótimo para cada linha
    const fontSizes = preparedLines.map((lineInfo) => {
      return calculateOptimalFontSize(
        ctx,
        lineInfo.text,
        MOCKUP_CONFIG.textArea.maxWidth * 0.9,
        MOCKUP_CONFIG.typography.fontSize
      );
    });

    // 🎛️ APLICAR CONTROLES DE TIPOGRAFIA DO CONFIG
    const lineHeightMultiplier = MOCKUP_CONFIG.textArea.lineHeightMultiplier || 1.2;
    const letterSpacing = MOCKUP_CONFIG.textArea.letterSpacing || 0;
    const textScaleFactor = MOCKUP_CONFIG.textArea.textScaleFactor || 1.0;
    
    // Aplicar scale factor nos font sizes base
    const scaledFontSizes = fontSizes.map(size => size * textScaleFactor);
    
    // Calcular altura total com line heights personalizados
    const lineHeights = scaledFontSizes.map((size) => size * lineHeightMultiplier);
    const initialTotalHeight = lineHeights.reduce(
      (sum, height) => sum + height,
      0
    );

    // Nova lógica: Container auto-inteligente (Box Text)
    const containerX = MOCKUP_CONFIG.textArea.x;
    const containerY = MOCKUP_CONFIG.textArea.y;
    const containerWidth = MOCKUP_CONFIG.textArea.width;
    const containerHeight = MOCKUP_CONFIG.textArea.height;
    const padding = 20; // Padding interno do container
    
    // Área útil do container (descontando padding)
    const usableWidth = containerWidth - (padding * 2);
    const usableHeight = containerHeight - (padding * 2);
    
    // Auto-ajustar font sizes para caber no container
    let adjustedFontSizes = [...scaledFontSizes];  // Usar os font sizes já escalados
    let adjustedLineHeights = adjustedFontSizes.map(size => size * lineHeightMultiplier);
    let totalHeight = adjustedLineHeights.reduce((sum, height) => sum + height, 0);
    
    // Se não couber na altura, reduzir proporcionalmente
    if (totalHeight > usableHeight) {
      const scaleFactor = usableHeight / totalHeight;
      adjustedFontSizes = adjustedFontSizes.map(size => size * scaleFactor);
      adjustedLineHeights = adjustedFontSizes.map(size => size * lineHeightMultiplier);  // Manter multiplier personalizado
      totalHeight = adjustedLineHeights.reduce((sum, height) => sum + height, 0);
    }
    
    // Verificar se as linhas cabem na largura e ajustar se necessário
    adjustedFontSizes = adjustedFontSizes.map((fontSize, index) => {
      const lineText = preparedLines[index].text;
      return calculateOptimalFontSize(ctx, lineText, usableWidth, fontSize);
    });
    
    // Recalcular line heights após ajuste de largura
    adjustedLineHeights = adjustedFontSizes.map(size => size * lineHeightMultiplier);  // Manter multiplier personalizado
    totalHeight = adjustedLineHeights.reduce((sum, height) => sum + height, 0);
    
    // Posicionar texto no centro vertical do container
    let currentY = containerY + padding + (usableHeight - totalHeight) / 2;
    
    console.log("DEBUG BOX TEXT AUTO-INTELIGENTE:");
    console.log("Container:", {x: containerX, y: containerY, width: containerWidth, height: containerHeight});
    console.log("Área útil:", {width: usableWidth, height: usableHeight});
    console.log("Total height:", totalHeight);
    console.log("Y inicial:", currentY);
    console.log("Font sizes ajustados:", adjustedFontSizes);
    
    // 🎛️ DEBUG CONTROLES DE TIPOGRAFIA
    console.log("CONTROLES APLICADOS:");
    console.log("- Line Height Multiplier:", lineHeightMultiplier);
    console.log("- Letter Spacing:", letterSpacing + "px");
    console.log("- Text Scale Factor:", textScaleFactor);
    console.log("- Font sizes originais:", fontSizes);
    console.log("- Font sizes escalados:", scaledFontSizes);

    // Desenhar cada linha
    preparedLines.forEach((lineInfo, index) => {
      const fontSize = adjustedFontSizes[index];
      const lineHeight = adjustedLineHeights[index];

      // Aplicar scale vertical
      ctx.save();
      ctx.translate(0, currentY + lineHeight / 2);
      ctx.scale(1, 1.2);
      ctx.translate(0, -(currentY + lineHeight / 2));

      // Configurar fonte
      ctx.font = `${fontSize}px "${MOCKUP_CONFIG.typography.fontFamily}", Arial Black, sans-serif`;

      // 🎛️ APLICAR LETTER SPACING PERSONALIZADO
      // Se letterSpacing = 0, usar espaços normais; se > 0, usar spacing personalizado
      let finalText;
      if (letterSpacing > 0) {
        // Criar spacing personalizado entre caracteres
        finalText = lineInfo.text.split("").join(" ".repeat(Math.max(1, Math.floor(letterSpacing / 2))));
      } else {
        // Usar espaçamento padrão (um espaço entre letras)
        finalText = lineInfo.text.split("").join(" ");
      }

      // Desenhar ícone do WhatsApp se for telefone
      if (lineInfo.isPhone && whatsappIcon && whatsappIcon.complete && MOCKUP_CONFIG.whatsappIcon.enabled) {
        const iconSize = fontSize;
        const textWidth = ctx.measureText(finalText).width;  // Usar finalText com spacing aplicado
        const iconX = textCenter.centerX - textWidth / 2 - iconSize - 15;

        ctx.save();
        ctx.scale(1, 1 / 1.2); // Compensar scale vertical
        const adjustedY = (currentY + lineHeight / 2) * 1.2;
        ctx.drawImage(
          whatsappIcon,
          iconX,
          adjustedY - iconSize / 2,
          iconSize,
          iconSize
        );
        ctx.restore();
      }

     // Desenhar texto centralizado (usando centro calculado automaticamente)
          ctx.fillText(finalText, textCenter.centerX, currentY + lineHeight / 2);  // Usar finalText com spacing aplicado

      ctx.restore();

      // Próxima linha
      currentY += lineHeight;
    });

    ctx.restore();
  }

  // Mostrar resultado
  loading.style.display = "none";
  preview.style.display = "block";
  buttons.style.display = "block";
});

// Download
document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  const date = new Date();
  const timestamp = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${date
    .getHours()
    .toString()
    .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
  link.download = `enjoy-dreams-${timestamp}.png`;
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
});

// Nova arte
document.getElementById("newArtBtn").addEventListener("click", () => {
  fileInput.value = "";
  infoText.value = "";
  userImage = null;
  uploadArea.innerHTML =
    '<div class="upload-icon">📸</div><div class="upload-text">Clique ou arraste sua foto aqui</div><div class="upload-subtext">Formatos aceitos: JPG, PNG, WEBP</div>';
  preview.style.display = "none";
  buttons.style.display = "none";
  generateBtn.style.display = "block";
  generateBtn.disabled = true;
});