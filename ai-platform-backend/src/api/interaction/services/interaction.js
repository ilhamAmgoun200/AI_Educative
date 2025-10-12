'use strict';

/**
 * interaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::interaction.interaction');
