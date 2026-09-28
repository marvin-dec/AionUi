/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerStarCliExt } from './starCliExt';

// Register built-in StarCLI extension commands.
// To add a new sf/* command, add a `registerStarCliExt({...})` call here.

registerStarCliExt({
  name: 'sf/feedback',
  method: 'sf/feedbackSubmit',
  i18nKey: 'starCliExt.feedback',
  hasArgs: true,
});
