import { BrandazinePrinciple, BrandazinePrincipleLabels, BrandazinePrincipleReactions, UserType } from './enums';
import { getInitializedMikroOrmInstance } from './mikro-orm';
import 'source-map-support/register';
import 'dotenv/config';

import { App, Block, PlainTextElement } from '@slack/bolt';
import { Config } from './config';
import * as util from 'node:util';
import * as repl from 'node:repl';
import { EntityManager, RequestContext } from '@mikro-orm/core';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { Praise } from './entities/praise.entity';
import JSXSlack from 'jsx-slack';
import { PraiseResponseBlock } from './blocks/praise-response.block';
import { SelectPrincipleModal } from './blocks/select-principle.modal';
import { PraisePrinciple } from './entities/praise-principle.entity';

/** Slack Text Element */
interface TextElement {
  type: 'text';
  text: string;
}

/** Slack User Element */
interface UserElement {
  type: 'user';
  user_id: string;
}

/** Slack UserGroup Element */
interface UserGroupElement {
  type: 'usergroup';
  usergroup_id: string;
}

/** Slack Known Element that can be found in a rich_text block section */
export type KnownElement = TextElement | PlainTextElement | UserElement | UserGroupElement;

const config = new Config();
const slack = new App({
  token: config.envConfig.slack.token,
  appToken: config.envConfig.slack.appToken,
  signingSecret: config.envConfig.slack.signingSecret,
  socketMode: true,
});

const getOrCreateUsersBySlackUserIds = async (
  slackUserIds: string[],
  userRepository: UserRepository,
  persist = false,
) => {
  const users = await Promise.all(
    slackUserIds.map(
      async (userId) =>
        (await userRepository.findUserBySlackUserId(userId)) ??
        userRepository.createUserFromSlackUser((await slack.client.users.info({ user: userId })).user!),
    ),
  );
  if (persist) {
    await userRepository.persistAndFlush(users);
  }

  return users;
};

const getUsersFromSlackUserGroup = async (slackUserGroupId: string, userRepository: UserRepository, persist = true) => {
  const usersResponse = await slack.client.usergroups.users.list({ usergroup: slackUserGroupId });
  if (!usersResponse.ok) {
    console.error(usersResponse.error);
    return [];
  }

  return getOrCreateUsersBySlackUserIds(usersResponse.users!, userRepository, persist);
};

async function main() {
  const orm = await getInitializedMikroOrmInstance();
  const schemaGenerator = orm.getSchemaGenerator();
  await schemaGenerator.updateSchema({
    dropTables: false,
    safe: true,
  });

  slack.use(async ({ next, context }) => RequestContext.createAsync(orm.em, next));

  slack.message(/.*/, async ({ message, client }) => {
    if (message.type !== 'message' || message.subtype || message.thread_ts || !message.text) {
      return;
    }

    // must mention this bot
    if (!message.text.includes(`<@${config.envConfig.slack.botUserId}`)) {
      return;
    }

    console.info(util.inspect(message, { depth: Infinity, colors: true }));

    const em = orm.em.getContext();
    const userRepository = em.getRepository<User, UserRepository>(User);

    let user = await userRepository.findUserBySlackUserId(message.user);
    if (!user) {
      const slackUserInfoResponse = await client.users.info({ user: message.user });
      if (!slackUserInfoResponse.ok) {
        console.error(slackUserInfoResponse.error);
        return;
      }

      user = await userRepository.createAndPersistUserFromSlackUser(slackUserInfoResponse.user!);
    }

    // extract block elements from rich_text blocks
    const richTextBlocks = (message.blocks ?? []).filter((block) => block.type === 'rich_text') as (Block & {
      type: 'rich_text';
      block_id: string;
      elements: {
        type: string;
        elements?: KnownElement[];
      }[];
    })[];
    const elements = richTextBlocks.flatMap((block) => block.elements).flatMap((element) => element.elements ?? []);

    const users = elements.filter((element): element is UserElement => element.type === 'user');
    const userGroups = elements.filter((element): element is UserGroupElement => element.type === 'usergroup');

    const userTags = users.map(({ user_id: userId }) => `<@${userId}>`);
    const userGroupTags = userGroups.flatMap(({ usergroup_id: userGroupId }) => [
      `<@${userGroupId}>`,
      `<!subteam^${userGroupId}>`,
      new RegExp(String.raw`<\!subteam\^${userGroupId}\|\@([a-z0-9_-]+)>`, 'ig'),
    ]);

    // sanitize text: remove user(group)Tags from text
    const refinedText = [...userTags, ...userGroupTags]
      .reduce((text: string, needle) => text.replaceAll(needle, ''), message.text ?? '')
      .trim();

    const userGroupUsers = (
      await Promise.all(
        userGroups.map(({ usergroup_id: userGroupId }) =>
          getUsersFromSlackUserGroup(userGroupId, userRepository, false),
        ),
      )
    ).flat();
    const receivers = [
      ...(await getOrCreateUsersBySlackUserIds(
        users.map(({ user_id: userId }) => userId),
        userRepository,
        false,
      )),
      ...userGroupUsers,
    ].filter((receiver) => receiver.id !== user!.id);
    const receiversWithoutBotUser = receivers.filter((receiver) => receiver.type === UserType.User);
    if (receiversWithoutBotUser.length === 0) {
      return;
    }
    const uniqueReceivers = receiversWithoutBotUser.filter(
      (receiver, index, self) => self.findIndex((r) => r.id === receiver.id) === index,
    );

    const praise = new Praise();
    praise.slackMessageTs = message.ts;
    praise.slackChannelId = message.channel;
    praise.praiser = user;
    praise.originalSlackMessage = message;
    praise.originalText = message.text ?? '';
    praise.refinedText = refinedText;
    praise.receivers.add(uniqueReceivers);
    await em.persistAndFlush(praise);

    await client.chat.postMessage({
      channel: message.channel,
      // reply_broadcast: true,
      thread_ts: message.ts,
      blocks: JSXSlack(PraiseResponseBlock({ praiseId: praise.id })),
    });
  });

  slack.action('open-select-praise-principles', async ({ client, ack, action, body, respond }) => {
    await ack();
    if (action.type !== 'button' || body.type !== 'block_actions') {
      return;
    }

    const em = orm.em.getContext();
    const praiseRepository = em.getRepository(Praise);

    const possiblePraiseId = action.value;
    const praise = await praiseRepository.findOne(
      { id: possiblePraiseId },
      {
        fields: ['id'],
      },
    );
    if (!praise) {
      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        delete_original: false,
        text: 'Invalid button payload.',
      });
      return;
    }

    await client.views.open({
      trigger_id: body.trigger_id,
      view: JSXSlack(
        SelectPrincipleModal({
          praiseId: praise.id,
          channelId: body.channel!.id,
        }),
      ),
    });
  });

  slack.view('submit-praise-principles', async ({ ack, respond, body, view, client }) => {
    await ack();

    const em = orm.em.getContext();
    const userRepository = em.getRepository<User, UserRepository>(User);
    const praiseRepository = em.getRepository(Praise);
    const praisePrincipleRepository = em.getRepository(PraisePrinciple);

    let user = await userRepository.findUserBySlackUserId(body.user.id);
    if (!user) {
      const slackUserInfoResponse = await client.users.info({ user: body.user.id });
      if (!slackUserInfoResponse.ok) {
        console.error(slackUserInfoResponse.error);
        return;
      }

      user = await userRepository.createAndPersistUserFromSlackUser(slackUserInfoResponse.user!);
    }

    const { praiseId, channelId } = JSON.parse(body.view.private_metadata) as { praiseId: string; channelId: string };
    const praise = await praiseRepository.findOne({ id: praiseId });
    if (!praise) {
      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        delete_original: false,
        text: 'Invalid button payload.',
      });
      return;
    }

    const values = Object.values(view.state.values).reduce(
      (obj, value) => ({
        ...obj,
        ...value,
      }),
      {},
    );

    const selectedPrinciples = values.principles.selected_options!.map((option) => option.value as BrandazinePrinciple);
    const addedPraisePrinciples: PraisePrinciple[] = [];
    for (const selectedPrinciple of selectedPrinciples) {
      try {
        const praisePrinciple = praisePrincipleRepository.create({
          praise,
          selectedPrinciple,
          selectedBy: user,
        });
        await praisePrincipleRepository.persistAndFlush(praisePrinciple);
        addedPraisePrinciples.push(praisePrinciple);
      } catch (e) {}
    }

    const text =
      `<@${user.slackUserId}>님이 다음 Principles를 선택했습니다:` +
      addedPraisePrinciples
        .map((praisePrinciple) => `\n- ${BrandazinePrincipleLabels[praisePrinciple.selectedPrinciple]}`)
        .join('');

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: praise.slackMessageTs,
      text,
    });

    // add proper reactions
    const reactionsResponse = await client.reactions.list({
      full: true,
      channel: channelId,
      timestamp: praise.slackMessageTs,
    });
    if (!reactionsResponse.ok) {
      console.error(reactionsResponse.error);
      return;
    }
    const addedReactions = reactionsResponse.items!.flatMap(
      (item) => (item.message && item.message.reactions?.map((reaction) => reaction.name)) ?? [],
    );
    // exclude addedReactions
    const reactionsToAdd = addedPraisePrinciples
      .map(({ selectedPrinciple }) => BrandazinePrincipleReactions[selectedPrinciple])
      .filter((reaction) => !addedReactions.includes(reaction));
    if (reactionsToAdd.length > 0) {
      await Promise.allSettled(
        reactionsToAdd.map((reaction) =>
          client.reactions.add({
            channel: channelId,
            timestamp: praise.slackMessageTs,
            name: reaction,
          }),
        ),
      );
    }
  });

  await slack.start();
  console.log('⚡️ Bolt app started');

  Object.assign(repl.start('> ').context, {
    slack,
    client: slack.client,
    orm,
  });
}

if (require.main === module) {
  main().catch(console.error);
}
