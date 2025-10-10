const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TriStar Fitness API',
      version: '1.0.0',
      description: 'Comprehensive API for TriStar Fitness Gym Management System',
      contact: {
        name: 'API Support',
        email: 'support@tristarfitness.com',
        url: 'https://tristarfitness.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.tristarfitness.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            total: {
              type: 'integer',
              example: 100
            },
            pages: {
              type: 'integer',
              example: 10
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Members',
        description: 'Member management operations'
      },
      {
        name: 'Trainers',
        description: 'Trainer management operations'
      },
      {
        name: 'Sessions',
        description: 'Fitness session and class management'
      },
      {
        name: 'Attendance',
        description: 'Member attendance tracking'
      },
      {
        name: 'Equipment',
        description: 'Gym equipment management and maintenance'
      },
      {
        name: 'Invoices',
        description: 'Billing and payment management'
      },
      {
        name: 'Nutrition',
        description: 'Nutrition planning and tracking'
      },
      {
        name: 'Reports',
        description: 'Analytics and reporting endpoints'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './middleware/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;

