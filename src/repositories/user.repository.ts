import { EntityRepository } from '@mikro-orm/better-sqlite';

import { User } from '../entities/user.entity';

import type { User as SlackUser } from '@slack/web-api/dist/response/UsersInfoResponse';
import type { DeepNonNullable, DeepRequired } from 'ts-essentials';
import { UserType } from '../enums';

export class UserRepository extends EntityRepository<User> {
  public async findUserBySlackUserId(slackUserId: string) {
    return this.findOne({
      slackUserId,
    });
  }

  public createUserFromSlackUser($slackUser: SlackUser) {
    const slackUser = $slackUser as DeepRequired<SlackUser>;
    const user = this.create({
      type: $slackUser.is_bot ? UserType.Bot : UserType.User,
      slackUserId: slackUser.id,
      displayName: slackUser.profile.display_name_normalized,
      realName: slackUser.profile.real_name_normalized,
      slackUsername: slackUser.name,
      email: slackUser.profile.email,
    });
    return user;
  }

  public async createAndPersistUserFromSlackUser($slackUser: SlackUser) {
    const slackUser = $slackUser as DeepRequired<SlackUser>;
    const user = this.create({
      type: $slackUser.is_bot ? UserType.Bot : UserType.User,
      slackUserId: slackUser.id,
      displayName: slackUser.profile.display_name_normalized,
      realName: slackUser.profile.real_name_normalized,
      slackUsername: slackUser.name,
      email: slackUser.profile.email,
    });
    await this.persistAndFlush(user);

    return user;
  }
}
