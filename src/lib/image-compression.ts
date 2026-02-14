import imageCompression from "browser-image-compression";

/**
 * Настройки сжатия изображений
 */
export interface ImageCompressionOptions {
  /**
   * Максимальный размер файла в МБ (по умолчанию 2MB)
   */
  maxSizeMB?: number;

  /**
   * Максимальная ширина изображения в пикселях (по умолчанию 2048px)
   */
  maxWidthOrHeight?: number;

  /**
   * Использовать WebWorker для сжатия (по умолчанию true)
   * Улучшает производительность, не блокируя основной поток
   */
  useWebWorker?: boolean;

  /**
   * Качество сжатия от 0 до 1 (по умолчанию 0.85)
   * 1 = максимальное качество, 0 = минимальное качество
   */
  initialQuality?: number;

  /**
   * Тип файла на выходе
   * По умолчанию сохраняется исходный тип
   */
  fileType?: string;

  /**
   * Колбэк для отслеживания прогресса сжатия
   */
  onProgress?: (progress: number) => void;
}

/**
 * Результат сжатия изображения
 */
export interface CompressionResult {
  /**
   * Сжатый файл
   */
  compressedFile: File;

  /**
   * Исходный размер файла в байтах
   */
  originalSize: number;

  /**
   * Размер сжатого файла в байтах
   */
  compressedSize: number;

  /**
   * Процент сжатия (сколько места сэкономлено)
   */
  compressionPercentage: number;

  /**
   * Исходные размеры изображения
   */
  originalDimensions?: {
    width: number;
    height: number;
  };

  /**
   * Новые размеры изображения
   */
  compressedDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Настройки сжатия по умолчанию
 * Оптимизированы для баланса между качеством и размером файла
 */
const DEFAULT_OPTIONS: Required<Omit<ImageCompressionOptions, "onProgress" | "fileType">> = {
  maxSizeMB: 2, // Максимум 2MB на файл
  maxWidthOrHeight: 2048, // Достаточно для качественного отображения
  useWebWorker: true, // Не блокируем UI
  initialQuality: 0.85, // Хорошее качество при значительном сжатии
};

/**
 * Получает размеры изображения из файла
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Форматирует размер файла в читаемый формат
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Проверяет, нужно ли сжимать файл
 */
export function shouldCompressImage(file: File, maxSizeMB: number = 2): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}

/**
 * Сжимает изображение с заданными настройками
 *
 * @param file - Исходный файл изображения
 * @param options - Опции сжатия
 * @returns Результат сжатия с метаданными
 *
 * @example
 * ```typescript
 * const result = await compressImage(file, {
 *   maxSizeMB: 2,
 *   maxWidthOrHeight: 2048,
 *   onProgress: (progress) => console.log(`Прогресс: ${progress}%`)
 * });
 *
 * console.log(`Сжато: ${result.compressionPercentage}%`);
 * console.log(`Было: ${formatFileSize(result.originalSize)}`);
 * console.log(`Стало: ${formatFileSize(result.compressedSize)}`);
 * ```
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Получаем исходные размеры изображения
  let originalDimensions: { width: number; height: number } | undefined;
  try {
    originalDimensions = await getImageDimensions(file);
  } catch (error) {
    console.warn("Failed to get original image dimensions:", error);
  }

  // Объединяем опции с настройками по умолчанию
  const compressionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Конвертируем onProgress в формат библиотеки
  const onProgress = options.onProgress
    ? (progress: number) => {
        // Библиотека возвращает прогресс от 0 до 100
        options.onProgress!(Math.round(progress));
      }
    : undefined;

  // Выполняем сжатие
  const compressedFile = await imageCompression(file, {
    maxSizeMB: compressionOptions.maxSizeMB,
    maxWidthOrHeight: compressionOptions.maxWidthOrHeight,
    useWebWorker: compressionOptions.useWebWorker,
    initialQuality: compressionOptions.initialQuality,
    fileType: options.fileType,
    onProgress,
  });

  const compressedSize = compressedFile.size;

  // Получаем новые размеры изображения
  let compressedDimensions: { width: number; height: number } | undefined;
  try {
    compressedDimensions = await getImageDimensions(compressedFile);
  } catch (error) {
    console.warn("Failed to get compressed image dimensions:", error);
  }

  // Вычисляем процент сжатия
  const compressionPercentage = Math.round(((originalSize - compressedSize) / originalSize) * 100);

  return {
    compressedFile,
    originalSize,
    compressedSize,
    compressionPercentage,
    originalDimensions,
    compressedDimensions,
  };
}

/**
 * Сжимает несколько изображений параллельно
 *
 * @param files - Массив файлов для сжатия
 * @param options - Опции сжатия
 * @param onFileProgress - Колбэк для отслеживания прогресса отдельного файла
 * @returns Массив результатов сжатия
 *
 * @example
 * ```typescript
 * const results = await compressMultipleImages(files, {
 *   maxSizeMB: 2
 * }, (index, progress) => {
 *   console.log(`Файл ${index + 1}: ${progress}%`);
 * });
 * ```
 */
export async function compressMultipleImages(
  files: File[],
  options: ImageCompressionOptions = {},
  onFileProgress?: (fileIndex: number, progress: number) => void
): Promise<CompressionResult[]> {
  const compressionPromises = files.map((file, index) => {
    const fileOptions = {
      ...options,
      onProgress: onFileProgress
        ? (progress: number) => onFileProgress(index, progress)
        : undefined,
    };

    return compressImage(file, fileOptions);
  });

  return Promise.all(compressionPromises);
}

/**
 * Проверяет, поддерживается ли формат изображения для сжатия
 */
export function isSupportedImageFormat(file: File): boolean {
  const supportedFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
    "image/gif",
  ];

  return supportedFormats.includes(file.type.toLowerCase());
}

/**
 * Получает оптимальные настройки сжатия на основе размера файла
 *
 * @param fileSize - Размер файла в байтах
 * @returns Рекомендуемые настройки сжатия
 */
export function getOptimalCompressionSettings(fileSize: number): ImageCompressionOptions {
  const sizeMB = fileSize / (1024 * 1024);

  if (sizeMB < 2) {
    // Файл уже небольшой, легкое сжатие
    return {
      maxSizeMB: 2,
      maxWidthOrHeight: 2048,
      initialQuality: 0.9,
    };
  } else if (sizeMB < 5) {
    // Средний файл, стандартное сжатие
    return {
      maxSizeMB: 2,
      maxWidthOrHeight: 2048,
      initialQuality: 0.85,
    };
  } else if (sizeMB < 10) {
    // Большой файл, более агрессивное сжатие
    return {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      initialQuality: 0.8,
    };
  } else {
    // Очень большой файл, максимальное сжатие
    return {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      initialQuality: 0.75,
    };
  }
}
