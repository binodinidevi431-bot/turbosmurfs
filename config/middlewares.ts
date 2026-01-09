export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: "strapi::body",
    config: {
      formLimit: "500mb",
      jsonLimit: "50mb",
      textLimit: "50mb",
      formidable: {
        maxFileSize: 500 * 1024 * 1024, // 500MB
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
