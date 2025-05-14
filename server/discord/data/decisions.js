// Decision events data

const decisionEvents = [
  {
    title: 'Oyuncu Transferi',
    description: 'Önemli bir transfer hedefi için teklif yapmanız isteniyor. Oyuncu yetenekli ama oldukça pahalı.',
    options: [
      {
        text: 'Teklifi yap ve oyuncuyu transfer et',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: -5,
          teamMoraleChange: 5,
          message: 'Takıma önemli bir oyuncu kazandırdınız! Taraftarlar çok heyecanlı, ancak yönetim bütçenin aşılmasından endişeli.'
        }
      },
      {
        text: 'Pazarlık yap ve daha düşük bir teklif sun',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 5,
          teamMoraleChange: 0,
          message: 'Pazarlık sonucu kısmen başarılı oldu. Yönetim mali disipline bağlılığınızı takdir ediyor.'
        }
      },
      {
        text: 'Transferden vazgeç ve başka hedeflere yönel',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 10,
          teamMoraleChange: -2,
          message: 'Taraftarlar hayal kırıklığına uğradı, ancak yönetim mali disiplinden dolayı memnun.'
        }
      }
    ]
  },
  {
    title: 'Sakatlanan Yıldız',
    description: 'Takımın yıldız oyuncusu sakatlandı. Doktorlar tam iyileşmesi için 4 hafta dinlenmesi gerektiğini söylüyor, ancak önemli bir maç 2 hafta sonra.',
    options: [
      {
        text: 'Riski göze al ve 2 hafta sonra sahaya sür',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: -10,
          teamMoraleChange: -5,
          message: 'Oyuncu daha da sakatlandı ve sezon sonuna kadar oynayamayacak. Karar büyük eleştiri aldı.',
          title: 'Sağlık Tehlikeye Atan'
        }
      },
      {
        text: 'Doktorların tavsiyesine uy ve 4 hafta dinlendir',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Oyuncu tam olarak iyileşti ve daha güçlü döndü. Profesyonel yaklaşımınız takdir edildi.'
        }
      },
      {
        text: 'Alternatif tedavi yöntemleri dene ve 3 hafta sonra değerlendir',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 0,
          teamMoraleChange: 0,
          message: 'Tedavi kısmen başarılı oldu. Oyuncu 3 hafta sonra dönebildi, ancak tam performans gösteremiyor.'
        }
      }
    ]
  },
  {
    title: 'Medya Baskısı',
    description: 'Son maçlarda kötü sonuçlar aldınız ve medya sert eleştiriyor. Basın toplantısında nasıl bir tavır sergileyeceksiniz?',
    options: [
      {
        text: 'Eleştirilere sert yanıt ver ve medyayı suçla',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: -10,
          teamMoraleChange: -5,
          message: 'Taraftarların bir kısmı sizi desteklese de, profesyonel olmayan tavırdan dolayı eleştiriler arttı.',
          title: 'Medya Düşmanı'
        }
      },
      {
        text: 'Sorumluluk al ve daha iyi olacağına söz ver',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Dürüst yaklaşımınız hem taraftarlar hem de yönetim tarafından takdir edildi.'
        }
      },
      {
        text: 'Soruları geçiştir ve detaya girme',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: -5,
          teamMoraleChange: 0,
          message: 'Kimse cevaplarınızdan tatmin olmadı ve güvenilirliğiniz sorgulanıyor.'
        }
      }
    ]
  },
  {
    title: 'Disiplinsiz Oyuncu',
    description: 'Takımın yıldız oyuncusu antrenmana geç geliyor ve takım kurallarına uymakta zorluk çekiyor. Nasıl bir önlem alacaksınız?',
    options: [
      {
        text: 'Sert bir ceza ver ve bir sonraki maçta kadroya alma',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 15,
          teamMoraleChange: 10,
          message: 'Oyuncu disiplin cezasını kabul etti ve davranışlarını düzeltti. Takım içi disiplin arttı.'
        }
      },
      {
        text: 'Özel bir görüşme yap ve son bir şans ver',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 0,
          teamMoraleChange: 0,
          message: 'Oyuncu bir süre daha dikkatli davrandı, ancak eski alışkanlıklarına geri dönme eğilimi gösteriyor.'
        }
      },
      {
        text: 'Durumu görmezden gel ve performansa odaklan',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: -10,
          teamMoraleChange: -15,
          message: 'Diğer oyuncular da disiplin konusunda gevşemeye başladı. Takım içi düzen bozuluyor.',
          title: 'Disiplinsiz Teknik Direktör'
        }
      }
    ]
  },
  {
    title: 'Taktik Değişikliği',
    description: 'Takım son maçlarda istediği sonuçları alamıyor. Taktik değişikliği düşünüyor musunuz?',
    options: [
      {
        text: 'Tamamen yeni bir sistem ve diziliş dene',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: -5,
          teamMoraleChange: -5,
          message: 'Yeni sistem takıma iyi geldi, ancak uyum sorunu yaşanıyor. Yönetim fazla risk aldığınızı düşünüyor.'
        }
      },
      {
        text: 'Mevcut sistemi koru ama küçük ayarlamalar yap',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 5,
          teamMoraleChange: 5,
          message: 'Yapılan küçük değişiklikler işe yaradı. Takım daha dengeli oynamaya başladı.'
        }
      },
      {
        text: 'Hiçbir değişiklik yapma ve mevcut sisteme güven',
        consequences: {
          fanSupportChange: -10,
          managementTrustChange: -10,
          teamMoraleChange: -10,
          message: 'Kötü sonuçlar devam etti ve taraftarlar değişim talep ediyor. Herkes hayal kırıklığı içinde.',
          title: 'İnatçı Teknik Direktör'
        }
      }
    ]
  },
  {
    title: 'Genç Oyuncular',
    description: 'Altyapıdan yetenekli gençler A takıma yükselmek istiyor. Yaklaşımınız ne olacak?',
    options: [
      {
        text: 'Genç oyunculara şans ver ve rotasyonda kullan',
        consequences: {
          fanSupportChange: 15,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Genç oyuncular beklentileri aştı ve taraftarlar altyapıya verdiğiniz değeri takdir ediyor.',
          title: 'Gençlerin Hamisi'
        }
      },
      {
        text: 'Sadece en yetenekli 1-2 oyuncuya şans ver',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 5,
          teamMoraleChange: 0,
          message: 'Seçilen gençler iyi performans gösteriyor. Dengeli bir yaklaşım sergilediğiniz düşünülüyor.'
        }
      },
      {
        text: 'Tecrübeli oyunculara güven ve gençleri kiralık gönder',
        consequences: {
          fanSupportChange: -10,
          managementTrustChange: -5,
          teamMoraleChange: -5,
          message: 'Taraftarlar altyapıya önem vermediğinizi düşünüyor. Genç oyuncular hayal kırıklığına uğradı.'
        }
      }
    ]
  },
  {
    title: 'Başka Kulüpten Teklif',
    description: 'Daha büyük ve zengin bir kulüpten size teklif geldi. Nasıl yanıt vereceksiniz?',
    options: [
      {
        text: 'Teklifi reddet ve mevcut kulübe bağlılığını göster',
        consequences: {
          fanSupportChange: 20,
          managementTrustChange: 15,
          teamMoraleChange: 10,
          message: 'Bağlılığınız büyük takdir topladı. Taraftarlar ve yönetim size olan güvenini artırdı.',
          title: 'Sadık Teknik Direktör'
        }
      },
      {
        text: 'Görüşmelere açık ol ama hemen karar verme',
        consequences: {
          fanSupportChange: -10,
          managementTrustChange: -15,
          teamMoraleChange: -5,
          message: 'Kararsızlığınız güven kaybına neden oldu. Medya transfer söylentilerini sürekli gündemde tutuyor.'
        }
      },
      {
        text: 'Teklifi kabul et ve transfer için hazırlan',
        consequences: {
          fanSupportChange: -20,
          managementTrustChange: -20,
          teamMoraleChange: -15,
          message: 'Taraftarlar ve oyuncular büyük hayal kırıklığı yaşadı. Kulüpten ayrılmanız tepki çekti.',
          title: 'Fırsatçı Teknik Direktör'
        }
      }
    ]
  },
  {
    title: 'Çalışma Programı',
    description: 'Yoğun maç takvimi nedeniyle oyuncular yorgun düşüyor. Antrenman programı için nasıl bir yaklaşım uygulayacaksınız?',
    options: [
      {
        text: 'Yoğun ve sert antrenmanlarla disiplini koruyun',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 5,
          teamMoraleChange: -15,
          message: 'Oyuncular yorgunluktan performans düşüşü yaşıyor. Sakatlıklar arttı.',
          title: 'Demir Yumruk'
        }
      },
      {
        text: 'Dengeli bir program uygula ve rotasyon yap',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 10,
          teamMoraleChange: 10,
          message: 'Dengeli yaklaşımınız sonuç verdi. Oyuncular hem dinç hem de formda kalmayı başarıyor.'
        }
      },
      {
        text: 'Dinlenmeye öncelik ver ve antrenmanları hafiflet',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: -5,
          teamMoraleChange: 15,
          message: 'Oyuncular mutlu ve dinlenmiş, ancak fiziksel kondisyon düşüşü gözleniyor.'
        }
      }
    ]
  },
  {
    title: 'Mali Kriz',
    description: 'Kulüp mali zorluklar yaşıyor ve giderlerin kısılması isteniyor. Nasıl bir yaklaşım sergileyeceksiniz?',
    options: [
      {
        text: 'Yüksek maaşlı oyuncuları satarak bütçeyi rahatlatın',
        consequences: {
          fanSupportChange: -15,
          managementTrustChange: 20,
          teamMoraleChange: -10,
          message: 'Mali durum düzeldi ancak takım güç kaybetti. Taraftarlar yıldızların satılmasından memnun değil.'
        }
      },
      {
        text: 'Genç oyunculara yönelerek maliyeti düşürün',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 10,
          teamMoraleChange: 0,
          message: 'Akıllı ve sürdürülebilir yaklaşımınız takdir edildi. Genç oyuncuların gelişimi göze çarpıyor.'
        }
      },
      {
        text: 'Mali kısıtlamaları reddedin ve yatırım talep edin',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: -20,
          teamMoraleChange: 5,
          message: 'Yönetimle ters düştünüz ve ilişkiler gergin. Taraftarlar hırslı yaklaşımınızı destekliyor.',
          title: 'Yönetim Düşmanı'
        }
      }
    ]
  },
  {
    title: 'Taraftar Protestosu',
    description: 'Taraftarlar son sonuçlardan dolayı protesto gösterileri düzenliyor. Nasıl yanıt vereceksiniz?',
    options: [
      {
        text: 'Taraftarlarla buluş ve onları dinle',
        consequences: {
          fanSupportChange: 20,
          managementTrustChange: 0,
          teamMoraleChange: 5,
          message: 'Taraftarlar yaklaşımınızı takdir etti ve desteğini yeniledi. İletişim kanalları güçlendi.',
          title: 'Taraftar Dostu'
        }
      },
      {
        text: 'Medya aracılığıyla mesaj gönder ve anlayış iste',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 5,
          teamMoraleChange: 0,
          message: 'Mesajınız kısmen olumlu karşılandı, ancak bazı taraftar grupları daha fazlasını bekliyor.'
        }
      },
      {
        text: 'Durumu görmezden gel ve sadece işine odaklan',
        consequences: {
          fanSupportChange: -15,
          managementTrustChange: -5,
          teamMoraleChange: -10,
          message: 'Protestolar büyüdü ve medya baskısı arttı. Takım üzerindeki baskı performansı etkiliyor.'
        }
      }
    ]
  },
  {
    title: 'Kaptan Seçimi',
    description: 'Mevcut takım kaptanı sakatlandı ve uzun süre oynayamayacak. Yeni kaptan seçimi için nasıl bir yol izleyeceksiniz?',
    options: [
      {
        text: 'Takımın en tecrübeli oyuncusunu seç',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 10,
          teamMoraleChange: 5,
          message: 'Tecrübeli oyuncu kaptanlık görevini başarıyla üstlendi ve takıma liderlik ediyor.'
        }
      },
      {
        text: 'Oyunculara oylama yaptır ve demokratik seçim yap',
        consequences: {
          fanSupportChange: 10,
          managementTrustChange: 0,
          teamMoraleChange: 15,
          message: 'Demokratik yaklaşımınız takım içi birliği güçlendirdi. Oyuncular seçimi sahiplendi.',
          title: 'Demokratik Lider'
        }
      },
      {
        text: 'Gelecek vadeden genç bir oyuncuyu kaptan yap',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: -5,
          teamMoraleChange: -10,
          message: 'Genç oyuncu henüz bu sorumluluğa hazır değil. Tecrübe eksikliği saha içinde hissediliyor.'
        }
      }
    ]
  },
  {
    title: 'Derby Haftası',
    description: 'Ezeli rakibinizle büyük bir derby maçı yaklaşıyor. Maç öncesi yaklaşımınız ne olacak?',
    options: [
      {
        text: 'Agresif açıklamalarla gerilimi artır ve rakibi tahrik et',
        consequences: {
          fanSupportChange: 15,
          managementTrustChange: -10,
          teamMoraleChange: 5,
          message: 'Taraftarlar ateşli açıklamalarınızı sevdi, ancak maçta gerginlik üst düzeye çıktı ve kırmızı kartlar gördünüz.'
        }
      },
      {
        text: 'Rakibe saygılı ol ancak kazanma kararlılığını vurgula',
        consequences: {
          fanSupportChange: 5,
          managementTrustChange: 15,
          teamMoraleChange: 10,
          message: 'Profesyonel duruşunuz takdir topladı. Takım odaklanmış ve disiplinli bir performans sergiledi.'
        }
      },
      {
        text: 'Tamamen sessiz kal ve medyadan uzak dur',
        consequences: {
          fanSupportChange: -5,
          managementTrustChange: 5,
          teamMoraleChange: 0,
          message: 'Sessizliğiniz stratejik bulundu ancak taraftarlar daha fazla tutku bekliyordu.'
        }
      }
    ]
  },
  {
    title: 'Sponsor Anlaşması',
    description: 'Kulübe büyük bir sponsor teklifi geldi, ancak bazı taraftarlar sponsorun etik değerlerini sorguluyor. Tavrınız ne olacak?',
    options: [
      {
        text: 'Anlaşmayı destekle ve ekonomik faydaları vurgula',
        consequences: {
          fanSupportChange: -10,
          managementTrustChange: 20,
          teamMoraleChange: 0,
          message: 'Yönetim memnun ancak bir kısım taraftar protesto başlattı. Kulüp ekonomik olarak güçlendi.'
        }
      },
      {
        text: 'Tarafsız kal ve "Bu benim görev alanım değil" de',
        consequences: {
          fanSupportChange: 0,
          managementTrustChange: 0,
          teamMoraleChange: 0,
          message: 'Kimse tavrınızdan memnun olmadı. Kararsız görünmek beklentileri karşılamadı.'
        }
      },
      {
        text: 'Sponsora karşı çık ve etik değerleri savun',
        consequences: {
          fanSupportChange: 15,
          managementTrustChange: -15,
          teamMoraleChange: 5,
          message: 'Taraftarlar prensipli duruşunuzu alkışladı ancak yönetimle aranızda ciddi bir gerginlik oluştu.',
          title: 'Prensip Sahibi'
        }
      }
    ]
  }
];

function getRandomDecision() {
  const randomIndex = Math.floor(Math.random() * decisionEvents.length);
  return decisionEvents[randomIndex];
}

module.exports = {
  getRandomDecision
};