import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  MessageList,
  MessageComposer,
  WithComponents,
  Attachment as DefaultAttachment,
  useChatContext,
  useMessageComposerContext,
  useMessageComposerController,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import {
  Search, ChevronDown, ChevronLeft, MoreHorizontal,
  Phone, Video, X, Info, Send,
  FileText, Image, Video as VideoIcon,
  Download, ExternalLink, File, Trash2, Ban, Mail, MessageSquare, Reply, Table, Monitor, Archive, Pin, Pencil, Clipboard, Smile, MoreVertical, User, BellOff,
  Clock, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import EmojiPickerReact from 'emoji-picker-react';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || '3mgv7c3pnrhu';

// ---- Offline queue utilities ----
const OFFLINE_QUEUE_KEY = 'mentorlink_offline_msgs';

const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

const removeFromOfflineQueue = (msgId) => {
  try {
    const queue = getOfflineQueue().filter(m => m.id !== msgId);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch { /* ignore */ }
};

const getPendingCount = () => getOfflineQueue().length;

const getFileMetadata = (attachment) => {
  const name = attachment.title || attachment.fallback || '';
  const ext = name.split('.').pop().toLowerCase();
  const mime = (attachment.mime_type || '').toLowerCase();

  if (attachment.image_url || mime.startsWith('image/')) return { icon: Image, label: 'Imagen', color: 'text-blue-500' };
  if (ext === 'pdf' || mime === 'application/pdf') return { icon: FileText, label: 'PDF', color: 'text-red-500' };
  if (['doc', 'docx'].includes(ext) || mime === 'application/msword' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return { icon: FileText, label: 'Word', color: 'text-blue-500' };
  if (['xls', 'xlsx'].includes(ext) || mime === 'application/vnd.ms-excel' || mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return { icon: Table, label: 'Excel', color: 'text-green-500' };
  if (['ppt', 'pptx'].includes(ext) || mime === 'application/vnd.ms-powerpoint' || mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return { icon: Monitor, label: 'PPT', color: 'text-orange-500' };
  if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext) || mime.startsWith('video/')) return { icon: VideoIcon, label: 'Video', color: 'text-red-500' };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('gzip')) return { icon: Archive, label: 'ZIP', color: 'text-yellow-500' };
  if (['txt', 'csv'].includes(ext) || mime === 'text/plain' || mime === 'text/csv') return { icon: FileText, label: 'Texto', color: 'text-gray-500' };
  return { icon: File, label: 'Archivo', color: 'text-gray-500' };
};

const getFileIcon = (file) => {
  const meta = getFileMetadata({ title: file?.name, fallback: file?.name, mime_type: file?.type || '' });
  const Icon = meta.icon;
  return <Icon className={`w-12 h-12 ${meta.color}`} />;
};

const getFileTypeText = (file) => {
  const meta = getFileMetadata({ title: file?.name, fallback: file?.name, mime_type: file?.type || '' });
  return meta.label;
};

const GreenCardAttachment = ({ attachment, onImageClick }) => {
  if (!attachment || (!attachment.image_url && !attachment.asset_url)) return null;

  if (attachment.image_url) {
    return (
      <div onClick={() => onImageClick?.(attachment.image_url)} className="cursor-pointer">
        <img src={attachment.image_url} className="max-w-[280px] max-h-[300px] rounded-xl object-contain border border-gray-200 bg-white" />
      </div>
    );
  }

  if (attachment.mime_type?.startsWith('video/')) {
    return (
      <video src={attachment.asset_url} controls className="max-w-[300px] rounded-xl border border-gray-200 bg-black" />
    );
  }

  const file = {
    url: attachment.asset_url,
    name: attachment.title || attachment.fallback || 'Archivo',
    size: attachment.file_size || 0,
    type: attachment.mime_type || '',
  };

  return (
    <div className="w-[280px] flex flex-col rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="h-24 bg-white flex items-center justify-center">
        {getFileIcon(file)}
      </div>
      <div className="bg-[#dcfce7] px-4 py-2 border-t border-[#bbf7d0]">
        <p className="text-sm font-medium text-gray-800 truncate max-w-[220px]">
          {file.name}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
          <span>{(file.size / 1024).toFixed(1)} KB</span>
          <span>•</span>
          <span>{getFileTypeText(file)}</span>
        </div>
      </div>
      <div className="flex divide-x divide-[#bbf7d0] bg-[#dcfce7]">
        <button
          onClick={() => window.open(file.url, '_blank')}
          className="flex-1 py-2 text-sm font-medium text-blue-600 hover:bg-[#bbf7d0] flex items-center justify-center gap-1 transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Abrir
        </button>
        <button
          onClick={() => {
            const a = document.createElement('a');
            a.href = file.url;
            a.download = file.name;
            a.click();
          }}
          className="flex-1 py-2 text-sm font-medium text-blue-600 hover:bg-[#bbf7d0] flex items-center justify-center gap-1 transition-colors"
        >
          <Download className="w-4 h-4" /> Guardar como...
        </button>
      </div>
    </div>
  );
};

const FilePreviewModal = ({ file, fileType, onSend, onClose }) => {
  const [text, setText] = useState('');
  const objectUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  useEffect(() => {
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [objectUrl]);

  const handleClose = () => onClose();

  const handleSend = () => {
    onSend(text);
    setText('');
  };

  const isImageFile = fileType === 'image' || file?.type?.startsWith('image/');
  const previewMeta = isImageFile
    ? { icon: Image, label: 'Imagen', color: 'text-blue-500' }
    : getFileMetadata({ title: file?.name, fallback: file?.name, mime_type: file?.type });
  const PreviewIcon = previewMeta.icon;
  const previewLabel = previewMeta.label;
  const previewColor = previewMeta.color;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button onClick={handleClose} className="p-1 min-h-[44px] min-w-[44px] hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center">
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-sm font-medium text-gray-800 truncate max-w-[60%] text-center">{file?.name}</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 relative bg-gray-50">
        {isImageFile ? (
          <img src={objectUrl} alt={file?.name} className="absolute inset-0 w-full h-full object-contain" />
        ) : previewMeta.label === 'PDF' ? (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <File className="w-20 h-20 text-red-400" />
            <span className="text-sm text-gray-500">Vista previa no disponible en el navegador</span>
            <button
              onClick={() => window.open(objectUrl, '_blank')}
              className="px-5 py-2 bg-[#00a67e] text-white text-sm font-medium rounded-full hover:bg-[#008f6c] transition-colors shadow-sm"
            >
              Abrir PDF
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {PreviewIcon && <PreviewIcon className={`w-20 h-20 ${previewColor || 'text-gray-400'}`} />}
            <span className={`text-sm ${previewColor || 'text-gray-500'}`}>{previewLabel || 'Archivo'}</span>
            <span className="text-xs text-gray-400">Vista previa no disponible</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 bg-white shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a5c]"
          autoFocus
        />
        <button onClick={handleSend} className="p-3 min-h-[44px] min-w-[44px] bg-[#00a67e] text-white rounded-full hover:bg-[#008f6c] transition-colors shadow-md">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};



const ChannelSelector = ({ channelId, onSelect }) => {
  const { setActiveChannel, client } = useChatContext();

  useEffect(() => {
    if (!channelId || !client) return;

    let isMounted = true;
    const selectChannel = async () => {
      try {
        const channel = client.channel('messaging', channelId);
        await channel.watch();
        if (isMounted) {
          setActiveChannel(channel);
          if (onSelect) onSelect();
          window.history.replaceState(null, '', '/mensajes');
        }
      } catch (err) {
        console.error('Error selecting channel from URL, attempting auto-creation:', err);
        try {
          const parts = channelId.replace('mentoria_', '').split('_');
          if (parts.length >= 2) {
            const newChannel = client.channel('messaging', channelId, {
              members: [parts[0], parts[1]]
            });
            await newChannel.create();
            await newChannel.watch();
            if (isMounted) {
              setActiveChannel(newChannel);
              if (onSelect) onSelect();
              window.history.replaceState(null, '', '/mensajes');
            }
          }
        } catch (createErr) {
          console.error('Error auto-creating channel in ChannelSelector:', createErr);
        }
      }
    };
    selectChannel();

    return () => { isMounted = false; };
  }, [channelId, client, setActiveChannel, onSelect]);

  return null;
};

const CustomEmojiPicker = () => {
  const { textareaRef } = useMessageComposerContext();
  const { textComposer } = useMessageComposerController();
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (showPicker) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [showPicker]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target) && !e.target.closest?.('.emoji-trigger-btn')) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = textarea.value.substring(0, start) + emoji + textarea.value.substring(end);
      textarea.value = newText;
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textComposer.handleChange({
        selection: { start, end: start + emoji.length },
        text: newText,
      });
      textarea.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
    }
    setShowPicker(false);
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="emoji-trigger-btn p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Emojis"
      >
        <Smile className="w-5 h-5 text-gray-500" />
      </button>
      {showPicker && (
        <div ref={pickerRef} className="absolute bottom-full left-0 z-50 mb-2">
          <div className="h-[350px] overflow-y-auto">
            <EmojiPickerReact
              locale="es"
              searchPlaceholder="Buscar emoji"
              labels={{
                categories: {
                  suggested: 'Sugeridos',
                  smileys_people: 'Smileys y personas',
                  animals_nature: 'Animales y naturaleza',
                  food_drink: 'Comida y bebida',
                  activity: 'Actividad',
                  travel_places: 'Viajes y lugares',
                  objects: 'Objetos',
                  symbols: 'Símbolos',
                  flags: 'Banderas'
                }
              }}
              onEmojiClick={onEmojiClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CustomSendButton = ({ sendMessage }) => (
  <button
    onClick={sendMessage}
    className="str-chat__send-button"
    aria-label="Enviar"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
  </button>
);

const userProfileCache = new Map();

const getParticipantData = (otherUser, cachedProfile, mentoriaContext, userId) => {
  let displayName = '';
  let avatarUrl = null;

  if (mentoriaContext) {
    const isStudent = mentoriaContext.estudiante_id === userId;
    const otherPerson = isStudent ? mentoriaContext.mentor : mentoriaContext.estudiante;
    if (otherPerson?.nombre_completo && otherPerson.nombre_completo !== 'Usuario' && otherPerson.nombre_completo !== 'N/A') {
      displayName = otherPerson.nombre_completo;
    }
    if (otherPerson?.avatar_url) {
      avatarUrl = otherPerson.avatar_url;
    }
  }

  if (!displayName && cachedProfile?.nombre_completo && cachedProfile.nombre_completo !== 'Usuario') {
    displayName = cachedProfile.nombre_completo;
  }
  if (!avatarUrl && cachedProfile?.avatar_url) {
    avatarUrl = cachedProfile.avatar_url;
  }

  if (!displayName || displayName === 'N/A' || displayName === 'Usuario') {
    const nu = otherUser?.nombre_usuario || '';
    const au = otherUser?.apellido_usuario || '';
    if (nu || au) {
      displayName = `${nu} ${au}`.trim();
    } else if (otherUser?.name && otherUser.name !== 'N/A' && otherUser.name !== 'Usuario') {
      displayName = otherUser.name;
    }
  }

  if (!displayName || displayName === 'N/A') {
    displayName = 'Usuario';
  }

  if (!avatarUrl) {
    avatarUrl = otherUser?.avatar_url || otherUser?.image || null;
  }

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return {
    nombre_usuario: displayName.split(' ')[0] || '',
    apellido_usuario: displayName.split(' ').slice(1).join(' ') || '',
    avatar_url: avatarUrl,
    displayName,
    initials,
  };
};

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
  const { user } = useAuth();
  const members = Object.values(channel.state?.members || {});
  const otherMember = members.find(m => m.user?.id !== user?.id);
  const otherUserId = otherMember?.user?.id;

  const [profile, setProfile] = useState(() => userProfileCache.get(otherUserId) || null);

  useEffect(() => {
    if (!otherUserId) return;
    if (userProfileCache.has(otherUserId)) {
      setProfile(userProfileCache.get(otherUserId));
      return;
    }

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, nombre_completo, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();

        if (data && isMounted) {
          const parts = (data.nombre_completo || '').trim().split(/\s+/);
          const parsed = {
            nombre_usuario: parts[0] || '',
            apellido_usuario: parts.slice(1).join(' ') || '',
            avatar_url: data.avatar_url || null,
            nombre_completo: data.nombre_completo,
          };
          userProfileCache.set(otherUserId, parsed);
          setProfile(parsed);
        }
      } catch (err) {
        console.error('Error fetching member profile:', err);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [otherUserId]);

  const participant = getParticipantData(otherMember?.user, profile, null, user?.id);
  const displayName = participant.displayName;
  const avatarUrl = participant.avatar_url;
  const initials = participant.initials;

  const lastMessage = channel.state?.latestMessages?.[0];
  const lastMessageText = lastMessage?.text || '';
  const isMyMessage = lastMessage?.user?.id === user?.id;
  const previewText = lastMessageText
    ? (isMyMessage ? `Tú: ${lastMessageText}` : lastMessageText)
    : 'Sin mensajes aún';
  const truncatedPreview = previewText.length > 50 ? previewText.slice(0, 50) + '...' : previewText;
  const isActive = activeChannel?.cid === channel.cid;

  return (
    <div
      onClick={() => setActiveChannel(channel)}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="w-10 h-10 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
        </div>
        <p className="text-xs text-gray-500 truncate">{truncatedPreview}</p>
      </div>
    </div>
  );
};

const ChatHeader = ({
  onBackClick,
  setShowCallModal,
  chatBlocked, setChatBlocked,
  setShowProfileModal,
  setShowClearChatModal,
  setShowDeleteChatModal,
  setShowFinalizarModal,
  mutedChats, setMutedChats,
  isOnline,
  pendingCount,
  esMentor,
  userId,
}) => {
  const { channel } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [mentoriaContext, setMentoriaContext] = useState(null);

  const members = Object.values(channel?.state?.members || {});
  const otherMember = members.find(m => m.user?.id !== userId);
  const otherUserId = otherMember?.user?.id;

  const [profile, setProfile] = useState(() => userProfileCache.get(otherUserId) || null);

  useEffect(() => {
    if (!otherUserId) return;
    if (userProfileCache.has(otherUserId)) {
      setProfile(userProfileCache.get(otherUserId));
      return;
    }

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, nombre_completo, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();

        if (data && isMounted) {
          const parts = (data.nombre_completo || '').trim().split(/\s+/);
          const parsed = {
            nombre_usuario: parts[0] || '',
            apellido_usuario: parts.slice(1).join(' ') || '',
            avatar_url: data.avatar_url || null,
            nombre_completo: data.nombre_completo,
          };
          userProfileCache.set(otherUserId, parsed);
          setProfile(parsed);
        }
      } catch (err) {
        console.error('Error fetching header member profile:', err);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [otherUserId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!channel || !userId) {
      setMentoriaContext(null);
      return;
    }
    if (!otherUserId) return;

    const fetchMentoria = async () => {
      const { data } = await supabase
        .from('mentorias')
        .select(`
          id, estado, materia, fecha_solicitud, estudiante_id, mentor_id,
          estudiante:estudiante_id(id, nombre_completo, avatar_url),
          mentor:mentor_id(id, nombre_completo, avatar_url)
        `)
        .or(`and(estudiante_id.eq.${userId},mentor_id.eq.${otherUserId}),and(mentor_id.eq.${userId},estudiante_id.eq.${otherUserId})`)
        .in('estado', ['Pendiente', 'Activa'])
        .order('fecha_solicitud', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setMentoriaContext(data);
    };
    fetchMentoria();
  }, [channel?.cid, userId, otherUserId]);

  if (!channel) return null;

  const participant = getParticipantData(otherMember?.user, profile, mentoriaContext, userId);
  const displayName = participant.displayName;
  const avatarUrl = participant.avatar_url;
  const initials = participant.initials;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-9 h-9 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
          {mentoriaContext && (
            <p className="text-[10px] text-gray-500 truncate">
              {mentoriaContext.estado === 'Activa'
                ? `Mentoría activa: ${mentoriaContext.materia || 'General'}`
                : `Esperando confirmación del ${esMentor ? 'estudiante' : 'mentor'}...`}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-medium">En línea</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-red-600 font-medium">Sin conexión</span>
                </>
              )}
              {pendingCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Opciones">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => { setShowProfileModal(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" /> Ver perfil
              </button>
              <button
                onClick={async () => {
                  try {
                    if (mutedChats.has(channel.cid)) {
                      await channel.unmute();
                      const newMuted = new Set(mutedChats);
                      newMuted.delete(channel.cid);
                      setMutedChats(newMuted);
                    } else {
                      await channel.mute();
                      const newMuted = new Set(mutedChats);
                      newMuted.add(channel.cid);
                      setMutedChats(newMuted);
                    }
                  } catch (err) {
                    console.error('Error toggling mute:', err);
                  }
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BellOff className="w-4 h-4 text-gray-400" /> {mutedChats.has(channel.cid) ? 'Activar notificaciones' : 'Silenciar notificaciones'}
              </button>
              <button
                onClick={() => { setShowClearChatModal(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gray-400" /> Vaciar chat
              </button>
              <button
                onClick={() => { setChatBlocked(!chatBlocked); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Ban className="w-4 h-4 text-gray-400" /> {chatBlocked ? 'Desbloquear contacto' : 'Bloquear contacto'}
              </button>
              {setShowFinalizarModal && (
                <button
                  onClick={() => { setShowFinalizarModal(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                >
                  <CheckCircle className="w-4 h-4 text-amber-600" /> Finalizar consulta
                </button>
              )}
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => { setShowDeleteChatModal(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 text-red-400" /> Eliminar chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RightPanelContent = ({ CustomAttachment, chatBlocked, setChatBlocked, setShowCallModal, setShowProfileModal, setShowClearChatModal, setShowDeleteChatModal, setShowFinalizarModal, mutedChats, setMutedChats, uploadError, onBackClick, esMentor, userId, mentoriaBlockedMsg }) => {
  const { channel } = useChatContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updatePending = () => setPendingCount(getOfflineQueue().length);
    updatePending();

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineMessages();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineMessages = useCallback(async () => {
    if (!channel || !isOnline) return;
    const queue = getOfflineQueue();
    for (const msg of queue) {
      try {
        await channel.sendMessage({ text: msg.text });
        removeFromOfflineQueue(msg.id);
      } catch (e) {
        console.error('Sync failed for:', msg.id, e);
        break;
      }
    }
    setPendingCount(getPendingCount());
  }, [channel, isOnline]);

  useEffect(() => {
    if (isOnline) syncOfflineMessages();
  }, [isOnline, syncOfflineMessages]);

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Selecciona un chat para empezar</p>
        </div>
      </div>
    );
  }

  return (
    <Channel>
      <WithComponents overrides={{ Attachment: CustomAttachment, EmojiPicker: CustomEmojiPicker, SendButton: CustomSendButton }}>
        <Window>
          <ChatHeader
            onBackClick={onBackClick}
            setShowCallModal={setShowCallModal}
            chatBlocked={chatBlocked}
            setChatBlocked={setChatBlocked}
            setShowProfileModal={setShowProfileModal}
            setShowClearChatModal={setShowClearChatModal}
            setShowDeleteChatModal={setShowDeleteChatModal}
            setShowFinalizarModal={setShowFinalizarModal}
            mutedChats={mutedChats}
            setMutedChats={setMutedChats}
            isOnline={isOnline}
            pendingCount={pendingCount}
            esMentor={esMentor}
            userId={userId}
          />
          <MessageList />
          {chatBlocked && (
            <div className="border-t border-gray-200 p-4 bg-white text-center text-sm text-gray-400">
              {mentoriaBlockedMsg || 'Chat bloqueado. Desbloquea desde el menú de opciones.'}
            </div>
          )}
          {uploadError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-700 text-center">
              {uploadError}
            </div>
          )}
          {!chatBlocked && <MessageComposer />}
        </Window>
      </WithComponents>
    </Channel>
  );
};

const messageBubbleStyle = `
  .str-chat__message--me .str-chat__message-inner .str-chat__message-bubble {
    background-color: #0f2a5c !important;
    border: none !important;
    border-radius: 16px 16px 4px 16px !important;
    padding-bottom: 20px !important;
  }
  .str-chat__message--me .str-chat__message-inner .str-chat__message-bubble p,
  .str-chat__message--me .str-chat__message-inner .str-chat__message-bubble .str-chat__message-text {
    color: #FFFFFF !important;
    font-size: 0.875rem !important;
    line-height: 1.25rem !important;
  }
  .str-chat__message--other .str-chat__message-inner .str-chat__message-bubble {
    background-color: #FFFFFF !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 16px 16px 16px 4px !important;
    padding-bottom: 20px !important;
  }
  .str-chat__message--other .str-chat__message-inner .str-chat__message-bubble p,
  .str-chat__message--other .str-chat__message-inner .str-chat__message-bubble .str-chat__message-text {
    color: #1F2937 !important;
    font-size: 0.875rem !important;
    line-height: 1.25rem !important;
  }
  .str-chat__message-data {
    position: absolute !important;
    bottom: 2px !important;
    right: 10px !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
  }
  .str-chat__message-data-timestamp {
    font-size: 10px !important;
  }
  .str-chat__message--me .str-chat__message-data-timestamp {
    color: rgba(255, 255, 255, 0.65) !important;
  }
  .str-chat__message--other .str-chat__message-data-timestamp {
    color: #9CA3AF !important;
  }
  .str-chat__message-simple-status-read-by {
    font-size: 10px !important;
    color: #60A5FA !important;
  }
  .str-chat__send-button:hover {
    background-color: #0b1d42 !important;
    border-radius: 8px !important;
  }
  .str-chat__message-emoji {
    font-size: 2.25rem !important;
  }
  .str-chat__message-attachment-card {
    border-radius: 12px !important;
  }
  .str-chat__channel-list-messenger__header {
    display: none !important;
  }
  .str-chat__channel-list-messenger {
    border: none !important;
  }
  .str-chat__channel-preview-messenger {
    border: none !important;
  }
  .str-chat__message-composer__additional-actions {
    order: -1 !important;
  }
  .str-chat__message-composer {
    gap: 12px !important;
  }
  .str-chat__message-composer .str-chat__message-composer__send-button {
    margin-left: 12px !important;
  }
`;

export default function MensajesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatBlocked, setChatBlocked] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFileType, setPendingFileType] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [fileMessageText, setFileMessageText] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [imageViewer, setImageViewer] = useState(null);
  const [mutedChats, setMutedChats] = useState(new Set());
  const [contactProfile, setContactProfile] = useState(null);
  const location = useLocation();
  const channelFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('channel') || null;
  }, [location.search]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const initChatRef = useRef(null);
  const [mentoriaBlockedMsg, setMentoriaBlockedMsg] = useState('');
  // Trigger para refrescar ChannelList cuando se crea un canal nuevo
  const [channelListRefresh, setChannelListRefresh] = useState(0);

  const handleChannelSelectedFromUrl = useCallback(() => {
    setChannelListRefresh(prev => prev + 1);
  }, []);

  const esMentor = user?.rol === 'Mentor' || user?.user_metadata?.rol === 'Mentor';

  // Refrescar ChannelList cuando se navega con un channelId nuevo (canal recién creado)
  useEffect(() => {
    if (channelFromUrl && chatClient) {
      setChannelListRefresh(prev => prev + 1);
    }
  }, [channelFromUrl, chatClient]);

  useEffect(() => {
    if (!activeChannel || !user) return;
    setMentoriaBlockedMsg('');
    const members = Object.values(activeChannel.state?.members || {});
    const otherMember = members.find(m => m.user?.id !== user.id);
    const otherUserId = otherMember?.user?.id;
    if (!otherUserId) return;

    const checkMentoria = async () => {
      const { data } = await supabase
        .from('mentorias')
        .select('estado')
        .or(`and(estudiante_id.eq.${user.id},mentor_id.eq.${otherUserId}),and(mentor_id.eq.${user.id},estudiante_id.eq.${otherUserId})`)
        .in('estado', ['Pendiente', 'Activa'])
        .order('fecha_solicitud', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && data.estado === 'Pendiente' && !esMentor) {
        setChatBlocked(true);
        setMentoriaBlockedMsg('Espera a que el mentor acepte tu solicitud para poder chatear.');
      } else if (data && data.estado === 'Activa' && chatBlocked && mentoriaBlockedMsg) {
        setChatBlocked(false);
        setMentoriaBlockedMsg('');
      }
    };
    checkMentoria();
  }, [activeChannel?.cid, user?.id]);

  const handleBackClick = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      setErrorMsg('El chat está temporalmente fuera de servicio. Por favor, recarga la página en unos segundos.');
      return;
    }
    setRetryCount(c => c + 1);
    setErrorMsg('El chat está iniciando... Por favor, espera unos segundos.');
    initChatRef.current?.();
  }, [retryCount, maxRetries]);

  useEffect(() => {
    if (!user) return;

    const state = { cancelled: false, client: null, timeoutId: null };

    const initChat = async () => {
      setErrorMsg('');
      setLoading(true);
      const client = new StreamChat(API_KEY);
      state.client = client;

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          navigate('/login');
          return;
        }

        const streamUserId = authUser.id;
        const displayName = user?.nombre || authUser.email || 'Usuario';

        // Check sessionStorage for cached token
        const storageKey = `stream_token_${streamUserId}`;
        let token = null;
        
        try {
          const cached = sessionStorage.getItem(storageKey);
          if (cached) {
            const { token: cachedToken, expiresAt } = JSON.parse(cached);
            // Check if token is still valid (with 5 min buffer)
            if (cachedToken && expiresAt && Date.now() < expiresAt - 5 * 60 * 1000) {
              token = cachedToken;
              console.log('[Stream] Using cached token');
            }
          }
        } catch (e) {
          console.warn('[Stream] Failed to parse cached token:', e);
        }

        // Fetch new token if no valid cached token
        if (!token) {
          console.log('[Stream] Fetching new token from Edge Function...');
          const fetchStart = Date.now();
          const session = await supabase.auth.getSession();
          const accessToken = session.data.session?.access_token;
          if (!accessToken) throw new Error('No hay sesión activa');

          const response = await fetch('https://baelhtrbulusonjbdtor.supabase.co/functions/v1/generate-stream-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ userId: streamUserId })
          });

          console.log('[Stream] Edge Function response:', response.status, `(${Date.now() - fetchStart}ms)`);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
          }

          const tokenData = await response.json();
          token = tokenData.token;
          console.log('[Stream] Token received, length:', token?.length);

          // Cache token with expiration (decode JWT to get exp)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresAt = payload.exp ? payload.exp * 1000 : Date.now() + 3600000; // JWT exp is in seconds, fallback 1 hour
            sessionStorage.setItem(storageKey, JSON.stringify({ token, expiresAt }));
            console.log('[Stream] Cached new token, expires:', expiresAt ? new Date(expiresAt).toISOString() : 'unknown');
          } catch (e) {
            console.warn('[Stream] Failed to cache token:', e);
          }
        }

        await Promise.race([
          client.connectUser(
            { id: streamUserId, name: displayName, image: '' },
            token
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout (30s)')), 30000)
          )
        ]);

        console.log('[Stream] connectUser successful');

        if (state.cancelled) return;

        setChatClient(client);
        setLoading(false);
      } catch (err) {
        console.error('Stream Chat init error:', err);
        if (!state.cancelled) {
          setErrorMsg(err?.message || err?.toString() || 'Error desconocido');
          setLoading(false);
        }
      }

      state.timeoutId = setTimeout(() => {
        if (!state.cancelled) {
          setErrorMsg('Tiempo de espera agotado (40s)');
          setLoading(false);
        }
      }, 40000);
    };

    initChatRef.current = initChat;

    initChat();

    return () => {
      state.cancelled = true;
      if (state.timeoutId) clearTimeout(state.timeoutId);
      if (state.client) state.client.disconnectUser();
    };
  }, [user?.id, navigate]);

  useEffect(() => {
    if (showProfileModal && activeChannel) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        try {
          const members = Object.values(activeChannel.state?.members || {});
          const otherMember = members.find(m => m.user?.id !== user?.id);
          const otherUserId = otherMember?.user?.id;
          if (otherUserId) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', otherUserId)
              .maybeSingle();
            setContactProfile(data || { id: otherUserId, nombre_completo: otherMember?.user?.name });
          }
        } catch (e) {
          console.error('Error fetching profile:', e);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    } else if (!showProfileModal) {
      setContactProfile(null);
    }
  }, [showProfileModal, activeChannel, user?.id]);

  const handleClearChat = async () => {
    try {
      if (activeChannel) {
        await activeChannel.truncate();
      }
      setUploadError('Chat vaciado correctamente');
      setTimeout(() => setUploadError(''), 3000);
    } catch (err) {
      console.error('Error clearing chat:', err);
      setUploadError(err?.message || 'Error al vaciar el chat');
      setTimeout(() => setUploadError(''), 5000);
    }
    setShowClearChatModal(false);
  };

  const handleDeleteChat = async () => {
    try {
      if (activeChannel) {
        try {
          await activeChannel.delete();
        } catch {
          await activeChannel.hide();
        }
        setActiveChannel(null);
        setShowDeleteChatModal(false);
      }
    } catch (err) {
      console.error('Error deleting channel:', err);
      setUploadError(err?.message || 'Error al eliminar el chat');
      setTimeout(() => setUploadError(''), 5000);
      setShowDeleteChatModal(false);
    }
  };

  const handleFinalizarConsulta = async () => {
    try {
      if (activeChannel && user) {
        const members = Object.values(activeChannel.state?.members || {});
        const otherMember = members.find(m => m.user?.id !== user.id);
        const otherUserId = otherMember?.user?.id;

        if (otherUserId) {
          await supabase
            .from('mentorias')
            .update({
              estado: 'Finalizada',
              fecha_completada: new Date().toISOString()
            })
            .or(`and(estudiante_id.eq.${user.id},mentor_id.eq.${otherUserId}),and(mentor_id.eq.${user.id},estudiante_id.eq.${otherUserId})`)
            .in('estado', ['Pendiente', 'Activa']);
        }

        try {
          await activeChannel.hide();
        } catch (e) {
          console.warn('Error hiding channel in Stream:', e);
        }

        setActiveChannel(null);
        setChannelListRefresh(prev => prev + 1);
        setShowFinalizarModal(false);
      }
    } catch (err) {
      console.error('Error al finalizar consulta:', err);
      setUploadError(err?.message || 'Error al finalizar consulta');
      setTimeout(() => setUploadError(''), 5000);
      setShowFinalizarModal(false);
    }
  };

  const CustomAttachment = useMemo(() => {
    const Comp = (props) => {
      const { attachments } = props;
      const fileAttachments = attachments?.filter(a => a.type === 'file' || a.type === 'image');
      if (fileAttachments?.length > 0) {
        return (
          <div className="flex flex-col gap-2">
            {fileAttachments.map((att, i) => (
              <GreenCardAttachment key={i} attachment={att} onImageClick={(url) => setImageViewer(url)} />
            ))}
          </div>
        );
      }
      return <DefaultAttachment {...props} />;
    };
    return Comp;
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#0f2a5c] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Conectando al chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chatClient) {
    return (
      <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <p className="text-lg font-semibold text-gray-800 mb-2">Chat no disponible</p>
            <p className="text-sm text-gray-500 mb-2">No se pudo conectar con Stream Chat.</p>
            {errorMsg && (
              <p className="text-xs text-red-500 mb-2 bg-red-50 p-2 rounded-lg font-mono">Error: {errorMsg}</p>
            )}
            {retryCount >= maxRetries ? (
              <p className="text-xs text-gray-400 mb-4">
                El chat está temporalmente fuera de servicio. Por favor, recarga la página en unos segundos.
              </p>
            ) : retryCount > 0 ? (
              <p className="text-xs text-gray-400 mb-4">
                Intento {retryCount} de {maxRetries}...
              </p>
            ) : (
              <p className="text-xs text-gray-400 mb-4">
                El chat está iniciando... Por favor, espera unos segundos.
              </p>
            )}
            <button onClick={handleRetry}
              className="px-4 py-2 min-h-[44px] bg-[#0f2a5c] text-white rounded-lg text-sm hover:bg-[#0f2a5c]/90 transition">
              {retryCount >= maxRetries ? 'Recargar página' : 'Reintentar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleClosePreview = () => setShowDiscardModal(true);

  const handleDiscardPreview = () => {
    setShowDiscardModal(false);
    setPendingFile(null);
    setPendingFileType(null);
    setShowFilePreview(false);
    setFileMessageText('');
  };

  const handleSendFile = async () => {
    try {
      const res = await activeChannel.sendImage(pendingFile);
      const attachment = { type: 'image', image_url: res.file, fallback: pendingFile.name, created_at: new Date().toISOString() };
      const msg = fileMessageText.trim() ? { text: fileMessageText.trim(), attachments: [attachment] } : { attachments: [attachment] };
      await activeChannel.sendMessage(msg);
      setPendingFile(null);
      setPendingFileType(null);
      setShowFilePreview(false);
      setFileMessageText('');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err?.message || err?.toString() || 'Error al subir archivo');
      setTimeout(() => setUploadError(''), 5000);
    }
  };

  const handleSendVideo = async () => {
    try {
      const res = await activeChannel.sendFile(pendingFile);
      const attachment = { type: 'file', asset_url: res.file, title: pendingFile.name, file_size: pendingFile.size, mime_type: pendingFile.type, created_at: new Date().toISOString() };
      const msg = fileMessageText.trim() ? { text: fileMessageText.trim(), attachments: [attachment] } : { attachments: [attachment] };
      await activeChannel.sendMessage(msg);
      setPendingFile(null);
      setPendingFileType(null);
      setShowFilePreview(false);
      setFileMessageText('');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err?.message || err?.toString() || 'Error al subir archivo');
      setTimeout(() => setUploadError(''), 5000);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <style>{messageBubbleStyle}</style>
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col h-screen">
        <div className="px-4 lg:px-8 py-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mensajes</h1>
              <p className="text-gray-500 text-sm mt-2">Chatea con mentores y estudiantes.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Header nombreUsuario={user?.nombre || 'Usuario'} initials={user?.nombre ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'} avatarUrl={user?.avatar_url} />
            </div>
          </div>
        </div>

        <Chat client={chatClient} theme="messaging light">
          {channelFromUrl && (
            <ChannelSelector
              channelId={channelFromUrl}
              onSelect={handleChannelSelectedFromUrl}
            />
          )}
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT PANEL - CHANNEL LIST */}
            <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${activeChannel ? 'hidden md:flex' : ''}`}>
              <div className="px-4 pt-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar conversaciones..."
                    className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a5c]"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ChannelList
                  key={channelListRefresh}
                  filters={{ members: { $in: [user.id] } }}
                  sort={{ updated_at: -1, last_message_at: -1 }}
                  options={{ limit: 50, state: true }}
                  Preview={CustomChannelPreview}
                />
              </div>
            </div>

            {/* RIGHT PANEL - CHAT OR EMPTY STATE */}
            <div className={`flex-1 flex flex-col bg-white ${!activeChannel ? 'hidden md:flex' : ''}`}>
              <RightPanelContent
                CustomAttachment={CustomAttachment}
                chatBlocked={chatBlocked}
                setChatBlocked={setChatBlocked}
                setShowCallModal={setShowCallModal}
                setShowProfileModal={setShowProfileModal}
                setShowClearChatModal={setShowClearChatModal}
                setShowDeleteChatModal={setShowDeleteChatModal}
                mutedChats={mutedChats}
                setMutedChats={setMutedChats}
                uploadError={uploadError}
                esMentor={esMentor}
                userId={user?.id}
                onBackClick={() => setActiveChannel(null)}
                mentoriaBlockedMsg={mentoriaBlockedMsg}
              />
            </div>
          </div>
        </Chat>
      </div>

      {/* FILE PREVIEW MODALS */}
      {showFilePreview && pendingFile && pendingFile.type.startsWith('image/') && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
            <button onClick={handleClosePreview} className="p-2 min-h-[44px] min-w-[44px] text-gray-500 hover:text-gray-700 flex items-center justify-center">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-medium text-gray-800 truncate max-w-md">{pendingFile.name}</h2>
            <div className="w-10"></div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 overflow-auto">
            <img
              src={URL.createObjectURL(pendingFile)}
              alt="Vista previa"
              className="max-w-full max-h-[85vh] object-contain shadow-lg rounded-lg"
            />
          </div>
          <div className="p-4 bg-white border-t flex items-center gap-3">
            <input
              type="text"
              value={fileMessageText}
              onChange={(e) => setFileMessageText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSendFile()}
            />
            <button
              onClick={handleSendFile}
              className="bg-[#00a67e] text-white rounded-full p-3 min-h-[44px] min-w-[44px] shadow-lg hover:bg-[#008f6c] transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showFilePreview && pendingFile && pendingFile.type.startsWith('video/') && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
            <button onClick={handleClosePreview} className="p-2 min-h-[44px] min-w-[44px] text-gray-500 hover:text-gray-700 flex items-center justify-center">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-medium text-gray-800 truncate max-w-md">{pendingFile.name}</h2>
            <div className="w-10"></div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 overflow-auto">
            <video
              src={URL.createObjectURL(pendingFile)}
              controls
              className="max-w-full max-h-[70vh] rounded-lg shadow-md bg-black"
            />
          </div>
          <div className="p-4 bg-white border-t flex items-center gap-3">
            <input
              type="text"
              value={fileMessageText}
              onChange={(e) => setFileMessageText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSendVideo()}
            />
            <button
              onClick={handleSendVideo}
              className="bg-[#00a67e] text-white rounded-full p-3 min-h-[44px] min-w-[44px] shadow-lg hover:bg-[#008f6c] transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {pendingFile && !pendingFile.type.startsWith('image/') && !pendingFile.type.startsWith('video/') && chatClient && activeChannel && (
        <FilePreviewModal
          file={pendingFile}
          fileType={pendingFileType}
          onSend={async (text) => {
            try {
              const res = await activeChannel.sendFile(pendingFile);
              const attachment = { type: 'file', asset_url: res.file, title: pendingFile.name, file_size: pendingFile.size, mime_type: pendingFile.type, created_at: new Date().toISOString() };
              const msg = text.trim() ? { text: text.trim(), attachments: [attachment] } : { attachments: [attachment] };
              await activeChannel.sendMessage(msg);
              setPendingFile(null);
              setPendingFileType(null);
              setShowFilePreview(false);
            } catch (err) {
              console.error('Upload error:', err);
              setUploadError(err?.message || err?.toString() || 'Error al subir archivo');
              setTimeout(() => setUploadError(''), 5000);
            }
          }}
          onClose={handleClosePreview}
        />
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Perfil del contacto</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#0f2a5c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contactProfile ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(contactProfile.nombre_completo || contactProfile.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="text-center w-full">
                  <p className="text-base font-semibold text-gray-800">{contactProfile.nombre_completo || contactProfile.name || 'Sin nombre'}</p>
                  <p className="text-sm text-gray-500 mt-1">{contactProfile.email || contactProfile.correo || ''}</p>
                </div>
                {contactProfile.carrera && (
                  <div className="w-full bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Carrera</p>
                    <p className="text-sm font-medium text-gray-700">{contactProfile.carrera}</p>
                  </div>
                )}
                {contactProfile.ciclo && (
                  <div className="w-full bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Ciclo</p>
                    <p className="text-sm font-medium text-gray-700">{contactProfile.ciclo}</p>
                  </div>
                )}
                {contactProfile.rol && (
                  <div className="w-full bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Rol</p>
                    <p className="text-sm font-medium text-gray-700 capitalize">{contactProfile.rol === 'Mentor' ? 'Mentor' : contactProfile.rol === 'Senior' ? 'Mentor senior' : contactProfile.rol}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No se encontró información del contacto.</p>
            )}
          </div>
        </div>
      )}

      {showClearChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowClearChatModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Vaciar chat</h3>
            <p className="text-sm text-gray-600 mb-6">¿Seguro que quieres eliminar todos los mensajes de este chat? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearChatModal(false)}
                className="flex-1 px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleClearChat}
                className="flex-1 px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteChatModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Eliminar chat</h3>
            <p className="text-sm text-gray-600 mb-6">¿Seguro que quieres eliminar este chat permanentemente? Todos los mensajes se perderán.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteChatModal(false)}
                className="flex-1 px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleDeleteChat}
                className="flex-1 px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalizarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFinalizarModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Finalizar consulta</h3>
            <p className="text-sm text-gray-600 mb-6">¿Estás seguro de que quieres finalizar esta consulta?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowFinalizarModal(false)}
                className="flex-1 px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleFinalizarConsulta}
                className="flex-1 px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCallModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Comunicarte</h3>
              <button onClick={() => setShowCallModal(false)} className="p-1 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => {
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                if (isMobile) { window.location.href = 'tel:+51999999999'; }
                else { alert('Funcionalidad de llamadas de voz disponible en la versión 2.0'); }
                setShowCallModal(false);
              }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Phone className="w-5 h-5 text-[#0f2a5c]" /> Llamada de voz
              </button>
              <button onClick={() => {
                window.open('https://meet.google.com/new', '_blank');
                setShowCallModal(false);
              }}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <Video className="w-5 h-5 text-[#0f2a5c]" /> Videollamada
              </button>
            </div>
            <div className="mt-4">
              <button onClick={() => setShowCallModal(false)}
                className="w-full px-4 py-2 min-h-[44px] text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDiscardModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" onClick={() => setShowDiscardModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[95%] max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-gray-800 text-center mb-5">¿Quieres descartar la selección?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDiscardModal(false)}
                className="flex-1 px-4 py-2 min-h-[44px] text-[#008f6c] font-medium hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleDiscardPreview}
                className="flex-1 px-4 py-2 min-h-[44px] bg-[#00a67e] text-white font-bold rounded-full hover:bg-[#008f6c] transition-colors">
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {imageViewer && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setImageViewer(null)}>
          <button onClick={() => setImageViewer(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors">
            <X className="w-8 h-8" />
          </button>
          <img src={imageViewer} className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

