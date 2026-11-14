import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  FileText,
  FolderOpen,
  Send,
  Download,
  Hand,
  Wifi,
  PanelRightClose,
  PanelRightOpen,
  Clock,
  Check,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Volume2,
  AlertCircle,
  UserPlus,
  PenTool,
  Copy,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ClassDoc,
  ClassFileDoc,
  ClassFileType,
  RoomMessageDoc,
  RoomParticipant,
} from '../types';
import { formatLocalizedDate, formatLocalizedNumber } from '../i18n/translations';
import { OperationType, db, handleFirestoreError } from '../lib/firebase';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { RoomWhiteboard } from '../components/meeting/RoomWhiteboard';

interface JitsiDeviceEntry {
  deviceId?: string;
  label?: string;
  kind?: string;
}

interface JitsiAvailableDevices {
  audioInput?: JitsiDeviceEntry[];
  audioOutput?: JitsiDeviceEntry[];
  videoInput?: JitsiDeviceEntry[];
}

interface JitsiCurrentDevices {
  audioInput?: JitsiDeviceEntry;
  audioOutput?: JitsiDeviceEntry;
  videoInput?: JitsiDeviceEntry;
}

interface JitsiMeetAPIInstance {
  executeCommand: (command: string, ...args: unknown[]) => void;
  addListener: (event: string, listener: (payload: Record<string, unknown>) => void) => void;
  removeAllListeners?: (event: string) => void;
  getAvailableDevices?: () => Promise<JitsiAvailableDevices>;
  getCurrentDevices?: () => Promise<JitsiCurrentDevices>;
  setAudioInputDevice?: (deviceLabel: string, deviceId?: string) => Promise<void>;
  setVideoInputDevice?: (deviceLabel: string, deviceId?: string) => Promise<void>;
  setAudioOutputDevice?: (deviceLabel: string, deviceId?: string) => Promise<void>;
  isAudioMuted?: () => Promise<boolean>;
  isVideoMuted?: () => Promise<boolean>;
  dispose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiMeetAPIInstance;
  }
}

const JITSI_ALLOWED_BUTTONS = [
  'camera',
  'microphone',
  'desktop',
  'chat',
  'whiteboard',
  'invite',
  'fullscreen',
  'settings',
  'hangup',
];

const FILE_TYPES: ClassFileType[] = ['PDF', 'Slides', 'Dataset', 'Worksheet', 'Link'];

type SidebarTab = 'participants' | 'chat' | 'notes' | 'files';

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export function MeetingRoomPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId?: string }>();
  const {
    firebaseUser,
    classes,
    classesLoading,
    students,
    createStudent,
    activeMeetingId,
    setActiveMeetingId,
    user,
    settings,
    updateSettings,
    meetingNotes,
    saveMeetingNote,
    language,
    isRtl,
    t,
  } = useApp();

  const targetClassId = classId || activeMeetingId || classes[0]?.id || '';
  const fallbackClass =
    classes.find((c) => c.id === targetClassId) ?? classes[0] ?? null;

  const [firestoreClass, setFirestoreClass] = useState<ClassDoc | null>(null);

  useEffect(() => {
    if (classId && classId !== activeMeetingId) {
      setActiveMeetingId(classId);
    }
  }, [classId, activeMeetingId, setActiveMeetingId]);

  // Listen directly to the selected Firestore `classes/{classId}` document
  useEffect(() => {
    if (!firebaseUser || !targetClassId) {
      setFirestoreClass(null);
      return;
    }

    const classPath = `classes/${targetClassId}`;
    const unsubscribe = onSnapshot(
      doc(db, 'classes', targetClassId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setFirestoreClass(null);
          return;
        }
        const data = snapshot.data();
        setFirestoreClass({
          id: snapshot.id,
          ownerId: data.ownerId,
          code: data.code,
          title: data.title,
          discipline: data.discipline,
          teacherId: data.teacherId || '',
          instructorName: data.instructorName || '',
          instructorTitle: data.instructorTitle || '',
          instructorAvatar: data.instructorAvatar || '',
          scheduleSummary: data.scheduleSummary || '',
          roomCode: data.roomCode || '',
          totalSessions: Number(data.totalSessions || 0),
          completedSessions: Number(data.completedSessions || 0),
          enrolledCount: Number(data.enrolledCount || 0),
          description: data.description || '',
          syllabusTopics: Array.isArray(data.syllabusTopics) ? data.syllabusTopics : [],
          isLiveNow: Boolean(data.isLiveNow),
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, classPath);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser, targetClassId]);

  const activeClass = firestoreClass ?? fallbackClass;
  const activeClassId = activeClass?.id ?? '';

  const jitsiContainerRef = useRef<HTMLDivElement | null>(null);
  const jitsiApiRef = useRef<JitsiMeetAPIInstance | null>(null);

  // Media controls & Jitsi lifecycle state
  const [cameraOn, setCameraOn] = useState(!settings.cameraOffOnJoin);
  const [micOn, setMicOn] = useState(!settings.autoMuteOnJoin);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [jitsiReady, setJitsiReady] = useState(false);
  const [jitsiError, setJitsiError] = useState<string | null>(null);

  // Real Jitsi remote participants
  const [remoteParticipants, setRemoteParticipants] = useState<RoomParticipant[]>([]);

  // Real Firestore messages & files for this class
  const [messages, setMessages] = useState<RoomMessageDoc[]>([]);
  const [files, setFiles] = useState<ClassFileDoc[]>([]);

  // Hardware devices & in-room audio/video testing state
  const [mics, setMics] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [cams, setCams] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [speakers, setSpeakers] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [avStatusMessage, setAvStatusMessage] = useState<string | null>(null);
  const [avErrorMessage, setAvErrorMessage] = useState<string | null>(null);
  const [testingMic, setTestingMic] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  // Layout & sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>('participants');
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<ClassFileDoc | null>(null);
  const [addFileOpen, setAddFileOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form drafts
  const [chatDraft, setChatDraft] = useState('');
  const [participantQuery, setParticipantQuery] = useState('');
  const [noteSavedAt, setNoteSavedAt] = useState<string | null>(null);

  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<ClassFileType>('PDF');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileSummary, setNewFileSummary] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');

  // Live meeting elapsed timer starting at 00:00:00
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    setElapsedSeconds(0);
    if (!activeClassId) return;
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [activeClassId]);

  const refreshMediaDevices = useCallback(
    async (requestPermissionIfNeeded = false) => {
      setDevicesLoading(true);
      setAvErrorMessage(null);

      const mergeList = (
        primary: Array<{ deviceId?: string; label?: string }>,
        secondary: Array<{ deviceId?: string; label?: string }>,
        fallbackPrefix: string
      ) => {
        const map = new Map<string, string>();
        [...primary, ...secondary].forEach((d) => {
          const id = (d.deviceId || '').trim();
          if (!id) return;
          const existingLabel = map.get(id);
          const candidateLabel = (d.label || '').trim();
          if (!existingLabel || (candidateLabel && !existingLabel)) {
            map.set(id, candidateLabel);
          }
        });
        let idx = 0;
        return Array.from(map.entries()).map(([deviceId, label]) => {
          idx += 1;
          return {
            deviceId,
            label: label || `${fallbackPrefix} ${idx}`,
          };
        });
      };

      try {
        let browserDevices: MediaDeviceInfo[] = [];
        if (navigator.mediaDevices?.enumerateDevices) {
          browserDevices = await navigator.mediaDevices.enumerateDevices();
        }

        const hasValidIds = browserDevices.some((d) => Boolean(d.deviceId));
        if (
          requestPermissionIfNeeded &&
          !hasValidIds &&
          navigator.mediaDevices?.getUserMedia
        ) {
          try {
            let tempStream: MediaStream | null = null;
            try {
              tempStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
              });
            } catch {
              tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            tempStream.getTracks().forEach((tr) => tr.stop());
            if (navigator.mediaDevices?.enumerateDevices) {
              browserDevices = await navigator.mediaDevices.enumerateDevices();
            }
          } catch {
            setAvErrorMessage(t.meeting.settingsModal.permissionNotice);
          }
        }

        let jitsiAvailable: JitsiAvailableDevices = {};
        if (jitsiApiRef.current?.getAvailableDevices) {
          try {
            jitsiAvailable = (await jitsiApiRef.current.getAvailableDevices()) || {};
          } catch {
            // Fall back to browser enumeration
          }
        }

        const nextMics = mergeList(
          jitsiAvailable.audioInput || [],
          browserDevices.filter((d) => d.kind === 'audioinput'),
          t.settings.avSection.micLabel
        );
        const nextCams = mergeList(
          jitsiAvailable.videoInput || [],
          browserDevices.filter((d) => d.kind === 'videoinput'),
          t.settings.avSection.camLabel
        );
        const nextSpeakers = mergeList(
          jitsiAvailable.audioOutput || [],
          browserDevices.filter((d) => d.kind === 'audiooutput'),
          t.settings.avSection.spkLabel
        );

        setMics(nextMics);
        setCams(nextCams);
        setSpeakers(nextSpeakers);

        return { mics: nextMics, cams: nextCams, speakers: nextSpeakers };
      } finally {
        setDevicesLoading(false);
      }
    },
    [
      t.meeting.settingsModal.permissionNotice,
      t.settings.avSection.camLabel,
      t.settings.avSection.micLabel,
      t.settings.avSection.spkLabel,
    ]
  );

  // Initial enumeration & browser hot-plug listener
  useEffect(() => {
    refreshMediaDevices(false);
    const handleDeviceChange = () => {
      refreshMediaDevices(false);
    };
    navigator.mediaDevices?.addEventListener?.('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', handleDeviceChange);
    };
  }, [refreshMediaDevices]);

  // Refresh devices whenever the in-room audio/video modal opens; stop mic test when closed
  useEffect(() => {
    if (settingsModalOpen) {
      setAvStatusMessage(null);
      refreshMediaDevices(true);
    } else {
      setTestingMic(false);
    }
  }, [settingsModalOpen, refreshMediaDevices]);

  // Real Web Audio API microphone test inside the meeting room modal
  useEffect(() => {
    if (!testingMic || !settingsModalOpen) {
      setMicLevel(0);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((tr) => tr.stop());
        micStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setAvErrorMessage(null);

    async function startRoomMicTest() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setAvErrorMessage(t.settings.avSection.micPermissionError);
        setTestingMic(false);
        return;
      }
      try {
        const audioConstraint: MediaTrackConstraints | boolean = settings.microphoneId
          ? { deviceId: { ideal: settings.microphoneId } }
          : true;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        micStreamRef.current = stream;
        refreshMediaDevices(false);

        const ctx = new window.AudioContext();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i += 1) {
            sum += data[i];
          }
          const avg = sum / data.length;
          const pct = Math.min(100, Math.round((avg / 128) * 100));
          setMicLevel(pct);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setAvErrorMessage(t.settings.avSection.micPermissionError);
          setTestingMic(false);
        }
      }
    }

    startRoomMicTest();

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((tr) => tr.stop());
        micStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [
    testingMic,
    settingsModalOpen,
    settings.microphoneId,
    refreshMediaDevices,
    t.settings.avSection.micPermissionError,
  ]);

  // Subscribe to Firestore room messages & files for `activeClassId`
  useEffect(() => {
    if (!firebaseUser || !activeClassId) {
      setMessages([]);
      setFiles([]);
      return;
    }

    const uid = firebaseUser.uid;
    const msgPath = `classes/${activeClassId}/messages`;
    const filePath = `classes/${activeClassId}/files`;

    const unsubMessages = onSnapshot(
      query(collection(db, msgPath), where('ownerId', '==', uid)),
      (snapshot) => {
        const loaded: RoomMessageDoc[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ownerId: data.ownerId,
              classId: data.classId,
              senderId: data.senderId,
              senderName: data.senderName,
              senderRole: data.senderRole,
              text: data.text,
              createdAt:
                data.createdAt && typeof data.createdAt.toMillis === 'function'
                  ? data.createdAt.toMillis()
                  : Date.now(),
            };
          })
          .sort((a, b) => a.createdAt - b.createdAt);
        setMessages(loaded);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, msgPath)
    );

    const unsubFiles = onSnapshot(
      query(collection(db, filePath), where('ownerId', '==', uid)),
      (snapshot) => {
        const loaded: ClassFileDoc[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ownerId: data.ownerId,
              classId: data.classId,
              name: data.name,
              size: data.size,
              type: data.type,
              url: data.url || '',
              uploadedBy: data.uploadedBy,
              summary: data.summary || '',
              createdAt:
                data.createdAt && typeof data.createdAt.toMillis === 'function'
                  ? data.createdAt.toMillis()
                  : Date.now(),
            };
          })
          .sort((a, b) => b.createdAt - a.createdAt);
        setFiles(loaded);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, filePath)
    );

    return () => {
      unsubMessages();
      unsubFiles();
    };
  }, [firebaseUser, activeClassId]);

  // Mount Jitsi Meet External API inside the video container
  useEffect(() => {
    if (!activeClass?.roomCode) return;
    let cancelled = false;
    const container = jitsiContainerRef.current;
    if (!container) return;

    setJitsiReady(false);
    setJitsiError(null);
    setRemoteParticipants([]);

    const mountJitsi = () => {
      if (cancelled || !jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
        return;
      }

      jitsiContainerRef.current.innerHTML = '';
      const sanitizedCode = activeClass.roomCode.replace(/[^a-zA-Z0-9]/g, '');
      const roomName = `SabeelMeet${sanitizedCode || 'Classroom'}Room`;

      const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        lang: language,
        userInfo: {
          displayName: user?.name || firebaseUser?.displayName || '',
          email: user?.email || firebaseUser?.email || '',
        },
        configOverwrite: {
          startWithAudioMuted: settings.autoMuteOnJoin,
          startWithVideoMuted: settings.cameraOffOnJoin,
          prejoinPageEnabled: false,
          prejoinConfig: { enabled: false },
          disableDeepLinking: true,
          hideConferenceSubject: true,
          hideConferenceTimer: true,
          hideParticipantsStats: true,
          disableProfile: true,
          notifications: [],
          toolbarButtons: JITSI_ALLOWED_BUTTONS,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: JITSI_ALLOWED_BUTTONS,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          HIDE_INVITE_MORE_HEADER: false,
          MOBILE_APP_PROMO: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        },
      });

      jitsiApiRef.current = api;

      api.addListener('videoConferenceJoined', async () => {
        if (cancelled) return;
        setJitsiReady(true);

        try {
          const [audioMuted, videoMuted] = await Promise.all([
            api.isAudioMuted ? api.isAudioMuted() : Promise.resolve(settingsRef.current.autoMuteOnJoin),
            api.isVideoMuted ? api.isVideoMuted() : Promise.resolve(settingsRef.current.cameraOffOnJoin),
          ]);
          if (!cancelled) {
            setMicOn(!audioMuted);
            setCameraOn(!videoMuted);
          }
        } catch {
          // Keep current state
        }

        const lists = await refreshMediaDevices(false);
        if (cancelled || !lists) return;

        const saved = settingsRef.current;
        if (saved.microphoneId && api.setAudioInputDevice) {
          const match = lists.mics.find((m) => m.deviceId === saved.microphoneId);
          if (match) {
            api.setAudioInputDevice(match.label, match.deviceId).catch(() => {});
          }
        }
        if (saved.cameraId && api.setVideoInputDevice) {
          const match = lists.cams.find((c) => c.deviceId === saved.cameraId);
          if (match) {
            api.setVideoInputDevice(match.label, match.deviceId).catch(() => {});
          }
        }
        if (saved.speakerId && api.setAudioOutputDevice) {
          const match = lists.speakers.find((s) => s.deviceId === saved.speakerId);
          if (match) {
            api.setAudioOutputDevice(match.label, match.deviceId).catch(() => {});
          }
        }
      });
      api.addListener('deviceListChanged', () => {
        if (!cancelled) {
          refreshMediaDevices(false);
        }
      });
      api.addListener('audioMuteStatusChanged', (payload) => {
        if (!cancelled && typeof payload.muted === 'boolean') {
          setMicOn(!payload.muted);
        }
      });
      api.addListener('videoMuteStatusChanged', (payload) => {
        if (!cancelled && typeof payload.muted === 'boolean') {
          setCameraOn(!payload.muted);
        }
      });
      api.addListener('screenSharingStatusChanged', (payload) => {
        if (!cancelled && typeof payload.on === 'boolean') {
          setScreenSharing(payload.on);
        }
      });
      api.addListener('participantJoined', (payload) => {
        if (cancelled) return;
        const pid = typeof payload.id === 'string' ? payload.id : '';
        const pName =
          typeof payload.displayName === 'string' && payload.displayName.trim()
            ? payload.displayName.trim()
            : t.enums.roles.Student;
        if (!pid) return;
        setRemoteParticipants((prev) => {
          if (prev.some((p) => p.id === pid)) return prev;
          return [
            ...prev,
            {
              id: pid,
              name: pName,
              role: t.enums.roles.Student,
              initials: pName.slice(0, 2).toUpperCase(),
              isMicOn: true,
              isCameraOn: true,
              isHandRaised: false,
            },
          ];
        });
      });
      api.addListener('participantLeft', (payload) => {
        if (cancelled) return;
        const pid = typeof payload.id === 'string' ? payload.id : '';
        if (!pid) return;
        setRemoteParticipants((prev) => prev.filter((p) => p.id !== pid));
      });
      api.addListener('readyToClose', () => {
        if (!cancelled) navigate('/dashboard');
      });

      setTimeout(() => {
        if (!cancelled) setJitsiReady(true);
      }, 700);
    };

    if (window.JitsiMeetExternalAPI) {
      mountJitsi();
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-jitsi-external-api="true"]'
      );
      const handleLoad = () => mountJitsi();
      const handleError = () => {
        if (!cancelled) {
          setJitsiError(t.meeting.jitsiLoadError);
        }
      };

      if (existingScript) {
        existingScript.addEventListener('load', handleLoad);
        existingScript.addEventListener('error', handleError);
      } else {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.dataset.jitsiExternalApi = 'true';
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch {
          // Ignore disposal errors
        }
        jitsiApiRef.current = null;
      }
    };
  }, [activeClass?.roomCode, language]);

  // Combine real authenticated user + Jitsi remote participants + enrolled Firestore students
  const participants: RoomParticipant[] = useMemo(() => {
    const list: RoomParticipant[] = [];
    if (user) {
      list.push({
        id: user.id,
        name: `${user.name} (${t.common.you})`,
        role: t.enums.roles[user.role],
        avatarUrl: user.avatarUrl,
        initials: user.initials,
        isMicOn: micOn,
        isCameraOn: cameraOn,
        isHandRaised: handRaised,
        isLocal: true,
      });
    }
    remoteParticipants.forEach((rp) => list.push(rp));
    students
      .filter((s) => s.classId === activeClassId)
      .forEach((s) => {
        list.push({
          id: s.id,
          name: s.name,
          role: s.cohort || t.enums.roles.Student,
          avatarUrl: s.avatarUrl,
          initials: s.name.slice(0, 2).toUpperCase(),
          isMicOn: false,
          isCameraOn: false,
          isHandRaised: false,
        });
      });
    return list;
  }, [
    user,
    micOn,
    cameraOn,
    handRaised,
    remoteParticipants,
    students,
    activeClassId,
    t.common.you,
    t.enums.roles,
  ]);

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(participantQuery.trim().toLowerCase())
  );

  const noteContent = activeClassId ? meetingNotes[activeClassId] ?? '' : '';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !activeClassId) return;
    const trimmed = chatDraft.trim();
    if (!trimmed) return;

    const uid = firebaseUser.uid;
    const messageId = `msg-${Date.now()}`;
    const path = `classes/${activeClassId}/messages/${messageId}`;

    setChatDraft('');
    try {
      await setDoc(doc(db, 'classes', activeClassId, 'messages', messageId), {
        ownerId: uid,
        classId: activeClassId,
        senderId: uid,
        senderName: user?.name || firebaseUser.displayName || firebaseUser.email || t.common.you,
        senderRole: user?.role || 'Student',
        text: trimmed.slice(0, 1000),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !activeClassId || !newFileName.trim()) return;
    const uid = firebaseUser.uid;
    const fileId = `fil-${Date.now()}`;
    const path = `classes/${activeClassId}/files/${fileId}`;

    try {
      await setDoc(doc(db, 'classes', activeClassId, 'files', fileId), {
        ownerId: uid,
        classId: activeClassId,
        name: newFileName.trim().slice(0, 160),
        size: newFileUrl.trim() ? 'URL' : '—',
        type: newFileType,
        url: newFileUrl.trim().slice(0, 500),
        uploadedBy: user?.name || firebaseUser.displayName || t.common.you,
        summary: newFileSummary.trim().slice(0, 400),
        createdAt: serverTimestamp(),
      });
      setNewFileName('');
      setNewFileUrl('');
      setNewFileSummary('');
      setAddFileOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!activeClassId) return;
    try {
      await deleteDoc(doc(db, 'classes', activeClassId, 'files', fileId));
      showToast(t.meeting.filesPanel.deletedToast);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `classes/${activeClassId}/files/${fileId}`);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassId || newStudentName.trim().length < 2 || newStudentCode.trim().length < 2) {
      return;
    }
    await createStudent({
      classId: activeClassId,
      name: newStudentName,
      studentCode: newStudentCode,
      cohort: user?.cohort || '',
    });
    setNewStudentName('');
    setNewStudentCode('');
    setAddStudentOpen(false);
  };

  const handleInsertTimestamp = () => {
    if (!activeClassId) return;
    const stamp = `[${formatDuration(elapsedSeconds)}] `;
    const next =
      noteContent.endsWith('\n') || !noteContent
        ? `${noteContent}${stamp}`
        : `${noteContent}\n${stamp}`;
    saveMeetingNote(activeClassId, next);
    setNoteSavedAt(t.meeting.notesPanel.savedJustNow);
  };

  const handleExportNotes = () => {
    if (!activeClass) return;
    const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeClass.code}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.meeting.notesPanel.exportedToast);
  };

  // Empty state when no classes exist yet
  if (!classesLoading && !activeClass) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0F15] text-slate-100 p-6">
        <div className="max-w-md w-full rounded-[18px] bg-[#121822] border border-white/[0.08] p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#69B6FF]/15 text-[#69B6FF] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-white">
            {t.meeting.noClassTitle}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t.meeting.noClassDesc}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              {t.meeting.backToWorkspace}
            </Button>
            <Button variant="primary" onClick={() => navigate('/classes')}>
              {t.meeting.goToClasses}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarTabs: Array<{
    id: SidebarTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'participants', label: t.meeting.tabs.participants, icon: Users },
    { id: 'chat', label: t.meeting.tabs.chat, icon: MessageSquare },
    { id: 'notes', label: t.meeting.tabs.notes, icon: FileText },
    { id: 'files', label: t.meeting.tabs.files, icon: FolderOpen },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#0B0F15] text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 bg-[#121822] border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label={t.meeting.backToWorkspace}
            className="p-2 rounded-[10px] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
          </button>

          {activeClass && (
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono-tabular text-xs font-semibold text-[#69B6FF] shrink-0">
                  {activeClass.code}
                </span>
                <h1 className="font-display text-sm sm:text-base font-bold text-white truncate">
                  {activeClass.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                <Avatar
                  src={activeClass.instructorAvatar}
                  name={activeClass.instructorName}
                  initials={activeClass.instructorName.slice(0, 2).toUpperCase()}
                  size="xs"
                  className="!w-4 !h-4 !text-[9px]"
                />
                <span className="truncate">{activeClass.instructorName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular shrink-0">{activeClass.roomCode}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Elapsed Meeting Timer */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-mono-tabular" dir="ltr">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>

          <span className="hidden sm:inline h-4 w-px bg-white/10" aria-hidden="true" />

          {/* Real Connection Indicator */}
          <div
            className={`flex items-center gap-2 text-xs font-medium ${
              jitsiError
                ? 'text-red-400'
                : jitsiReady
                ? 'text-emerald-400'
                : 'text-amber-300'
            }`}
          >
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                jitsiError
                  ? 'bg-red-400'
                  : jitsiReady
                  ? 'bg-emerald-400'
                  : 'bg-amber-300'
              }`}
              aria-hidden="true"
            />
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden md:inline whitespace-nowrap">
              {jitsiError
                ? t.meeting.unavailable
                : jitsiReady
                ? t.meeting.connected
                : t.meeting.connecting}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? t.meeting.hideSidebar : t.meeting.showSidebar}
            className="p-2 rounded-[10px] text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            {sidebarOpen ? (
              <PanelRightClose className="w-4 h-4 rtl:-scale-x-100" />
            ) : (
              <PanelRightOpen className="w-4 h-4 rtl:-scale-x-100" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area: Jitsi Video Container + Sidebar */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <section
          aria-label={t.meeting.stageAria}
          className="flex-1 p-3 sm:p-5 flex flex-col min-w-0 min-h-0 relative"
        >
          <div
            id="sabeel-video-stage-container"
            className="flex-1 w-full h-full rounded-[18px] bg-[#101620] border border-white/[0.08] relative overflow-hidden flex flex-col items-center justify-center"
          >
            <div ref={jitsiContainerRef} className="w-full h-full relative z-10" />

            {(!jitsiReady || jitsiError) && activeClass && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#101620] pointer-events-none">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.035]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                  }}
                />
                <div className="relative z-10 text-center px-6 max-w-md space-y-2.5">
                  <div className="w-12 h-12 rounded-[14px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#69B6FF]">
                    <Video className="w-5 h-5" />
                  </div>
                  <p className="font-display text-base font-semibold text-white">
                    {jitsiError ? t.meeting.unavailable : t.meeting.connecting}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {jitsiError ?? t.meeting.preparingStream(activeClass.code)}
                  </p>
                </div>
              </div>
            )}

            <RoomWhiteboard
              open={whiteboardOpen}
              onClose={() => setWhiteboardOpen(false)}
              courseCode={activeClass?.code || 'SBL'}
              hasJitsiSession={Boolean(jitsiApiRef.current && jitsiReady)}
              onToggleJitsiWhiteboard={() => {
                setWhiteboardOpen(false);
                jitsiApiRef.current?.executeCommand('toggleWhiteboard');
              }}
              onExported={() => showToast(t.meeting.whiteboard.exportedToast)}
            />

            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-4 end-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-[#18202D] border border-[#69B6FF]/40 text-xs font-medium text-white shadow-lg"
                >
                  <Check className="w-3.5 h-3.5 text-[#69B6FF]" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Mobile Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-x-0 top-16 bottom-20 z-20 bg-[#0B0F15]/55 backdrop-blur-[2px] md:hidden"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Sidebar (Right in LTR, Left in RTL via `end-0` + `border-s`) */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? -24 : 24 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-16 bottom-20 end-0 z-30 w-full max-w-[360px] md:static md:inset-auto md:w-[372px] md:max-w-none flex flex-col shrink-0 bg-[#121822] border-s border-white/[0.08] overflow-hidden"
            >
              {/* Tabs */}
              <div
                role="tablist"
                aria-label={t.meeting.tabs.participants}
                className="p-2 border-b border-white/[0.08] grid grid-cols-4 gap-1 shrink-0"
              >
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-[10px] text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                        active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="meeting-sidebar-tab"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-[10px] bg-white/[0.08] border border-white/[0.08]"
                        />
                      )}
                      <Icon
                        className={`relative z-10 w-4 h-4 ${
                          active ? 'text-[#69B6FF]' : ''
                        }`}
                      />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Panels */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {activeTab === 'participants' && (
                  <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-200">
                        {t.meeting.participantsPanel.inRoom(participants.length)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAddStudentOpen(true)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-[8px] bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.meeting.participantsPanel.addStudentBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHandRaised((prev) => !prev)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                            handRaised
                              ? 'bg-[#69B6FF] text-[#0B0F15]'
                              : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]'
                          }`}
                        >
                          <Hand className="w-3.5 h-3.5" />
                          <span>
                            {handRaised
                              ? t.meeting.participantsPanel.lowerHand
                              : t.meeting.participantsPanel.raiseHand}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="search"
                        value={participantQuery}
                        onChange={(e) => setParticipantQuery(e.target.value)}
                        placeholder={t.meeting.participantsPanel.filterPlaceholder}
                        className="w-full ps-8 pe-3 py-2 rounded-[10px] bg-[#0B0F15] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#69B6FF]"
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 pe-1">
                      {filteredParticipants.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-8">
                          {t.meeting.participantsPanel.empty}
                        </p>
                      ) : (
                        filteredParticipants.map((person) => (
                          <div
                            key={person.id}
                            className="flex items-center justify-between gap-2.5 p-2 rounded-[10px] hover:bg-white/[0.04] transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar
                                src={person.avatarUrl}
                                name={person.name}
                                initials={person.initials}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                  {person.name}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {person.role}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-slate-400">
                              {person.isHandRaised && (
                                <Hand className="w-3.5 h-3.5 text-[#69B6FF]" />
                              )}
                              {person.isMicOn ? (
                                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <MicOff className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              {person.isCameraOn ? (
                                <Video className="w-3.5 h-3.5 text-slate-300" />
                              ) : (
                                <VideoOff className="w-3.5 h-3.5 text-slate-600" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-8">
                          {t.meeting.chatPanel.empty}
                        </p>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className="space-y-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className={`text-xs font-semibold ${
                                  msg.senderRole === 'Instructor'
                                    ? 'text-[#69B6FF]'
                                    : 'text-slate-200'
                                }`}
                              >
                                {msg.senderName}
                              </span>
                              <span className="font-mono-tabular text-[10px] text-slate-500">
                                {formatLocalizedDate(msg.createdAt, language, {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0F15]/70 border border-white/[0.06] rounded-[12px] px-3 py-2">
                              {msg.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 border-t border-white/[0.08] flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                        placeholder={t.meeting.chatPanel.placeholder}
                        className="flex-1 px-3 py-2 rounded-[10px] bg-[#0B0F15] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#69B6FF]"
                      />
                      <button
                        type="submit"
                        aria-label={t.meeting.chatPanel.send}
                        className="p-2 rounded-[10px] bg-[#69B6FF] text-[#0B0F15] hover:bg-[#53AAFA] transition-colors cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5 rtl:-scale-x-100" />
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'notes' && activeClassId && (
                  <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-300">
                        {t.meeting.notesPanel.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {noteSavedAt ?? t.meeting.notesPanel.saved}
                      </span>
                    </div>

                    <textarea
                      value={noteContent}
                      onChange={(e) => {
                        saveMeetingNote(activeClassId, e.target.value);
                        setNoteSavedAt(t.meeting.notesPanel.saved);
                      }}
                      placeholder={t.meeting.notesPanel.placeholder}
                      className="flex-1 w-full p-3.5 rounded-[12px] bg-[#0B0F15] border border-white/[0.08] text-xs text-slate-200 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#69B6FF]"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleInsertTimestamp}
                        className="px-3 py-1.5 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono-tabular text-slate-300 transition-colors cursor-pointer"
                      >
                        {t.meeting.notesPanel.insertTimestamp}
                      </button>
                      <button
                        type="button"
                        onClick={handleExportNotes}
                        className="px-3 py-1.5 rounded-[8px] bg-[#69B6FF]/15 hover:bg-[#69B6FF]/25 text-xs font-medium text-[#69B6FF] transition-colors cursor-pointer"
                      >
                        {t.meeting.notesPanel.exportNotes}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-300">
                        {t.meeting.filesPanel.title(files.length)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddFileOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#69B6FF]/15 hover:bg-[#69B6FF]/25 text-xs font-medium text-[#69B6FF] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.meeting.filesPanel.addFileBtn}</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5">
                      {files.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-8">
                          {t.meeting.filesPanel.empty}
                        </p>
                      ) : (
                        files.map((file) => (
                          <div
                            key={file.id}
                            className="p-3 rounded-[12px] bg-[#0B0F15]/80 border border-white/[0.07] hover:border-[#69B6FF]/40 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewFile(file)}
                                className="text-start min-w-0 cursor-pointer flex-1"
                              >
                                <p className="text-xs font-semibold text-white truncate hover:text-[#69B6FF] transition-colors">
                                  {file.name}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono-tabular">
                                  {file.type} ·{' '}
                                  {formatLocalizedDate(file.createdAt, language, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </button>
                              <div className="flex items-center gap-1 shrink-0">
                                {file.url && (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={t.meeting.filesPanel.previewOpenLink}
                                    className="p-1.5 rounded-[8px] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  aria-label={t.common.delete}
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="p-1.5 rounded-[8px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Toolbar */}
      <footer className="min-h-[80px] py-2 px-3 sm:px-6 bg-[#121822] border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono-tabular">
          {activeClass && <span>{t.meeting.roomLabel(activeClass.roomCode)}</span>}
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            aria-label={micOn ? t.meeting.controls.mute : t.meeting.controls.unmute}
            onClick={() => {
              if (jitsiApiRef.current) {
                jitsiApiRef.current.executeCommand('toggleAudio');
              } else {
                setMicOn((prev) => !prev);
              }
            }}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-[12px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
              micOn
                ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08]'
                : 'bg-[#DC2626]/20 hover:bg-[#DC2626]/30 text-red-300 border border-[#DC2626]/40'
            }`}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {micOn ? t.meeting.controls.mute : t.meeting.controls.unmute}
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            aria-label={cameraOn ? t.meeting.controls.camera : t.meeting.controls.startVideo}
            onClick={() => {
              if (jitsiApiRef.current) {
                jitsiApiRef.current.executeCommand('toggleVideo');
              } else {
                setCameraOn((prev) => !prev);
              }
            }}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-[12px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
              cameraOn
                ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08]'
                : 'bg-[#DC2626]/20 hover:bg-[#DC2626]/30 text-red-300 border border-[#DC2626]/40'
            }`}
          >
            {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {cameraOn ? t.meeting.controls.camera : t.meeting.controls.startVideo}
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            aria-label={
              screenSharing ? t.meeting.controls.sharingScreen : t.meeting.controls.shareScreen
            }
            onClick={() => {
              if (jitsiApiRef.current) {
                jitsiApiRef.current.executeCommand('toggleShareScreen');
              } else {
                setScreenSharing((prev) => !prev);
              }
            }}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-[12px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
              screenSharing
                ? 'bg-[#69B6FF] text-[#0B0F15]'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08]'
            }`}
          >
            <MonitorUp className="w-4 h-4" />
            <span className="hidden sm:inline">
              {screenSharing
                ? t.meeting.controls.sharingScreen
                : t.meeting.controls.shareScreen}
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            aria-label={t.meeting.controls.whiteboard}
            aria-pressed={whiteboardOpen}
            onClick={() => setWhiteboardOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-[12px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
              whiteboardOpen
                ? 'bg-[#69B6FF] text-[#0B0F15]'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08]'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden md:inline">{t.meeting.controls.whiteboard}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            aria-label={t.meeting.controls.invite}
            onClick={() => {
              setCopiedField(null);
              setInviteModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-[12px] text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden md:inline">{t.meeting.controls.invite}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            aria-label={t.meeting.controls.settings}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-[12px] text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline">{t.meeting.controls.settings}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setLeaveConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-[12px] text-xs font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{t.meeting.controls.leave}</span>
          </motion.button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>{t.meeting.participantsCount(participants.length)}</span>
        </div>
      </footer>

      {/* Modal: In-Meeting Audio/Video Settings */}
      <Modal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title={t.meeting.settingsModal.title}
        description={t.meeting.settingsModal.description}
      >
        <div className="space-y-4">
          {/* Quick Room Mic/Cam Toggles & Refresh Devices */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (jitsiApiRef.current) {
                    jitsiApiRef.current.executeCommand('toggleAudio');
                  } else {
                    setMicOn((prev) => !prev);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer ${
                  micOn
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
                }`}
              >
                {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{micOn ? t.meeting.controls.mute : t.meeting.controls.unmute}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (jitsiApiRef.current) {
                    jitsiApiRef.current.executeCommand('toggleVideo');
                  } else {
                    setCameraOn((prev) => !prev);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer ${
                  cameraOn
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30'
                }`}
              >
                {cameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                <span>{cameraOn ? t.meeting.controls.camera : t.meeting.controls.startVideo}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={devicesLoading}
              onClick={() => refreshMediaDevices(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-medium text-[#1D74CE] dark:text-[#69B6FF] hover:bg-[#69B6FF]/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${devicesLoading ? 'animate-spin' : ''}`} />
              <span>{t.meeting.settingsModal.refreshDevices}</span>
            </button>
          </div>

          {/* Microphone Selector + Live Test */}
          <div>
            <label
              htmlFor="mtg-mic"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t.settings.avSection.micLabel}</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                id="mtg-mic"
                value={settings.microphoneId}
                onChange={async (e) => {
                  const deviceId = e.target.value;
                  setAvErrorMessage(null);
                  setAvStatusMessage(null);
                  const selected =
                    mics.find((m) => m.deviceId === deviceId) ??
                    mics.find((m) => m.deviceId === 'default') ??
                    mics[0];

                  updateSettings({ microphoneId: deviceId }).catch(() => {});

                  if (jitsiApiRef.current?.setAudioInputDevice && selected) {
                    try {
                      await jitsiApiRef.current.setAudioInputDevice(
                        selected.label,
                        selected.deviceId
                      );
                      setAvStatusMessage(t.meeting.settingsModal.deviceApplied);
                    } catch {
                      setAvErrorMessage(t.meeting.settingsModal.switchFailed);
                    }
                  } else {
                    setAvStatusMessage(t.meeting.settingsModal.deviceApplied);
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              >
                <option value="">{t.settings.avSection.systemDefault}</option>
                {mics.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant={testingMic ? 'primary' : 'secondary'}
                size="md"
                onClick={() => setTestingMic((prev) => !prev)}
              >
                {testingMic ? t.settings.avSection.stopTest : t.settings.avSection.testMic}
              </Button>
            </div>

            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{t.settings.avSection.inputLevel}</span>
                <span className="font-mono-tabular">
                  {testingMic
                    ? t.settings.avSection.receivingSignal(micLevel)
                    : t.settings.avSection.idle}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#EEF4F9] dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#69B6FF] transition-all duration-75"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Camera Selector */}
          <div>
            <label
              htmlFor="mtg-cam"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{t.settings.avSection.camLabel}</span>
            </label>
            <select
              id="mtg-cam"
              value={settings.cameraId}
              onChange={async (e) => {
                const deviceId = e.target.value;
                setAvErrorMessage(null);
                setAvStatusMessage(null);
                const selected =
                  cams.find((c) => c.deviceId === deviceId) ??
                  cams.find((c) => c.deviceId === 'default') ??
                  cams[0];

                updateSettings({ cameraId: deviceId }).catch(() => {});

                if (jitsiApiRef.current?.setVideoInputDevice && selected) {
                  try {
                    await jitsiApiRef.current.setVideoInputDevice(
                      selected.label,
                      selected.deviceId
                    );
                    setAvStatusMessage(t.meeting.settingsModal.deviceApplied);
                  } catch {
                    setAvErrorMessage(t.meeting.settingsModal.switchFailed);
                  }
                } else {
                  setAvStatusMessage(t.meeting.settingsModal.deviceApplied);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            >
              <option value="">{t.settings.avSection.systemDefault}</option>
              {cams.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speaker Selector */}
          <div>
            <label
              htmlFor="mtg-spk"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.settings.avSection.spkLabel}</span>
            </label>
            <select
              id="mtg-spk"
              value={settings.speakerId}
              onChange={async (e) => {
                const deviceId = e.target.value;
                setAvErrorMessage(null);
                setAvStatusMessage(null);
                const selected =
                  speakers.find((s) => s.deviceId === deviceId) ??
                  speakers.find((s) => s.deviceId === 'default') ??
                  speakers[0];

                updateSettings({ speakerId: deviceId }).catch(() => {});

                if (jitsiApiRef.current?.setAudioOutputDevice && selected) {
                  try {
                    await jitsiApiRef.current.setAudioOutputDevice(
                      selected.label,
                      selected.deviceId
                    );
                    setAvStatusMessage(t.meeting.settingsModal.deviceApplied);
                  } catch {
                    setAvErrorMessage(t.meeting.settingsModal.speakerUnsupported);
                  }
                } else {
                  setAvStatusMessage(t.meeting.settingsModal.deviceApplied);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            >
              <option value="">{t.settings.avSection.systemDefault}</option>
              {speakers.map((s) => (
                <option key={s.deviceId} value={s.deviceId}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {avErrorMessage && (
            <div className="flex items-start gap-2 p-2.5 rounded-[10px] bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{avErrorMessage}</span>
            </div>
          )}

          {avStatusMessage && !avErrorMessage && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#16A34A] dark:text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{avStatusMessage}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setSettingsModalOpen(false)}>
              {t.meeting.settingsModal.done}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Class File */}
      <Modal
        open={addFileOpen}
        onClose={() => setAddFileOpen(false)}
        title={t.meeting.filesPanel.addModalTitle}
      >
        <form onSubmit={handleAddFile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.meeting.filesPanel.fileNameLabel}
            </label>
            <input
              type="text"
              required
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.meeting.filesPanel.fileTypeLabel}
              </label>
              <select
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value as ClassFileType)}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              >
                {FILE_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.meeting.filesPanel.fileUrlLabel}
              </label>
              <input
                type="url"
                dir="ltr"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.meeting.filesPanel.fileSummaryLabel}
            </label>
            <textarea
              rows={2}
              value={newFileSummary}
              onChange={(e) => setNewFileSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddFileOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary">
              {t.common.add}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Student to Roster */}
      <Modal
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        title={t.meeting.participantsPanel.addStudentTitle}
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.meeting.participantsPanel.studentNameLabel}
            </label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.meeting.participantsPanel.studentCodeLabel}
            </label>
            <input
              type="text"
              required
              dir="ltr"
              value={newStudentCode}
              onChange={(e) => setNewStudentCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddStudentOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary">
              {t.common.add}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: File Summary Preview */}
      <Modal
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name ?? ''}
        description={
          previewFile ? `${previewFile.type} · ${previewFile.uploadedBy}` : undefined
        }
      >
        {previewFile && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {previewFile.summary || t.common.notSpecified}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="ghost" onClick={() => setPreviewFile(null)}>
                {t.common.close}
              </Button>
              {previewFile.url && (
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#69B6FF] text-[#0B0F15] text-sm font-semibold hover:bg-[#53AAFA] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.meeting.filesPanel.previewOpenLink}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Invite Participants */}
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={t.meeting.inviteModal.title}
        description={t.meeting.inviteModal.description}
      >
        {activeClass && (() => {
          const sanitizedCode = activeClass.roomCode.replace(/[^a-zA-Z0-9]/g, '');
          const jitsiRoomName = `SabeelMeet${sanitizedCode || 'Classroom'}Room`;
          const sabeelUrl = `${window.location.origin}/meeting/${activeClass.id}`;
          const jitsiUrl = `https://meet.jit.si/${jitsiRoomName}`;
          const fullInviteText = t.meeting.inviteModal.inviteMessageTemplate(
            `${activeClass.code} · ${activeClass.title}`,
            activeClass.roomCode,
            sabeelUrl
          );

          const copyValue = async (key: string, value: string) => {
            try {
              await navigator.clipboard.writeText(value);
              setCopiedField(key);
              setTimeout(() => setCopiedField(null), 1800);
            } catch {
              // Clipboard unavailable
            }
          };

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.meeting.inviteModal.roomCodeLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={activeClass.roomCode}
                    className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular font-semibold text-[#0B0F15] dark:text-white"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    icon={
                      copiedField === 'code' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                    onClick={() => copyValue('code', activeClass.roomCode)}
                  >
                    {copiedField === 'code'
                      ? t.meeting.inviteModal.copied
                      : t.meeting.inviteModal.copyCode}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.meeting.inviteModal.sabeelLinkLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={sabeelUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-xs font-mono-tabular text-[#0B0F15] dark:text-white truncate"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    icon={
                      copiedField === 'sabeel' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                    onClick={() => copyValue('sabeel', sabeelUrl)}
                  >
                    {copiedField === 'sabeel'
                      ? t.meeting.inviteModal.copied
                      : t.meeting.inviteModal.copyLink}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.meeting.inviteModal.jitsiLinkLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={jitsiUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-xs font-mono-tabular text-[#0B0F15] dark:text-white truncate"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    icon={
                      copiedField === 'jitsi' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                    onClick={() => copyValue('jitsi', jitsiUrl)}
                  >
                    {copiedField === 'jitsi'
                      ? t.meeting.inviteModal.copied
                      : t.meeting.inviteModal.copyLink}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <Button
                    type="button"
                    variant="secondary"
                    icon={<Share2 className="w-4 h-4" />}
                    onClick={() => {
                      navigator
                        .share({
                          title: `${activeClass.code} · ${activeClass.title}`,
                          text: fullInviteText,
                          url: sabeelUrl,
                        })
                        .catch(() => {});
                    }}
                  >
                    {t.meeting.inviteModal.shareNative}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  icon={
                    copiedField === 'full' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )
                  }
                  onClick={() => copyValue('full', fullInviteText)}
                >
                  {copiedField === 'full'
                    ? t.meeting.inviteModal.copied
                    : t.meeting.inviteModal.copyFullInvite}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal: Leave Classroom Confirmation */}
      <Modal
        open={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
        title={t.meeting.leaveModal.title}
        description={t.meeting.leaveModal.description}
        maxWidthClass="max-w-md"
      >
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" onClick={() => setLeaveConfirmOpen(false)}>
            {t.meeting.leaveModal.stay}
          </Button>
          <Button
            variant="danger"
            icon={<PhoneOff className="w-4 h-4" />}
            onClick={() => {
              if (jitsiApiRef.current) {
                try {
                  jitsiApiRef.current.executeCommand('hangup');
                  jitsiApiRef.current.dispose();
                } catch {
                  // Ignore hangup/dispose errors
                }
                jitsiApiRef.current = null;
              }
              navigate('/dashboard');
            }}
          >
            {t.meeting.leaveModal.leaveBtn}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
