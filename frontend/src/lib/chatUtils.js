import { StreamChat } from 'stream-chat';
import { supabase } from './supabase';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY;

/**
 * Genera un ID de canal único y consistente de Stream Chat basado en los IDs de 2 usuarios.
 * Garantiza un tamaño < 64 caracteres (límite de Stream Chat) y el mismo formato independientemente del orden de los IDs.
 */
export const getChannelId = (id1, id2) => {
  if (!id1 || !id2) return '';
  const sorted = [String(id1), String(id2)].sort();
  return sorted.map(id => String(id).replace(/-/g, '').slice(0, 16)).join('-');
};

export const ensureProfile = async (authUser) => {
  if (!authUser) return null;
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, nombre_completo, avatar_url')
    .eq('id', authUser.id)
    .maybeSingle();
  if (existing) return existing;

  const meta = authUser.user_metadata || {};
  const nombre = meta.nombre_completo || meta.name || authUser.email?.split('@')[0] || 'Usuario';
  const { data: newProfile } = await supabase.from('profiles').insert({
    id: authUser.id,
    nombre_completo: nombre,
    codigo_estudiante: meta.codigo_estudiante || `EST-${Date.now()}`,
    email: authUser.email,
    rol: meta.rol || 'Estudiante',
    carrera: meta.carrera || null,
    ciclo: parseInt(meta.ciclo) || 1,
    promedio: parseFloat(meta.promedio) || 0.00,
    estilo_aprendizaje: meta.estilo_aprendizaje || 'Visual',
  }).select('id, nombre_completo, avatar_url').single();
  return newProfile || null;
};

/**
 * Conecta el usuario actual a Stream Chat, crea/obtiene el canal con el targetUserId,
 * asegurando la sincronización exacta entre connectUser y channel.create().
 */
export const createOrGetStreamChannel = async (targetUserId, targetUserName = '') => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('No hay usuario autenticado');

  await ensureProfile(authUser);

  const currentUserId = String(authUser.id);
  const otherUserId = String(targetUserId);
  const channelId = getChannelId(currentUserId, otherUserId);

  const chatClient = new StreamChat(API_KEY);
  try {
    const sess = await supabase.auth.getSession();
    const accessToken = sess.data.session?.access_token;
    if (!accessToken) throw new Error('No hay sesión activa');

    const response = await fetch('https://baelhtrbulusonjbdtor.supabase.co/functions/v1/generate-stream-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ userId: authUser.id, otherUserId })
    });
    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Token error: ${response.status} - ${errBody.slice(0, 200)}`);
    }
    const tokenData = await response.json();

    const userName = tokenData.profile?.nombre_completo || authUser.user_metadata?.nombre_completo || targetUserName || authUser.email?.split('@')[0] || 'Usuario';
    await chatClient.connectUser(
      { id: authUser.id, name: userName },
      tokenData.token
    );

    const channel = chatClient.channel('messaging', channelId, {
      members: [authUser.id, otherUserId]
    });
    if (tokenData.channelId) {
      await channel.watch();
    } else {
      await channel.create();
    }
  } finally {
    await chatClient.disconnectUser();
  }

  return channelId;
};
