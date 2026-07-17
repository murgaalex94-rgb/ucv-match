import React, { useState, useEffect, useMemo } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageComposer,
  WithComponents,
  Attachment as DefaultAttachment,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import {
  Bell, BellOff, Search, ChevronDown, MoreHorizontal,
  Phone, Video, X, Info, Send,
  FileText, Image, Video as VideoIcon,
  Download, ExternalLink, File, Trash2, Ban, Mail, MessageSquare, Reply, Table, Monitor, Archive, Pin, Pencil, Clipboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import streamTokens from '../data/stream-tokens.json';

const API_KEY = '6w2ddzpb7xaw';

const defaultConversations = [
  { id: 1, name: 'Carlos Gómez', avatar: 'CG', lastMessage: 'Perfecto, entonces quedamos para el viernes a las 5pm.', time: '10:32', unread: 2, online: true, subject: 'Mentoría Matemática II' },
  { id: 2, name: 'María Fernández', avatar: 'MF', lastMessage: 'Te comparto los apuntes de álgebra lineal.', time: '09:15', unread: 0, online: false, subject: 'Mentoría Álgebra Lineal' },
  { id: 3, name: 'José Ramírez', avatar: 'JR', lastMessage: 'Revisa el código que te compartí en el repo.', time: 'Ayer', unread: 1, online: true, subject: 'Mentoría Programación Java' },
  { id: 4, name: 'Ana Torres', avatar: 'AT', lastMessage: '¿Podemos adelantar la sesión de esta semana?', time: 'Ayer', unread: 0, online: false, subject: 'Mentoría Python DS' },
  { id: 5, name: 'Roberto Silva', avatar: 'RS', lastMessage: 'Excelente trabajo en el proyecto final.', time: 'Lun', unread: 0, online: true, subject: 'Mentoría JavaScript' },
  { id: 6, name: 'Soporte UCV Match', avatar: 'SU', lastMessage: 'Tu solicitud de mentoría ha sido aprobada.', time: 'Lun', unread: 0, online: true, subject: 'Soporte' }
];

// ==============================================
// 1. FUNCIONES DE METADATOS DE ARCHIVOS
// ==============================================
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

// ==============================================
// 3. TARJETA VERDE DE ARCHIVO (PDF, Word, PPT, etc.)
// ==============================================
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
      {/* PARTE SUPERIOR (BLANCA) - EL ICONO */}
      <div className="h-24 bg-white flex items-center justify-center">
        {getFileIcon(file)}
      </div>
      {/* PARTE MEDIA (VERDE CLARO) - EL NOMBRE Y TAMAÑO */}
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
      {/* PARTE INFERIOR (BOTONES) */}
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

// ==============================================
// 4. MODAL DE VISTA PREVIA DE ARCHIVOS NO VISUALES (PDF, Word, etc.)
// ==============================================
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
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-sm font-medium text-gray-800 truncate max-w-[60%] text-center">{file?.name}</span>
        <div className="w-8" />
      </div>

      {/* Preview area */}
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

      {/* Bottom bar */}
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






// ==============================================
// 6. COMPONENTE PRINCIPAL
// ==============================================
const messageBubbleStyle = `
  .str-chat__message--me .str-chat__message-inner .str-chat__message-bubble,
  .str-chat__message--other .str-chat__message-inner .str-chat__message-bubble {
    border: none !important;
  }
  .str-chat__message-emoji {
    font-size: 2.25rem !important;
  }
`;

export default function MensajesPage() {
  const { user } = useAuth();
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
  const [conversations, setConversations] = useState(defaultConversations);
  const [mutedChats, setMutedChats] = useState(new Set());
  

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === (activeChannel ? parseInt(activeChannel.id.replace('channel-', '')) : 1)) || conversations[0];

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && imageViewer) setImageViewer(null); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [imageViewer]);



  useEffect(() => {
    const client = new StreamChat(API_KEY);
    let cancelled = false;

    const initChat = async () => {
      try {
        const streamUserId = 'alex_murga';
        const displayName = user?.nombre || 'Alex Murga';

        const token = streamTokens[streamUserId];
        if (!token) throw new Error('No token found for stream user');

        await Promise.race([
          client.connectUser(
            { id: streamUserId, name: displayName, image: '' },
            token
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 15000)
          )
        ]);

        if (cancelled) return;

        const firstConv = conversations[0];
        const firstChannel = client.channel('messaging', `channel-${firstConv.id}`, {
          name: firstConv.name,
          members: ['alex_murga'],
          subject: firstConv.subject,
        });

        await Promise.race([
          firstChannel.watch(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Channel watch timeout')), 10000)
          )
        ]);

        if (cancelled) return;

        setChatClient(client);
        setActiveChannel(firstChannel);
        setLoading(false);
      } catch (err) {
        console.error('Stream Chat init error:', err);
        if (!cancelled) {
          setErrorMsg(err?.message || err?.toString() || 'Error desconocido');
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setErrorMsg('Tiempo de espera agotado (20s)');
        setLoading(false);
      }
    }, 20000);

    initChat();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      client.disconnectUser();
    };
  }, [user]);

  const handleSelectConversation = async (conv) => {
    if (!chatClient) return;
    try {
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c))
      );
      const channel = chatClient.channel('messaging', `channel-${conv.id}`, {
        name: conv.name,
        members: ['alex_murga'],
        subject: conv.subject,
        own_capabilities: ['send-message', 'update-own-message', 'delete-own-message'],
      });
      await channel.watch();
      setActiveChannel(channel);
    } catch (err) {
      console.error('Error selecting channel:', err);
    }
  };

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
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Mensajes</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 cursor-pointer">
              <div className="w-8 h-8 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.nombre ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AM'}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.nombre || 'Alex Murga'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                    activeConv.id === conv.id ? 'bg-[#0f2a5c]/5 border-l-2 border-[#0f2a5c]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{conv.avatar}</div>
                    {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800 text-sm truncate">{conv.name}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{conv.subject}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-xs text-gray-500 truncate flex-1">{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">{conv.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white">
            <Chat client={chatClient} theme="messaging light">
              {activeChannel && (
                <Channel channel={activeChannel}>
                  <WithComponents overrides={{
                    Attachment: CustomAttachment,
                  }}>
                  <Window>
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{activeConv.avatar}</div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{activeConv.name}</p>
                          <p className="text-xs text-green-600">{activeConv.online ? 'En línea' : 'Desconectado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowCallModal(true)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><Phone className="w-4 h-4" /></button>
                        <button onClick={() => setShowCallModal(true)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><Video className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f5f7fa]" onContextMenu={(e) => e.preventDefault()}>
                      <MessageList 
                        onUserClick={() => setShowProfileModal(true)}
                        messageActions={({ editMessage, deleteMessage, isMyMessage }) =>
                          isMyMessage ? [editMessage, deleteMessage] : []
                        }
                      />
                    </div>
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
                    {!chatBlocked && (
                      <MessageComposer />
                    )}
                  </Window>
                  </WithComponents>
                  </Channel>
              )}
            </Chat>
          </div>
        </div>
      </div>

      {/* ===== MODALES DE ARCHIVOS (Imágenes, Videos, otros) ===== */}
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

      {showCallModal && activeConv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCallModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Comunicarte con {activeConv.name}</h3>
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

      {showProfileModal && activeConv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Perfil del mentor</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-[#0f2a5c] rounded-full flex items-center justify-center text-xl font-bold text-white">{activeConv.avatar}</div>
              <p className="text-lg font-semibold text-gray-800">{activeConv.name}</p>
              <p className="text-sm text-gray-500">{activeConv.subject}</p>
              <span className={`text-xs font-medium ${activeConv.online ? 'text-green-600' : 'text-gray-400'}`}>
                {activeConv.online ? 'En línea' : 'Desconectado'}
              </span>
              <button onClick={() => setShowProfileModal(false)}
                className="mt-2 px-6 py-2 bg-[#0f2a5c] text-white rounded-full text-sm font-medium hover:bg-[#0f2a5c]/90 transition-colors">
                Cerrar
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