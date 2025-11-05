'use strict';

/**
 * ai-session service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ai-session.ai-session');
