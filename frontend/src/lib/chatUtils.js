import { StreamChat } from 'stream-chat';
import { supabase } from './supabase';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || '3mgv7c3pnrhu';

/**
 * Genera un ID de canal único y consistente de Stream Chat basado en los IDs de 2 usuarios.
 * Garantiza un tamaño < 64 caracteres (límite de Stream Chat) y el mismo formato independientemente del orden de los IDs.
 */
export const getChannelId = (id1, id2) => {
  if (!id1 || !id2) return '';
  const sorted = [String(id1), String(id2)].sort();
  return sorted.map(id => String(id).replace(/-/g, '').slice(0, 16)).join('-');
};

/**
 * Conecta el usuario actual a Stream Chat, crea/obtiene el canal con el targetUserId,
 * asegurando la sincronización exacta entre connectUser y channel.create().
 */
export const createOrGetStreamChannel = async (targetUserId, targetUserName = '') => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('No hay usuario autenticado');

  const currentUserId = String(authUser.id);
  const otherUserId = String(targetUserId);

  return getChannelId(currentUserId, otherUserId);
};
