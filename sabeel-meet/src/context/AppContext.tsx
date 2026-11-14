import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  User as FirebaseUser,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ClassDoc,
  Discipline,
  LanguageCode,
  MeetingDoc,
  MeetingStatus,
  NotificationCategory,
  NotificationDoc,
  SessionType,
  SettingsDoc,
  StudentDoc,
  TeacherDoc,
  ThemeMode,
  UserDoc,
} from '../types';
import { TRANSLATIONS, TranslationDictionary } from '../i18n/translations';
import {
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../lib/firebase';

const DEFAULT_SETTINGS_VALUES: Omit<SettingsDoc, 'ownerId'> = {
  language: 'ar',
  theme: 'light',
  microphoneId: '',
  cameraId: '',
  speakerId: '',
  autoMuteOnJoin: true,
  cameraOffOnJoin: false,
  sessionReminders: true,
  chatMentions: true,
  materialUploads: true,
  weeklyDigest: false,
  compactSchedule: false,
};

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase().slice(0, 4);
}

export interface CreateClassInput {
  code: string;
  title: string;
  discipline: Discipline;
  instructorName: string;
  instructorTitle: string;
  roomCode: string;
  scheduleSummary: string;
  totalSessions: number;
  description: string;
  syllabusTopics: string[];
  isLiveNow: boolean;
}

export interface CreateMeetingInput {
  classId: string;
  title: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  isLiveNow?: boolean;
}

export interface CreateStudentInput {
  classId: string;
  name: string;
  studentCode: string;
  cohort: string;
}

interface AppContextValue {
  authReady: boolean;
  isAuthenticated: boolean;
  firebaseUser: FirebaseUser | null;
  login: (emailHint?: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;

  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isRtl: boolean;
  t: TranslationDictionary;

  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  user: UserDoc | null;
  userLoading: boolean;
  updateUser: (patch: Partial<UserDoc>) => Promise<void>;

  classes: ClassDoc[];
  classesLoading: boolean;
  classesError: string | null;
  createClass: (input: CreateClassInput) => Promise<string | null>;
  deleteClass: (classId: string) => Promise<void>;

  meetings: MeetingDoc[];
  meetingsLoading: boolean;
  meetingsError: string | null;
  createMeeting: (input: CreateMeetingInput) => Promise<string | null>;
  toggleMeetingReminder: (meetingId: string) => Promise<void>;
  updateMeetingStatus: (meetingId: string, status: MeetingStatus) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;

  teachers: TeacherDoc[];
  teachersLoading: boolean;

  students: StudentDoc[];
  studentsLoading: boolean;
  createStudent: (input: CreateStudentInput) => Promise<void>;

  notifications: NotificationDoc[];
  notificationsLoading: boolean;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  settings: Omit<SettingsDoc, 'ownerId'>;
  settingsLoading: boolean;
  updateSettings: (patch: Partial<Omit<SettingsDoc, 'ownerId'>>) => Promise<void>;

  activeMeetingId: string;
  setActiveMeetingId: (id: string) => void;

  meetingNotes: Record<string, string>;
  saveMeetingNote: (classId: string, content: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('sabeel_lang');
    return saved === 'en' ? 'en' : 'ar';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('sabeel_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [user, setUser] = useState<UserDoc | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);

  const [classes, setClasses] = useState<ClassDoc[]>([]);
  const [classesLoading, setClassesLoading] = useState<boolean>(true);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [meetings, setMeetings] = useState<MeetingDoc[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState<boolean>(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  const [teachers, setTeachers] = useState<TeacherDoc[]>([]);
  const [teachersLoading, setTeachersLoading] = useState<boolean>(true);

  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(true);

  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);

  const [settings, setSettings] = useState<Omit<SettingsDoc, 'ownerId'>>(() => ({
    ...DEFAULT_SETTINGS_VALUES,
    language: localStorage.getItem('sabeel_lang') === 'en' ? 'en' : 'ar',
    theme: localStorage.getItem('sabeel_theme') === 'dark' ? 'dark' : 'light',
  }));
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);

  const [activeMeetingId, setActiveMeetingId] = useState<string>('');
  const [meetingNotes, setMeetingNotes] = useState<Record<string, string>>({});
  const [existingNoteIds, setExistingNoteIds] = useState<Record<string, boolean>>({});

  const initializedUidRef = useRef<string | null>(null);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // Apply language & RTL/LTR direction to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('sabeel_lang', language);
    document.title = `${t.brandName} — ${t.brandSubtitle}`;
  }, [language, t.brandName, t.brandSubtitle]);

  // Apply light/dark theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sabeel_theme', theme);
  }, [theme]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthReady(true);
      if (!fbUser) {
        initializedUidRef.current = null;
        setUser(null);
        setUserLoading(false);
        setClasses([]);
        setClassesLoading(false);
        setClassesError(null);
        setMeetings([]);
        setMeetingsLoading(false);
        setMeetingsError(null);
        setTeachers([]);
        setTeachersLoading(false);
        setStudents([]);
        setStudentsLoading(false);
        setNotifications([]);
        setNotificationsLoading(false);
        setMeetingNotes({});
        setExistingNoteIds({});
        setActiveMeetingId('');
        setSettingsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load real user document & subscribe to real Firestore collections
  useEffect(() => {
    if (!authReady || !firebaseUser) return;

    const currentUser = firebaseUser;
    const uid = currentUser.uid;
    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    setUserLoading(true);
    setClassesLoading(true);
    setMeetingsLoading(true);
    setTeachersLoading(true);
    setStudentsLoading(true);
    setNotificationsLoading(true);
    setSettingsLoading(true);
    setClassesError(null);
    setMeetingsError(null);

    async function initAccountAndSubscribe() {
      const userDocRef = doc(db, 'users', uid);
      const privateInfoRef = doc(db, 'users', uid, 'private', 'info');
      const settingsDocRef = doc(db, 'settings', uid);

      let userExists = false;
      let settingsExists = false;

      try {
        const [userSnap, settingsSnap] = await Promise.all([
          getDoc(userDocRef),
          getDoc(settingsDocRef),
        ]);
        userExists = userSnap.exists();
        settingsExists = settingsSnap.exists();
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      }

      if (cancelled) return;

      if ((!userExists || !settingsExists) && initializedUidRef.current !== uid) {
        initializedUidRef.current = uid;
        const rawEmail = (currentUser.email || '').trim().slice(0, 160);
        const fallbackName = rawEmail ? rawEmail.split('@')[0] : 'User';
        const displayName = (currentUser.displayName || fallbackName).trim().slice(0, 100);
        const avatarUrl = (currentUser.photoURL || '').trim().slice(0, 500);
        const initials = computeInitials(displayName);
        const detectedTz =
          Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 80) || 'UTC';

        const batch = writeBatch(db);

        if (!userExists) {
          batch.set(userDocRef, {
            ownerId: uid,
            name: displayName,
            role: 'Student',
            department: '',
            cohort: '',
            timezone: detectedTz,
            bio: '',
            avatarUrl,
            initials,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          if (rawEmail) {
            batch.set(privateInfoRef, {
              ownerId: uid,
              email: rawEmail,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        if (!settingsExists) {
          batch.set(settingsDocRef, {
            ownerId: uid,
            ...DEFAULT_SETTINGS_VALUES,
            language,
            theme,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        try {
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }
      }

      if (cancelled) return;

      // 1. User Document Listener (`users/{uid}`)
      unsubscribers.push(
        onSnapshot(
          userDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setUser((prev) => ({
                id: uid,
                ownerId: data.ownerId || uid,
                name: data.name || currentUser.displayName || '',
                email: prev?.email || currentUser.email || '',
                role: data.role || 'Student',
                department: data.department || '',
                cohort: data.cohort || '',
                timezone: data.timezone || 'UTC',
                bio: data.bio || '',
                avatarUrl: data.avatarUrl ?? currentUser.photoURL ?? '',
                initials: data.initials || computeInitials(data.name || ''),
              }));
            }
            setUserLoading(false);
          },
          (error) => {
            setUserLoading(false);
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
          }
        )
      );

      // 2. User Private Email Listener (`users/{uid}/private/info`)
      unsubscribers.push(
        onSnapshot(
          privateInfoRef,
          (snapshot) => {
            if (!snapshot.exists()) return;
            const data = snapshot.data();
            if (typeof data.email === 'string') {
              setUser((prev) => (prev ? { ...prev, email: data.email } : prev));
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${uid}/private/info`);
          }
        )
      );

      // 3. Settings Listener (`settings/{uid}`)
      unsubscribers.push(
        onSnapshot(
          settingsDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const loadedSettings: Omit<SettingsDoc, 'ownerId'> = {
                language: data.language === 'en' ? 'en' : 'ar',
                theme: data.theme === 'dark' ? 'dark' : 'light',
                microphoneId: data.microphoneId || '',
                cameraId: data.cameraId || '',
                speakerId: data.speakerId || '',
                autoMuteOnJoin: Boolean(data.autoMuteOnJoin),
                cameraOffOnJoin: Boolean(data.cameraOffOnJoin),
                sessionReminders: Boolean(data.sessionReminders),
                chatMentions: Boolean(data.chatMentions),
                materialUploads: Boolean(data.materialUploads),
                weeklyDigest: Boolean(data.weeklyDigest),
                compactSchedule: Boolean(data.compactSchedule),
              };
              setSettings(loadedSettings);
              setLanguageState(loadedSettings.language);
              setThemeState(loadedSettings.theme);
            }
            setSettingsLoading(false);
          },
          (error) => {
            setSettingsLoading(false);
            handleFirestoreError(error, OperationType.GET, `settings/${uid}`);
          }
        )
      );

      // 4. Classes Listener (`classes`)
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'classes'), where('ownerId', '==', uid)),
          (snapshot) => {
            const loaded: ClassDoc[] = snapshot.docs
              .map((d) => {
                const data = d.data();
                return {
                  id: d.id,
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
                  createdAt:
                    data.createdAt && typeof data.createdAt.toMillis === 'function'
                      ? data.createdAt.toMillis()
                      : 0,
                };
              })
              .sort(
                (a, b) =>
                  Number(b.isLiveNow) - Number(a.isLiveNow) ||
                  (b.createdAt || 0) - (a.createdAt || 0)
              );
            setClasses(loaded);
            setClassesLoading(false);
            setClassesError(null);
          },
          (error) => {
            setClassesLoading(false);
            setClassesError(error instanceof Error ? error.message : String(error));
            handleFirestoreError(error, OperationType.LIST, 'classes');
          }
        )
      );

      // 5. Meetings Listener (`meetings`)
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'meetings'), where('ownerId', '==', uid)),
          (snapshot) => {
            const loaded: MeetingDoc[] = snapshot.docs
              .map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  ownerId: data.ownerId,
                  classId: data.classId,
                  courseCode: data.courseCode,
                  title: data.title,
                  instructorName: data.instructorName,
                  instructorAvatar: data.instructorAvatar || '',
                  scheduledDate: data.scheduledDate,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  durationMinutes: Number(data.durationMinutes || 60),
                  roomCode: data.roomCode,
                  status: data.status,
                  sessionType: data.sessionType,
                  reminderEnabled: Boolean(data.reminderEnabled),
                  createdAt:
                    data.createdAt && typeof data.createdAt.toMillis === 'function'
                      ? data.createdAt.toMillis()
                      : 0,
                };
              })
              .sort(
                (a, b) =>
                  a.scheduledDate.localeCompare(b.scheduledDate) ||
                  a.startTime.localeCompare(b.startTime)
              );
            setMeetings(loaded);
            setMeetingsLoading(false);
            setMeetingsError(null);
          },
          (error) => {
            setMeetingsLoading(false);
            setMeetingsError(error instanceof Error ? error.message : String(error));
            handleFirestoreError(error, OperationType.LIST, 'meetings');
          }
        )
      );

      // 6. Teachers Listener (`teachers`)
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'teachers'), where('ownerId', '==', uid)),
          (snapshot) => {
            const loaded: TeacherDoc[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                ownerId: data.ownerId,
                name: data.name,
                title: data.title || '',
                department: data.department || '',
                avatarUrl: data.avatarUrl || '',
              };
            });
            setTeachers(loaded);
            setTeachersLoading(false);
          },
          (error) => {
            setTeachersLoading(false);
            handleFirestoreError(error, OperationType.LIST, 'teachers');
          }
        )
      );

      // 7. Students Listener (`students`)
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'students'), where('ownerId', '==', uid)),
          (snapshot) => {
            const loaded: StudentDoc[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                ownerId: data.ownerId,
                classId: data.classId,
                name: data.name,
                studentCode: data.studentCode,
                cohort: data.cohort || '',
                avatarUrl: data.avatarUrl || '',
                status: data.status || 'active',
              };
            });
            setStudents(loaded);
            setStudentsLoading(false);
          },
          (error) => {
            setStudentsLoading(false);
            handleFirestoreError(error, OperationType.LIST, 'students');
          }
        )
      );

      // 8. Notifications Listener (`notifications`)
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'notifications'), where('ownerId', '==', uid)),
          (snapshot) => {
            const loaded: NotificationDoc[] = snapshot.docs
              .map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  ownerId: data.ownerId,
                  title: data.title,
                  courseCode: data.courseCode,
                  detail: data.detail || '',
                  category: data.category,
                  read: Boolean(data.read),
                  createdAt:
                    data.createdAt && typeof data.createdAt.toMillis === 'function'
                      ? data.createdAt.toMillis()
                      : 0,
                };
              })
              .sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
            setNotifications(loaded);
            setNotificationsLoading(false);
          },
          (error) => {
            setNotificationsLoading(false);
            handleFirestoreError(error, OperationType.LIST, 'notifications');
          }
        )
      );

      // 9. Personal Notes Listener (`users/{uid}/notes`)
      unsubscribers.push(
        onSnapshot(
          query(collection(db, `users/${uid}/notes`), where('ownerId', '==', uid)),
          (snapshot) => {
            const notesMap: Record<string, string> = {};
            const existsMap: Record<string, boolean> = {};
            snapshot.docs.forEach((d) => {
              const data = d.data();
              notesMap[d.id] = data.content ?? '';
              existsMap[d.id] = true;
            });
            setMeetingNotes(notesMap);
            setExistingNoteIds(existsMap);
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${uid}/notes`);
          }
        )
      );
    }

    initAccountAndSubscribe().catch((err) => {
      if (cancelled) return;
      setUserLoading(false);
      setClassesLoading(false);
      setMeetingsLoading(false);
      setTeachersLoading(false);
      setStudentsLoading(false);
      setNotificationsLoading(false);
      setSettingsLoading(false);
      setClassesError(err instanceof Error ? err.message : String(err));
    });

    return () => {
      cancelled = true;
      unsubscribers.forEach((fn) => fn());
    };
  }, [authReady, firebaseUser]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setSettings((prev) => ({ ...prev, language: lang }));
    localStorage.setItem('sabeel_lang', lang);

    if (firebaseUser) {
      const uid = firebaseUser.uid;
      updateDoc(doc(db, 'settings', uid), {
        language: lang,
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `settings/${uid}`));
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    setSettings((prev) => ({ ...prev, theme: mode }));
    localStorage.setItem('sabeel_theme', mode);

    if (firebaseUser) {
      const uid = firebaseUser.uid;
      updateDoc(doc(db, 'settings', uid), {
        theme: mode,
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `settings/${uid}`));
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const login = async (emailHint?: string, rememberMe = true) => {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    if (emailHint?.trim()) {
      googleProvider.setCustomParameters({ login_hint: emailHint.trim() });
    } else {
      googleProvider.setCustomParameters({});
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (patch: Partial<UserDoc>) => {
    if (!firebaseUser || !user) return;
    const uid = firebaseUser.uid;
    const nextName = (patch.name ?? user.name).trim().slice(0, 100) || user.name;
    const nextDept = (patch.department ?? user.department).trim().slice(0, 140);
    const nextCohort = (patch.cohort ?? user.cohort).trim().slice(0, 60);
    const nextTz = (patch.timezone ?? user.timezone).trim().slice(0, 80) || user.timezone;
    const nextBio = (patch.bio ?? user.bio).trim().slice(0, 600);
    const nextInitials = computeInitials(nextName);

    try {
      await updateDoc(doc(db, 'users', uid), {
        name: nextName,
        department: nextDept,
        cohort: nextCohort,
        timezone: nextTz,
        bio: nextBio,
        initials: nextInitials,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const updateSettings = async (patch: Partial<Omit<SettingsDoc, 'ownerId'>>) => {
    const sanitizedPatch: Partial<Omit<SettingsDoc, 'ownerId'>> = { ...patch };
    if (typeof sanitizedPatch.microphoneId === 'string') {
      sanitizedPatch.microphoneId = sanitizedPatch.microphoneId.slice(0, 160);
    }
    if (typeof sanitizedPatch.cameraId === 'string') {
      sanitizedPatch.cameraId = sanitizedPatch.cameraId.slice(0, 160);
    }
    if (typeof sanitizedPatch.speakerId === 'string') {
      sanitizedPatch.speakerId = sanitizedPatch.speakerId.slice(0, 160);
    }

    const next: Omit<SettingsDoc, 'ownerId'> = { ...settings, ...sanitizedPatch };
    setSettings(next);
    if (sanitizedPatch.language) setLanguageState(sanitizedPatch.language);
    if (sanitizedPatch.theme) setThemeState(sanitizedPatch.theme);

    if (firebaseUser) {
      const uid = firebaseUser.uid;
      try {
        await updateDoc(doc(db, 'settings', uid), {
          ...sanitizedPatch,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `settings/${uid}`);
      }
    }
  };

  const createNotification = async (
    uid: string,
    payload: {
      title: string;
      courseCode: string;
      detail: string;
      category: NotificationCategory;
    }
  ) => {
    const notifId = `ntf-${Date.now()}`;
    try {
      await setDoc(doc(db, 'notifications', notifId), {
        ownerId: uid,
        title: payload.title.trim().slice(0, 160),
        courseCode: payload.courseCode.trim().slice(0, 24),
        detail: payload.detail.trim().slice(0, 300),
        category: payload.category,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`);
    }
  };

  const createClass = async (input: CreateClassInput): Promise<string | null> => {
    if (!firebaseUser) {
      throw new Error('AUTH_REQUIRED');
    }
    const uid = firebaseUser.uid;
    const classId = `cls-${Date.now()}`;
    const teacherId = `tch-${Date.now()}`;

    const code = input.code.trim().toUpperCase().slice(0, 24);
    const title = input.title.trim().slice(0, 140);
    const instructorName = input.instructorName.trim().slice(0, 100);
    const instructorTitle = input.instructorTitle.trim().slice(0, 120);
    const roomCode = input.roomCode.trim().toUpperCase().slice(0, 24);
    const scheduleSummary = input.scheduleSummary.trim().slice(0, 120);
    const description = input.description.trim().slice(0, 600);
    const safeSessions = Number.isFinite(input.totalSessions)
      ? input.totalSessions
      : 12;
    const totalSessions = Math.max(1, Math.min(200, Math.round(safeSessions || 12)));
    const syllabusTopics = input.syllabusTopics
      .map((s) => s.trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, 10);

    if (!code || !title || !instructorName || !roomCode) {
      throw new Error('VALIDATION_ERROR');
    }

    const batch = writeBatch(db);

    batch.set(doc(db, 'teachers', teacherId), {
      ownerId: uid,
      name: instructorName,
      title: instructorTitle,
      department: input.discipline,
      avatarUrl: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    batch.set(doc(db, 'classes', classId), {
      ownerId: uid,
      code,
      title,
      discipline: input.discipline,
      teacherId,
      instructorName,
      instructorTitle,
      instructorAvatar: '',
      scheduleSummary,
      roomCode,
      totalSessions,
      completedSessions: 0,
      enrolledCount: 1,
      description,
      syllabusTopics,
      isLiveNow: Boolean(input.isLiveNow),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `classes/${classId}`);
    }

    try {
      await createNotification(uid, {
        title,
        courseCode: code,
        detail: `${instructorName} · ${roomCode}`,
        category: 'session',
      });
    } catch (notifErr) {
      console.warn('Non-blocking notification error:', notifErr);
    }

    return classId;
  };

  const deleteClass = async (classId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(doc(db, 'classes', classId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `classes/${classId}`);
    }
  };

  const createMeeting = async (input: CreateMeetingInput): Promise<string | null> => {
    if (!firebaseUser) {
      throw new Error('AUTH_REQUIRED');
    }
    const targetClass = classes.find((c) => c.id === input.classId);
    const title = input.title.trim().slice(0, 160);
    if (!targetClass || !title) {
      throw new Error('VALIDATION_ERROR');
    }

    const uid = firebaseUser.uid;
    const meetingId = `mtg-${Date.now()}`;
    const [sh, sm] = input.startTime.split(':').map(Number);
    const [eh, em] = input.endTime.split(':').map(Number);
    const diff =
      !Number.isNaN(sh) && !Number.isNaN(eh)
        ? Math.max(15, Math.min(480, eh * 60 + (em || 0) - (sh * 60 + (sm || 0))))
        : 60;

    try {
      await setDoc(doc(db, 'meetings', meetingId), {
        ownerId: uid,
        classId: targetClass.id,
        courseCode: targetClass.code,
        title,
        instructorName: targetClass.instructorName,
        instructorAvatar: targetClass.instructorAvatar || '',
        scheduledDate: input.scheduledDate,
        startTime: input.startTime,
        endTime: input.endTime,
        durationMinutes: diff,
        roomCode: targetClass.roomCode,
        status: input.isLiveNow ? 'live' : 'upcoming',
        sessionType: input.sessionType,
        reminderEnabled: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `meetings/${meetingId}`);
    }

    try {
      await createNotification(uid, {
        title,
        courseCode: targetClass.code,
        detail: `${input.scheduledDate} · ${input.startTime} – ${input.endTime}`,
        category: 'schedule',
      });
    } catch (notifErr) {
      console.warn('Non-blocking notification error:', notifErr);
    }

    return meetingId;
  };

  const toggleMeetingReminder = async (meetingId: string) => {
    const target = meetings.find((m) => m.id === meetingId);
    if (!target || target.status === 'completed') return;
    try {
      await updateDoc(doc(db, 'meetings', meetingId), {
        reminderEnabled: !target.reminderEnabled,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `meetings/${meetingId}`);
    }
  };

  const updateMeetingStatus = async (meetingId: string, status: MeetingStatus) => {
    const target = meetings.find((m) => m.id === meetingId);
    if (!target || target.status === 'completed') return;
    try {
      await updateDoc(doc(db, 'meetings', meetingId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `meetings/${meetingId}`);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `meetings/${meetingId}`);
    }
  };

  const createStudent = async (input: CreateStudentInput) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const studentId = `std-${Date.now()}`;
    try {
      await setDoc(doc(db, 'students', studentId), {
        ownerId: uid,
        classId: input.classId,
        name: input.name.trim().slice(0, 100),
        studentCode: input.studentCode.trim().slice(0, 40),
        cohort: input.cohort.trim().slice(0, 60),
        avatarUrl: '',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `students/${studentId}`);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!firebaseUser) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'notifications');
    }
  };

  const saveMeetingNote = async (classId: string, content: string) => {
    const trimmed = content.slice(0, 20000);
    setMeetingNotes((prev) => ({ ...prev, [classId]: trimmed }));
    if (!firebaseUser) return;

    const uid = firebaseUser.uid;
    const path = `users/${uid}/notes/${classId}`;
    const noteRef = doc(db, 'users', uid, 'notes', classId);
    try {
      if (existingNoteIds[classId]) {
        await updateDoc(noteRef, {
          content: trimmed,
          updatedAt: serverTimestamp(),
        });
      } else {
        setExistingNoteIds((prev) => ({ ...prev, [classId]: true }));
        await setDoc(noteRef, {
          ownerId: uid,
          classId,
          content: trimmed,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <AppContext.Provider
      value={{
        authReady,
        isAuthenticated: Boolean(firebaseUser),
        firebaseUser,
        login,
        logout,
        language,
        setLanguage,
        isRtl,
        t,
        theme,
        setTheme,
        toggleTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        user,
        userLoading,
        updateUser,
        classes,
        classesLoading,
        classesError,
        createClass,
        deleteClass,
        meetings,
        meetingsLoading,
        meetingsError,
        createMeeting,
        toggleMeetingReminder,
        updateMeetingStatus,
        deleteMeeting,
        teachers,
        teachersLoading,
        students,
        studentsLoading,
        createStudent,
        notifications,
        notificationsLoading,
        markNotificationRead,
        markAllNotificationsRead,
        settings,
        settingsLoading,
        updateSettings,
        activeMeetingId,
        setActiveMeetingId,
        meetingNotes,
        saveMeetingNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
