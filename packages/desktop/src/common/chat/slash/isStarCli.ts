/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/** Whether the agent display name indicates a StarCLI agent. */
export function isStarCliAgent(agentName?: string): boolean {
  return !!agentName && agentName.toLowerCase().includes('star');
}
