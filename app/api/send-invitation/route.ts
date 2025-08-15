import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configurez Nodemailer (utilisant les variables d'environnement pour la sécurité)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Ou 'smtp.sendgrid.net' si vous utilisez SendGrid
  auth: {
    user: process.env.EMAIL_USER, // Votre adresse e-mail (ex: pour Gmail)
    pass: process.env.EMAIL_PASS, // Votre mot de passe d'application (pour Gmail) ou clé API (pour SendGrid)
  },
});

export async function POST(request: Request) {
  try {
    const { email, displayName, role, invitationId } = await request.json();

    // Assurez-vous que NEXT_PUBLIC_BASE_URL est défini dans vos variables d'environnement Vercel
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/invitation/${invitationId}`;

    const mailOptions = {
      from: 'EcoleChat <noreply@votre-domaine.com>', // Remplacez par votre adresse d'expéditeur
      to: email,
      subject: `Invitation à rejoindre EcoleChat - ${displayName}`,
      html: `
        <p>Bonjour ${displayName},</p>
        <p>Vous avez été invité(e) à rejoindre la plateforme de messagerie sécurisée EcoleChat en tant que ${role}.</p>
        <p>Pour activer votre compte et définir votre mot de passe, veuillez cliquer sur le lien ci-dessous :</p>
        <p><a href="${invitationLink}">Activer mon compte EcoleChat</a></p>
        <p>Ce lien est valide pour une durée limitée.</p>
        <p>Si vous n'avez pas demandé cette invitation, veuillez ignorer cet e-mail.</p>
        <p>L'équipe EcoleChat</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${email}`);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: unknown) {
    console.error('Erreur lors de l\'envoi de l\'e-mail d\'invitation :', error);
    let errorMessage = 'Échec de l\'envoi de l\'e-mail';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ success: false, message: errorMessage, error: errorMessage }, { status: 500 });
  }
}
