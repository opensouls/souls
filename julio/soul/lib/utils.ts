import { ChatMessageRoleEnum, CortexStep } from "socialagi";
import { Perception } from "soul-engine/soul";
import { DiscordEventData } from "../../discord/soulGateway.js";

export function getBotUserIdFromPerception(perception: Perception | null | undefined) {
  return perception?._metadata?.botUserId as string | undefined;
}

export function getDiscordEventFromPerception(
  perception: Perception | null | undefined
): DiscordEventData | undefined {
  if (!perception) {
    return undefined;
  }

  return perception._metadata?.discordEvent as DiscordEventData;
}

export function getMetadataFromPerception(perception: Perception | null | undefined) {
  const botUserId = getBotUserIdFromPerception(perception) || "anonymous-123";
  const discordEvent = getDiscordEventFromPerception(perception);
  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  return {
    botUserId,
    userName,
    userDisplayName,
    discordEvent,
  };
}

export function getUserDataFromDiscordEvent(discordEvent: DiscordEventData | undefined) {
  const userName = discordEvent?.atMentionUsername || "Anonymous";
  const userDisplayName = discordEvent?.userDisplayName || "Anonymous";

  return {
    userName,
    userDisplayName,
  };
}

export function random() {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  let seed = Date.now();
  seed = (a * seed + c) % m;
  return seed / m;
}

export function newMemory(content: string) {
  return [
    {
      role: ChatMessageRoleEnum.Assistant,
      content,
    },
  ];
}

export function getLastMemory(step: CortexStep) {
  return step.memories.slice(-1)[0]?.content.toString().trim() || null;
}
