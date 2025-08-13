import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary avec les variables d'environnement
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    // Génération de la signature sécurisée
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

    return NextResponse.json({ signature, timestamp: paramsToSign.timestamp });
  } catch (error) {
    console.error('Erreur lors de la génération de la signature Cloudinary:', error);
    return NextResponse.json({ success: false, message: 'Échec de la génération de la signature' }, { status: 500 });
  }
}
