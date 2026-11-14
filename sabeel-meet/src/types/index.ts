export type ThemeMode = 'light' | 'dark';
export type LanguageCode = 'ar' | 'en';
export type UserRole = 'Student' | 'Teaching Fellow' | 'Instructor';

export type Discipline =
  | 'Computer Science'
  | 'Mathematics'
  | 'Humanities'
  | 'Economics'
  | 'Sciences'
  | 'Languages';

export type MeetingStatus = 'live' | 'upcoming' | 'completed';
export type SessionType = 'Live Lecture' | 'Seminar Discussion' | 'Lab Workshop';
export type NotificationCategory = 'session' | 'material' | 'note' | 'schedule';
export type ClassFileType = 'PDF' | 'Slides' | 'Dataset' | 'Worksheet' | 'Link';

/** Firestore collection: `users/{userId}` + `users/{userId}/private/info` */
export interface UserDoc {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  cohort: string;
  timezone: string;
  bio: string;
  avatarUrl: string;
  initials: string;
  createdAt?: number;
  updatedAt?: number;
}

/** Firestore collection: `classes/{classId}` */
export interface ClassDoc {
  id: string;
  ownerId: string;
  code: string;
  title: string;
  discipline: Discipline;
  teacherId: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  scheduleSummary: string;
  roomCode: string;
  totalSessions: number;
  completedSessions: number;
  enrolledCount: number;
  description: string;
  syllabusTopics: string[];
  isLiveNow: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** Firestore collection: `meetings/{meetingId}` */
export interface MeetingDoc {
  id: string;
  ownerId: string;
  classId: string;
  courseCode: string;
  title: string;
  instructorName: string;
  instructorAvatar: string;
  scheduledDate: string; // ISO YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  durationMinutes: number;
  roomCode: string;
  status: MeetingStatus;
  sessionType: SessionType;
  reminderEnabled: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** Firestore collection: `teachers/{teacherId}` */
export interface TeacherDoc {
  id: string;
  ownerId: string;
  name: string;
  title: string;
  department: string;
  avatarUrl: string;
  createdAt?: number;
  updatedAt?: number;
}

/** Firestore collection: `students/{studentId}` */
export interface StudentDoc {
  id: string;
  ownerId: string;
  classId: string;
  name: string;
  studentCode: string;
  cohort: string;
  avatarUrl: string;
  status: 'active' | 'excused';
  createdAt?: number;
  updatedAt?: number;
}

/** Firestore collection: `settings/{userId}` */
export interface SettingsDoc {
  ownerId: string;
  language: LanguageCode;
  theme: ThemeMode;
  microphoneId: string;
  cameraId: string;
  speakerId: string;
  autoMuteOnJoin: boolean;
  cameraOffOnJoin: boolean;
  sessionReminders: boolean;
  chatMentions: boolean;
  materialUploads: boolean;
  weeklyDigest: boolean;
  compactSchedule: boolean;
}

/** Firestore collection: `notifications/{notificationId}` */
export interface NotificationDoc {
  id: string;
  ownerId: string;
  title: string;
  courseCode: string;
  detail: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: number;
}

/** Firestore subcollection: `users/{userId}/notes/{classId}` */
export interface MeetingNoteDoc {
  id: string;
  ownerId: string;
  classId: string;
  content: string;
  updatedAt?: number;
}

/** Firestore subcollection: `classes/{classId}/messages/{messageId}` */
export interface RoomMessageDoc {
  id: string;
  ownerId: string;
  classId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: number;
}

/** Firestore subcollection: `classes/{classId}/files/{fileId}` */
export interface ClassFileDoc {
  id: string;
  ownerId: string;
  classId: string;
  name: string;
  size: string;
  type: ClassFileType;
  url: string;
  uploadedBy: string;
  summary: string;
  createdAt: number;
}

/** Live participant state from Jitsi + Firestore roster */
export interface RoomParticipant {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  initials: string;
  isMicOn: boolean;
  isCameraOn: boolean;
  isHandRaised: boolean;
  isLocal?: boolean;
}
