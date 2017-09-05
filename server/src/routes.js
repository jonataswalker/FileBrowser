import Path from 'path';
import { getTree, createFolder, removeFiles } from 'helpers/tree';
import { ROUTES, TEXT } from 'konstants';

const resolve = file => Path.resolve(__dirname, file);
const root = Path.resolve(process.env.npm_package_config_ROOT_DIR);
const staticPath = process.env.npm_package_config_STATIC_PATH || '/static';

const routes = [
  {
    method: 'GET',
    path: ROUTES.FILES.ALL,
    handler: (request, reply) => {
      getTree(root).then(reply);
    }
  },
  {
    method: 'PATCH',
    path: ROUTES.FILES.REMOVE,
    handler: (request, reply) => {
      const message = TEXT.API.MESSAGES.FILE.REMOVED;
      const folder = Path.join(root, request.payload.folder);

      removeFiles(folder, request.payload.files)
        .then(() => getTree(root))
        .then(tree => reply({ tree, message }));
    }
  },
  {
    method: 'POST',
    path: ROUTES.FOLDER.CREATE,
    handler: (request, reply) => {
      const dir = Path.join(root, '.' + request.payload.path);
      const message = TEXT.API.MESSAGES.FOLDER.CREATED;
      createFolder(dir)
        .then(() => getTree(root))
        .then(tree => reply({ tree, message }));
    }
  },
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.file(resolve('../examples/index.html'));
    }
  },
  {
    method: 'GET',
    path: `${staticPath}/{p*}`,
    handler: {
      directory: {
        path: [
          resolve('../examples'),
          resolve('../examples/_uploads'),
          resolve('../dist')
        ]
      }
    }
  }
];

const router = {
  register: (server, options, next) => {
    server.route(routes);
    next();
  }
};

router.register.attributes = { name: 'routes' };

export default router;
