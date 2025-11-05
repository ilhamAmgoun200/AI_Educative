'use strict';

/**
 * transcript service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::transcript.transcript');
