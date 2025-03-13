import { getImages, uploadImage, deleteImage, getImageById } from '../services/imageService.js';

export const listImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { images, totalPages, totalImages } = await getImages(page);
    
    res.render('index', {
      images,
      currentPage: page,
      totalPages,
      totalImages
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).render('error', { error: 'Failed to fetch images' });
  }
};

export const handleUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    await uploadImage(req.file);
    res.redirect('/');
  } catch (error) {
    console.error('Error uploading to S3:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const handleDelete = async (req, res) => {
  const imageKey = decodeURIComponent(req.params.id);
  
  try {
    await deleteImage(imageKey);
    res.redirect('back');
  } catch (error) {
    console.error('Error deleting from S3:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

export const showImage = async (req, res) => {
  const imageKey = decodeURIComponent(req.params.id);
  
  try {
    const image = await getImageById(imageKey);
    res.render('image', { image });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(404).redirect('/');
  }
};