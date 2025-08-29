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
            // `SELECT tabelnomer FROM PERSONNEL WHERE GPWP = ?`,
            `SELECT tabelnomer FROM PERSONNEL WHERE tabelnomer = ?`,
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

  async findUserByTabelnomer(tabelnomer: string): Promise<Personnel | null> {
    return this.connectionService
      .withConnection<Personnel | null>(async (db) => {
        return new Promise<Personnel | null>((resolve) => {
          db.query(
            `SELECT tabelnomer FROM PERSONNEL WHERE tabelnomer = ?`,
            [`${tabelnomer}`],
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
  async updateUserKey(tabelnomer: string, key: string): Promise<boolean> {
    return this.connectionService
      .withConnection<boolean>(async (db) => {
        return new Promise<boolean>((resolve) => {
          db.query(
            `UPDATE PERSONNEL SET KLUCH2 = ? WHERE tabelnomer = ?`,
            [key, tabelnomer],
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
  generateKey(tabelnomer: string): string {
    const safeId = +tabelnomer & 0xffffffff;
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
   * Создает ключ на основе tablenomer и записывает с автоматическим удалением через 5 минут
   */
  async createAndScheduleKey(tabelnomer: string, uuid: string): Promise<string> {
    const key = this.generateKey(tabelnomer);
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
  // Публичные API-методы
  // ==============================================
  /**
   * Генерирует QR-код для пользователя
   */
  async generateQrByUUID(uuid: string): Promise<QrGenerationResponseDto> {
    const user = await this.findUserByUUID(uuid);

    console.log(`UUID >>>> ${uuid}`);
    console.log(`PERSON >>>> ${JSON.stringify(user)}`);

    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    const newKey = this.generateKey(user?.tabelnomer || '');

    console.log(`NEW KEY >>>> ${newKey}`);

    const success = await this.setTemporaryKey(uuid, newKey);

    console.log(`SET KEY >>>> ${success}`); 

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



  async generateQrByTabelnomer(tabelnomer: string): Promise<QrGenerationResponseDto> {
    const user = await this.findUserByTabelnomer(tabelnomer);

    console.log(`TABELNOMER >>>> ${tabelnomer}`);
    console.log(`PERSON >>>> ${JSON.stringify(user)}`);

    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    const newKey = this.generateKey(user?.tabelnomer || '');

    console.log(`NEW KEY >>>> ${newKey}`);

    const success = await this.setTemporaryKey(tabelnomer, newKey);

    console.log(`SET KEY >>>> ${success}`); 

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
