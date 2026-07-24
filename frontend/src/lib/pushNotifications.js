import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';

const FCM_SERVER_KEY = 'BO2-mc6IJ2ov0s0b2hj9x-5HipdzU2kUuyYHi-X7kZT6kaaC99UVjUgks6OnjzzvpDu-ohIdJhw24aeT5J2sk6I';

export const sendPushNotification = async (userId, title, body, data = {}) => {
  // Only send push notifications on mobile (Android/iOS), not on web
  const platform = Capacitor.getPlatform();
  if (platform === 'web') {
    console.log('Push notifications disabled on web platform');
    return false;
  }

  try {
    // Get the user's push tokens from Supabase
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching push tokens:', error);
      return false;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found for user:', userId);
      return false;
    }

    // Send push notification using Firebase Cloud Messaging
    const notificationPromises = tokens.map(async (tokenObj) => {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${FCM_SERVER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: tokenObj.token,
          notification: {
            title,
            body,
            sound: 'default',
          },
          data: data,
          priority: 'high',
        }),
      });

      return response.json();
    });

    const results = await Promise.allSettled(notificationPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send notification to token ${index}:`, result.reason);
      } else {
        console.log(`Notification sent successfully to token ${index}:`, result.value);
      }
    });

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};
