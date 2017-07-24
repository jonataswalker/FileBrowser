import path from 'path';
import crypto from 'crypto';
import express from 'express';
import multer from 'multer';
import mime from 'mime-types';
import url from 'url';
import util from 'util';
// import { ROUTES, UPLOAD } from '../constants';

const router = express.Router();
const resolve = file => path.resolve(__dirname, file);

const routes = {};

// const uploadRoot = UPLOAD.ROOT.replace('{root}', resolve('../'));

// const storageFotos = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, `${uploadRoot}/${UPLOAD.FOTOS}/`);
//   },
//   filename: (req, file, cb) => {
//     crypto.pseudoRandomBytes(16, (err, raw) => {
//       const ext = mime.extension(file.mimetype);
//       cb(null, `${raw.toString('hex')}-${Date.now()}.${ext}`);
//     });
//   }
// });

const imageFilter = (req, file, cb) => {
  // accept image only
  console.log(file);
  const ext = mime.extension(file.mimetype);
  ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
    ? cb(null, true)
    : cb(new Error('Only image files are allowed!'), false);
};

// const uploadFotos = multer({
//   storage: storageFotos,
//   fileFilter: imageFilter
// }).array('test');
// router.put(ROUTES.FOTOS.UPLOAD, handleUploadFotos);

router.get('/files', (req, res) => {
  res.json({});
  console.log('get');
});


// Always return the main index.html
// so router render the route in the client
router.all('*', (req, res) => {
  const file = path.basename(url.parse(req.url).pathname);
  const mime_ = mime.lookup(file);
  mime_ && res.setHeader('Content-Type', mime_);
  res.sendFile(resolve('../examples/index.html'));
});

export default router;

// function handleUploadFotos(req, res, next) {
//   uploadFotos(req, res, (err) => {
//     if (err) return res.json({ message: err });
//     res.json({ message: req.files });
//   });
// }

function handleErrorValidation(res, result) {
  if (!result.isEmpty()) {
    res.send(
      'There have been validation errors: ' + util.inspect(result.array()));
    return true;
  } else return false;
}

