import { DecisionResult } from '@shared/schema';

// Interface for decision events
export interface DecisionEvent {
  title: string;
  description: string;
  options: DecisionOption[];
}

// Interface for decision options
export interface DecisionOption {
  text: string;
  consequences: DecisionResult;
}

// Decision events data
const decisionEvents: DecisionEvent[] = [
  {
    title: 'Yıldız Oyuncu Krizi',
    description: 'Takımın yıldız oyuncusu Mehmet Aydın, son maçta oyundan alınmasına sosyal medyada tepki gösterdi. "Hoca beni sevmiyor sanırım, takımda bazı futbolcular ayrıcalıklı" şeklinde paylaşım yaptı. Bu duruma nasıl yaklaşacaksın?',
    options: [
      {
        text: 'Disiplinsizliği kınayacağını açıkla ve para cezası ver. Takımda düzeni sağla.',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 15,
          teamMoraleChange: -10,
          message: 'Disiplin kurallarını uyguladın. Yönetim bu kararlılığından memnun ancak takım içinde gerginlik oluştu.',
          title: 'Soyunma Odası Katili'
        }
      },
      {
        text: 'Oyuncuyla özel görüşme talep et, sorunları dinle ve çözüm bulmaya çalış.',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 5,
          teamMoraleChange: 10,
          message: 'Diyalog yoluyla sorunu çözdün. Oyuncu ve takım arkadaşları bu yaklaşımı takdir etti.'
        }
      },
      {
        text: 'Konuyu büyütme, medyada yorum yapma ve bir sonraki maçta normal planına devam et.',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: -5,
          teamMoraleChange: -5,
          message: 'Görmezden gelme stratejin, yıldız oyuncunun daha da tepki göstermesine neden oldu. Takım içinde gruplar oluşmaya başladı.'
        }
      }
    ]
  },
  {
    title: 'Yönetim Müdahalesi',
    description: 'Kulüp başkanı, hafta sonu oynayacağınız maçta belirli bir oyuncuyu kullanmanızı istiyor. "Forma giymesi önemli, transfer görüşmeleri için vitrine çıkarmalıyız" dedi. Bu oyuncu sizin planlarınızda yoktu. Ne yapacaksınız?',
    options: [
      {
        text: 'Başkanın isteğini reddederek kendi kadro planını uygula.',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: -15,
          teamMoraleChange: 10,
          message: 'Teknik bağımsızlığını korudun ama yönetimle aran açıldı. Takım senin arkanda.',
          title: 'Yönetimle Savaşan'
        }
      },
      {
        text: 'Oyuncuyu kadroya al ama yedek kulübesinde tut.',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: -5,
          teamMoraleChange: 5,
          message: 'Bir orta yol buldun, ancak yönetim tam olarak memnun değil. En azından takım motivasyonunu korudun.'
        }
      },
      {
        text: 'Başkanın isteğini kabul et ve oyuncuyu ilk 11\'de oynat.',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 15,
          teamMoraleChange: -10,
          message: 'Yönetimle aran iyi ama takım içinde hak etmeyenin oynaması huzursuzluk yarattı. Taraftar da taktik kararlarını sorguluyor.'
        }
      }
    ]
  },
  {
    title: 'Transfer Teklifi',
    description: 'Büyük bir Avrupa kulübünden sana teknik direktörlük teklifi geldi. Mevcut takımında kontratın devam ediyor. Teklif cazip ve kariyerinde sıçrama yapabilirsin. Haberi medya duydu ve tepkini bekliyor.',
    options: [
      {
        text: 'Teklifi reddettiğini ve mevcut takımına sadık kalacağını açıkla.',
        consequences: {
          fanSupportChange: 15,
          managementTrustChange: 10,
          teamMoraleChange: 10,
          message: 'Sadakatinle taraftarların ve oyuncuların saygısını kazandın. Takım daha motive oldu.'
        }
      },
      {
        text: 'Teklifin olduğunu doğrula ama kararını sezon sonunda vereceğini söyle.',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: -10,
          teamMoraleChange: -5,
          message: 'Belirsizlik takıma olumsuz yansıdı. Yönetim, şimdiden yeni teknik direktör arayışlarına başladı.'
        }
      },
      {
        text: 'Konuyu ne doğrula ne yalanlı, "sadece takıma odaklıyım" de.',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 0,
          teamMoraleChange: -3,
          message: 'Diplomatik yanıtın belirsizlik yarattı. Medya dedikoduları devam ediyor ama büyük bir kriz yaşanmadı.'
        }
      }
    ]
  },
  {
    title: 'Genç Yetenek Baskısı',
    description: 'Altyapıdan yükselen 17 yaşındaki yetenekli oyuncu, sosyal medyada büyük ilgi görüyor. Taraftarlar onu ilk 11\'de görmek istiyor. Oyuncu henüz tam hazır değil ama potansiyeli yüksek.',
    options: [
      {
        text: 'Genç oyuncuyu ilk 11\'de oynat ve şans ver.',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: 0,
          teamMoraleChange: -5,
          message: 'Taraftarları mutlu ettin ama oyuncu baskıyla performans gösteremedi. Tecrübeli oyuncular arasında huzursuzluk başladı.'
        }
      },
      {
        text: 'Maç içinde son 20 dakikada oyuna alıp tecrübe kazanmasını sağla.',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Dengeli yaklaşımın takdir topladı. Genç oyuncu da fırsat bulduğu için mutlu.'
        }
      },
      {
        text: 'Henüz hazır olmadığını açıkla ve U21 takımında oynamasını sağla.',
        consequences: {
          fanSupportChange: -10,
          managementTrustChange: 5,
          teamMoraleChange: 0,
          message: 'Taraftarlar hayal kırıklığına uğradı ama yönetim uzun vadeli planını takdir etti. Oyuncu da gelişimine odaklanabildi.'
        }
      }
    ]
  },
  {
    title: 'Maç Öncesi Kriz',
    description: 'Kritik bir maçtan 2 saat önce, takımın en önemli oyuncularından ikisi arasında soyunma odasında tartışma çıktı. Gerginlik had safhada ve maç yaklaşıyor.',
    options: [
      {
        text: 'Her iki oyuncuyu da ilk 11\'den çıkar ve disiplin uygula.',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 10,
          teamMoraleChange: -5,
          message: 'Disiplin anlayışın takdir edildi ama önemli maçta iki yıldızdan yoksun kaldın. Takım performansı olumsuz etkilenebilir.'
        }
      },
      {
        text: 'Hızlı bir toplantıyla sorunu çöz ve normal kadroyla devam et.',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 5,
          teamMoraleChange: 5,
          message: 'Kriz yönetimi başarılı oldu. Oyuncular sorunu bir kenara bırakıp maça odaklandı.'
        }
      },
      {
        text: 'Sorunu başka bir zamana ertele ve oyuncuları farklı bölgelerde oynat.',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 0,
          teamMoraleChange: -10,
          message: 'Geçici çözüm işe yaramadı. Maç içinde iki oyuncu arasındaki gerginlik sahaya yansıdı ve takım performansını etkiledi.'
        }
      }
    ]
  },
  {
    title: 'Medya Sızıntısı',
    description: 'Takım içi bir toplantıda söylediğin özel sözler medyaya sızdırıldı. Bazı oyuncular hakkında eleştirel ifadelerin manşetlerde. Takım içinde huzursuzluk başladı.',
    options: [
      {
        text: 'Sözlerin çarpıtıldığını söyle ve yalanla.',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: -5,
          teamMoraleChange: -10,
          message: 'Yalanın inandırıcı olmadı. Oyuncular sana olan güvenlerini kaybetmeye başladı.'
        }
      },
      {
        text: 'Özür dile ve konunun içerde çözüleceğini açıkla.',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Dürüst yaklaşımın ve sorumluluk alman takdir topladı. Oyuncular da seni affetmeye hazır.'
        }
      },
      {
        text: 'Sızıntıyı yapanı bul ve sert yaptırım uygula.',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 0,
          teamMoraleChange: -5,
          message: 'Cadı avı başlattın. Takım içinde güvensizlik ortamı oluştu ve herkes birbirinden şüpheleniyor.',
          title: 'Soyunma Odası Katili'
        }
      }
    ]
  },
  {
    title: 'Sakatlık Kararı',
    description: 'Takımın yıldız oyuncusu hafif sakatlığı olmasına rağmen çok önemli bir maçta oynamak istiyor. Doktorlar riski olduğunu söylüyor ama oyuncuyu dinlendirirsen kritik maçta eksik kalacaksın.',
    options: [
      {
        text: 'Riski göze al ve oyuncuyu oynat.',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: -10,
          teamMoraleChange: 0,
          message: 'Oyuncu sakatlanmadan maçı tamamladı, ancak sağlık ekibi kararını sorguluyor. Yönetim de oyuncunun sağlığını riske attığını düşünüyor.'
        }
      },
      {
        text: 'Oyuncuyu dinlendir ve sağlığını önceliklendir.',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Uzun vadeli düşündün. Oyuncu da senin kararının kendi iyiliği için olduğunu anladı. Takım bu fedakarlığı takdir etti.'
        }
      },
      {
        text: 'Oyuncuyu yedek kulübesinde tut, gerekirse oyuna al.',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 0,
          teamMoraleChange: 0,
          message: 'Orta yolu buldun. Risk hala var ama en azından 90 dakika zorlanmayacak. Sonuç maçın gidişatına bağlı.'
        }
      }
    ]
  },
  {
    title: 'Taraftar Protesto',
    description: 'Son maçlardaki kötü sonuçlar nedeniyle taraftarlar antrenman tesislerinin önünde protesto yapıyor. Medya tepkini merak ediyor.',
    options: [
      {
        text: 'Protestoları görmezden gel ve antrenmanlarını sürdür.',
        consequences: {
          fanSupportChange: -15,
          managementTrustChange: -5,
          teamMoraleChange: -5,
          message: 'Taraftarlarla iletişim kurmaman protestoları büyüttü. Takım daha büyük baskı altında.'
        }
      },
      {
        text: 'Taraftarlarla konuşmak için dışarı çık ve onları dinle.',
        consequences: {
          fanSupportChange: 15,
          managementTrustChange: 5,
          teamMoraleChange: 10,
          message: 'Cesur davrandın ve taraftarların karşısına çıktın. Samimi yaklaşımın takdir topladı ve gerginlik azaldı.'
        }
      },
      {
        text: 'Basına açıklama yap ama taraftarlarla yüzleşme.',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 0,
          teamMoraleChange: 0,
          message: 'Diplomatik yaklaşımın büyük bir kriz yaratmadı ama taraftarların güvenini de kazanamadın.'
        }
      }
    ]
  },
  {
    title: 'VAR Tartışması',
    description: 'Son maçta aleyhine verilen VAR kararı takımının mağlubiyetine neden oldu. Maç sonrası basın toplantısında hakem kararları hakkında ne söyleyeceksin?',
    options: [
      {
        text: 'Hakemleri sert şekilde eleştir ve kararların skandal olduğunu söyle.',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: -10,
          teamMoraleChange: 5,
          message: 'Taraftarlar tepkini destekledi ama federasyondan ceza alabilirsin. Yönetim bu durumdan rahatsız.'
        }
      },
      {
        text: 'Diplomatik ol ve "Kararları tartışmak istemiyorum" de.',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 10,
          teamMoraleChange: 0,
          message: 'Profesyonel duruşun yönetim tarafından takdir edildi. Taraftarlar ise daha fazla tepki bekliyordu.'
        }
      },
      {
        text: 'Sistem hakkında genel bir eleştiri yap ama spesifik kararları tartışma.',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 5,
          teamMoraleChange: 5,
          message: 'Dengeli yaklaşımın hem taraftarları hem de yönetimi tatmin etti. Sistemsel sorunlara dikkat çektin ama gereksiz polemiğe girmedin.'
        }
      }
    ]
  },
  {
    title: 'Kampanya Teklifi',
    description: 'Büyük bir marka, sezon ortasında seninle özel bir reklam kampanyası yapmak istiyor. Teklifler cazip ama takımın son dönemde istediğin performansı sergileyemiyor.',
    options: [
      {
        text: 'Teklifi kabul et ve ek gelir sağla.',
        consequences: {
          fanSupportChange: -10,
          managementTrustChange: -5,
          teamMoraleChange: -5,
          message: 'Kötü performans döneminde reklam yüzü olman taraftarları kızdırdı. "Takıma odaklanmak yerine para peşinde" yorumları yapılıyor.'
        }
      },
      {
        text: 'Teklifi nazikçe reddet ve tamamen işine odaklan.',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Fedakarlığın ve profesyonelliğin takdir topladı. Herkes senin önceliğinin takım olduğunu gördü.'
        }
      },
      {
        text: 'Kampanyaya katıl ama kazancını hayır kurumuna bağışla.',
        consequences: {
          fanSupportChange: 15,
          managementTrustChange: 5,
          teamMoraleChange: 10,
          message: 'Hem toplumsal sorumluluk gösterdin hem de takımına odaklandığını kanıtladın. Herkes bu hareketi takdir etti.'
        }
      }
    ]
  }
];

// Function to get a random decision event
export function getRandomDecision(): DecisionEvent {
  const randomIndex = Math.floor(Math.random() * decisionEvents.length);
  return decisionEvents[randomIndex];
}
