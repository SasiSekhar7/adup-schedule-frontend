import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";
import axios from "axios";
import { toast } from "sonner";

export const firebaseConfig = {
  apiKey: "AIzaSyA30Krnh17Ugd_7yDf-k5dbEIwi02nUrCQ",
  authDomain: "ad96-c974f.firebaseapp.com",
  projectId: "ad96-c974f",
  storageBucket: "ad96-c974f.firebasestorage.app",
  messagingSenderId: "80844393688",
  appId: "1:80844393688:web:50f9e9152b731b57941bad",
  measurementId: "G-KR91ZE7H8T",
};

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("FCM Messaging initialization error:", err);
  }
}

export { messaging };

const BACKEND_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "web_browser";
  let deviceId = localStorage.getItem("cms_web_device_id");
  if (!deviceId) {
    deviceId = "web_browser_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("cms_web_device_id", deviceId);
  }
  return deviceId;
}

/**
 * Request Web Notification permissions and register token with backend
 */
export async function requestWebNotificationPermission(
  deviceId?: string,
  userId?: string,
) {
  if (!messaging) return null;
  const effectiveDeviceId = deviceId || getOrCreateDeviceId();
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging);

      if (currentToken) {
        await axios.post(`${BACKEND_URL}/notifications/register-token`, {
          deviceToken: currentToken,
          platform: "web",
          deviceId: effectiveDeviceId,
          userId: userId || null,
        });
        console.log("Web FCM Token registered successfully:", currentToken);
        return currentToken;
      }
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
  }
  return null;
}


// Global subscriber set to support multiple listeners without overriding onMessage
const notificationSubscribers = new Set<(payload: any) => void>();
let isFCMListenerAttached = false;

/**
 * Listen for messages while web application is in foreground
 */
export function listenForegroundNotifications(
  callback: (payload: any) => void,
) {
  notificationSubscribers.add(callback);

  if (messaging && !isFCMListenerAttached) {
    isFCMListenerAttached = true;
    onMessage(messaging, (payload) => {
      console.log("Foreground notification received:", payload);

      const action = payload?.data?.action;
      const isSilentAction =
        action === "NOTIFICATION_DELETED" || action === "NOTIFICATIONS_CLEARED";

      if (!isSilentAction) {
        const title =
          payload?.notification?.title || payload?.data?.title || "Notification";
        const body = payload?.notification?.body || payload?.data?.body || "";

        // 1. Trigger Sonner Toast Banner only for standard notifications
        toast.info(title, {
          description: body,
          duration: 6000,
        });

        // 2. Trigger Native Desktop System Notification Popup
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, {
            body: body,
            icon: "/logo.png",
            data: payload?.data || {},
          });
        }
      }

      // 3. Always notify all subscribed callbacks (e.g. NotificationBell) to sync state
      notificationSubscribers.forEach((subscriber) => {
        try {
          subscriber(payload);
        } catch (err) {
          console.error("Error in notification subscriber:", err);
        }
      });

    });
  }

  return () => {
    notificationSubscribers.delete(callback);
  };
}
