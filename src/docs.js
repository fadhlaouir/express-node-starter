/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const router = require('express').Router();
const helmet = require('helmet');
const spec = require('./swagger.json');

/* -------------------------------------------------------------------------- */
/*                              API documentation                             */
/* -------------------------------------------------------------------------- */
// Swagger UI loads from a pinned CDN version with integrity hashes, so the API
// doesn't depend on swagger-ui packages (or their install-time telemetry).
const CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.34.0';
const CSS_INTEGRITY =
  'sha384-4c3vsE5f+trhFyHrFrLM1fFGUn531NIaC7dcqEWIJdoRQJ5CkJbSuSCwXLpaS1KF';
const JS_INTEGRITY =
  'sha384-9Td7MKiIr2S83E1kZyyVi8KdJw/S8CpAvu0llLyMeg0xq/hDGiZJfVn0fV4llCmK';

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec.info.title} — API documentation</title>
  <link rel="stylesheet" href="${CDN}/swagger-ui.css" integrity="${CSS_INTEGRITY}" crossorigin="anonymous">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${CDN}/swagger-ui-bundle.js" integrity="${JS_INTEGRITY}" crossorigin="anonymous"></script>
  <script src="init.js"></script>
</body>
</html>`;

router.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:'],
    },
  }),
);

// GET /api-docs/ - Swagger UI
router.get('/', (req, res) => {
  // Redirect to the mount path, never to the request URL: a query string
  // would otherwise end up before the slash and loop.
  if (!req.originalUrl.split('?')[0].endsWith('/'))
    return res.redirect(301, `${req.baseUrl}/`);
  return res.type('html').send(page);
});

// GET /api-docs/init.js - starts Swagger UI (served here to avoid inline scripts)
router.get('/init.js', (req, res) =>
  res
    .type('js')
    .send(
      "window.ui = SwaggerUIBundle({ url: 'openapi.json', dom_id: '#swagger-ui' });",
    ),
);

// GET /api-docs/openapi.json - the OpenAPI document
router.get('/openapi.json', (req, res) => res.json(spec));

module.exports = router;
