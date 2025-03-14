import express from 'express';
import { upload } from '../config/multer.js';
import { 
  listImages, 
  handleUpload, 
  handleDelete, 
  showImage 
} from '../controllers/imageController.js';

const router = express.Router();


router.get('/', listImages);
router.post('/upload', upload.single('image'), handleUpload);
router.post('/delete/:id', handleDelete);
router.get('/image/:id', showImage);

export default router;