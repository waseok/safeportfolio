/** 인증샷 업로드용 최대 가로·세로(px). 더 큰 사진은 비율 유지하며 축소합니다. */
export const IMAGE_UPLOAD_MAX_EDGE = 1280;

/** JPEG 압축 품질 (0~1). 0.8이면 화질·용량 균형이 좋습니다. */
export const IMAGE_UPLOAD_JPEG_QUALITY = 0.8;

/** 압축 전 원본 허용 최대 크기(바이트). 그 이상이면 업로드를 막습니다. */
export const IMAGE_UPLOAD_MAX_INPUT_BYTES = 15 * 1024 * 1024;

/** 이미 이 크기 이하 JPEG이고 해상도도 작으면 재압축을 건너뜁니다. */
const SKIP_RECOMPRESS_BYTES = 350_000;

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 불러올 수 없어요. 다른 사진을 선택해 주세요."));
    };
    img.src = url;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("이미지 압축에 실패했어요."))),
      "image/jpeg",
      quality
    );
  });
}

/**
 * 브라우저에서 인증샷을 리사이즈·JPEG 압축합니다.
 * Supabase Storage 용량을 줄이기 위한 업로드 전 처리입니다.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있어요.");
  }
  if (file.size > IMAGE_UPLOAD_MAX_INPUT_BYTES) {
    throw new Error("사진이 너무 커요. 15MB 이하 사진을 선택해 주세요.");
  }

  let bitmap: ImageBitmap | null = null;
  let img: HTMLImageElement | null = null;

  try {
    if (typeof createImageBitmap === "function") {
      bitmap = await createImageBitmap(file);
    } else {
      img = await loadImageElement(file);
    }

    const width = bitmap?.width ?? img!.naturalWidth;
    const height = bitmap?.height ?? img!.naturalHeight;
    const longest = Math.max(width, height);
    const scale = longest > IMAGE_UPLOAD_MAX_EDGE ? IMAGE_UPLOAD_MAX_EDGE / longest : 1;
    const outW = Math.max(1, Math.round(width * scale));
    const outH = Math.max(1, Math.round(height * scale));

    const alreadySmall =
      scale === 1 &&
      file.type === "image/jpeg" &&
      file.size <= SKIP_RECOMPRESS_BYTES;
    if (alreadySmall) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("이미지 처리를 할 수 없어요.");
    }
    if (bitmap) {
      ctx.drawImage(bitmap, 0, 0, outW, outH);
    } else {
      ctx.drawImage(img!, 0, 0, outW, outH);
    }

    const blob = await canvasToJpegBlob(canvas, IMAGE_UPLOAD_JPEG_QUALITY);
    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap?.close();
  }
}

/** UI에 표시할 용량 문자열 (예: "1.2 MB") */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
