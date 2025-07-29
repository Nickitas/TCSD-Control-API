import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { bitCount } from 'src/shared/helpers/bit-count.helper';
import { Personnel } from 'src/shared/types/personnel.interface';
import { UserResponseDto } from './dto/qr.dto';


@Injectable()
export class QrService {
    private readonly logger = new Logger(QrService.name);
    private activeTimeouts = new Map<string, NodeJS.Timeout>();
    private scheduledTimeouts: Record<string, NodeJS.Timeout> = {};

    constructor(
        private readonly connectionService: DatabaseService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) { }

    /**
     * Находит пользователя по UUID (GPWP)
     */
    async findUUID(uuid: string): Promise<Personnel | null> {
        const results = await this.connectionService.withConnection<Personnel | null>(
            async (db) => {
                return new Promise<Personnel | null>((resolve) => {
                    db.query(
                        `SELECT PERS_ID FROM PERSONNEL WHERE GPWP = ?`,
                        [uuid],
                        (err, result) => {
                            if (err) {
                                console.error('Query error:', err);
                                resolve(null);
                                return;
                            }
                            resolve(result[0] || null);
                        }
                    );
                });
            }
        );
        return results.find(r => r !== null) ?? null;
    }

    /**
    * Обновляет ключ (KLUCH2) для пользователя с указанным UUID
    */
    async updateKey(uuid: string, key: string): Promise<boolean> {
        const results = await this.connectionService.withConnection<boolean>(
            async (db) => {
                return new Promise<boolean>((resolve) => {
                    db.query(
                        `UPDATE PERSONNEL SET KLUCH2 = ? WHERE GPWP = ?`,
                        [key, uuid],
                        (err) => {
                            if (err) {
                                console.error('Update error:', err);
                                resolve(false);
                                return;
                            }
                            resolve(true);
                        }
                    );
                });
            }
        );
        return results.some(r => r === true);
    }

    /**
    * Генерирует ключ на основе ID
    */
    genKey(id: number): string {
        // Используем только младшие 32 бита
        const safeId = id & 0xFFFFFFFF;
        const withParity = (safeId << 1) | (bitCount(safeId) % 2);
        return withParity.toString(16)
            .padStart(12, '0')
            .toUpperCase();
    }

    /**
     * Генерирует QR-код для пользователя
     */
    async generateQr(uuid: string): Promise<UserResponseDto> {
        const user = await this.findUUID(uuid);
        if (!user?.PERS_ID) {
            return {
                status: 404,
                message: 'User not found'
            };
        }

        const persId = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
        const newKey = this.genKey(persId);

        const updateResult = await this.updateKey(uuid, newKey);
        if (!updateResult) {
            return {
                status: 400,
                message: 'Update failed'
            };
        }

        if (this.scheduledTimeouts[uuid]) {
            clearTimeout(this.scheduledTimeouts[uuid]);
        }

        this.scheduledTimeouts[uuid] = setTimeout(async () => {
            await this.updateKey(uuid, '');
            delete this.scheduledTimeouts[uuid];
        }, 60 * 1000);

        return {
            status: 200,
            message: 'QR generated successfully',
            data: { key: persId }
        };
    }



    /**
     * Создает и записывает ключ во все БД с автоматическим удалением через 3 минуты
     */
    async createAndScheduleKey(userId: number, uuid: string): Promise<string> {
        const key = this.genKey(userId);

        // Записываем ключ во все БД
        const updateResult = await this.updateKey(uuid, key);

         if (!updateResult) {
            throw new Error('Failed to update key in databases');
        }

        // Устанавливаем таймер на удаление
        // this.scheduleKeyRemoval(uuid, userId);

        return key;
    }
}