import { Injectable, Logger } from '@nestjs/common';
import { QrGenerationResponseDto } from './dtos/qr.dto';
import { Personnel } from '@/fb-database/types/personnel.interface';
import { FbDatabaseService } from '@/fb-database/fb-database.service';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);
  private scheduledTimeouts: Record<string, NodeJS.Timeout> = {};

  constructor(private readonly connectionService: FbDatabaseService) { }

  private clearScheduledTimeout(uuid: string): void {
    if (this.scheduledTimeouts[uuid]) {
      clearTimeout(this.scheduledTimeouts[uuid]);
      delete this.scheduledTimeouts[uuid];
    }
  }

  /** Находит пользователя по UUID (GPWP) */
  async findUserByUUID(uuid: string): Promise<Personnel | null> {
    return this.connectionService
      .withConnection<Personnel | null>(async (db) => {
        return new Promise<Personnel | null>((resolve) => {
          db.query(
            `SELECT pers_id FROM PERSONNEL WHERE GPWP = ?`,
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

  /** Обновляет ключ (KLUCH2) для пользователя с указанным UUID */
  async updateUserKeyByUUID(uuid: string, key: string): Promise<boolean> {
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

  /** Обновляет ключ (KLUCH2) для пользователя с указанным Tabelnomer */
  async updateUserKeyByTabelnomer(tabelnomer: string, key: string): Promise<boolean> {
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

  /** Генерирует ключ на основе переданной строки пользователя */
  generateKey(value: number): string {
    let binary = value.toString(2);

    let onesCount = binary.split('1').length - 1;
    if (onesCount % 2 == 0) {
      binary += '1'
    }
    else {
      binary += '0';
    }

    let hex = parseInt(binary, 2).toString(16).padStart(12, '0').toUpperCase();

    this.logger.debug(`hex key >>>> ${hex}`);
    return hex;
  }

  /** Устанавливает готовый ключ с автоматическим удалением через 5 минут */
  async setTemporaryKeyByUUID(uuid: string, key: string): Promise<boolean> {
    this.clearScheduledTimeout(uuid);
    const updateResult = await this.updateUserKeyByUUID(uuid, key);
    if (!updateResult) return false;

    this.scheduledTimeouts[uuid] = setTimeout(
      async () => {
        await this.updateUserKeyByUUID(uuid, '');
        delete this.scheduledTimeouts[uuid];
      },
      5 * 60 * 1000,
    );

    return true;
  }

  /** Устанавливает готовый ключ с автоматическим удалением через 5 минут */
  async setTemporaryKeyByTabelnomer(tabelnomer: string, key: string): Promise<boolean> {
    this.clearScheduledTimeout(tabelnomer);
    const updateResult = await this.updateUserKeyByTabelnomer(tabelnomer, key);
    if (!updateResult) return false;

    this.scheduledTimeouts[tabelnomer] = setTimeout(
      async () => {
        await this.updateUserKeyByTabelnomer(tabelnomer, '');
        delete this.scheduledTimeouts[tabelnomer];
      },
      5 * 60 * 1000,
    );

    return true;
  }

  /** Создает ключ на основе tablenomer и записывает с автоматическим удалением через 5 минут */
  async createAndScheduleKeyByTabelnomer(tabelnomer: string, uuid: string): Promise<string> {
    const key = this.generateKey(+tabelnomer);
    await this.setTemporaryKeyByTabelnomer(tabelnomer, key);
    return key;
  }

  async createAndScheduleKeyByUUID(tabelnomer: string, uuid: string): Promise<string> {
    const key = this.generateKey(+tabelnomer);
    await this.setTemporaryKeyByUUID(uuid, key);
    return key;
  }



  // ==============================================
  // Публичные API-методы
  // ==============================================
  /** Генерирует QR-код для пользователя */
  async generateQrByUUID(uuid: string): Promise<QrGenerationResponseDto> {
    const user = await this.findUserByUUID(uuid);
    const qrNum = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    
    this.logger.debug(`UUID >>>> ${uuid}`);
    this.logger.debug(`PERSON >>>> ${JSON.stringify(user)}`);
    
    if (!user?.pers_id) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    const scudKey = this.generateKey(qrNum);
    const success = await this.setTemporaryKeyByUUID(uuid, scudKey);

    this.logger.debug(`QR NUM >>>> ${qrNum}`);
    this.logger.debug(`SCUD KEY >>>> ${scudKey}`);
    this.logger.debug(`SET KEY >>>> ${success}`);

    return success
      ? {
        status: 200,
        message: 'QR generated successfully',
        data: { key: qrNum },
      }
      : {
        status: 400,
        message: 'Update failed',
      };
  }


  /** Геренация QR-code для студента */
  async generateQrByTabelnomer(tabelnomer: string): Promise<QrGenerationResponseDto> {
    const user = await this.findUserByTabelnomer(tabelnomer);
    const qrNum = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

    this.logger.debug(`TABLELNOMER >>>> ${tabelnomer}`);
    this.logger.debug(`PERSON >>>> ${JSON.stringify(user)}`);

    if (!user?.tabelnomer) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    const scudKey = this.generateKey(qrNum);
    const success = await this.setTemporaryKeyByTabelnomer(tabelnomer, scudKey);

    this.logger.debug(`QR NUM >>>> ${qrNum}`);
    this.logger.debug(`SCUD KEY >>>> ${scudKey}`);
    this.logger.debug(`SET KEY >>>> ${success}`);

    return success
      ? {
        status: 200,
        message: 'QR generated successfully',
        data: { key: qrNum },
      }
      : {
        status: 400,
        message: 'Update failed',
      };
  }
}
