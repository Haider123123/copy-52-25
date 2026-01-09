import { PatientCategory, Language, Theme } from './types';

export const THEMES: Theme[] = [
  { id: 'classic', nameEn: 'Classic Light', nameAr: 'كلاسيكي فاتح', nameKu: 'کلاسیکی ڕوون', type: 'light', colors: { primary: '#4f46e5', secondary: '#0d9488', bg: '#f9fafb' } },
  { id: 'dark-pro', nameEn: 'Dark Pro', nameAr: 'داكن أنيق', nameKu: 'تاریکی پڕۆ', type: 'dark', colors: { primary: '#0284C7', secondary: '#38BDF8', bg: '#0F172A' } },
  { id: 'nature', nameEn: 'Nature', nameAr: 'طبيعي', nameKu: 'سروشتی', type: 'light', colors: { primary: '#10B981', secondary: '#34D399', bg: '#ECFDF5' } },
  { id: 'bold-energy', nameEn: 'Bold Energy', nameAr: 'جريء', nameKu: 'وزەی بوێر', type: 'light', colors: { primary: '#EA580C', secondary: '#F97316', bg: '#FFF7ED' } },
  { id: 'luxury', nameEn: 'Luxury', nameAr: 'فاخر', nameKu: 'شاهانە', type: 'light', colors: { primary: '#EAB308', secondary: '#FACC15', bg: '#FAF5FF' } },
  { id: 'soft-blue', nameEn: 'Soft Blue', nameAr: 'أزرق هادئ', nameKu: 'شيونی هێمن', type: 'light', colors: { primary: '#3B82F6', secondary: '#93C5FD', bg: '#EFF6FF' } },
  { id: 'pastel', nameEn: 'Pastel', nameAr: 'عصري ناعم', nameKu: 'پاستێل', type: 'light', colors: { primary: '#EC4899', secondary: '#F9A8D4', bg: '#FDF2F8' } },
  { id: 'amoled', nameEn: 'AMOLED Black', nameAr: 'أسود نقي', nameKu: 'ڕەش', type: 'dark', colors: { primary: '#06B6D4', secondary: '#22D3EE', bg: '#000000' } },
  { id: 'sunny', nameEn: 'Sunny', nameAr: 'مشرق', nameKu: 'خۆرەتاو', type: 'light', colors: { primary: '#F59E0B', secondary: '#FBBF24', bg: '#FFFBEB' } },
  { id: 'modern-tech', nameEn: 'Modern Tech', nameAr: 'عصري تقني', nameKu: 'تەکنەلۆژیاي مۆدێرن', type: 'dark', colors: { primary: '#7C3AED', secondary: '#8B5CF6', bg: '#1E1B4B' } },
  
  // New 5 Themes
  { id: 'emerald-night', nameEn: 'Emerald Night', nameAr: 'زمردي ليلي', nameKu: 'زمردی شەوانە', type: 'dark', colors: { primary: '#10B981', secondary: '#059669', bg: '#064E3B' } },
  { id: 'berry-pink', nameEn: 'Berry Pink', nameAr: 'توتي مشرق', nameKu: 'تووتڕکی گەش', type: 'light', colors: { primary: '#DB2777', secondary: '#F472B6', bg: '#FFF1F2' } },
  { id: 'desert-gold', nameEn: 'Desert Gold', nameAr: 'ذهبي الصحراء', nameKu: 'ئاڵتوونی بیابان', type: 'light', colors: { primary: '#D97706', secondary: '#F59E0B', bg: '#FEF3C7' } },
  { id: 'ice-blue', nameEn: 'Arctic Ice', nameAr: 'جليد قطبي', nameKu: 'سەهۆڵی جەمسەری', type: 'light', colors: { primary: '#0891B2', secondary: '#22D3EE', bg: '#F0F9FF' } },
  { id: 'carbon-orange', nameEn: 'Carbon Orange', nameAr: 'كربون برتقالي', nameKu: 'کاربۆن و پڕتەقاڵی', type: 'dark', colors: { primary: '#F97316', secondary: '#FB923C', bg: '#171717' } },
];

export const COUNTRY_CODES = [
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
];

export const CURRENCY_LIST = [
  "USD", "EUR", "GBP", "IQD", "SAR", "AED", "KWD", "QAR", "BHD", "OMR", 
  "JOD", "EGP", "LBP", "SYP", "YER", "LYD", "TND", "DZD", "MAD", "SDG", 
  "SOS", "DJF", "MRU", "KMF", "TRY"
];

export const TREATMENT_TYPES = [
  { id: 'diagnosis', en: 'Diagnosis', ar: 'تشخيص', ku: 'دەستنیشانكردن' },
  { id: 'filling', en: 'Regular Filling', ar: 'حشوة عادية', ku: 'پڕكردنەوە' },
  { id: 'rct', en: 'Root Canal', ar: 'حشوة جذر', ku: 'دەماربڕین' },
  { id: 'implant', en: 'Implant', ar: 'زراعة', ku: 'چاندن' },
  { id: 'crown', en: 'Crown', ar: 'تغليف', ku: 'رووپۆش' },
  { id: 'extraction', en: 'Extraction', ar: 'قلع', ku: 'كێشان' },
  { id: 'surgery', en: 'Surgery', ar: 'عملية جراحية', ku: 'نەشتەرگەری' },
  { id: 'cleaning', en: 'Cleaning/Scaling', ar: 'تنظيف', ku: 'پاككردنەوە' },
  { id: 'ortho', en: 'Orthodontics', ar: 'تقويم', ku: 'راستكردنەوە' },
  { id: 'other', en: 'Other', ar: 'أخرى', ku: 'هیتر' },
];

export const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

export const STATUS_COLORS: any = {
  active: 'bg-red-100 text-red-600 border-red-200',
  finished: 'bg-green-100 text-green-600 border-green-200',
  pending: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  discontinued: 'bg-gray-100 text-gray-600 border-gray-200'
};

export const CATEGORIES: {id: PatientCategory | 'all', label: string, labelAr: string, labelKu: string}[] = [
    { id: 'all', label: 'All', labelAr: 'الكل', labelKu: 'هەموو' },
    { id: 'diagnosis', label: 'Diagnosis', labelAr: 'تشخيص', labelKu: 'دەستنیشان' },
    { id: 'filling', label: 'Filling', labelAr: 'حشوة', labelKu: 'پڕكردنەوە' },
    { id: 'rct', label: 'RCT', labelAr: 'عصب', labelKu: 'دەمار' },
    { id: 'cleaning', label: 'Cleaning', labelAr: 'تنظيف', labelKu: 'پاككردنەوە' },
    { id: 'implant', label: 'Implant', labelAr: 'زراعة', labelKu: 'چاندن' },
    { id: 'smile', label: 'Smile Design', labelAr: 'ابتسامة', labelKu: 'دیزاینی پێکەنين' },
    { id: 'whitening', label: 'Whitening', labelAr: 'تبييض', labelKu: 'سپیکردنەوە' },
    { id: 'crown', label: 'Crown', labelAr: 'تغليف', labelKu: 'رووپۆش' },
    { id: 'surgery', label: 'Surgery', labelAr: 'جراحة', labelKu: 'نەشتەرگەري' },
    { id: 'ortho', label: 'Orthodontics', labelAr: 'تقويم', labelKu: 'راستكردنەوە' },
    { id: 'other', label: 'Other', labelAr: 'أخرى', labelKu: 'هیتر' },
];

export const MEMO_COLORS = [
  { id: 'yellow', class: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900', bg: '#fef3c7' },
  { id: 'blue', class: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900', bg: '#dbeafe' },
  { id: 'green', class: 'from-green-50 to-green-100 border-green-200 text-green-900', bg: '#dcfce7' },
  { id: 'purple', class: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900', bg: '#f3e8ff' },
  { id: 'pink', class: 'from-pink-50 to-pink-100 border-pink-200 text-pink-900', bg: '#fce7f3' },
  { id: 'gray', class: 'from-gray-50 to-gray-100 border-gray-200 text-gray-900', bg: '#f3f4f6' },
];

export const DAY_COLORS = [
  'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-100', // Day 0 (Sunday)
  'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-100', // Day 1 (Monday)
  'bg-zinc-800 border-zinc-700 text-white dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100', // Day 2 (Tuesday) - Updated to Light Black/Grey as requested
  'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-100', // Day 3 (Wednesday)
  'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-100', // Day 4 (Thursday)
  'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:border-fuchsia-800 dark:text-fuchsia-100', // Day 5 (Friday)
  'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-100', // Day 6 (Saturday)
];

export const MEDICAL_CONDITIONS_LIST = [
    { id: 'diabetes', en: 'Diabetes', ar: 'السكري', ku: 'شەکرە' },
    { id: 'hypertension', en: 'Hypertension', ar: 'ارتفاع ضغط الدم', ku: 'بەرزبوونەوەی پەستانی خوێن' },
    { id: 'heart_disease', en: 'Heart Disease', ar: 'أمراض القلب', ku: 'نەخۆشي دڵ' },
    { id: 'asthma', en: 'Asthma', ar: 'الربو', ku: 'ڕەبۆ' },
    { id: 'hepatitis', en: 'Hepatitis', ar: 'التهاب الكبد', ku: 'هەوکردني جگەر' },
    { id: 'bleeding_disorder', en: 'Bleeding Disorder', ar: 'سيولة الدم', ku: 'کێشەی خوێن بەربوون' },
    { id: 'allergy_penicillin', en: 'Penicillin Allergy', ar: 'حساسية البنسلين', ku: 'حەساسیەت بە پەنسلین' },
    { id: 'allergy_anesthesia', en: 'Anesthesia Allergy', ar: 'حساسية التخدير', ku: 'حەساسیەت بە بەنج' },
    { id: 'pregnancy', en: 'Pregnancy', ar: 'حمل', ku: 'دووگیانی' },
    { id: 'epilepsy', en: 'Epilepsy', ar: 'الصرع', ku: 'فێ (مەشک)' },
    { id: 'thyroid', en: 'Thyroid Disorder', ar: 'اضطرابات الغدة الدرقية', ku: 'کێشەی غودە' },
    { id: 'smoker', en: 'Smoker', ar: 'مدخن', ku: 'جگەرەکێش' },
];

export const PATIENT_QUESTIONS_LIST = [
    { 
        id: 'brushing', 
        en: 'How often do you brush?', 
        ar: 'كم مرة تفرش أسنانك؟', 
        ku: 'چەند جار ددان دەشۆيت؟',
        options: [
            { id: 'none', en: 'Never', ar: 'لا أفرش', ku: 'ناشۆم' },
            { id: 'once', en: 'Once a day', ar: 'مرة واحدة', ku: 'یەک جار' },
            { id: 'twice', en: 'Twice a day', ar: 'مرتين', ku: 'دوو جار' },
            { id: 'more', en: 'More than twice', ar: 'أكثر من مرتين', ku: 'زیاتر لە دوو جار' }
        ]
    },
    { 
        id: 'flossing', 
        en: 'Do you use dental floss?', 
        ar: 'هل تستخدم خيط الأسنان؟', 
        ku: 'ئایا داوی ددان بەکاردێنیت؟',
        options: [
            { id: 'yes', en: 'Yes', ar: 'نعم', ku: 'بەڵێ' },
            { id: 'no', en: 'No', ar: 'لا', ku: 'نەخێر' },
            { id: 'sometimes', en: 'Sometimes', ar: 'أحياناً', ku: 'هەندێک جار' }
        ]
    },
    { 
        id: 'mouthwash', 
        en: 'Do you use mouthwash?', 
        ar: 'هل تستعمل غسول الفم؟', 
        ku: 'ئایا ئاوی دەم بەکاردێنیت؟',
        options: [
            { id: 'yes', en: 'Yes', ar: 'نعم', ku: 'بەڵێ' },
            { id: 'no', en: 'No', ar: 'لا', ku: 'نەخێر' },
            { id: 'sometimes', en: 'Sometimes', ar: 'أحياناً', ku: 'هەندێک جار' }
        ]
    },
    { 
        id: 'last_visit', 
        en: 'Last dentist visit?', 
        ar: 'متى كانت آخر زيارة لطبيب الأسنان؟', 
        ku: 'دواین سەردانی پزیشکی ددان؟',
        options: [
            { id: '6m', en: '< 6 Months', ar: 'أقل من 6 أشهر', ku: 'کەمتر لە ٦ مانگ' },
            { id: '1y', en: '6-12 Months', ar: '6-12 شهر', ku: '٦-١٢ مانگ' },
            { id: 'more', en: '> 1 Year', ar: 'أكثر من سنة', ku: 'زیاتر لە ساڵێک' },
            { id: 'never', en: 'Never', ar: 'أبداً', ku: 'هەرگیز' }
        ]
    },
    { 
        id: 'bleeding', 
        en: 'Do your gums bleed?', 
        ar: 'هل تنزف لثتك؟', 
        ku: 'ئایا پوکت خوێنی لێدێت؟',
        options: [
            { id: 'yes', en: 'Yes', ar: 'نعم', ku: 'بەڵێ' },
            { id: 'no', en: 'No', ar: 'لا', ku: 'نەخێر' },
            { id: 'brushing', en: 'Only when brushing', ar: 'عند التفريش فقط', ku: 'تەنها کاتی ددان شوشتن' }
        ]
    },
    { 
        id: 'pain_type', 
        en: 'Type of pain?', 
        ar: 'نوع الألم؟', 
        ku: 'جۆري ئازار؟',
        options: [
            { id: 'none', en: 'No Pain', ar: 'لا يوجد', ku: 'نییە' },
            { id: 'sharp', en: 'Sharp', ar: 'حاد', ku: 'توند' },
            { id: 'throbbing', en: 'Throbbing', ar: 'نابض', ku: 'لێدەدات' },
            { id: 'continuous', en: 'Continuous', ar: 'مستمر', ku: 'بەردەوام' },
            { id: 'intermittent', en: 'Intermittent', ar: 'متقطع', ku: 'ناوبەناو' }
        ]
    },
    { 
        id: 'sensitivity', 
        en: 'Sensitivity to?', 
        ar: 'تحسس من؟', 
        ku: 'حەساسیەت بە؟',
        options: [
            { id: 'none', en: 'None', ar: 'لا يوجد', ku: 'نییە' },
            { id: 'cold', en: 'Cold', ar: 'البارد', ku: 'سارد' },
            { id: 'hot', en: 'Hot', ar: 'الحار', ku: 'گەرم' },
            { id: 'sweet', en: 'Sweets', ar: 'الحلويات', ku: 'شيرينی' },
            { id: 'pressure', en: 'Pressure/Biting', ar: 'الضغط/العض', ku: 'گازگرتن' }
        ]
    },
    {
        id: 'anxiety',
        en: 'Dental Anxiety?',
        ar: 'هل لديك خوف أو قلق من علاج الأسنان؟',
        ku: 'ئایا ترست هەیە لە چارەسەري ددان؟',
        options: [
            { id: 'yes', en: 'Yes', ar: 'نعم', ku: 'بەڵێ' },
            { id: 'no', en: 'No', ar: 'لا', ku: 'نەخێر' },
            { id: 'little', en: 'A little', ar: 'قليلاً', ku: 'کەمێک' }
        ]
    }
];

export const PRICING_PLANS = [
  { 
    id: '1mo', 
    price: 3, 
    originalPrice: null,
    durationEn: '/ Month', durationAr: '/ شهر', durationKu: '/ مانگ', 
    labelEn: 'Monthly', labelAr: 'شهري', labelKu: 'مانگانە',
    features: [
        { en: 'Full Access', ar: 'وصول كامل', ku: 'دەسەڵاتی تەواو' },
        { en: 'Cloud Sync', ar: 'مزامنة سحابية', ku: 'هاوکاتکردنی هەوری' },
        { en: '24/7 Support', ar: 'دعم فني', ku: 'پاڵپشتی ٢٤/٧' },
        { en: 'Unlimited Devices', ar: 'عدد غير محدود من الاجهزة', ku: 'ژمارەی بێسنوور لە ئامێرەکان' },
    ]
  },
  { 
    id: '3mo', 
    price: 7, 
    originalPrice: 9,
    durationEn: '/ 3 Months', durationAr: '/ 3 أشهر', durationKu: '/ ٣ مانگ',
    labelEn: 'Quarterly', labelAr: '3 أشهر', labelKu: '٣ مانگ',
    features: [
        { en: 'Full Access', ar: 'وصول كامل', ku: 'دەسەڵاتی تەواو' },
        { en: 'Cloud Sync', ar: 'مزامنة سحابية', ku: 'هاوکاتکردنی هەوری' },
        { en: '24/7 Support', ar: 'دعم فني', ku: 'پاڵپشتی ٢٤/٧' },
        { en: 'Unlimited Devices', ar: 'عدد غير محدود من الاجهزة', ku: 'ژمارەی بێسنوور لە ئامێرەکان' },
    ]
  },
  { 
    id: '6mo', 
    price: 11, 
    originalPrice: 18,
    durationEn: '/ 6 Months', durationAr: '/ 6 أشهر', durationKu: '/ ٦ مانگ',
    labelEn: 'Bi-Yearly', labelAr: '6 أشهر', labelKu: '٦ مانگ',
    features: [
        { en: 'Full Access', ar: 'وصول كامل', ku: 'دەسەڵاتی تەواو' },
        { en: 'Cloud Sync', ar: 'مزامنة سحابية', ku: 'هاوکاتکردنی هەوری' },
        { en: '24/7 Support', ar: 'دعم فني', ku: 'پاڵپشتی ٢٤/٧' },
        { en: 'Unlimited Devices', ar: 'عدد غير محدود من الاجهزة', ku: 'ژمارەی بێسنوور لە ئامێرەکان' },
        { en: 'Free Consent Form Design', ar: 'تصميم ورقة موافقة عمل مجاني', ku: 'دیزايني فۆرمی ڕەزامەندي بەخۆڕایی' },
    ]
  },
  { 
    id: '1yr', 
    price: 15, 
    originalPrice: 36,
    durationEn: '/ Year', durationAr: '/ سنة', durationKu: '/ ساڵانە',
    labelEn: 'Yearly', labelAr: 'سنوي', labelKu: 'ساڵانە',
    features: [
        { en: 'Full Access', ar: 'وصول كامل', ku: 'دەسەڵاتی تەواو' },
        { en: 'Cloud Sync', ar: 'مزامنة سحابية', ku: 'هاوکاتکردنی هەوری' },
        { en: '24/7 Support', ar: 'دعم فني', ku: 'پاڵپشتی ٢٤/٧' },
        { en: 'Unlimited Devices', ar: 'عدد غير محدود من الاجهزة', ku: 'ژمارەی بێسنوور لە ئامێرەکان' },
        { en: 'Free Rx Design', ar: 'تصميم وصفة طبية مجاني', ku: 'دیزايني ڕەچەتة بەخۆڕایی' },
        { en: 'Free Consent Form Design', ar: 'تصميم ورقة موافقة عمل مجانية', ku: 'دیزايني فۆرمي ڕەزامەندي بەخۆڕایی' },
    ]
  },
];