import Firebird from 'node-firebird';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { DataBase } from 'src/shared/classes/DataBase.class';

@Injectable()
export class ConnectionService {

    private readonly buildings = {
        main: "Главное здание",
        dorm1: "Общежитие 1",
        dorm5: "Общежитие 5",
    } as const;


    constructor(private readonly config: ConfigService) {

    }


    async withConnection<T>(
        callback: (db: Firebird.Database) => Promise<T>
    ): Promise<T | null> {
        const db = new DataBase(this.config);
        
        return new Promise((resolve) => {
            db.connection(async (dbInstance, err) => {
                if (err) {
                    console.error('Connection error:', err);
                    resolve(null);
                    return;
                }

                try {
                    const result = await callback(dbInstance);
                    resolve(result);
                } catch (error) {
                    console.error('Query error:', error);
                    resolve(null);
                } finally {
                    dbInstance.detach();
                }
            });
        });
    }

    getBuildingName(key: keyof typeof this.buildings): string {
        return this.buildings[key];
    }
}
