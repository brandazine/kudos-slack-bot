import {
  Collection,
  Entity,
  JsonType,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
  ManyToOne,
} from '@mikro-orm/core';
import { SoftDeletable } from 'mikro-orm-soft-delete';

import { PraisePrinciple } from './praise-principle.entity';
import { PraiseUser } from './praise-user.entity';
import { User } from './user.entity';

import * as crypto from 'node:crypto';

@SoftDeletable(() => Praise, 'deletedAt', () => new Date())
@Entity({
  tableName: 'praise',
})
export class Praise {
  @PrimaryKey({ type: 'uuid' })
  public id: string = crypto.randomUUID();

  @Unique()
  @Property({ type: 'varchar', length: 255 })
  public slackMessageTs!: string;

  @ManyToOne(() => User, { type: 'uuid' })
  public praiser!: User;

  @Property({ type: JsonType })
  public originalSlackMessage: any;

  @Property({ type: 'text' })
  public originalText!: string;

  @Property({ type: 'text' })
  public refinedText!: string;

  @OneToMany(() => PraisePrinciple, (praisePrinciple) => praisePrinciple.praise, {
    eager: true,
  })
  public principles = new Collection<PraisePrinciple>(this);

  @ManyToMany({
    entity: () => User,
    pivotEntity: () => PraiseUser,
    eager: true,
  })
  public receivers = new Collection<User>(this);

  @Property({ type: 'timestamptz' })
  public createdAt: Date = new Date();

  @Property({ type: 'timestamptz', nullable: true })
  public deletedAt?: Date;
}
