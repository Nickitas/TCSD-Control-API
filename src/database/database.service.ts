import { Injectable } from '@nestjs/common';
import * as Firebird from 'node-firebird';
import { ConfigService } from 'src/config/config.service';
import { DataBase } from 'src/shared/classes/DataBase.class';
import { DBConfig } from 'src/shared/types/db-config.interface';

@Injectable()
export class DatabaseService {
    constructor(private readonly configService: ConfigService) {}

    async withConnection<T>(callback: (db: Firebird.Database) => Promise<T>): Promise<T[]> {
        const dbMap: DBConfig[] = this.configService.getDbMap();
        const results: T[] = [];

        for (const dbConfig of dbMap) {
            const db = new DataBase(dbConfig);

            console.log('>>> Trying to connect to:', dbConfig.database);

            try {
                const result = await new Promise<T>((resolve, reject) => {
                    db.connection((connection, err) => {
                        if (err) {
                            console.error(`ERROR >>> connecting to database ${dbConfig.database}:`, err);
                            reject(err);
                            return;
                        }

                        callback(connection)
                            .then(resolve)
                            .catch(reject)
                            .finally(() => {
                                connection.detach((detachErr) => {
                                    if (detachErr) {
                                        console.error(`ERROR >>> detaching from database ${dbConfig.database}:`, detachErr);
                                    }
                                });
                            });
                    });
                });
                results.push(result);
            } catch (error) {
                console.error(`ERROR >>> with database ${dbConfig.database}:`, error);
                results.push(null as unknown as T);
            }
        }

        return results;
    }
}