import { BetterSqliteDriver, defineConfig } from '@mikro-orm/better-sqlite';
import { EntityGenerator } from '@mikro-orm/entity-generator';

const MikroOrmConfig = defineConfig({
  dbName: 'db.sqlite3',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/entities/*.entity.ts'],
  timezone: '+09:00',
  allowGlobalContext: true,
  extensions: [EntityGenerator],
  driver: BetterSqliteDriver,
});

export default MikroOrmConfig;
