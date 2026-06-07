import fs from 'fs';
import path from 'path';

const generatedDir = path.resolve(process.cwd(), 'test-results', 'generated-files');

function ensureGeneratedDir() {
  fs.mkdirSync(generatedDir, { recursive: true });
}

export function createTinyJpg(name: string) {
  ensureGeneratedDir();
  const filePath = path.join(generatedDir, name);
  const base64Jpg =
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Aqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';
  fs.writeFileSync(filePath, Buffer.from(base64Jpg, 'base64'));
  return filePath;
}

export function createTinyJpgFiles(count: number) {
  return Array.from({ length: count }, (_, index) => createTinyJpg(`product-image-${Date.now()}-${index + 1}.jpg`));
}

export function createInvalidTextFile() {
  ensureGeneratedDir();
  const filePath = path.join(generatedDir, `invalid-upload-${Date.now()}.txt`);
  fs.writeFileSync(filePath, 'This is not an image file.');
  return filePath;
}

export function createLargeJpgFile(sizeInKb = 600) {
  ensureGeneratedDir();
  const filePath = path.join(generatedDir, `large-product-image-${Date.now()}.jpg`);
  fs.writeFileSync(filePath, Buffer.alloc(sizeInKb * 1024, 1));
  return filePath;
}

export function createLargeMp4File(sizeInMb = 101) {
  ensureGeneratedDir();
  const filePath = path.join(generatedDir, `large-complaint-video-${Date.now()}.mp4`);
  const fileHandle = fs.openSync(filePath, 'w');
  fs.writeSync(fileHandle, Buffer.from('ftypmp42'), 0, 8, 0);
  fs.ftruncateSync(fileHandle, sizeInMb * 1024 * 1024);
  fs.closeSync(fileHandle);
  return filePath;
}
