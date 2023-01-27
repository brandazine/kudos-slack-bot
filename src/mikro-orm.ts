import { MikroORM } from '@mikro-orm/core';
import MikroOrmConfig from './mikro-orm.config';

export const getInitializedMikroOrmInstance = async () => {
  const orm = await MikroORM.init(MikroOrmConfig);
  return orm;
};
