
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from "./firebase-service-account.json" with { type: "json" };

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

const firebaseMessaging = getMessaging(firebaseApp);

export { firebaseApp, firebaseMessaging };
