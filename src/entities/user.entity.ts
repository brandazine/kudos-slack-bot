import { Collection, Entity, ManyToOne, PrimaryKey, Property, Unique, OneToMany, Enum } from '@mikro-orm/core';
import * as crypto from 'node:crypto';
import { UserType } from '../enums';

import { UserRepository } from '../repositories/user.repository';
import { Praise } from './praise.entity';

@Entity({
  tableName: 'user',
  customRepository: () => UserRepository,
})
export class User {
  @PrimaryKey({ type: 'uuid' })
  public id: string = crypto.randomUUID();

  @Enum({
    type: 'text',
    items: () => UserType,
  })
  public type!: UserType;

  @Unique()
  @Property({ type: 'varchar', length: 32 })
  public slackUserId!: string;

  @Property({ type: 'varchar', length: 32 })
  public displayName!: string;

  @Property({ type: 'varchar', length: 32 })
  public realName!: string;

  @Property({ type: 'varchar', length: 64 })
  public slackUsername!: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  public email?: string;

  @OneToMany(() => Praise, (praise) => praise.praiser)
  public praises = new Collection<Praise>(this);
}
