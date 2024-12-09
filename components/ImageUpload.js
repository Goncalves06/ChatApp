import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';

export const uploadImage = async (imageUri) => {
  try {
    const imageRef = ref(storage, `chat-images/${Date.now()}`);
    const imgBlob = await fetch(imageUri).then((res) => res.blob());
    await uploadBytes(imageRef, imgBlob);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw new Error("Erro ao enviar a imagem.");
  }
};
