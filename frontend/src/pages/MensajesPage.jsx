import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import EmojiPickerReact from 'emoji-picker-react';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || '3mgv7c3pnrhu';

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
        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
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
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f2a5c]"
          autoFocus
        />
        <button onClick={handleSend} className="p-3 bg-[#00a67e] text-white rounded-full hover:bg-[#008f6c] transition-colors shadow-md">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ActiveChannelSync = ({ setActiveChannel }) => {
  const { channel } = useChatContext();
  useEffect(() => { setActiveChannel(channel); }, [channel, setActiveChannel]);
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

const ChatHeader = ({
  onBackClick,
  setShowCallModal,
  chatBlocked, setChatBlocked,
  setShowProfileModal,
  setShowClearChatModal,
  setShowDeleteChatModal,
  mutedChats, setMutedChats,
}) => {
  const { channel } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!channel) return null;

  const members = Object.values(channel.state?.members || {});
  const otherMember = members.find(m => m.user?.id !== channel.state?.members?.[Object.keys(channel.state?.members || {})[0]]?.user?.id);
  const displayName = channel.data?.name || otherMember?.user?.name || 'Chat';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onBackClick && (
          <button onClick={onBackClick} className="md:hidden p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors" title="Volver">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        )}
        <div className="w-9 h-9 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
          <p className="text-xs text-gray-400">En línea</p>
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
                onClick={() => {
                  const newMuted = new Set(mutedChats);
                  if (newMuted.has(channel.cid)) newMuted.delete(channel.cid);
                  else newMuted.add(channel.cid);
                  setMutedChats(newMuted);
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

const RightPanelContent = ({ CustomAttachment, chatBlocked, setChatBlocked, setShowCallModal, setShowProfileModal, setShowClearChatModal, setShowDeleteChatModal, mutedChats, setMutedChats, uploadError, onBackClick }) => {
  const { channel } = useChatContext();

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
            mutedChats={mutedChats}
            setMutedChats={setMutedChats}
          />
          <MessageList />
          {chatBlocked && (
            <div className="border-t border-gray-200 p-4 bg-white text-center text-sm text-gray-400">
              Chat bloqueado. Desbloquea desde el menú de opciones.
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
  .str-chat__message--me .str-chat__message-inner .str-chat__message-bubble,
  .str-chat__message--other .str-chat__message-inner .str-chat__message-bubble {
    border: none !important;
  }
  .str-chat__message-emoji {
    font-size: 2.25rem !important;
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
  const [noChannels, setNoChannels] = useState(false);
  const [contactProfile, setContactProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && imageViewer) setImageViewer(null); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [imageViewer]);

  useEffect(() => {
    if (!user) return;

    const state = { cancelled: false, client: null, timeoutId: null };

    const initChat = async () => {
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
            const expiresAt = payload.exp * 1000; // JWT exp is in seconds
            sessionStorage.setItem(storageKey, JSON.stringify({ token, expiresAt }));
            console.log('[Stream] Cached new token, expires:', new Date(expiresAt).toISOString());
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

        try {
          const filter = { members: { $in: [streamUserId] } };
          const channels = await client.queryChannels(filter, {}, { limit: 1 });
          if (channels.length === 0) {
            setNoChannels(true);
          }
        } catch (queryErr) {
          console.log('Error querying channels:', queryErr);
        }
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
              .single();
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
        await activeChannel.delete();
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
            <p className="text-xs text-gray-400 mb-4">Revisa que la API Key y Secret Key sean correctas y que tu App de Stream esté activa en <span className="font-medium">getstream.io</span></p>
            <button onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0f2a5c] text-white rounded-lg text-sm hover:bg-[#0f2a5c]/90 transition">
              Reintentar
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
          <ActiveChannelSync setActiveChannel={setActiveChannel} />
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT PANEL - CHANNEL LIST */}
            <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 ${activeChannel ? 'hidden md:block' : ''}`}>
              <ChannelList
                filters={{ members: { $in: [user.id] } }}
                options={{ limit: 5 }}
              />
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
                onBackClick={() => setActiveChannel(null)}
              />
            </div>
          </div>
        </Chat>
      </div>

      {/* FILE PREVIEW MODALS */}
      {showFilePreview && pendingFile && pendingFile.type.startsWith('image/') && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
            <button onClick={handleClosePreview} className="p-2 text-gray-500 hover:text-gray-700">
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
              className="bg-[#00a67e] text-white rounded-full p-3 shadow-lg hover:bg-[#008f6c] transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showFilePreview && pendingFile && pendingFile.type.startsWith('video/') && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
            <button onClick={handleClosePreview} className="p-2 text-gray-500 hover:text-gray-700">
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
              className="bg-[#00a67e] text-white rounded-full p-3 shadow-lg hover:bg-[#008f6c] transition"
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
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Perfil del contacto</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
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
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Vaciar chat</h3>
            <p className="text-sm text-gray-600 mb-6">¿Seguro que quieres eliminar todos los mensajes de este chat? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearChatModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleClearChat}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteChatModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Eliminar chat</h3>
            <p className="text-sm text-gray-600 mb-6">¿Seguro que quieres eliminar este chat permanentemente? Todos los mensajes se perderán.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteChatModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleDeleteChat}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCallModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Comunicarte</h3>
              <button onClick={() => setShowCallModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
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
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDiscardModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" onClick={() => setShowDiscardModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold text-gray-800 text-center mb-5">¿Quieres descartar la selección?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDiscardModal(false)}
                className="flex-1 px-4 py-2 text-[#008f6c] font-medium hover:bg-gray-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleDiscardPreview}
                className="flex-1 px-4 py-2 bg-[#00a67e] text-white font-bold rounded-full hover:bg-[#008f6c] transition-colors">
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
