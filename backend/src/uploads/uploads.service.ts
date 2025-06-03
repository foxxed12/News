// backend/src/uploads/uploads.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import * as sharp from 'sharp';

/**
 * UploadsService
 * --------------
 *  • Хранит файлы, загруженные через Multer (см. UploadsController).  
 *  • Для изображений — создаёт уменьшенную копию 400 px по ширине
 *    и кладёт её в подпапку  `public/uploads/small`.  
 *  • Возвращает URL'ы, которые отправляются клиенту.
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  /** ./public/uploads */
  private readonly uploadDir = join(process.cwd(), 'public', 'uploads');
  /** ./public/uploads/small */
  private readonly smallDir = join(this.uploadDir, 'small');

  constructor() {
    // Убедимся, что /small существует
    if (!existsSync(this.smallDir)) {
      mkdirSync(this.smallDir, { recursive: true });
      this.logger.log(`Created uploads directory: ${this.smallDir}`);
    }
  }

  /**
   * Обработать только что загруженный файл.
   * @param file  Multer file
   * @returns объект с URL'ами оригинала и (если картинка) превью
   */
  async handleUpload(file: Express.Multer.File): Promise<{
    url: string;
    previewUrl?: string;
  }> {
    const url = `/uploads/${file.filename}`;

    // Если это изображение — делаем lazy-resize (400px)
    if (file.mimetype.startsWith('image/')) {
      try {
        await this.generateSmallPreview(file.filename);
      } catch (e) {
        this.logger.error('Sharp resize failed', e);
        throw new InternalServerErrorException('Image resize failed');
      }

      return { url, previewUrl: `/uploads/small/${file.filename}` };
    }

    // Видео / другой файл — возвращаем только оригинал
    return { url };
  }

  /* ------------------------------------------------------------------
   * PRIVATE
   * ---------------------------------------------------------------- */

  /** Создаёт уменьшенную копию 400 px по ширине */
  private async generateSmallPreview(filename: string): Promise<void> {
    const original = join(this.uploadDir, filename);
    const target = join(this.smallDir, filename);

    await sharp(original)
      .resize({ width: 400, withoutEnlargement: true })
      .toFile(target);
  }
}
