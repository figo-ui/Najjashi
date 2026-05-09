import type { ZikrItem, SahabaLesson, AdhkarTime } from '../types';

// ─── Morning Adhkar ───
export const MORNING_ADHKAR: ZikrItem[] = [
  { id: 'm1', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', transliteration: 'Asbahnaa wa asbahal-mulku lillaah', translation: 'We have reached the morning and all sovereignty belongs to Allah', count: 1, completed: 0, reward: 'Whoever says this in the morning has completed his duty', category: 'morning' },
  { id: 'm2', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا', transliteration: 'Allaahumma bika asbahnaa wa bika amsainaa', translation: 'O Allah, by Your leave we have reached the morning', count: 1, completed: 0, reward: 'None has the right to be worshipped except You', category: 'morning' },
  { id: 'm3', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhaanallaahi wa bihamdih', translation: 'How perfect Allah is and I praise Him', count: 100, completed: 0, reward: 'His sins will be forgiven even if they are like the foam of the sea', category: 'morning' },
  { id: 'm4', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'Laa ilaaha illallaahu wahdahu laa shareeka lah', translation: 'None has the right to be worshipped except Allah, alone, without partner', count: 10, completed: 0, reward: 'Ten good deeds, ten sins wiped away', category: 'morning' },
  { id: 'm5', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', transliteration: "A'oodhu bikalimaatillaahit-taammaati min sharri maa khalaq", translation: 'I take refuge in Allah\'s perfect words from the evil He has created', count: 3, completed: 0, reward: 'Nothing will harm him', category: 'morning' },
  { id: 'm6', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', transliteration: 'Bismillaahilladhee laa yadhurru ma\'asmihi shay\'', translation: 'In the name of Allah with whose name nothing can cause harm', count: 3, completed: 0, reward: 'Nothing will harm him', category: 'morning' },
];

// ─── Evening Adhkar ───
export const EVENING_ADHKAR: ZikrItem[] = [
  { id: 'e1', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', transliteration: 'Amsainaa wa amsal-mulku lillaah', translation: 'We have reached the evening and all sovereignty belongs to Allah', count: 1, completed: 0, reward: 'Whoever says this in the evening has completed his duty', category: 'evening' },
  { id: 'e2', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا', transliteration: 'Allaahumma bika amsainaa wa bika asbahnaa', translation: 'O Allah, by Your leave we have reached the evening', count: 1, completed: 0, reward: 'None has the right to be worshipped except You', category: 'evening' },
  { id: 'e3', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhaanallaahi wa bihamdih', translation: 'How perfect Allah is and I praise Him', count: 100, completed: 0, reward: 'His sins will be forgiven even if they are like the foam of the sea', category: 'evening' },
  { id: 'e4', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', transliteration: "A'oodhu bikalimaatillaahit-taammaati min sharri maa khalaq", translation: 'I take refuge in Allah\'s perfect words from the evil He has created', count: 3, completed: 0, reward: 'Nothing will harm him', category: 'evening' },
  { id: 'e5', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', transliteration: 'Bismillaahilladhee laa yadhurru ma\'asmihi shay\'', translation: 'In the name of Allah with whose name nothing can cause harm', count: 3, completed: 0, reward: 'Nothing will harm him', category: 'evening' },
  { id: 'e6', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'Laa ilaaha illallaahu wahdahu laa shareeka lah', translation: 'None has the right to be worshipped except Allah, alone, without partner', count: 10, completed: 0, reward: 'Ten good deeds, ten sins wiped away', category: 'evening' },
  { id: 'e7', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', transliteration: 'Allaahumma bika amsainaa wa bika asbahnaa wa bika nahyaa wa bika namootu wa ilaykal-maseer', translation: 'O Allah, by Your leave we have reached the evening, by Your leave we have reached the morning, by Your leave we live and die, and to You is the return', count: 1, completed: 0, reward: 'Whoever says this in the evening has completed his duty', category: 'evening' },
  { id: 'e8', arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي', transliteration: 'Allaahumma \'aafinee fee badanee, Allaahumma \'aafinee fee sam\'ee, Allaahumma \'aafinee fee basaree', translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health', count: 1, completed: 0, reward: 'None has the right to be worshipped except You', category: 'evening' },
  { id: 'e9', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', transliteration: 'Allaahumma innee as\'alukal-\'afwa wal-\'aafiyata fid-dunyaa wal-aakhirah', translation: 'O Allah, I ask You for pardon and well-being in this life and the next', count: 1, completed: 0, reward: 'Whoever asks for well-being, Allah will grant it to him', category: 'evening' },
  { id: 'e10', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا', transliteration: 'Radiytu billaahi rabban wa bil-Islaami deenan wa bi-Muhammadin nabiyyan', translation: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad as my Prophet', count: 3, completed: 0, reward: 'Allah will be pleased with him on the Day of Judgment', category: 'evening' },
];

// ─── Sleep Adhkar ───
export const SLEEP_ADHKAR: ZikrItem[] = [
  { id: 's1', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration: 'Bismikallaahumma amootu wa ahyaa', translation: 'In Your name, O Allah, I die and I live', count: 1, completed: 0, reward: 'Recommended before sleeping', category: 'sleep' },
  { id: 's2', arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', transliteration: 'Allaahumma qinee \'adhaabaka yawma tab\'athu \'ibaadak', translation: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants', count: 1, completed: 0, reward: 'Whoever says this and dies that night, will be forgiven', category: 'sleep' },
  { id: 's3', arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhaanallaah', translation: 'How perfect Allah is', count: 33, completed: 0, reward: 'Sins are forgiven even if they are like the foam of the sea', category: 'sleep' },
  { id: 's4', arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdu lillaah', translation: 'All praise is for Allah', count: 33, completed: 0, reward: 'Sins are forgiven even if they are like the foam of the sea', category: 'sleep' },
  { id: 's5', arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allaahu akbar', translation: 'Allah is the Greatest', count: 34, completed: 0, reward: 'Better than having a servant', category: 'sleep' },
  { id: 's6', arabic: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ', transliteration: 'Allaahumma rabbas-samaawaatis-sab\'i wa rabbal-\'arshil-\'azeem', translation: 'O Allah, Lord of the seven heavens and Lord of the magnificent Throne', count: 1, completed: 0, reward: 'Whoever says this, Allah will protect him', category: 'sleep' },
];

// ─── After Prayer Adhkar ───
export const AFTER_PRAYER_ADHKAR: ZikrItem[] = [
  { id: 'ap1', arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullaah', translation: 'I ask Allah for forgiveness', count: 3, completed: 0, reward: 'Major sins are forgiven', category: 'after_prayer' },
  { id: 'ap2', arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ', transliteration: 'Allaahumma antas-salaamu wa minkas-salaam', translation: 'O Allah, You are As-Salam and from You comes all peace', count: 1, completed: 0, reward: 'Allah will grant him safety', category: 'after_prayer' },
  { id: 'ap3', arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'Subhaanallaah', translation: 'How perfect Allah is', count: 33, completed: 0, reward: 'Sins are forgiven even if they are like the foam of the sea', category: 'after_prayer' },
  { id: 'ap4', arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdu lillaah', translation: 'All praise is for Allah', count: 33, completed: 0, reward: 'Sins are forgiven even if they are like the foam of the sea', category: 'after_prayer' },
  { id: 'ap5', arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allaahu akbar', translation: 'Allah is the Greatest', count: 33, completed: 0, reward: 'Sins are forgiven even if they are like the foam of the sea', category: 'after_prayer' },
];

// ─── Sahaba Micro-Lessons: Abu Bakr As-Siddiq (RA) ───
export const ABU_BAKR_LESSONS: SahabaLesson[] = [
  { id: 'ab1', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 1, totalLessons: 25, title: 'The First to Believe', titleAr: 'أول من آمن', narration: 'Abu Bakr was the first adult man to accept Islam. When the Prophet ﷺ began preaching, Abu Bakr did not hesitate — he believed immediately, earning the title As-Siddiq (The Truthful).', narrationAr: 'كان أبو بكر أول رجل بالغ يقبل الإسلام. عندما بدأ النبي ﷺ الدعوة، لم يتردد أبو بكر — آمن فورًا، فاستحق لقب الصديق.', takeaway: 'Immediate trust in truth is the mark of a sincere heart', takeawayAr: 'الثقة الفورية بالحق هي علامة القلب الصادق', isComplete: false, isUnlocked: true },
  { id: 'ab2', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 2, totalLessons: 25, title: 'The Companion in the Cave', titleAr: 'الرفيق في الغار', narration: 'When the Prophet ﷺ fled Makkah, Abu Bakr accompanied him. In the cave of Thawr, Abu Bakr blocked a snake hole with his foot, willing to sacrifice himself so the Prophet could sleep peacefully.', narrationAr: 'عندما فر النبي ﷺ من مكة، رافقه أبو بكر. في غار ثور، سد أبو بكر ثقب أفعى بقدمه، مستعدًا للتضحية بنفسه لينام النبي بسلام.', takeaway: 'True friendship means putting others before yourself', takeawayAr: 'الصدق الحقيقي يعني تقديم الآخرين على نفسك', isComplete: false, isUnlocked: true },
  { id: 'ab3', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 3, totalLessons: 25, title: 'The Most Generous', titleAr: 'الأجود', narration: 'Abu Bakr spent his entire wealth for the sake of Islam. When asked what he left for his family, he replied: "I have left for them Allah and His Messenger."', narrationAr: 'أنفق أبو بكر ماله كله في سبيل الإسلام. وعندما سُئل ماذا ترك لأهله، أجاب: "تركت لهم الله ورسوله."', takeaway: 'True generosity is giving everything and trusting Allah', takeawayAr: 'الكرم الحقيقي هو العطاء الكلي والتوكل على الله', isComplete: false, isUnlocked: true },
  { id: 'ab4', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 4, totalLessons: 25, title: 'Freeing the Slaves', titleAr: 'عتق العبيد', narration: 'Abu Bakr purchased and freed many Muslim slaves who were being tortured by their masters in Makkah, including Bilal ibn Rabah, whose voice would later echo across the world calling the adhan.', narrationAr: 'اشترى أبو بكر وأعتق العديد من العبيد المسلمين الذين كانوا يُعذبون على يد سادتهم في مكة، منهم بلال بن رباح، الذي سيردد صوته الأذان في أنحاء العالم.', takeaway: 'Freedom is a right worth fighting for', takeawayAr: 'الحرية حق يستحق القتال من أجله', isComplete: false, isUnlocked: true },
  { id: 'ab5', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 5, totalLessons: 25, title: 'The Day of Grief', titleAr: 'يوم الحزن', narration: 'After the death of the Prophet ﷺ, while others were in shock and disbelief, Abu Bakr stood firm. He recited: "Muhammad is but a messenger. Messengers have passed away before him."', narrationAr: 'بعد وفاة النبي ﷺ، بينما كان الآخرون في صدمة وعدم تصديق، وقف أبو بكر ثابتًا. تلا: "وما محمد إلا رسول قد خلت من قبله الرسل."', takeaway: 'Steadfastness in the hardest moments defines true leadership', takeawayAr: 'الثبات في أصعب اللحظات يحدد القيادة الحقيقية', isComplete: false, isUnlocked: true },
  { id: 'ab6', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 6, totalLessons: 25, title: 'The First Caliph', titleAr: 'أول خليفة', narration: 'Abu Bakr became the first Caliph of Islam. In his inaugural speech, he humbly said: "I have been given authority over you, but I am not the best among you. If I do well, support me; if I err, correct me."', narrationAr: 'أصبح أبو بكر أول خليفة للمسلمين. في خطبته الأولى قال بتواضع: "وليت عليكم ولست بخيركم، فإن أحسنت فأعينوني وإن أسأت فقوموني."', takeaway: 'Humble leadership earns genuine respect', takeawayAr: 'القيادة المتواضعة تكسب الاحترام الحقيقي', isComplete: false, isUnlocked: true },
  { id: 'ab7', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 7, totalLessons: 25, title: 'The War Against Apostasy', titleAr: 'حرب الردة', narration: 'When tribes began leaving Islam after the Prophet\'s death, Abu Bakr stood firm and refused to compromise. He declared: "By Allah, even if they withhold a rope they used to give the Prophet, I will fight them for it."', narrationAr: 'عندما بدأت القبائل تترك الإسلام بعد وفاة النبي، وقف أبو بكر ثابتًا ورفض التنازل. أعلن: "والله لو منعوني عقالاً كانوا يؤدونه لرسول الله لقاتلتهم عليه."', takeaway: 'Standing firm on principles, even when it is difficult', takeawayAr: 'الثبات على المبادئ حتى عندما يكون الأمر صعبًا', isComplete: false, isUnlocked: true },
  { id: 'ab8', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 8, totalLessons: 25, title: 'Preserving the Quran', titleAr: 'حفظ القرآن', narration: 'Abu Bakr ordered the compilation of the Quran into a single manuscript. Though initially hesitant, he recognized the importance of preserving Allah\'s word for future generations.', narrationAr: 'أمر أبو بكر بجمع القرآن في مخطوطة واحدة. ورغم تردده في البداية، أدرك أهمية حفظ كلمة الله للأجيال القادمة.', takeaway: 'Preservation of sacred knowledge is a sacred duty', takeawayAr: 'حفظ العلم المقدس واجب مقدس', isComplete: false, isUnlocked: true },
  { id: 'ab9', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 9, totalLessons: 25, title: 'A Man of Tender Heart', titleAr: 'صاحب القلب الرحيم', narration: 'Despite his strength, Abu Bakr was known for his tenderness. He would weep when reciting the Quran and was deeply moved by the suffering of others. His tears were not weakness — they were the sign of a heart alive with faith.', narrationAr: 'رغم قوته، عُرف أبو بكر برقته. كان يبكي عند تلاوة القرآن ويتأثر عميقًا بمعاناة الآخرين. دموعه لم تكن ضعفًا — بل علامة قلب نابض بالإيمان.', takeaway: 'Tears of faith are the mark of a living heart', takeawayAr: 'دموع الإيمان علامة قلب حي', isComplete: false, isUnlocked: true },
  { id: 'ab10', characterName: 'Abu Bakr As-Siddiq', characterNameAr: 'أبو بكر الصديق', lessonNumber: 10, totalLessons: 25, title: 'His Final Advice', titleAr: 'وصيته الأخيرة', narration: 'On his deathbed, Abu Bakr\'s final words to Umar were: "I have entrusted you with a heavy burden. Fear Allah and follow His guidance. Know that the best action is to obey Allah and the worst is to disobey Him."', narrationAr: 'على فراش الموت، كانت كلمات أبو بكر الأخيرة لعمر: "لقد أؤتمنك على عبء ثقيل. اتقِ الله واتبع هداه. واعلم أن خير العمل طاعة الله وشر العمل معصيته."', takeaway: 'A leader\'s greatest legacy is sincere advice', takeawayAr: 'أعظم إرث للقائد هو النصيحة الصادقة', isComplete: false, isUnlocked: true },
];

// ─── Helper ───
export function getAdhkarByTime(time: AdhkarTime): ZikrItem[] {
  switch (time) {
    case 'morning': return MORNING_ADHKAR;
    case 'evening': return EVENING_ADHKAR;
    case 'after_prayer': return AFTER_PRAYER_ADHKAR;
    case 'sleep': return SLEEP_ADHKAR;
    default: return MORNING_ADHKAR;
  }
}

export function getSahabaLessons(): SahabaLesson[] {
  return ABU_BAKR_LESSONS;
}

// ─── Hisnul Muslim Enrichment ───
// Loads the bundled Hisnul Muslim dataset and merges with local adhkar

let hisnulMuslimCache: any[] = [];

function loadHisnulMuslim(): any[] {
  if (hisnulMuslimCache.length > 0) return hisnulMuslimCache;
  try {
    hisnulMuslimCache = require('../../data/hisnulmuslim.json');
    return hisnulMuslimCache;
  } catch {
    return [];
  }
}

/**
 * Parse the Hisnul Muslim "english" field to extract transliteration and translation.
 */
function parseHisnulEnglish(english: string): { transliteration: string; translation: string; reference: string } {
  const refMarker = '\n\nReference:';
  const refIdx = english.indexOf(refMarker);
  let reference = '';
  let content = english;

  if (refIdx >= 0) {
    reference = english.slice(refIdx + refMarker.length).trim();
    content = english.slice(0, refIdx);
  }

  const paragraphs = content.split('\n\n').filter(Boolean);
  let transliteration = '';
  let translation = '';

  if (paragraphs.length >= 2) {
    // First paragraph is transliteration, rest is translation
    transliteration = paragraphs[0].replace(/\n/g, ' ').trim();
    translation = paragraphs.slice(1).join('\n\n').replace(/\n/g, ' ').trim();
  } else if (paragraphs.length === 1) {
    const text = paragraphs[0];
    // Try to split on first purely English sentence (no diacritical marks)
    const lines = text.split('\n');
    const transLines: string[] = [];
    const engLines: string[] = [];
    let switchedToEnglish = false;

    for (const line of lines) {
      const isLikelyTransliteration = /[ḥṣʿḍṭāīūḍẓ]/.test(line);
      if (!switchedToEnglish && !isLikelyTransliteration && /^[A-Z][a-z]/.test(line.trim())) {
        switchedToEnglish = true;
      }
      if (switchedToEnglish) {
        engLines.push(line);
      } else {
        transLines.push(line);
      }
    }

    transliteration = transLines.join(' ').trim();
    translation = engLines.join(' ').trim();

    if (!translation) {
      translation = text.replace(/\n/g, ' ').trim();
    }
  }

  return { transliteration, translation, reference };
}

/**
 * Get enriched adhkar by merging local data with Hisnul Muslim entries.
 */
export function getEnrichedAdhkarByTime(time: AdhkarTime): ZikrItem[] {
  const localAdhkar = getAdhkarByTime(time);

  // Map Hisnul Muslim chapter titles to our categories
  const chapterKeywords: Record<string, string[]> = {
    morning: ['morning', 'waking up', 'after waking', 'when waking'],
    evening: ['evening', 'before sleeping', 'before going to bed', 'sleep'],
    sleep: ['before sleeping', 'before going to bed', 'sleep', 'when going to bed'],
    after_prayer: ['after prayer', 'after the prayer', 'after salah'],
  };

  const keywords = chapterKeywords[time] || [];
  const hisnulData = loadHisnulMuslim();

  const hisnulItems: ZikrItem[] = hisnulData
    .filter((entry: any) => {
      const titleLower = entry.title?.toLowerCase() || '';
      return keywords.some(kw => titleLower.includes(kw));
    })
    .map((entry: any, i: number) => {
      const parsed = parseHisnulEnglish(entry.english || '');
      return {
        id: `hisnul_${time}_${i}`,
        arabic: (entry.arabic || '').replace(/\n/g, ' ').trim(),
        transliteration: parsed.transliteration,
        translation: parsed.translation,
        count: 1,
        completed: 0,
        reward: parsed.reference || entry.reference || '',
        category: time,
      };
    });

  // Merge: local first, then Hisnul entries not duplicating local ones
  const localArabicSet = new Set(localAdhkar.map(a => a.arabic));
  const uniqueHisnul = hisnulItems.filter(h => !localArabicSet.has(h.arabic));

  return [...localAdhkar, ...uniqueHisnul];
}

/**
 * Search across all Hisnul Muslim entries.
 */
export function searchHisnulMuslim(query: string): any[] {
  const data = loadHisnulMuslim();
  const q = query.toLowerCase();
  return data.filter((entry: any) =>
    (entry.arabic || '').includes(query) ||
    (entry.english || '').toLowerCase().includes(q) ||
    (entry.title || '').toLowerCase().includes(q)
  );
}
