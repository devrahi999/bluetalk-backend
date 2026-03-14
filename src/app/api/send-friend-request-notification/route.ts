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
    const { senderName, receiverUid } = body;

    if (!senderName || !receiverUid) {
      return NextResponse.json(
        { error: 'Missing required fields: senderName or receiverUid' },
        { status: 400 }
      );
    }

    // Since we receive the token directly from the flutter app request to save a firestore read on the backend,
    // we use it directly here. If scaling, the backend could query Firestore.
    // However, keeping consistent with the plan, the token is passed to or retrieved by the server. 
    // Given the prompt requirement: "The API endpoint retrieves the FCM token of the receiver (User B) from Firestore"
    // Let's actually fetch it from firestore using admin sdk to follow the prompt exactly!

    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(receiverUid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Receiver user not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken || userData?.fcm_token; 

    // Check notification setting from user profile
    const notifEnabled = userData?.notif_friend_req !== false; // Returns true if undefined
    if (!notifEnabled) {
      return NextResponse.json({ success: true, message: 'User disabled friend request notifications' }, { status: 200 });
    }

    if (!fcmToken) {
      return NextResponse.json({ error: 'Receiver does not have an FCM token' }, { status: 404 });
    }

    const message = {
      notification: {
        title: 'New Friend Request',
        body: `${senderName} sent you a friend request`,
      },
      data: {
        type: 'friend_request',
        senderName: senderName,
      },
      token: fcmToken,
    };

    const response = await getMessaging().send(message);

    return NextResponse.json({ success: true, messageId: response }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
