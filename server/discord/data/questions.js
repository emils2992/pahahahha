// Press conference questions data

// Get random questions
function getRandomQuestions(timing, count = 3) {
  let questions = [];
  
  if (timing === 'önce') {
    questions = preMatchQuestions;
  } else if (timing === 'sonra') {
    questions = postMatchQuestions;
  } else {
    // If no valid timing, combine both
    questions = [...preMatchQuestions, ...postMatchQuestions];
  }
  
  // Shuffle and pick random questions
  return shuffleArray(questions).slice(0, count);
}

// Pre-match questions
const preMatchQuestions = [
  {
    question: "Bugün nasıl bir maç izleyeceğiz?",
    context: "Maç öncesi genel soru",
    category: "general",
    positiveKeywords: ["güven", "hazır", "motive", "iyi", "kazanmak", "formda", "plan"],
    negativeKeywords: ["endişe", "zor", "kaygı", "korku", "belirsiz", "risk"]
  },
  {
    question: "Rakip takım hakkında ne düşünüyorsunuz?",
    context: "Rakip analizi",
    category: "rival",
    positiveKeywords: ["saygı", "analiz", "hazırlık", "strateji", "zayıf", "inceledik"],
    negativeKeywords: ["korku", "tehlikeli", "endişe", "üstün", "zorlanacağız"]
  },
  {
    question: "Bugün nasıl bir kadro ve taktik düşünüyorsunuz?",
    context: "Taktik ve kadro sorgusu",
    category: "tactical",
    positiveKeywords: ["plan", "hazır", "strateji", "sistem", "analiz", "çalıştık"],
    negativeKeywords: ["belirsiz", "kararsız", "emin değilim", "bakalım", "göreceğiz"]
  },
  {
    question: "Son antrenmanlar nasıl geçti?",
    context: "Hazırlık süreci",
    category: "general",
    positiveKeywords: ["verimli", "iyi", "odaklı", "hazır", "motive", "enerjik"],
    negativeKeywords: ["sorun", "sıkıntı", "yorgun", "gergin", "yetersiz"]
  },
  {
    question: "Sakatlık durumu olan oyuncularınız var mı?",
    context: "Kadro durumu",
    category: "player",
    positiveKeywords: ["hazır", "iyileşti", "form", "kadromuz tam", "problem yok"],
    negativeKeywords: ["kayıp", "eksik", "sakatlık", "oynamayacak", "risk"]
  },
  {
    question: "Takım içinde herhangi bir sorun var mı?",
    context: "Takım içi durum",
    category: "club",
    positiveKeywords: ["birlik", "beraberlik", "aile", "uyum", "pozitif", "olumlu"],
    negativeKeywords: ["sorun", "gerginlik", "anlaşmazlık", "memnuniyetsizlik", "çatışma"]
  },
  {
    question: "Taraftarlardan beklentiniz nedir?",
    context: "Taraftar desteği",
    category: "club",
    positiveKeywords: ["destek", "itici güç", "on ikinci adam", "enerji", "atmosfer"],
    negativeKeywords: ["sabır", "anlayış", "zor", "baskı", "eleştiri"]
  },
  {
    question: "Bugünkü maçın zorluğu sizce ne olacak?",
    context: "Maç zorluğu",
    category: "tactical",
    positiveKeywords: ["hazırlıklıyız", "çalıştık", "analiz", "plan", "strateji"],
    negativeKeywords: ["çok zor", "büyük sorun", "endişe", "risk", "zorlanacağız"]
  },
  {
    question: "Hava koşulları oyun planınızı etkileyecek mi?",
    context: "Dış faktörler",
    category: "tactical",
    positiveKeywords: ["hazırız", "etkilemez", "her koşulda", "adapte", "alternatif plan"],
    negativeKeywords: ["zorlayacak", "etkileyecek", "endişeli", "olumsuz", "risk"]
  },
  {
    question: "Bu maçın sonucu sezonunuzu nasıl etkileyecek?",
    context: "Maçın önemi",
    category: "general",
    positiveKeywords: ["odaklı", "bir maç", "süreç", "kazanmak", "önemli", "hedef"],
    negativeKeywords: ["kritik", "kaybedersek", "tehlike", "risk", "her şey"]
  },
  {
    question: "Rakip takımın en tehlikeli oyuncusu kim sizce?",
    context: "Rakip analizi",
    category: "rival",
    positiveKeywords: ["hazırlıklıyız", "önlem", "analiz", "tedbir", "plan"],
    negativeKeywords: ["endişe", "durduramayız", "çok tehlikeli", "korkuyoruz"]
  },
  {
    question: "Ligin geri kalanında hedefleriniz neler?",
    context: "Sezon hedefleri",
    category: "general",
    positiveKeywords: ["hedef", "şampiyonluk", "yukarı", "başarı", "inanç", "mümkün"],
    negativeKeywords: ["zor", "imkansız", "düşmemek", "tutunmak", "kayıp"]
  },
  {
    question: "Son haftalardaki form durumunuz hakkında ne düşünüyorsunuz?",
    context: "Form durumu",
    category: "result",
    positiveKeywords: ["gelişim", "ilerleme", "pozitif", "yükseliş", "iyi"],
    negativeKeywords: ["düşüş", "sorun", "endişe", "kötü", "sıkıntı"]
  },
  {
    question: "Bugün sahada görmek istediğiniz oyun tarzı nasıl olacak?",
    context: "Oyun tarzı",
    category: "tactical",
    positiveKeywords: ["hücum", "baskı", "kontrol", "dominant", "aktif", "atak"],
    negativeKeywords: ["savunma", "çekilmek", "beklemek", "risk almamak"]
  },
  {
    question: "Bu maç için özel bir hazırlık yaptınız mı?",
    context: "Maç hazırlığı",
    category: "tactical",
    positiveKeywords: ["özel çalışma", "analiz", "plan", "strateji", "hazırlık"],
    negativeKeywords: ["rutin", "standart", "özel değil", "her zamanki"]
  }
];

// Post-match questions
const postMatchQuestions = [
  {
    question: "Maçın sonucunu nasıl değerlendiriyorsunuz?",
    context: "Genel değerlendirme",
    category: "result",
    positiveKeywords: ["memnun", "iyi", "doğru", "başarılı", "plan", "çalıştı"],
    negativeKeywords: ["üzgün", "kötü", "başarısız", "hayal kırıklığı", "yetersiz"]
  },
  {
    question: "Takımın performansı hakkında ne düşünüyorsunuz?",
    context: "Performans değerlendirmesi",
    category: "general",
    positiveKeywords: ["iyi", "başarılı", "etkili", "memnunum", "güzel", "pozitif"],
    negativeKeywords: ["kötü", "yetersiz", "hayal kırıklığı", "başarısız", "sorun"]
  },
  {
    question: "Hakem kararları hakkında ne düşünüyorsunuz?",
    context: "Hakem değerlendirmesi",
    category: "result",
    positiveKeywords: ["doğru", "adil", "yorum yapmak istemem", "profesyonel", "saygı"],
    negativeKeywords: ["hatalı", "skandal", "adaletsiz", "facia", "rezalet"]
  },
  {
    question: "Öne çıkan oyuncularınız kimlerdi?",
    context: "Oyuncu performansı",
    category: "player",
    positiveKeywords: ["başarılı", "etkili", "lider", "önemli", "katkı", "performans"],
    negativeKeywords: ["kimse", "yetersiz", "beklenti altı", "hayal kırıklığı"]
  },
  {
    question: "Sonraki maç için nasıl hazırlanacaksınız?",
    context: "Gelecek planlaması",
    category: "tactical",
    positiveKeywords: ["analiz", "çalışacağız", "plan", "hazırlık", "daha iyi", "gelişim"],
    negativeKeywords: ["zor olacak", "endişeliyim", "bilmiyorum", "göreceğiz"]
  },
  {
    question: "Rakip takım hakkında ne düşünüyorsunuz?",
    context: "Rakip değerlendirmesi",
    category: "rival",
    positiveKeywords: ["saygı", "iyi", "kaliteli", "başarılı", "tebrikler"],
    negativeKeywords: ["şanslı", "haksız", "kötü", "zayıf", "eleştiri"]
  },
  {
    question: "Maç öncesi planınızı uygulayabildiniz mi?",
    context: "Taktik değerlendirmesi",
    category: "tactical",
    positiveKeywords: ["evet", "uyguladık", "başarılı", "doğru", "işe yaradı"],
    negativeKeywords: ["hayır", "başaramadık", "planlandığı gibi gitmedi", "sorun"]
  },
  {
    question: "Takımın morali nasıl?",
    context: "Takım psikolojisi",
    category: "club",
    positiveKeywords: ["iyi", "yüksek", "pozitif", "motivasyon", "güven", "birlik"],
    negativeKeywords: ["düşük", "kötü", "moral bozukluğu", "üzgün", "hayal kırıklığı"]
  },
  {
    question: "Önümüzdeki haftalarda neleri değiştirmeyi planlıyorsunuz?",
    context: "Gelecek stratejisi",
    category: "tactical",
    positiveKeywords: ["geliştirme", "iyileştirme", "çalışma", "plan", "analiz"],
    negativeKeywords: ["bilmiyorum", "göreceğiz", "kararsız", "endişeli"]
  },
  {
    question: "Taraftarların tepkisini nasıl değerlendiriyorsunuz?",
    context: "Taraftar ilişkileri",
    category: "club",
    positiveKeywords: ["haklılar", "anlıyorum", "destek", "teşekkür", "saygı"],
    negativeKeywords: ["haksızlar", "anlamıyorlar", "sabırsız", "eleştiri"]
  },
  {
    question: "Bu sonucun ligdeki durumunuza etkisi ne olacak?",
    context: "Lig değerlendirmesi",
    category: "result",
    positiveKeywords: ["olumlu", "adım", "hedef", "devam", "şans", "yükseliş"],
    negativeKeywords: ["olumsuz", "kritik", "zor", "tehlikeli", "risk"]
  },
  {
    question: "Sakatlanan oyuncular oldu mu?",
    context: "Sağlık durumu",
    category: "player",
    positiveKeywords: ["yok", "problem yok", "sağlıklı", "iyi durumda"],
    negativeKeywords: ["maalesef", "ciddi", "kaybettik", "kontrol", "endişe"]
  },
  {
    question: "Yaptığınız oyuncu değişiklikleri işe yaradı mı?",
    context: "Taktik değişiklikler",
    category: "tactical",
    positiveKeywords: ["evet", "etkili", "doğru", "katkı", "fark", "pozitif"],
    negativeKeywords: ["hayır", "istediğimiz gibi olmadı", "yetersiz", "etkisiz"]
  },
  {
    question: "Sezon sonundaki hedefiniz değişti mi?",
    context: "Sezon hedefleri",
    category: "general",
    positiveKeywords: ["kararlıyız", "aynı", "hedef", "inanıyoruz", "mümkün"],
    negativeKeywords: ["değişti", "zor", "gerçekçi olmak", "yeniden değerlendirme"]
  },
  {
    question: "Statta oluşan atmosfer oyuncularınızı etkiledi mi?",
    context: "Atmosfer etkisi",
    category: "club",
    positiveKeywords: ["olumlu", "destek", "motive", "güç", "enerji"],
    negativeKeywords: ["baskı", "olumsuz", "etkiledi", "gergin", "zorladı"]
  }
];

// Helper function to shuffle an array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

module.exports = {
  getRandomQuestions
};