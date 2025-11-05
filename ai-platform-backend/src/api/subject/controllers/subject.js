'use strict';

/**
 * subject controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::subject.subject', ({ strapi }) => ({
  async find(ctx) {
    // Préparer les options de populate
    // Si populate est une chaîne ou non défini dans la query, le remplacer
    if (!ctx.query.populate || typeof ctx.query.populate === 'string') {
      ctx.query.populate = {
        author: {
          populate: {
            role: true,
          },
        },
        lessons: true,
      };
    }

    // Utiliser le service pour récupérer les données avec populate
    const { results, pagination } = await strapi.entityService.findPage('api::subject.subject', {
      ...ctx.query,
    });

    // Transformer les résultats au format API REST Strapi (format simplifié)
    const data = results.map((item) => {
      // Créer les attributes en excluant l'id et les relations
      const { id, author, lessons, ...restAttributes } = item;
      
      return {
        id: item.id,
        attributes: {
          ...restAttributes,
          author: author ? {
            data: {
              id: author.id,
              attributes: {
                username: author.username,
                email: author.email,
                role: author.role ? {
                  data: {
                    id: author.role.id,
                    attributes: {
                      name: author.role.name,
                      type: author.role.type,
                    },
                  },
                } : null,
              },
            },
          } : null,
          lessons: lessons && Array.isArray(lessons) ? {
            data: lessons.map((lesson) => ({
              id: lesson.id,
              attributes: {
                title: lesson.title,
                pdf_url: lesson.pdf_url,
                video_url: lesson.video_url,
                order_no: lesson.order_no,
                is_published: lesson.is_published,
                content: lesson.content,
              },
            })),
          } : null,
        },
      };
    });

    return {
      data,
      meta: {
        pagination,
      },
    };
  },
}));
