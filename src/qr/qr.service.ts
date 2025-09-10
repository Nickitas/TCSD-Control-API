import { Injectable, Logger } from '@nestjs/common';
import { QrGenerationResponseDto } from './dto/qr-generation.dto';
import { Personnel } from '@/fb-database/types/personnel.interface';
import { FbDatabaseService } from '@/fb-database/fb-database.service';
import { getRandomNumber } from './helpers/gen-random-number';
import { FbDbConfig } from '@/fb-database/types/config.interface';

type UserIdentifier = 'uuid' | 'tabelnomer';

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);
  private scheduledTimeouts: Record<string, NodeJS.Timeout> = {};

  constructor(private readonly connectionService: FbDatabaseService) { }

  private clearScheduledTimeout(identifier: string): void {
    if (this.scheduledTimeouts[identifier]) {
      clearTimeout(this.scheduledTimeouts[identifier]);
      delete this.scheduledTimeouts[identifier];
    }
  }

  /**
   * Находит пользователя по идентификатору (GPWP / Tabelnomer)
   * @param type по какому полю искать в базе 'uuid' | 'tabelnomer'
   * @param value значение для поика
   * @returns объект пользователя из таб. Person
   */
  private async findUserByIdentifier(
    type: UserIdentifier,
    value: string,
  ): Promise<{ user: Personnel | null; dbConfig: FbDbConfig | null }> {
    const field = type === 'uuid' ? 'GPWP' : 'tabelnomer';
    const query = `SELECT ${type === 'uuid' ? 'pers_id' : 'tabelnomer'} FROM PERSONNEL WHERE ${field} = ?`;

    const results = await this.connectionService.withConnection<{
      user: Personnel | null;
      dbConfig: FbDbConfig;
    }>(async (db, dbConfig) => {
      return new Promise((resolve) => {
        db.query(query, [value], (err, result) => {
          if (err) {
            this.logger.error('Query error:', err);
            resolve({ user: null, dbConfig });
            return;
          }
          resolve({ user: result[0] || null, dbConfig });
        });
      });
    });

    const found = results.find((r) => r.user !== null);
    return found || { user: null, dbConfig: null };
  }

  /**
   * Обновляет поле второго ключа СКУД (KLUCH2) для пользователя
   * @param type по какому полю выполнять обновление ключа в базе 'uuid' | 'tabelnomer'
   * @param identifier
   * @param key СКУД ключ
   * @returns
   */
  private async updateUserKeyByIdentifier(
    type: UserIdentifier,
    identifier: string,
    key: string,
    dbConfig: FbDbConfig,
  ): Promise<boolean> {
    const field = type === 'uuid' ? 'GPWP' : 'tabelnomer';
    const query = `UPDATE PERSONNEL SET KLUCH2 = ? WHERE ${field} = ?`;

    const connection = this.connectionService.getConnection(dbConfig.database);
    if (!connection) {
      this.logger.error(`No connection for database: ${dbConfig.database}`);
      return false;
    }

    return new Promise<boolean>((resolve) => {
      connection.query(query, [key, identifier], (err) => {
        if (err) {
          this.logger.error('Update error:', err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * Устанавливает временный ключ с автоматическим удалением
   * @param type по какому полю выполнять обновление ключа в базе с авто-удалением 'uuid' | 'tabelnomer'
   * @param identifier значение поля
   * @param key СКУД ключ
   * @returns
   */
  private async setTemporaryKeyByIdentifier(
    type: UserIdentifier,
    identifier: string,
    key: string,
  ): Promise<boolean> {
    this.clearScheduledTimeout(identifier);

    const { user, dbConfig } = await this.findUserByIdentifier(type, identifier);
    if (!user || !dbConfig) return false;

    const updateResult = await this.updateUserKeyByIdentifier(
      type,
      identifier,
      key,
      dbConfig,
    );

    if (!updateResult) return false;

    this.scheduledTimeouts[identifier] = setTimeout(
      async () => {
        await this.updateUserKeyByIdentifier(type, identifier, '', dbConfig);
        delete this.scheduledTimeouts[identifier];
      },
      30 * 60 * 1000,
    );

    return true;
  }

  /**
   * Генерирует ключ СКУД на основе 10-чного значения
   * @param value число в 10-чной системе (желательно 3-х символьное)
   * @returns hex ключ для СКУД
   */
  generateKey(value: number): string {
    let binary = value.toString(2);
    const onesCount = binary.split('1').length - 1;
    binary += onesCount % 2 === 0 ? '1' : '0';

    const hex = parseInt(binary, 2)
      .toString(16)
      .padStart(12, '0')
      .toUpperCase();
    this.logger.debug(`hex key >>>> ${hex}`);

    return hex;
  }

  /**
   * Общий метод для генерации QR-кода
   * @param type по какому полю выполнять работу 'uuid' | 'tabelnomer'
   * @param identifier значение поля пользователя
   * @returns
   */
  private async generateQrByIdentifier(
    type: UserIdentifier,
    identifier: string,
  ): Promise<QrGenerationResponseDto> {
    const user = await this.findUserByIdentifier(type, identifier);

    const qrNum = getRandomNumber();

    this.logger.debug(`${type.toUpperCase()} >>>> ${identifier}`);
    this.logger.debug(`PERSON >>>> ${JSON.stringify(user)}`);

    const userField = type === 'uuid' ? user?.user?.pers_id : user?.user?.tabelnomer;
    if (!userField) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    const scudKey = this.generateKey(qrNum);
    const success = await this.setTemporaryKeyByIdentifier(
      type,
      identifier,
      scudKey,
    );

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

  // ==============================================
  // Публичные API-методы
  // ==============================================
  //
  /** Генерирует QR-код для сотрудника по UUID (доступ в общежития не пройдет) */
  async generateQrByUUID(uuid: string): Promise<QrGenerationResponseDto> {
    return this.generateQrByIdentifier('uuid', uuid);
  }

  /** Генерирует QR-код для студента по Tabelnomer */
  async generateQrByTabelnomer(
    tabelnomer: string,
  ): Promise<QrGenerationResponseDto> {
    return this.generateQrByIdentifier('tabelnomer', tabelnomer);
  }
}
