/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommandItem } from './types';

/** Configuration for a single StarCLI extension command. */
export type StarCliExtConfig = {
  /** Slash command name without the leading `/` (e.g. `'sf/feedback'`). */
  name: string;
  /** The `method` sent to `extMethod` (e.g. `'sf/feedbackSubmit'`). */
  method: string;
  /** i18n key prefix (e.g. `'starCliExt.feedback'`). */
  i18nKey: string;
  /** Whether the command accepts free-text arguments. */
  hasArgs?: boolean;
};

const registry: StarCliExtConfig[] = [];

/** Register a StarCLI extension command. */
export function registerStarCliExt(config: StarCliExtConfig): void {
  registry.push(config);
}

/** All registered StarCLI extension commands. */
export function getStarCliExtConfigs(): readonly StarCliExtConfig[] {
  return registry;
}

/** Build slash command items from the registered configs. */
export function buildStarCliSlashCommands(
  configs: readonly StarCliExtConfig[],
  t: (key: string, opts?: Record<string, unknown>) => string
): SlashCommandItem[] {
  return configs.map((config) => ({
    name: config.name,
    description: t(`${config.i18nKey}.description`),
    kind: 'template' as const,
    source: 'acp' as const,
    selectionBehavior: 'insert' as const,
  }));
}

type StarCliExtMatch = { config: StarCliExtConfig; args: string };

/** Match an input string against registered `sf/*` commands. */
export function matchStarCliExt(input: string, configs: readonly StarCliExtConfig[]): StarCliExtMatch | null {
  for (const config of configs) {
    const re = new RegExp(`^/${escapeRegExp(config.name)}(?:\\s+([\\s\\S]*))?$`, 'i');
    const match = input.match(re);
    if (match) {
      return { config, args: match[1]?.trim() ?? '' };
    }
  }
  return null;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
