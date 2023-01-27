import { Entity, ManyToOne, PrimaryKey, t } from '@mikro-orm/core';
import * as crypto from 'node:crypto';

import { Praise } from './praise.entity';
import { User } from './user.entity';

@Entity({
  tableName: 'praise_user',
})
export class PraiseUser {
  @ManyToOne(() => Praise, { type: 'uuid', primary: true })
  public praise!: Praise;

  @ManyToOne(() => User, { type: 'uuid', primary: true })
  public user!: User;
}
