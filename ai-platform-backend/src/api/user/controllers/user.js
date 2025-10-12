'use strict';

/**
 * user controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user.user');
