// Types for press conference questions
export interface PressQuestion {
  question: string;
  context: string;
  category: 'tactical' | 'player' | 'rival' | 'result' | 'club' | 'general';
  positiveKeywords: string[];
  negativeKeywords: string[];
}

// Questions for pre-match press conferences
const preMatchQuestions: PressQuestion[] = [
  {
    question: 'Hocam, yarınki maç öncesi favori olduğunuz söyleniyor. Sizce bu maçın favorisi kim?',
    context: 'Derbi öncesi medya baskısı altındasınız',
    category: 'general',
    positiveKeywords: ['saygı', 'hazır', 'çalıştık', 'kendimize güveniyoruz', 'kazanmak'],
    negativeKeywords: ['kolay', 'zayıf', 'yeneriz', 'şansları yok', 'üstün']
  },
  {
    question: 'Rakip takımın yıldız oyuncusu hakkında ne düşünüyorsunuz? Ona karşı özel bir önlem var mı?',
    context: 'Rakip takımın en golcü oyuncusu son maçlarda formda',
    category: 'rival',
    positiveKeywords: ['takım savunması', 'analiz', 'önlem', 'plan', 'hazırız'],
    negativeKeywords: ['korkmuyoruz', 'önemsemiyoruz', 'abartılıyor', 'şans', 'değersiz']
  },
  {
    question: 'Son antrenmanlar nasıl geçti? Takımın motivasyonu ne durumda?',
    context: 'Takımda sakat oyuncular var',
    category: 'player',
    positiveKeywords: ['hazırız', 'moral', 'motivasyon', 'çalışıyoruz', 'eksiğimiz yok'],
    negativeKeywords: ['sorun', 'sakatlık', 'eksik', 'yetersiz', 'endişe']
  },
  {
    question: 'Yarınki maç için taktik planınız nedir? Nasıl bir oyun izleyeceğiz?',
    context: 'Rakip takım son maçlarında ofansif oynuyor',
    category: 'tactical',
    positiveKeywords: ['plan', 'analiz', 'strateji', 'hazırlık', 'güçlü'],
    negativeKeywords: ['gizli', 'söyleyemem', 'bekleyin', 'göreceksiniz', 'sürpriz']
  },
  {
    question: 'Transfer dönemindeki dedikodular takımı etkiliyor mu?',
    context: 'Takımdan birkaç oyuncu transfer listesinde',
    category: 'club',
    positiveKeywords: ['profesyonel', 'odak', 'konsantrasyon', 'sadık', 'bağlı'],
    negativeKeywords: ['rahatsız', 'etkilendi', 'mutsuz', 'dedikodu', 'sorun']
  },
  {
    question: 'Yönetimle ilişkileriniz nasıl? Size yeteri kadar destek veriyorlar mı?',
    context: 'Son haftalarda takım istenen sonuçları alamadı',
    category: 'club',
    positiveKeywords: ['destek', 'iletişim', 'güven', 'saygı', 'birlik'],
    negativeKeywords: ['müdahale', 'baskı', 'yetersiz', 'memnun değilim', 'karışıyorlar']
  },
  {
    question: 'Genç oyuncuları oynatma konusunda ne düşünüyorsunuz? Bu maçta şans verecek misiniz?',
    context: 'Altyapıdan yeni çıkan oyuncular kadrodaki yerlerini zorluyor',
    category: 'player',
    positiveKeywords: ['şans', 'gelişim', 'potansiyel', 'güven', 'fırsat'],
    negativeKeywords: ['hazır değil', 'tecrübesiz', 'risk', 'erken', 'beklemek']
  },
  {
    question: 'Ligdeki şampiyonluk şansınızı nasıl görüyorsunuz?',
    context: 'Takımınız şampiyonluk yarışında',
    category: 'general',
    positiveKeywords: ['inanç', 'mücadele', 'şans', 'hedef', 'azim'],
    negativeKeywords: ['imkansız', 'zor', 'düşünmüyoruz', 'erken', 'rakipler']
  },
  {
    question: 'Taraftarlarınıza maç öncesi bir mesajınız var mı?',
    context: 'Taraftarlar son dönemde takıma büyük destek veriyor',
    category: 'general',
    positiveKeywords: ['destek', 'teşekkür', 'güç', 'itici güç', 'birlikte'],
    negativeKeywords: ['sabır', 'anlayış', 'eleştiri', 'memnun değilim', 'baskı']
  },
  {
    question: 'Takımın savunma zaafları hakkında neler söyleyeceksiniz? Bu konuda çalışma yaptınız mı?',
    context: 'Son maçlarda defansta sorunlar yaşıyorsunuz',
    category: 'tactical',
    positiveKeywords: ['çalıştık', 'düzelttik', 'geliştirdik', 'analiz', 'çözüm'],
    negativeKeywords: ['sorun', 'zaaf', 'endişe', 'zayıf', 'kötü']
  }
];

// Questions for post-match press conferences
const postMatchQuestions: PressQuestion[] = [
  {
    question: 'Maçı nasıl değerlendiriyorsunuz? Sonuçtan memnun musunuz?',
    context: 'Takımınız maçı kaybetti',
    category: 'result',
    positiveKeywords: ['ders çıkarmalıyız', 'geliştireceğiz', 'analiz', 'sorumluluk', 'düzelteceğiz'],
    negativeKeywords: ['şanssızlık', 'hakem', 'haksızlık', 'kabul etmiyorum', 'itiraz']
  },
  {
    question: 'Hakem kararları hakkında ne düşünüyorsunuz?',
    context: 'Maçta tartışmalı hakem kararları vardı',
    category: 'result',
    positiveKeywords: ['saygı', 'yorum yapmak istemiyorum', 'odaklanmıyorum', 'bahane değil', 'profesyonel'],
    negativeKeywords: ['skandal', 'haksızlık', 'kötü', 'taraflı', 'ceza']
  },
  {
    question: 'Oyuncularınızın performansı nasıldı?',
    context: 'Bazı oyuncular beklenen performansı sergileyemedi',
    category: 'player',
    positiveKeywords: ['çaba', 'gelişim', 'destek', 'inanıyorum', 'güveniyorum'],
    negativeKeywords: ['hayal kırıklığı', 'yetersiz', 'kötü', 'başarısız', 'beklentinin altında']
  },
  {
    question: 'Seçtiğiniz taktik doğru muydu? Neler yanlış gitti?',
    context: 'Takımınız taktik açıdan sorunlar yaşadı',
    category: 'tactical',
    positiveKeywords: ['sorumluluk', 'analiz', 'geliştireceğiz', 'öğreneceğiz', 'düzelteceğiz'],
    negativeKeywords: ['hata', 'başarısız', 'yanlış', 'yetersiz', 'sorun']
  },
  {
    question: 'Takım kaptanının performansı hakkında ne düşünüyorsunuz?',
    context: 'Takım kaptanı bekleneni veremedi',
    category: 'player',
    positiveKeywords: ['lider', 'güveniyorum', 'önemli', 'değerli', 'destek'],
    negativeKeywords: ['hayal kırıklığı', 'beklentinin altında', 'değişiklik', 'düşüneceğiz', 'yetersiz']
  },
  {
    question: 'Önümüzdeki maça nasıl hazırlanacaksınız?',
    context: 'Kısa süre içinde önemli bir maçınız daha var',
    category: 'tactical',
    positiveKeywords: ['çalışma', 'hazırlık', 'analiz', 'odaklanma', 'iyileştirme'],
    negativeKeywords: ['yorgunluk', 'zor', 'endişe', 'problem', 'kaygı']
  },
  {
    question: 'Bu sonucun ardından ligdeki hedefinizi değiştirdiniz mi?',
    context: 'Takımınız önemli puan(lar) kaybetti',
    category: 'general',
    positiveKeywords: ['hedef', 'kararlılık', 'inanç', 'mücadele', 'azim'],
    negativeKeywords: ['imkansız', 'vazgeçtik', 'zor', 'başarısız', 'umutsuz']
  },
  {
    question: 'Rakip takımın oyunu hakkında ne düşünüyorsunuz?',
    context: 'Rakip takım beklenmedik bir taktikle oynadı',
    category: 'rival',
    positiveKeywords: ['saygı', 'hazırlandık', 'analiz', 'strateji', 'çalışma'],
    negativeKeywords: ['şans', 'haksız', 'kötü', 'değersiz', 'abartılıyor']
  },
  {
    question: 'Oyuncu değişiklikleri doğru muydu? Pişman olduğunuz bir tercih var mı?',
    context: 'Yaptığınız değişiklikler istediğiniz etkiyi yaratmadı',
    category: 'tactical',
    positiveKeywords: ['sorumluluk', 'öğreneceğiz', 'analiz', 'geliştireceğiz', 'karar'],
    negativeKeywords: ['hata', 'yanlış', 'pişmanlık', 'başarısız', 'kötü']
  },
  {
    question: 'Taraftarların tepkisi hakkında neler söyleyeceksiniz?',
    context: 'Taraftarlar takımı ıslıkladı',
    category: 'general',
    positiveKeywords: ['anlayış', 'destek', 'hak', 'çalışacağız', 'düzelteceğiz'],
    negativeKeywords: ['haksız', 'kırıldım', 'üzgünüm', 'sabırsız', 'eleştiri']
  }
];

// Function to get random questions for press conferences
export function getRandomQuestions(timing: string, count: number = 3): PressQuestion[] {
  const questions = timing === 'önce' ? preMatchQuestions : postMatchQuestions;
  
  // Shuffle array and get requested number of questions
  return shuffleArray([...questions]).slice(0, count);
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
