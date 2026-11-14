import { Discipline, LanguageCode, MeetingStatus, SessionType, UserRole } from '../types';

export interface TranslationDictionary {
  brandName: string;
  brandSubtitle: string;
  common: {
    loading: string;
    save: string;
    saving: string;
    cancel: string;
    close: string;
    delete: string;
    edit: string;
    create: string;
    add: string;
    refresh: string;
    search: string;
    clearFilters: string;
    errorOccurred: string;
    saveError: string;
    permissionError: string;
    offlineError: string;
    quotaError: string;
    retry: string;
    notSpecified: string;
    privacyTerms: string;
    hoursShort: string;
    minutesShort: string;
    liveNow: string;
    upcoming: string;
    completed: string;
    you: string;
    today: string;
    tomorrow: string;
  };
  nav: {
    dashboard: string;
    classes: string;
    schedule: string;
    meeting: string;
    profile: string;
    settings: string;
    signOut: string;
    darkMode: string;
    lightMode: string;
    collapseSidebar: string;
    expandSidebar: string;
    openMenu: string;
    closeMenu: string;
  };
  topbar: {
    joinByCode: string;
    joinByCodeShort: string;
    joinLiveClass: string;
    joinLiveShort: string;
    routes: {
      dashboardTitle: string;
      dashboardSubtitle: string;
      classesTitle: string;
      classesSubtitle: (count: number) => string;
      scheduleTitle: string;
      scheduleSubtitle: string;
      profileTitle: string;
      profileSubtitle: string;
      settingsTitle: string;
      settingsSubtitle: string;
      fallbackSubtitle: string;
    };
    joinModal: {
      title: string;
      description: string;
      roomCodeLabel: string;
      roomCodePlaceholder: string;
      availableRooms: string;
      noRoomsAvailable: string;
      enterRoom: string;
      invalidEmpty: string;
      notFound: (code: string) => string;
    };
  };
  login: {
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    feature1: string;
    feature2: string;
    feature3: string;
    heading: string;
    subheading: string;
    googleEmailHintLabel: string;
    googleEmailHintPlaceholder: string;
    rememberDevice: string;
    continueWithGoogle: string;
    signingIn: string;
    authFooter: string;
    suiteName: string;
    popupClosedError: string;
    popupBlockedError: string;
    authFailedError: string;
    invalidEmailError: string;
    toggleTheme: string;
  };
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    workspaceHeaderFallback: string;
    createClass: string;
    scheduleMeeting: string;
    joinLiveMeeting: string;
    stats: {
      activeClasses: string;
      activeClassesDetail: string;
      todaysMeetings: string;
      liveCountDetail: (n: number) => string;
      noLiveNow: string;
      weeklyHours: string;
      acrossMeetings: (n: number) => string;
      completionRate: string;
      sessionsProgress: (done: number, total: number) => string;
    };
    todaysSchedule: string;
    scheduledCount: (n: number) => string;
    fullSchedule: string;
    noMeetingsToday: string;
    noMeetingsTodayHint: string;
    joinClassBtn: string;
    enterRoomBtn: string;
    upcomingClasses: string;
    viewAllClasses: (n: number) => string;
    noClassesFound: string;
    noClassesFoundHint: string;
    createFirstClass: string;
    termProgress: string;
    quickActions: string;
    actions: {
      joinActiveTitle: string;
      joinActiveRoom: (code: string, room: string) => string;
      createClassTitle: string;
      createClassDesc: string;
      scheduleMeetingTitle: string;
      scheduleMeetingDesc: string;
      browseClassesTitle: string;
      browseClassesDesc: string;
      avSettingsTitle: string;
      avSettingsDesc: string;
    };
    notificationsTitle: string;
    notificationsMarkAll: string;
    noNotifications: string;
    noNotificationsHint: string;
  };
  classes: {
    title: string;
    subtitle: string;
    createClass: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    allDisciplines: string;
    enrolledCount: (n: number) => string;
    sessionsCompleted: string;
    joinLiveRoom: string;
    enterRoom: string;
    syllabus: string;
    deleteClass: string;
    noClassesFound: string;
    noClassesFoundHint: string;
    noMatchingClasses: string;
    noMatchingClassesHint: string;
    modalCreate: {
      title: string;
      description: string;
      codeLabel: string;
      codePlaceholder: string;
      titleLabel: string;
      titlePlaceholder: string;
      disciplineLabel: string;
      instructorLabel: string;
      instructorPlaceholder: string;
      instructorTitleLabel: string;
      instructorTitlePlaceholder: string;
      roomCodeLabel: string;
      roomCodePlaceholder: string;
      scheduleLabel: string;
      schedulePlaceholder: string;
      totalSessionsLabel: string;
      descriptionLabel: string;
      descriptionPlaceholder: string;
      topicsLabel: string;
      topicsPlaceholder: string;
      liveNowLabel: string;
      validationError: string;
      submit: string;
    };
    modalSyllabus: {
      roomCode: string;
      weeklySchedule: string;
      modulesTitle: string;
      noTopics: string;
      enterRoom: string;
    };
  };
  schedule: {
    title: string;
    subtitle: string;
    scheduleMeeting: string;
    allDays: (n: number) => string;
    noMeetingsScheduled: string;
    noMeetingsDayHint: string;
    viewAllDays: string;
    reminderOn: string;
    remindMe: string;
    markCompleted: string;
    joinLive: string;
    enterRoom: string;
    needClassFirst: string;
    modal: {
      title: string;
      description: string;
      classLabel: string;
      topicLabel: string;
      topicPlaceholder: string;
      dateLabel: string;
      startTimeLabel: string;
      endTimeLabel: string;
      sessionTypeLabel: string;
      markLiveLabel: string;
      validationError: string;
      submit: string;
    };
  };
  profile: {
    title: string;
    subtitle: string;
    editProfile: string;
    cancelEdit: string;
    profileUpdated: string;
    academicFocus: string;
    noBioYet: string;
    overviewStatsTitle: string;
    overviewStatsSubtitle: string;
    classesMetric: string;
    meetingsMetric: string;
    completedMetric: string;
    teachersMetric: string;
    studentsMetric: string;
    editForm: {
      title: string;
      fullName: string;
      timezone: string;
      department: string;
      departmentPlaceholder: string;
      cohort: string;
      cohortPlaceholder: string;
      bio: string;
      bioPlaceholder: string;
      saveChanges: string;
    };
    enrolledClassesTitle: string;
    enrolledClassesSubtitle: (n: number) => string;
    manage: string;
    noClassesYet: string;
    sessionsFraction: (done: number, total: number) => string;
  };
  settings: {
    title: string;
    subtitle: string;
    preferencesSaved: string;
    tabs: {
      appearance: string;
      av: string;
      notifications: string;
      account: string;
    };
    languageSection: {
      title: string;
      description: string;
      arabicName: string;
      arabicSub: string;
      englishName: string;
      englishSub: string;
    };
    themeSection: {
      title: string;
      description: string;
      lightMode: string;
      darkMode: string;
    };
    layoutSection: {
      title: string;
      compactLabel: string;
      compactDesc: string;
    };
    avSection: {
      title: string;
      description: string;
      micLabel: string;
      camLabel: string;
      spkLabel: string;
      systemDefault: string;
      testMic: string;
      stopTest: string;
      inputLevel: string;
      receivingSignal: (pct: number) => string;
      idle: string;
      micPermissionError: string;
      entryDefaultsTitle: string;
      muteOnEntryLabel: string;
      muteOnEntryDesc: string;
      camOffOnEntryLabel: string;
      camOffOnEntryDesc: string;
    };
    notificationsSection: {
      title: string;
      remindersLabel: string;
      remindersDesc: string;
      mentionsLabel: string;
      mentionsDesc: string;
      materialsLabel: string;
      materialsDesc: string;
      digestLabel: string;
      digestDesc: string;
    };
    accountSection: {
      title: string;
      signedInAs: string;
      emailLabel: string;
      roleLabel: string;
      signOutTitle: string;
      signOutDesc: string;
      signOutBtn: string;
    };
  };
  meeting: {
    backToWorkspace: string;
    connected: string;
    connecting: string;
    unavailable: string;
    hideSidebar: string;
    showSidebar: string;
    stageAria: string;
    preparingStream: (code: string) => string;
    jitsiLoadError: string;
    roomLabel: (code: string) => string;
    participantsCount: (n: number) => string;
    noClassTitle: string;
    noClassDesc: string;
    goToClasses: string;
    tabs: {
      participants: string;
      chat: string;
      notes: string;
      files: string;
    };
    participantsPanel: {
      inRoom: (n: number) => string;
      raiseHand: string;
      lowerHand: string;
      filterPlaceholder: string;
      empty: string;
      addStudentBtn: string;
      addStudentTitle: string;
      studentNameLabel: string;
      studentCodeLabel: string;
    };
    chatPanel: {
      empty: string;
      placeholder: string;
      send: string;
    };
    notesPanel: {
      title: string;
      saved: string;
      savedJustNow: string;
      placeholder: string;
      insertTimestamp: string;
      exportNotes: string;
      exportedToast: string;
    };
    filesPanel: {
      title: (n: number) => string;
      addFileBtn: string;
      empty: string;
      addModalTitle: string;
      fileNameLabel: string;
      fileTypeLabel: string;
      fileUrlLabel: string;
      fileSummaryLabel: string;
      previewOpenLink: string;
      deletedToast: string;
    };
    controls: {
      mute: string;
      unmute: string;
      camera: string;
      startVideo: string;
      shareScreen: string;
      sharingScreen: string;
      settings: string;
      whiteboard: string;
      invite: string;
      leave: string;
    };
    inviteModal: {
      title: string;
      description: string;
      roomCodeLabel: string;
      sabeelLinkLabel: string;
      jitsiLinkLabel: string;
      copyCode: string;
      copyLink: string;
      copied: string;
      copyFullInvite: string;
      shareNative: string;
      inviteMessageTemplate: (course: string, code: string, url: string) => string;
    };
    whiteboard: {
      title: string;
      pen: string;
      highlighter: string;
      line: string;
      rect: string;
      circle: string;
      eraser: string;
      undo: string;
      clear: string;
      exportPng: string;
      lightBoard: string;
      darkBoard: string;
      jitsiBoard: string;
      exportedToast: string;
    };
    settingsModal: {
      title: string;
      description: string;
      refreshDevices: string;
      permissionNotice: string;
      deviceApplied: string;
      switchFailed: string;
      speakerUnsupported: string;
      micToggleLabel: string;
      camToggleLabel: string;
      done: string;
    };
    leaveModal: {
      title: string;
      description: string;
      stay: string;
      leaveBtn: string;
    };
  };
  enums: {
    roles: Record<UserRole, string>;
    disciplines: Record<Discipline, string>;
    statuses: Record<MeetingStatus, string>;
    sessionTypes: Record<SessionType, string>;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  ar: {
    brandName: 'سبيل ميت',
    brandSubtitle: 'مساحة التعليم المباشر',
    common: {
      loading: 'جارٍ التحميل...',
      save: 'حفظ',
      saving: 'جارٍ الحفظ...',
      cancel: 'إلغاء',
      close: 'إغلاق',
      delete: 'حذف',
      edit: 'تعديل',
      create: 'إنشاء',
      add: 'إضافة',
      refresh: 'تحديث',
      search: 'بحث',
      clearFilters: 'إعادة ضبط التصفية',
      errorOccurred: 'حدث خطأ أثناء تحميل البيانات من الخادم.',
      saveError: 'تعذر حفظ البيانات في الخادم. يرجى المحاولة مرة أخرى.',
      permissionError: 'ليست لديك صلاحية لتنفيذ هذه العملية. تأكد من تسجيل الدخول بحساب Google موثق.',
      offlineError: 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مجدداً.',
      quotaError: 'تم تجاوز حد الاستخدام اليومي لقاعدة البيانات. يرجى المحاولة لاحقاً.',
      retry: 'إعادة المحاولة',
      notSpecified: 'غير محدد',
      privacyTerms: 'الخصوصية والشروط',
      hoursShort: 'س',
      minutesShort: 'دقيقة',
      liveNow: 'مباشر الآن',
      upcoming: 'قادم',
      completed: 'مكتمل',
      you: 'أنت',
      today: 'اليوم',
      tomorrow: 'غداً',
    },
    nav: {
      dashboard: 'لوحة التحكم',
      classes: 'فصولي الدراسية',
      schedule: 'الجدول الزمني',
      meeting: 'غرفة الاجتماع',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      signOut: 'تسجيل الخروج',
      darkMode: 'الوضع الداكن',
      lightMode: 'الوضع الفاتح',
      collapseSidebar: 'طي القائمة الجانبية',
      expandSidebar: 'توسيع القائمة الجانبية',
      openMenu: 'فتح قائمة التنقل',
      closeMenu: 'إغلاق قائمة التنقل',
    },
    topbar: {
      joinByCode: 'الانضمام برمز',
      joinByCodeShort: 'رمز الغرفة',
      joinLiveClass: 'دخول الفصل المباشر',
      joinLiveShort: 'فصل مباشر',
      routes: {
        dashboardTitle: 'نظرة عامة على المساحة',
        dashboardSubtitle: 'مركز المتابعة الأكاديمية',
        classesTitle: 'فصولي الدراسية',
        classesSubtitle: (count) =>
          count === 0
            ? 'لا توجد فصول مسجلة'
            : `${formatLocalizedNumber(count, 'ar')} فصول دراسية نشطة`,
        scheduleTitle: 'الجدول الزمني',
        scheduleSubtitle: 'المحاضرات والندوات المجدولة',
        profileTitle: 'الملف الأكاديمي',
        profileSubtitle: 'بيانات الحساب والسجل التعليمي',
        settingsTitle: 'إعدادات المساحة',
        settingsSubtitle: 'اللغة والمظهر وأجهزة الصوت والفيديو',
        fallbackSubtitle: 'مساحة العمل التعليمية',
      },
      joinModal: {
        title: 'الانضمام إلى قاعة دراسية',
        description: 'أدخل رمز القاعة الدراسية أو اختر إحدى القاعات المتاحة أدناه.',
        roomCodeLabel: 'رمز القاعة',
        roomCodePlaceholder: 'أدخل رمز القاعة',
        availableRooms: 'القاعات المتاحة',
        noRoomsAvailable: 'لا توجد قاعات دراسية مضافة حتى الآن.',
        enterRoom: 'دخول القاعة',
        invalidEmpty: 'يرجى إدخال رمز القاعة أولاً.',
        notFound: (code) => `لم يتم العثور على فصل دراسي مطابق للرمز ${code}.`,
      },
    },
    login: {
      eyebrow: 'منصة الفصول التعليمية المباشرة',
      heroTitle: 'ندوات منظمة، ونقاشات تفاعلية، وملاحظات متزامنة في بيئة هادئة واحدة.',
      heroBody:
        'مصممة للمجموعات الدراسية وأعضاء هيئة التدريس. انضم إلى قاعتك المباشرة، واستعرض الخطط الدراسية، واحتفظ بملاحظاتك منظمة.',
      feature1: 'قاعات بث عالية الجودة',
      feature2: 'مزامنة فورية عبر السحابة',
      feature3: 'ملاحظات ودردشة منظمة',
      heading: 'تسجيل الدخول إلى سبيل ميت',
      subheading: 'سجّل الدخول بحسابك في جوجل للوصول إلى فصولك وجدولك الدراسي.',
      googleEmailHintLabel: 'البريد الإلكتروني (اختياري لتسهيل الاختيار)',
      googleEmailHintPlaceholder: 'name@institution.edu',
      rememberDevice: 'الإبقاء على تسجيل الدخول على هذا الجهاز',
      continueWithGoogle: 'المتابعة باستخدام Google',
      signingIn: 'جارٍ الدخول إلى المساحة...',
      authFooter: 'محمي عبر مصادقة Google الآمنة.',
      suiteName: 'منصة سبيل ميت التعليمية',
      popupClosedError: 'تم إغلاق نافذة تسجيل الدخول قبل إتمام المصادقة.',
      popupBlockedError: 'حظر المتصفح نافذة تسجيل الدخول المنبثقة. يرجى السماح بالنوافذ المنبثقة والمحاولة مجدداً.',
      authFailedError: 'تعذر إتمام تسجيل الدخول. يرجى المحاولة مرة أخرى.',
      invalidEmailError: 'يرجى إدخال بريد إلكتروني صحيح أو ترك الحقل فارغاً.',
      toggleTheme: 'تبديل المظهر',
    },
    dashboard: {
      greetingMorning: 'صباح الخير',
      greetingAfternoon: 'طاب مساؤك',
      greetingEvening: 'مساء الخير',
      workspaceHeaderFallback: 'مساحة الطالب الأكاديمية',
      createClass: 'إنشاء فصل',
      scheduleMeeting: 'جدولة اجتماع',
      joinLiveMeeting: 'دخول البث المباشر',
      stats: {
        activeClasses: 'الفصول النشطة',
        activeClassesDetail: 'المسجلة في حسابك',
        todaysMeetings: 'اجتماعات اليوم',
        liveCountDetail: (n) => `${formatLocalizedNumber(n, 'ar')} قاعات مباشرة الآن`,
        noLiveNow: 'لا توجد قاعات مباشرة حالياً',
        weeklyHours: 'الساعات المجدولة',
        acrossMeetings: (n) => `عبر ${formatLocalizedNumber(n, 'ar')} اجتماعات`,
        completionRate: 'نسبة الإنجاز',
        sessionsProgress: (done, total) =>
          `${formatLocalizedNumber(done, 'ar')} من ${formatLocalizedNumber(total, 'ar')} جلسة`,
      },
      todaysSchedule: 'جدول اليوم',
      scheduledCount: (n) => `${formatLocalizedNumber(n, 'ar')} جلسات مجدولة`,
      fullSchedule: 'الجدول الكامل',
      noMeetingsToday: 'لا توجد اجتماعات مجدولة.',
      noMeetingsTodayHint: 'قم بجدولة اجتماع جديد لأحد فصولك أو استعرض الجدول الكامل.',
      joinClassBtn: 'دخول الفصل',
      enterRoomBtn: 'فتح القاعة',
      upcomingClasses: 'الفصول الدراسية',
      viewAllClasses: (n) => `عرض جميع الفصول (${formatLocalizedNumber(n, 'ar')})`,
      noClassesFound: 'لا توجد فصول دراسية.',
      noClassesFoundHint: 'أنشئ فصلك الدراسي الأول للبدء بتنظيم المحاضرات والغرف المباشرة.',
      createFirstClass: 'إنشاء أول فصل دراسي',
      termProgress: 'تقدم الفصل',
      quickActions: 'إجراءات سريعة',
      actions: {
        joinActiveTitle: 'الانضمام إلى الفصل المباشر',
        joinActiveRoom: (code, room) => `${code} · القاعة ${room}`,
        createClassTitle: 'إنشاء فصل دراسي جديد',
        createClassDesc: 'أضف مقرراً جديداً ومعلمه وقاعته',
        scheduleMeetingTitle: 'جدولة اجتماع دراسي',
        scheduleMeetingDesc: 'تحديد موعد محاضرة أو حلقة نقاش',
        browseClassesTitle: 'تصفح الفصول والخطط',
        browseClassesDesc: 'استعراض التفاصيل والموضوعات',
        avSettingsTitle: 'اختبار الصوت والكاميرا',
        avSettingsDesc: 'التحقق من الأجهزة قبل المحاضرة',
      },
      notificationsTitle: 'الإشعارات',
      notificationsMarkAll: 'تحديد الكل كمقروء',
      noNotifications: 'لا توجد إشعارات.',
      noNotificationsHint: 'ستظهر هنا التحديثات عند إنشاء الفصول أو جدولة الاجتماعات.',
    },
    classes: {
      title: 'فصولي الدراسية',
      subtitle: 'الفصول المسجلة، قاعات المحاضرات المباشرة، والخطط الدراسية.',
      createClass: 'إنشاء فصل دراسي',
      searchPlaceholder: 'ابحث باسم الفصل أو الرمز أو المعلم',
      searchAriaLabel: 'البحث في الفصول الدراسية',
      allDisciplines: 'الكل',
      enrolledCount: (n) => `${formatLocalizedNumber(n, 'ar')} مسجل`,
      sessionsCompleted: 'الجلسات المكتملة',
      joinLiveRoom: 'دخول القاعة المباشرة',
      enterRoom: 'دخول القاعة',
      syllabus: 'الخطة الدراسية',
      deleteClass: 'حذف الفصل',
      noClassesFound: 'لا توجد فصول دراسية.',
      noClassesFoundHint: 'لم تقم بإضافة أي فصل دراسي بعد. أضف فصلك الأول للبدء.',
      noMatchingClasses: 'لا توجد فصول مطابقة للتصفية.',
      noMatchingClassesHint: 'جرّب مسح نص البحث أو اختيار جميع التخصصات.',
      modalCreate: {
        title: 'إنشاء فصل دراسي جديد',
        description: 'سيتم حفظ الفصل مباشرة في قاعدة بيانات Firestore الخاصة بك.',
        codeLabel: 'رمز المقرر',
        codePlaceholder: 'مثال: CS-304',
        titleLabel: 'عنوان الفصل الدراسي',
        titlePlaceholder: 'مثال: هندسة النظم الموزعة',
        disciplineLabel: 'التخصص',
        instructorLabel: 'اسم المعلم',
        instructorPlaceholder: 'اسم الأستاذ أو المحاضر',
        instructorTitleLabel: 'الصفة الأكاديمية (اختياري)',
        instructorTitlePlaceholder: 'مثال: أستاذ مساعد',
        roomCodeLabel: 'رمز القاعة',
        roomCodePlaceholder: 'مثال: SBL-304',
        scheduleLabel: 'ملخص المواعيد',
        schedulePlaceholder: 'مثال: الأحد والثلاثاء · 10:00',
        totalSessionsLabel: 'إجمالي الجلسات',
        descriptionLabel: 'وصف الفصل',
        descriptionPlaceholder: 'نبذة مختصرة عن أهداف الفصل ومحتواه...',
        topicsLabel: 'محاور المقرر (موضوع في كل سطر)',
        topicsPlaceholder: 'الموضوع الأول\nالموضوع الثاني',
        liveNowLabel: 'تعيين كقاعة مباشرة الآن',
        validationError: 'يرجى ملء الحقول المطلوبة: رمز المقرر، رمز القاعة، عنوان الفصل، واسم المعلم.',
        submit: 'حفظ الفصل الدراسي',
      },
      modalSyllabus: {
        roomCode: 'رمز القاعة',
        weeklySchedule: 'الجدول الأسبوعي',
        modulesTitle: 'محاور المنهج الدراسي',
        noTopics: 'لم تُضف محاور دراسية لهذا الفصل بعد.',
        enterRoom: 'دخول قاعة الفصل',
      },
    },
    schedule: {
      title: 'الجدول الزمني',
      subtitle: 'إدارة الاجتماعات والمحاضرات المجدولة عبر الأيام.',
      scheduleMeeting: 'جدولة اجتماع',
      allDays: (n) => `كامل الجدول (${formatLocalizedNumber(n, 'ar')})`,
      noMeetingsScheduled: 'لا توجد اجتماعات مجدولة.',
      noMeetingsDayHint: 'جدولك فارغ حالياً. يمكنك جدولة اجتماع جديد لأحد فصولك الدراسية.',
      viewAllDays: 'عرض كافة الأيام',
      reminderOn: 'التذكير مفعل',
      remindMe: 'تذكيري',
      markCompleted: 'تحديد كمكتمل',
      joinLive: 'انضم الآن',
      enterRoom: 'دخول القاعة',
      needClassFirst: 'يرجى إنشاء فصل دراسي واحد على الأقل قبل جدولة اجتماع.',
      modal: {
        title: 'جدولة اجتماع دراسي',
        description: 'إضافة محاضرة أو حلقة نقاش إلى جدولك في Firestore.',
        classLabel: 'الفصل الدراسي',
        topicLabel: 'موضوع الاجتماع',
        topicPlaceholder: 'مثال: مراجعة الفصل الثالث',
        dateLabel: 'التاريخ',
        startTimeLabel: 'وقت البدء',
        endTimeLabel: 'وقت الانتهاء',
        sessionTypeLabel: 'نوع الجلسة',
        markLiveLabel: 'بدء الاجتماع مباشرة الآن',
        validationError: 'يرجى اختيار الفصل الدراسي وإدخال موضوع الاجتماع.',
        submit: 'حفظ الاجتماع',
      },
    },
    profile: {
      title: 'الملف الشخصي',
      subtitle: 'الهوية الأكاديمية، البيانات الحقيقية للحساب، والفصول المسجلة.',
      editProfile: 'تعديل الملف',
      cancelEdit: 'إلغاء التعديل',
      profileUpdated: 'تم تحديث الملف الشخصي',
      academicFocus: 'نبذة أكاديمية',
      noBioYet: 'لم تتم إضافة نبذة أكاديمية بعد.',
      overviewStatsTitle: 'إحصائيات الحساب الفعلية',
      overviewStatsSubtitle: 'محسوبة مباشرة من سجلات Firestore الخاصة بك',
      classesMetric: 'الفصول الدراسية',
      meetingsMetric: 'إجمالي الاجتماعات',
      completedMetric: 'اجتماعات مكتملة',
      teachersMetric: 'المعلمون',
      studentsMetric: 'الطلاب المسجلون',
      editForm: {
        title: 'تحديث بيانات الملف الشخصي',
        fullName: 'الاسم الكامل',
        timezone: 'المنطقة الزمنية',
        department: 'القسم أو التخصص',
        departmentPlaceholder: 'مثال: علوم الحاسب',
        cohort: 'الدفعة / المستوى',
        cohortPlaceholder: 'مثال: السنة الثالثة',
        bio: 'النبذة الأكاديمية',
        bioPlaceholder: 'اكتب اهتماماتك الدراسية والبحثية...',
        saveChanges: 'حفظ التغييرات',
      },
      enrolledClassesTitle: 'الفصول الدراسية المسجلة',
      enrolledClassesSubtitle: (n) =>
        `${formatLocalizedNumber(n, 'ar')} فصول مسجلة في حسابك`,
      manage: 'إدارة الفصول',
      noClassesYet: 'لا توجد فصول دراسية.',
      sessionsFraction: (done, total) =>
        `${formatLocalizedNumber(done, 'ar')}/${formatLocalizedNumber(total, 'ar')} جلسات`,
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'تخصيص اللغة والمظهر، وأجهزة الصوت والفيديو، وتفضيلات الإشعارات.',
      preferencesSaved: 'تم حفظ التفضيلات',
      tabs: {
        appearance: 'اللغة والمظهر',
        av: 'الصوت والفيديو',
        notifications: 'الإشعارات',
        account: 'الحساب',
      },
      languageSection: {
        title: 'لغة الواجهة والاتجاه',
        description: 'اختر لغة المنصة. يتم تبديل اتجاه الواجهة تلقائياً بين اليمين واليسار.',
        arabicName: 'العربية',
        arabicSub: 'واجهة عربية كاملة من اليمين إلى اليسار (RTL)',
        englishName: 'English',
        englishSub: 'واجهة إنجليزية من اليسار إلى اليمين (LTR)',
      },
      themeSection: {
        title: 'سمة الألوان',
        description: 'التبديل بين الوضع النهاري الواضح والوضع الداكن المريح للعين.',
        lightMode: 'الوضع الفاتح',
        darkMode: 'الوضع الداكن',
      },
      layoutSection: {
        title: 'تفضيلات العرض',
        compactLabel: 'عرض مضغوط للجدول الزمني',
        compactDesc: 'إظهار بطاقات الاجتماعات بكثافة أكبر عند استعراض الجدول.',
      },
      avSection: {
        title: 'أجهزة الصوت والكاميرا',
        description: 'قراءة الأجهزة الفعلية المتصلة بجهازك وضبط إعدادات الدخول للقاعة.',
        micLabel: 'الميكروفون',
        camLabel: 'الكاميرا',
        spkLabel: 'مخرج الصوت',
        systemDefault: 'الإعداد الافتراضي للنظام',
        testMic: 'اختبار الميكروفون',
        stopTest: 'إيقاف الاختبار',
        inputLevel: 'مستوى الإدخال الفعلي',
        receivingSignal: (pct) =>
          `${formatLocalizedNumber(pct, 'ar')}% · يستقبل إشارة صوتية`,
        idle: 'خامل',
        micPermissionError: 'تعذر الوصول إلى الميكروفون. يرجى السماح بالصلاحية من المتصفح.',
        entryDefaultsTitle: 'إعدادات الدخول الافتراضية للقاعة',
        muteOnEntryLabel: 'كتم الميكروفون عند الدخول',
        muteOnEntryDesc: 'الدخول إلى المحاضرات المباشرة بميكروفون مكتوم تلقائياً.',
        camOffOnEntryLabel: 'إيقاف الكاميرا عند الدخول',
        camOffOnEntryDesc: 'إبقاء الكاميرا مغلقة حتى تقوم بتشغيلها يدوياً داخل القاعة.',
      },
      notificationsSection: {
        title: 'تفضيلات الإشعارات',
        remindersLabel: 'تذكيرات قبل بدء الجلسات',
        remindersDesc: 'تنبيه قبل موعد المحاضرات وحلقات النقاش المجدولة.',
        mentionsLabel: 'إشارات المحاضر والزملاء',
        mentionsDesc: 'إشعار عند الرد على رسائلك داخل دردشة القاعة.',
        materialsLabel: 'ملفات ومواد الفصل الجديدة',
        materialsDesc: 'تنبيه عند إضافة ملفات أو مراجع جديدة في الفصول.',
        digestLabel: 'الملخص الأسبوعي',
        digestDesc: 'استلام ملخص أسبوعي بساعات الاجتماعات القادمة.',
      },
      accountSection: {
        title: 'الحساب والجلسة',
        signedInAs: 'مسجل الدخول باسم',
        emailLabel: 'البريد الإلكتروني',
        roleLabel: 'الدور الأكاديمي',
        signOutTitle: 'تسجيل الخروج من سبيل ميت',
        signOutDesc: 'إنهاء جلستك الحالية والعودة إلى صفحة تسجيل الدخول.',
        signOutBtn: 'تسجيل الخروج',
      },
    },
    meeting: {
      backToWorkspace: 'العودة إلى لوحة التحكم',
      connected: 'متصل',
      connecting: 'جارٍ الاتصال...',
      unavailable: 'تعذر الاتصال بالقاعة',
      hideSidebar: 'إخفاء اللوحة الجانبية',
      showSidebar: 'إظهار اللوحة الجانبية',
      stageAria: 'منصة البث المرئي للفصل',
      preparingStream: (code) => `جارٍ تجهيز قاعة البث المباشر للفصل ${code}...`,
      jitsiLoadError: 'تعذر تحميل واجهة Jitsi Meet الخارجية. تحقق من الاتصال بالشبكة.',
      roomLabel: (code) => `القاعة ${code}`,
      participantsCount: (n) => `${formatLocalizedNumber(n, 'ar')} مشارك`,
      noClassTitle: 'لا توجد فصول دراسية.',
      noClassDesc: 'أنشئ فصلاً دراسياً أولاً لتشغيل قاعة البث المباشر المرتبطة به.',
      goToClasses: 'الانتقال إلى الفصول الدراسية',
      tabs: {
        participants: 'المشاركون',
        chat: 'المحادثة',
        notes: 'الملاحظات',
        files: 'الملفات',
      },
      participantsPanel: {
        inRoom: (n) => `داخل القاعة (${formatLocalizedNumber(n, 'ar')})`,
        raiseHand: 'رفع اليد',
        lowerHand: 'خفض اليد',
        filterPlaceholder: 'تصفية المشاركين',
        empty: 'لا يوجد مشاركون آخرون في القاعة حالياً.',
        addStudentBtn: 'إضافة طالب',
        addStudentTitle: 'تسجيل طالب في الفصل',
        studentNameLabel: 'اسم الطالب',
        studentCodeLabel: 'الرقم الجامعي',
      },
      chatPanel: {
        empty: 'لا توجد رسائل بعد. ابدأ النقاش مع الفصل.',
        placeholder: 'اكتب رسالة في محادثة القاعة...',
        send: 'إرسال الرسالة',
      },
      notesPanel: {
        title: 'ملاحظاتك الشخصية',
        saved: 'محفوظة',
        savedJustNow: 'حُفظت الآن',
        placeholder: 'دوّن ملاحظاتك المنظمة أثناء المحاضرة...',
        insertTimestamp: '+ طابع زمني',
        exportNotes: 'تصدير الملاحظات',
        exportedToast: 'تم تنزيل ملف الملاحظات بنجاح',
      },
      filesPanel: {
        title: (n) => `ملفات الفصل (${formatLocalizedNumber(n, 'ar')})`,
        addFileBtn: 'إضافة ملف',
        empty: 'لا توجد ملفات مرفوعة حتى الآن.',
        addModalTitle: 'إضافة مرجع أو ملف للفصل',
        fileNameLabel: 'اسم الملف أو المرجع',
        fileTypeLabel: 'النوع',
        fileUrlLabel: 'الرابط (اختياري)',
        fileSummaryLabel: 'ملخص المحتوى',
        previewOpenLink: 'فتح الرابط',
        deletedToast: 'تم حذف الملف من القائمة',
      },
      controls: {
        mute: 'كتم الصوت',
        unmute: 'تشغيل الصوت',
        camera: 'الكاميرا',
        startVideo: 'تشغيل الكاميرا',
        shareScreen: 'مشاركة الشاشة',
        sharingScreen: 'تتم المشاركة',
        settings: 'الإعدادات',
        whiteboard: 'الوايت بورد',
        invite: 'دعوة',
        leave: 'مغادرة',
      },
      inviteModal: {
        title: 'دعوة إلى القاعة الدراسية',
        description: 'شارك رمز القاعة أو رابط الاجتماع المباشر مع الطلاب والزملاء.',
        roomCodeLabel: 'رمز القاعة',
        sabeelLinkLabel: 'رابط قاعة سبيل ميت',
        jitsiLinkLabel: 'رابط غرفة البث المباشر (Jitsi)',
        copyCode: 'نسخ الرمز',
        copyLink: 'نسخ الرابط',
        copied: 'تم النسخ',
        copyFullInvite: 'نسخ نص الدعوة كاملاً',
        shareNative: 'مشاركة',
        inviteMessageTemplate: (course, code, url) =>
          `دعوة للانضمام إلى فصل ${course} في سبيل ميت\nرمز القاعة: ${code}\nرابط القاعة: ${url}`,
      },
      whiteboard: {
        title: 'السبورة التفاعلية',
        pen: 'قلم',
        highlighter: 'تمييز',
        line: 'خط',
        rect: 'مستطيل',
        circle: 'دائرة',
        eraser: 'ممحاة',
        undo: 'تراجع',
        clear: 'مسح الكل',
        exportPng: 'تنزيل صورة',
        lightBoard: 'لوح فاتح',
        darkBoard: 'لوح داكن',
        jitsiBoard: 'سبورة Jitsi',
        exportedToast: 'تم تنزيل صورة السبورة',
      },
      settingsModal: {
        title: 'إعدادات الصوت والفيديو داخل القاعة',
        description: 'اضبط أجهزة الإدخال والإخراج النشطة لهذا الاجتماع مباشرة.',
        refreshDevices: 'تحديث الأجهزة',
        permissionNotice: 'يرجى السماح للمتصفح بالوصول إلى الميكروفون والكاميرا لعرض الأجهزة المتصلة.',
        deviceApplied: 'تم تطبيق الإعداد على القاعة المباشرة',
        switchFailed: 'تعذر التبديل إلى الجهاز المحدد.',
        speakerUnsupported: 'اختيار مخرج الصوت غير مدعوم في هذا المتصفح.',
        micToggleLabel: 'الميكروفون في القاعة',
        camToggleLabel: 'الكاميرا في القاعة',
        done: 'تم',
      },
      leaveModal: {
        title: 'مغادرة قاعة الاجتماع؟',
        description: 'يتم حفظ ملاحظاتك ورسائلك تلقائياً في Firestore.',
        stay: 'البقاء في القاعة',
        leaveBtn: 'مغادرة الفصل',
      },
    },
    enums: {
      roles: {
        Student: 'طالب',
        'Teaching Fellow': 'معيد',
        Instructor: 'محاضر',
      },
      disciplines: {
        'Computer Science': 'علوم الحاسب',
        Mathematics: 'الرياضيات',
        Humanities: 'العلوم الإنسانية',
        Economics: 'الاقتصاد',
        Sciences: 'العلوم الطبيعية',
        Languages: 'اللغات',
      },
      statuses: {
        live: 'مباشر الآن',
        upcoming: 'قادم',
        completed: 'مكتمل',
      },
      sessionTypes: {
        'Live Lecture': 'محاضرة مباشرة',
        'Seminar Discussion': 'حلقة نقاش',
        'Lab Workshop': 'ورشة تطبيقية',
      },
    },
  },

  en: {
    brandName: 'Sabeel Meet',
    brandSubtitle: 'Live Academic Workspace',
    common: {
      loading: 'Loading...',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      add: 'Add',
      refresh: 'Refresh',
      search: 'Search',
      clearFilters: 'Reset Filters',
      errorOccurred: 'An error occurred while loading data.',
      saveError: 'Could not save data to the server. Please try again.',
      permissionError: 'Missing or insufficient permissions. Ensure you are signed in with a verified Google account.',
      offlineError: 'You appear to be offline. Check your internet connection and try again.',
      quotaError: 'Daily Firestore usage quota exceeded. Please try again later.',
      retry: 'Retry',
      notSpecified: 'Not specified',
      privacyTerms: 'Privacy & Terms',
      hoursShort: 'h',
      minutesShort: 'min',
      liveNow: 'Live now',
      upcoming: 'Upcoming',
      completed: 'Completed',
      you: 'You',
      today: 'Today',
      tomorrow: 'Tomorrow',
    },
    nav: {
      dashboard: 'Dashboard',
      classes: 'My Classes',
      schedule: 'Schedule',
      meeting: 'Meeting Room',
      profile: 'Profile',
      settings: 'Settings',
      signOut: 'Sign Out',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      collapseSidebar: 'Collapse sidebar',
      expandSidebar: 'Expand sidebar',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
    },
    topbar: {
      joinByCode: 'Join by Code',
      joinByCodeShort: 'Code',
      joinLiveClass: 'Join Live Class',
      joinLiveShort: 'Join Live',
      routes: {
        dashboardTitle: 'Workspace Overview',
        dashboardSubtitle: 'Academic command center',
        classesTitle: 'My Classes',
        classesSubtitle: (count) =>
          count === 0
            ? 'No classes enrolled yet'
            : `${count} active ${count === 1 ? 'class' : 'classes'}`,
        scheduleTitle: 'Schedule',
        scheduleSubtitle: 'Scheduled lectures & workshops',
        profileTitle: 'Academic Profile',
        profileSubtitle: 'Account identity & enrolled classes',
        settingsTitle: 'Workspace Settings',
        settingsSubtitle: 'Language, appearance, audio & notifications',
        fallbackSubtitle: 'Academic workspace',
      },
      joinModal: {
        title: 'Join a Seminar Room',
        description: 'Enter a room code or pick one of your enrolled classes below.',
        roomCodeLabel: 'Room Code',
        roomCodePlaceholder: 'Enter room code',
        availableRooms: 'Available Classrooms',
        noRoomsAvailable: 'No classes have been created yet.',
        enterRoom: 'Enter Room',
        invalidEmpty: 'Please enter a valid room code.',
        notFound: (code) => `No class found matching room code ${code}.`,
      },
    },
    login: {
      eyebrow: 'Live Academic Classroom Platform',
      heroTitle: 'Structured seminars, live discussions, and shared notes in one calm space.',
      heroBody:
        'Built for focused cohorts and faculty. Join your live room, manage real course syllabi, and keep every session note synchronized.',
      feature1: 'HD Video Rooms',
      feature2: 'Real-Time Cloud Sync',
      feature3: 'Organized Notes & Chat',
      heading: 'Sign in to Sabeel Meet',
      subheading: 'Use your Google account to access your classes, schedule, and live rooms.',
      googleEmailHintLabel: 'Account Email (optional hint)',
      googleEmailHintPlaceholder: 'name@institution.edu',
      rememberDevice: 'Keep this device signed in',
      continueWithGoogle: 'Continue with Google',
      signingIn: 'Entering workspace...',
      authFooter: 'Protected by institutional Google authentication.',
      suiteName: 'Sabeel Meet Academic Suite',
      popupClosedError: 'Sign-in popup was closed before completing authentication.',
      popupBlockedError: 'Sign-in popup was blocked by your browser. Allow popups and try again.',
      authFailedError: 'Authentication failed. Please try signing in again.',
      invalidEmailError: 'Please enter a valid email address or leave the hint blank.',
      toggleTheme: 'Toggle color theme',
    },
    dashboard: {
      greetingMorning: 'Good morning',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      workspaceHeaderFallback: 'Academic Workspace',
      createClass: 'Create Class',
      scheduleMeeting: 'Schedule Meeting',
      joinLiveMeeting: 'Join Live Class',
      stats: {
        activeClasses: 'Active Classes',
        activeClassesDetail: 'Enrolled in your workspace',
        todaysMeetings: 'Today’s Meetings',
        liveCountDetail: (n) => `${n} live right now`,
        noLiveNow: 'No active rooms right now',
        weeklyHours: 'Scheduled Hours',
        acrossMeetings: (n) => `Across ${n} scheduled meetings`,
        completionRate: 'Term Completion',
        sessionsProgress: (done, total) => `${done} of ${total} sessions`,
      },
      todaysSchedule: 'Today’s Schedule',
      scheduledCount: (n) => `${n} scheduled ${n === 1 ? 'meeting' : 'meetings'}`,
      fullSchedule: 'Full Schedule',
      noMeetingsToday: 'No meetings scheduled.',
      noMeetingsTodayHint: 'Schedule a meeting for one of your classes or inspect the full agenda.',
      joinClassBtn: 'Join Class',
      enterRoomBtn: 'Enter Room',
      upcomingClasses: 'My Classes',
      viewAllClasses: (n) => `View all ${n} classes`,
      noClassesFound: 'No classes found.',
      noClassesFoundHint: 'Create your first class to start organizing live rooms and schedules.',
      createFirstClass: 'Create First Class',
      termProgress: 'Term Progress',
      quickActions: 'Quick Actions',
      actions: {
        joinActiveTitle: 'Join Active Seminar',
        joinActiveRoom: (code, room) => `${code} · Room ${room}`,
        createClassTitle: 'Create a New Class',
        createClassDesc: 'Add course code, instructor & room',
        scheduleMeetingTitle: 'Schedule a Meeting',
        scheduleMeetingDesc: 'Plan a live lecture or seminar',
        browseClassesTitle: 'Browse Course Syllabi',
        browseClassesDesc: 'Topics, schedules & details',
        avSettingsTitle: 'Test Audio & Camera',
        avSettingsDesc: 'Verify hardware before class',
      },
      notificationsTitle: 'Notifications',
      notificationsMarkAll: 'Mark all read',
      noNotifications: 'No notifications.',
      noNotificationsHint: 'Updates will appear here when classes or meetings are created.',
    },
    classes: {
      title: 'My Classes',
      subtitle: 'Enrolled courses, live lecture rooms, and syllabi stored in Firestore.',
      createClass: 'Create Class',
      searchPlaceholder: 'Search by class, code, or instructor',
      searchAriaLabel: 'Search classes',
      allDisciplines: 'All',
      enrolledCount: (n) => `${n} enrolled`,
      sessionsCompleted: 'Sessions completed',
      joinLiveRoom: 'Join Live Room',
      enterRoom: 'Enter Room',
      syllabus: 'Syllabus',
      deleteClass: 'Delete Class',
      noClassesFound: 'No classes found.',
      noClassesFoundHint: 'You have not created or enrolled in any classes yet.',
      noMatchingClasses: 'No classes match your filter.',
      noMatchingClassesHint: 'Try clearing your search query or switching back to all disciplines.',
      modalCreate: {
        title: 'Create New Class',
        description: 'This class will be saved directly to your Firestore database.',
        codeLabel: 'Course Code',
        codePlaceholder: 'e.g. CS-304',
        titleLabel: 'Class Title',
        titlePlaceholder: 'e.g. Distributed Systems Architecture',
        disciplineLabel: 'Discipline',
        instructorLabel: 'Instructor Name',
        instructorPlaceholder: 'e.g. Dr. Tariq Al-Mansoor',
        instructorTitleLabel: 'Academic Title (optional)',
        instructorTitlePlaceholder: 'e.g. Associate Professor',
        roomCodeLabel: 'Room Code',
        roomCodePlaceholder: 'e.g. SBL-304',
        scheduleLabel: 'Schedule Summary',
        schedulePlaceholder: 'e.g. Mon, Wed · 10:00 – 11:15',
        totalSessionsLabel: 'Total Sessions',
        descriptionLabel: 'Class Description',
        descriptionPlaceholder: 'Brief overview of the course objectives and curriculum...',
        topicsLabel: 'Syllabus Modules (one per line)',
        topicsPlaceholder: 'Module 1\nModule 2',
        liveNowLabel: 'Mark classroom as live right now',
        validationError: 'Please fill in all required fields: course code, room code, class title, and instructor name.',
        submit: 'Save Class',
      },
      modalSyllabus: {
        roomCode: 'Room Code',
        weeklySchedule: 'Weekly Schedule',
        modulesTitle: 'Core Syllabus Modules',
        noTopics: 'No syllabus topics have been added for this class yet.',
        enterRoom: 'Enter Classroom',
      },
    },
    schedule: {
      title: 'Schedule',
      subtitle: 'Manage scheduled lectures, workshops, and live meetings.',
      scheduleMeeting: 'Schedule Meeting',
      allDays: (n) => `All Meetings (${n})`,
      noMeetingsScheduled: 'No meetings scheduled.',
      noMeetingsDayHint: 'Your schedule is clear. Add a meeting for any of your classes.',
      viewAllDays: 'View All Meetings',
      reminderOn: 'Reminder On',
      remindMe: 'Remind Me',
      markCompleted: 'Mark Completed',
      joinLive: 'Join Live',
      enterRoom: 'Enter Room',
      needClassFirst: 'Please create at least one class before scheduling a meeting.',
      modal: {
        title: 'Schedule a Meeting',
        description: 'Add a live lecture or seminar session to Firestore.',
        classLabel: 'Class',
        topicLabel: 'Meeting Topic',
        topicPlaceholder: 'e.g. Midterm Review Session',
        dateLabel: 'Date',
        startTimeLabel: 'Start Time',
        endTimeLabel: 'End Time',
        sessionTypeLabel: 'Session Type',
        markLiveLabel: 'Start meeting live immediately',
        validationError: 'Please select a class and enter a meeting topic.',
        submit: 'Save Meeting',
      },
    },
    profile: {
      title: 'Profile',
      subtitle: 'Verified account identity, profile details, and real enrollment stats.',
      editProfile: 'Edit Profile',
      cancelEdit: 'Cancel Edit',
      profileUpdated: 'Profile updated',
      academicFocus: 'Academic Bio',
      noBioYet: 'No academic bio added yet.',
      overviewStatsTitle: 'Workspace Summary',
      overviewStatsSubtitle: 'Computed directly from your Firestore collections',
      classesMetric: 'Classes',
      meetingsMetric: 'Meetings',
      completedMetric: 'Completed',
      teachersMetric: 'Teachers',
      studentsMetric: 'Students',
      editForm: {
        title: 'Update Profile Details',
        fullName: 'Full Name',
        timezone: 'Timezone',
        department: 'Department & Track',
        departmentPlaceholder: 'e.g. Computer Science',
        cohort: 'Cohort / Year',
        cohortPlaceholder: 'e.g. Class of 2027',
        bio: 'Academic Bio',
        bioPlaceholder: 'Describe your academic focus and interests...',
        saveChanges: 'Save Changes',
      },
      enrolledClassesTitle: 'Enrolled Classes',
      enrolledClassesSubtitle: (n) => `${n} active ${n === 1 ? 'class' : 'classes'}`,
      manage: 'Manage',
      noClassesYet: 'No classes found.',
      sessionsFraction: (done, total) => `${done}/${total} sessions`,
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure language, theme, audio/video hardware, and notifications.',
      preferencesSaved: 'Preferences saved',
      tabs: {
        appearance: 'Appearance & Language',
        av: 'Audio & Video',
        notifications: 'Notifications',
        account: 'Account',
      },
      languageSection: {
        title: 'Interface Language & Direction',
        description: 'Choose your workspace language. Layout direction switches automatically.',
        arabicName: 'العربية',
        arabicSub: 'Full Arabic interface with Right-to-Left (RTL) layout',
        englishName: 'English',
        englishSub: 'Full English interface with Left-to-Right (LTR) layout',
      },
      themeSection: {
        title: 'Color Theme',
        description: 'Switch between crisp daylight canvas and low-glare studio dark mode.',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
      },
      layoutSection: {
        title: 'Layout Preferences',
        compactLabel: 'Compact schedule density',
        compactDesc: 'Show condensed time blocks when browsing scheduled meetings.',
      },
      avSection: {
        title: 'Audio & Camera Devices',
        description: 'Enumerates real hardware devices detected on your system.',
        micLabel: 'Microphone Input',
        camLabel: 'Camera Device',
        spkLabel: 'Audio Output',
        systemDefault: 'System Default',
        testMic: 'Test Mic',
        stopTest: 'Stop Test',
        inputLevel: 'Live input level',
        receivingSignal: (pct) => `${pct}% · Receiving audio`,
        idle: 'Idle',
        micPermissionError: 'Unable to access microphone. Please allow browser permission.',
        entryDefaultsTitle: 'Classroom Entry Defaults',
        muteOnEntryLabel: 'Mute microphone on entry',
        muteOnEntryDesc: 'Join live meetings muted automatically.',
        camOffOnEntryLabel: 'Start with camera off',
        camOffOnEntryDesc: 'Keep your camera disabled until you turn it on manually.',
      },
      notificationsSection: {
        title: 'Notification Preferences',
        remindersLabel: 'Session reminders',
        remindersDesc: 'Receive alerts before scheduled lectures and workshops begin.',
        mentionsLabel: 'Instructor & peer mentions',
        mentionsDesc: 'Notify when someone replies in seminar chat.',
        materialsLabel: 'New class files & resources',
        materialsDesc: 'Alert when new documents or links are added to a class.',
        digestLabel: 'Weekly academic summary',
        digestDesc: 'Receive a weekly summary of upcoming meetings and hours.',
      },
      accountSection: {
        title: 'Account & Session',
        signedInAs: 'Signed in as',
        emailLabel: 'Email Address',
        roleLabel: 'Account Role',
        signOutTitle: 'Sign out of Sabeel Meet',
        signOutDesc: 'End your current session and return to the login screen.',
        signOutBtn: 'Sign Out',
      },
    },
    meeting: {
      backToWorkspace: 'Back to workspace',
      connected: 'Connected',
      connecting: 'Connecting...',
      unavailable: 'Video room unavailable',
      hideSidebar: 'Hide room sidebar',
      showSidebar: 'Show room sidebar',
      stageAria: 'Video meeting stage',
      preparingStream: (code) => `Preparing Jitsi Meet stream for ${code}...`,
      jitsiLoadError: 'Unable to load Jitsi Meet External API. Check your network connection.',
      roomLabel: (code) => `Room ${code}`,
      participantsCount: (n) => `${n} ${n === 1 ? 'participant' : 'participants'}`,
      noClassTitle: 'No classes found.',
      noClassDesc: 'Create a class first to launch its live Jitsi classroom.',
      goToClasses: 'Go to My Classes',
      tabs: {
        participants: 'Participants',
        chat: 'Chat',
        notes: 'Notes',
        files: 'Files',
      },
      participantsPanel: {
        inRoom: (n) => `In this room (${n})`,
        raiseHand: 'Raise Hand',
        lowerHand: 'Lower Hand',
        filterPlaceholder: 'Filter participants',
        empty: 'No other participants in this room yet.',
        addStudentBtn: 'Add Student',
        addStudentTitle: 'Add Student to Class Roster',
        studentNameLabel: 'Student Name',
        studentCodeLabel: 'Student ID',
      },
      chatPanel: {
        empty: 'No messages yet. Start the discussion.',
        placeholder: 'Message seminar chat...',
        send: 'Send message',
      },
      notesPanel: {
        title: 'Personal Lecture Notes',
        saved: 'Saved',
        savedJustNow: 'Saved just now',
        placeholder: 'Take structured notes during the meeting...',
        insertTimestamp: '+ Timestamp',
        exportNotes: 'Export Notes',
        exportedToast: 'Notes downloaded to your device',
      },
      filesPanel: {
        title: (n) => `Shared Class Files (${n})`,
        addFileBtn: 'Add File',
        empty: 'No files uploaded yet.',
        addModalTitle: 'Add Class Material',
        fileNameLabel: 'Title / File Name',
        fileTypeLabel: 'Material Type',
        fileUrlLabel: 'Resource URL (optional)',
        fileSummaryLabel: 'Summary',
        previewOpenLink: 'Open Resource',
        deletedToast: 'File removed',
      },
      controls: {
        mute: 'Mute',
        unmute: 'Unmute',
        camera: 'Camera',
        startVideo: 'Start Video',
        shareScreen: 'Share Screen',
        sharingScreen: 'Sharing Screen',
        settings: 'Settings',
        whiteboard: 'Whiteboard',
        invite: 'Invite',
        leave: 'Leave',
      },
      inviteModal: {
        title: 'Invite to Classroom',
        description: 'Share the room code or direct classroom link with students and colleagues.',
        roomCodeLabel: 'Room Code',
        sabeelLinkLabel: 'Sabeel Meet Room Link',
        jitsiLinkLabel: 'Direct Live Stream Link (Jitsi)',
        copyCode: 'Copy Code',
        copyLink: 'Copy Link',
        copied: 'Copied',
        copyFullInvite: 'Copy Full Invitation',
        shareNative: 'Share',
        inviteMessageTemplate: (course, code, url) =>
          `Join ${course} on Sabeel Meet\nRoom Code: ${code}\nClassroom Link: ${url}`,
      },
      whiteboard: {
        title: 'Interactive Whiteboard',
        pen: 'Pen',
        highlighter: 'Highlighter',
        line: 'Line',
        rect: 'Rectangle',
        circle: 'Circle',
        eraser: 'Eraser',
        undo: 'Undo',
        clear: 'Clear',
        exportPng: 'Export PNG',
        lightBoard: 'Light Board',
        darkBoard: 'Dark Board',
        jitsiBoard: 'Jitsi Board',
        exportedToast: 'Whiteboard exported as PNG',
      },
      settingsModal: {
        title: 'Room Audio & Video Settings',
        description: 'Configure active input and output devices for this live meeting.',
        refreshDevices: 'Detect Devices',
        permissionNotice: 'Allow browser microphone and camera access to list connected devices.',
        deviceApplied: 'Applied to live meeting room',
        switchFailed: 'Could not switch to the selected device.',
        speakerUnsupported: 'Speaker output selection is not supported in this browser.',
        micToggleLabel: 'Room Microphone',
        camToggleLabel: 'Room Camera',
        done: 'Done',
      },
      leaveModal: {
        title: 'Leave Meeting Room?',
        description: 'Your personal notes and messages are saved automatically.',
        stay: 'Stay in Room',
        leaveBtn: 'Leave Class',
      },
    },
    enums: {
      roles: {
        Student: 'Student',
        'Teaching Fellow': 'Teaching Fellow',
        Instructor: 'Instructor',
      },
      disciplines: {
        'Computer Science': 'Computer Science',
        Mathematics: 'Mathematics',
        Humanities: 'Humanities',
        Economics: 'Economics',
        Sciences: 'Sciences',
        Languages: 'Languages',
      },
      statuses: {
        live: 'Live now',
        upcoming: 'Upcoming',
        completed: 'Completed',
      },
      sessionTypes: {
        'Live Lecture': 'Live Lecture',
        'Seminar Discussion': 'Seminar Discussion',
        'Lab Workshop': 'Lab Workshop',
      },
    },
  },
};

export function getLocale(lang: LanguageCode): string {
  return lang === 'ar' ? 'ar-SA' : 'en-US';
}

export function formatLocalizedNumber(value: number, lang: LanguageCode): string {
  return new Intl.NumberFormat(getLocale(lang)).format(value);
}

export function formatLocalizedDate(
  dateInput: Date | string | number,
  lang: LanguageCode,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' }
): string {
  const d =
    typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? new Date(`${dateInput}T12:00:00`)
      : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat(getLocale(lang), options).format(d);
}

export function formatLocalizedTime(hhmm: string, lang: LanguageCode): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(getLocale(lang), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: lang === 'ar',
  }).format(d);
}

export function getFirestoreErrorMessage(
  err: unknown,
  t: TranslationDictionary
): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  let inner = raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.error === 'string') {
      inner = parsed.error;
    }
  } catch {
    // Plain error message
  }

  const normalized = inner.toLowerCase();
  if (normalized.includes('quota exceeded') || normalized.includes('resource-exhausted')) {
    return t.common.quotaError;
  }
  if (
    normalized.includes('missing or insufficient permissions') ||
    normalized.includes('permission-denied') ||
    normalized.includes('auth_required')
  ) {
    return t.common.permissionError;
  }
  if (
    normalized.includes('offline') ||
    normalized.includes('unavailable') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('network')
  ) {
    return t.common.offlineError;
  }
  return t.common.saveError;
}
