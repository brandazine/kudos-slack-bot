import { Entity, Enum, ManyToOne, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { SoftDeletable } from 'mikro-orm-soft-delete';
import { BrandazinePrinciple } from '../enums';
import { Praise } from './praise.entity';
import { User } from './user.entity';

import * as crypto from 'node:crypto';

@SoftDeletable(() => PraisePrinciple, 'deletedAt', () => new Date())
@Entity({
  tableName: 'praise_principle',
})
@Unique({
  name: 'idx_praise_principle_unique',
  properties: ['praise', 'selectedBy', 'selectedPrinciple'],
})
export class PraisePrinciple {
  public [OptionalProps]?: 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  public id: string = crypto.randomUUID();

  @ManyToOne(() => Praise, { type: 'uuid' })
  public praise!: Praise;

  @Enum({
    items: () => BrandazinePrinciple,
  })
  public selectedPrinciple!: BrandazinePrinciple;

  @ManyToOne(() => User)
  public selectedBy!: User;

  @Property({ type: 'timestamptz' })
  public createdAt: Date = new Date();

  @Property({ type: 'timestamptz', nullable: true })
  public deletedAt?: Date;
}
