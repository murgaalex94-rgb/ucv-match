import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../lib/supabase';

export const usePushNotifications = (user) => {
  useEffect(() => {
    // Solo registrar notificaciones si el usuario está autenticado y estamos en un dispositivo nativo (Android/iOS)
    if (!user || !Capacitor.isNativePlatform()) return;

    const registerPush = async () => {
      try {
        // Solicitar permisos nativos (esto abre el popup en Android 13+)
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('El usuario denegó los permisos de notificaciones push');
          return;
        }

        // Si dio permisos, nos registramos en FCM para obtener el token
        await PushNotifications.register();
      } catch (error) {
        console.error('Error al registrar notificaciones push:', error);
      }
    };

    registerPush();

    // Listeners
    const addListeners = async () => {
      await PushNotifications.addListener('registration', async (token) => {
        console.info('Push registration success, token: ' + token.value);
        
        // Guardar el token en Supabase
        try {
          const { error } = await supabase
            .from('push_tokens')
            .upsert({
              user_id: user.id,
              token: token.value,
              platform: Capacitor.getPlatform(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,token'
            });
          
          if (error) {
            console.error('Error al guardar token push:', error);
          } else {
            console.info('Token push guardado exitosamente');
          }
        } catch (error) {
          console.error('Error al guardar token push:', error);
        }
      });

      await PushNotifications.addListener('registrationError', (err) => {
        console.error('Push registration error: ', err.error);
      });

      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.info('Push notification received: ', notification);
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.info('Push notification action performed: ', notification.actionId, notification.inputValue);
      });
    };

    addListeners();

    // Cleanup listeners when component unmounts
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);
};
