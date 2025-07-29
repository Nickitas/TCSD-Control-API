import { Injectable } from '@nestjs/common';
import { ConnectionService } from 'src/connection/connection.service';

interface Personnel {
    PERS_ID?: number;
}

@Injectable()
export class QrService {
    private scheduledTimeouts: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly connectionService: ConnectionService) { }

    /**
     * Находит пользователя по UUID (GPWP)
     */
    async findUUID(uuid: string): Promise<Personnel | null> {
        return this.connectionService.withConnection(async (db) => {
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
        });
    }

    /**
    * Обновляет ключ (KLUCH2) для пользователя с указанным UUID
    */
    async updateKey(uuid: string, key: string): Promise<boolean | null> {
        return this.connectionService.withConnection(async (db) => {
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
        });
    }

    /**
    * Генерирует ключ на основе ID
    */
    genKey(id: number): string {
        let binary = id.toString(2);
        const onesCount = binary.split('1').length - 1;

        binary += onesCount % 2 === 0 ? '1' : '0';

        return parseInt(binary, 2)
            .toString(16)
            .padStart(12, '0')
            .toUpperCase();
    }

    /**
     * Генерирует QR-код для пользователя
     */
    async generateQr(uuid: string) {
        const user = await this.findUUID(uuid);

        if (!user || !user.PERS_ID) {
            return {
                state: 0,
                message: 'User not found'
            };
        }

        // Генерируем случайный ID
        // const persId = Math.floor(user.PERS_ID / 1000);
        const persId = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
        const newKey = this.genKey(persId);

        const updateResult = await this.updateKey(uuid, newKey);

        if (updateResult) {
            // Очищаем предыдущий таймаут, если был
            if (this.scheduledTimeouts[uuid]) {
                clearTimeout(this.scheduledTimeouts[uuid]);
                delete this.scheduledTimeouts[uuid];
            }

            // Устанавливаем таймаут на сброс ключа через 1 минуту
            this.scheduledTimeouts[uuid] = setTimeout(async () => {
                await this.updateKey(uuid, '');
                delete this.scheduledTimeouts[uuid];
            }, 60 * 1000);

            return {
                state: 1,
                key: persId
            };
        }

        return {
            state: 0,
            message: 'Update failed'
        };
    }
}