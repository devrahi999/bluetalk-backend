import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NextResponse } from 'next/server';

// Initialize Firebase Admin using environment variables
function initFirebaseAdmin() {
  if (getApps().length === 0) {
    // For Vercel, we need to handle new line characters in the private key properly.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const credential = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    if (!credential.projectId || !credential.clientEmail || !credential.privateKey) {
      console.error('Firebase Admin credentials missing. Please check your environment variables.');
      return false;
    }

    initializeApp({
      credential: cert(credential),
    });
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const isInitialized = initFirebaseAdmin();
    if (!isInitialized) {
      return NextResponse.json(
        { error: 'Server misconfiguration: Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { senderName, receiverUid, roomName, groupId } = body;

    if (!senderName || !receiverUid || !roomName || !groupId) {
      return NextResponse.json(
        { error: 'Missing required fields: senderName, receiverUid, roomName, or groupId' },
        { status: 400 }
      );
    }

    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(receiverUid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Receiver user not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken || userData?.fcm_token; 

    if (!fcmToken) {
      return NextResponse.json({ error: 'Receiver does not have an FCM token' }, { status: 404 });
    }

    const message = {
      notification: {
        title: 'Voice Room Invitation',
        body: `${senderName} invited you to join the room "${roomName}"!`,
      },
      data: {
        type: 'room_invite',
        senderName: senderName,
        roomName: roomName,
        groupId: groupId,
      },
      token: fcmToken,
    };

    const response = await getMessaging().send(message);

    return NextResponse.json({ success: true, messageId: response }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending room invite push notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
