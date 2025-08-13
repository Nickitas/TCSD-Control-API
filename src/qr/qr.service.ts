import { Injectable, Logger } from '@nestjs/common';
import { QrGenerationResponseDto } from './dtos/qr.dto';
import { bitCount } from './helpers/bit-count.helper';
import { Personnel } from '@/fb-database/types/personnel.interface';
import { FbDatabaseService } from '@/fb-database/fb-database.service';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);
  private scheduledTimeouts: Record<string, NodeJS.Timeout> = {};

  constructor(private readonly connectionService: FbDatabaseService) {}

  // ==============================================
  // 1. Приватные вспомогательные методы
  // ==============================================
  private clearScheduledTimeout(uuid: string): void {
    if (this.scheduledTimeouts[uuid]) {
      clearTimeout(this.scheduledTimeouts[uuid]);
      delete this.scheduledTimeouts[uuid];
    }
  }

  // ==============================================
  // 2. Базовые операции с базой данных
  // ==============================================
  /**
   * Находит пользователя по UUID (GPWP)
   */
  async findUserByUUID(uuid: string): Promise<Personnel | null> {
    return this.connectionService
      .withConnection<Personnel | null>(async (db) => {
        return new Promise<Personnel | null>((resolve) => {
          db.query(
            `SELECT pers_id FROM PERSONNEL WHERE GPWP=?`,
            [`${uuid}`],
            (err, result) => {
              if (err) {
                this.logger.error('Query error:', err);
                resolve(null);
                return;
              }
              resolve(result[0] || null);
            },
          );
        });
      })
      .then((results) => results.find((r) => r !== null) ?? null);
  }

  /**
   * Находит пользователя по PersId
   */
  async findUserByPersId(pers_id: string): Promise<Personnel | null> {
    return this.connectionService
      .withConnection<Personnel | null>(async (db) => {
        return new Promise<Personnel | null>((resolve) => {
          db.query(
            `SELECT pers_id FROM PERSONNEL WHERE pers_id=?`,
            [`${pers_id}`],
            (err, result) => {
              if (err) {
                this.logger.error('Query error:', err);
                resolve(null);
                return;
              }
              resolve(result[0] || null);
            },
          );
        });
      })
      .then((results) => results.find((r) => r !== null) ?? null);
  }

  /**
   * Обновляет ключ (KLUCH2) для пользователя с указанным UUID
   */
  async updateUserKey(uuid: string, key: string): Promise<boolean> {
    return this.connectionService
      .withConnection<boolean>(async (db) => {
        return new Promise<boolean>((resolve) => {
          db.query(
            `UPDATE PERSONNEL SET KLUCH2 = ? WHERE GPWP = ?`,
            [key, uuid],
            (err) => {
              if (err) {
                this.logger.error('Update error:', err);
                resolve(false);
                return;
              }
              resolve(true);
            },
          );
        });
      })
      .then((results) => results.some((r) => r === true));
  }

  // ==============================================
  // 3. Методы работы с ключами
  // ==============================================
  /**
   * Генерирует ключ на основе pers_id пользователя
   */
  generateKey(id: number): string {
    const safeId = id & 0xffffffff;
    const withParity = (safeId << 1) | bitCount(safeId) % 2;
    return withParity.toString(16).padStart(12, '0').toUpperCase();
  }

  /**
   * Устанавливает готовый ключ с автоматическим удалением через 5 минут
   */
  async setTemporaryKey(uuid: string, key: string): Promise<boolean> {
    this.clearScheduledTimeout(uuid);
    const updateResult = await this.updateUserKey(uuid, key);
    if (!updateResult) return false;

    this.scheduledTimeouts[uuid] = setTimeout(
      async () => {
        await this.updateUserKey(uuid, '');
        delete this.scheduledTimeouts[uuid];
      },
      5 * 60 * 1000,
    );

    return true;
  }

  /**
   * Создает ключ на основе pers_id и записывает с автоматическим удалением через 5 минут
   */
  async createAndScheduleKey(persId: number, uuid: string): Promise<string> {
    const key = this.generateKey(persId);
    await this.setTemporaryKey(uuid, key);
    return key;
  }

  /**
   * Удаляет ключ вручную
   */
  async clearKey(uuid: string): Promise<boolean> {
    this.clearScheduledTimeout(uuid);
    return this.updateUserKey(uuid, '');
  }

  // ==============================================
  // 4. Публичные API-методы
  // ==============================================
  /**
   * Генерирует QR-код для пользователя
   */
  async generateQr(uuid: string): Promise<QrGenerationResponseDto> {
    const user = await this.findUserByUUID(uuid);
    if (!user?.pers_id) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    const newKey = this.generateKey(user.pers_id);
    const success = await this.setTemporaryKey(uuid, newKey);

    return success
      ? {
          status: 200,
          message: 'QR generated successfully',
          data: { key: user.pers_id },
        }
      : {
          status: 400,
          message: 'Update failed',
        };
  }

  async generateQrByPersId(pers_id: string): Promise<QrGenerationResponseDto> {
    const user = await this.findUserByPersId(pers_id);
    if (!user?.pers_id) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    const newKey = this.generateKey(user.pers_id);
    const success = await this.setTemporaryKey(pers_id, newKey);

    return success
      ? {
          status: 200,
          message: 'QR generated successfully',
          data: { key: user.pers_id },
        }
      : {
          status: 400,
          message: 'Update failed',
        };
  }
}
