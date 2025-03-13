import { 
  PutObjectCommand, 
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, bucketName } from '../config/s3.js';

const ITEMS_PER_PAGE = 10;

async function getSignedImageUrl(key) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getImages(page) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    MaxKeys: 1000
  });
  
  const { Contents = [] } = await s3Client.send(command);
  const sortedContents = Contents.sort((a, b) => b.LastModified - a.LastModified);
  
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedImages = sortedContents.slice(start, end);
  
  const images = await Promise.all(
    paginatedImages.map(async (item) => ({
      id: item.Key,
      url: await getSignedImageUrl(item.Key),
      name: item.Key.split('/').pop(),
      uploadedAt: item.LastModified
    }))
  );

  return {
    images,
    totalPages: Math.ceil(Contents.length / ITEMS_PER_PAGE),
    totalImages: Contents.length
  };
}

export async function uploadImage(file) {
  const fileKey = `images/${Date.now()}-${file.originalname}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  return await s3Client.send(command);
}

export async function deleteImage(imageKey) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: imageKey
  });
  
  return await s3Client.send(command);
}

export async function getImageById(imageKey) {
  const url = await getSignedImageUrl(imageKey);
  const name = imageKey.split('/').pop();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: imageKey
  });
  const response = await s3Client.send(command);
  
  return {
    id: imageKey,
    data: url,
    name: name,
    uploadedAt: response.LastModified
  };
}