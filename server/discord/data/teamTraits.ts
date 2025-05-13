// Types for team traits
export interface TeamTraits {
  description: string;
  mediaPressure: 'low' | 'medium' | 'high';
  fanExpectations: 'low' | 'medium' | 'high';
  managementPatience: 'low' | 'medium' | 'high';
  financialPower: 'low' | 'medium' | 'high';
  youthFocus: 'low' | 'medium' | 'high';
  keyAttributes: string[];
}

// Team traits based on trait type
const teamTraitsData: Record<string, TeamTraits> = {
  'kurumsal': {
    description: 'Kurumsal yapısı oturmuş, profesyonel bir kulüp. Uzun vadeli planlamalar yapılır ve sabır gösterilir.',
    mediaPressure: 'medium',
    fanExpectations: 'medium',
    managementPatience: 'high',
    financialPower: 'medium',
    youthFocus: 'medium',
    keyAttributes: [
      'Yönetim uzun vadeli düşünür',
      'Profesyonel kulüp yapısı',
      'Medya baskısı daha az',
      'Altyapıya önem verilir'
    ]
  },
  'çalkantılı': {
    description: 'İç dinamikleri değişken, yönetim müdahalelerinin fazla olduğu bir kulüp. Sonuç odaklı ve sabırsız.',
    mediaPressure: 'high',
    fanExpectations: 'high',
    managementPatience: 'low',
    financialPower: 'medium',
    youthFocus: 'low',
    keyAttributes: [
      'Yönetim kadro ve tekniğe müdahale eder',
      'Başarısızlıkta hızlı değişimler yaşanır',
      'Medya baskısı yüksek',
      'Taraftar tepkisi sert olabilir'
    ]
  },
  'sansasyonel': {
    description: 'Medya görünürlüğü yüksek, taraftar beklentisi fazla olan büyük bir kulüp. Her maç kazanmak zorundasın.',
    mediaPressure: 'high',
    fanExpectations: 'high',
    managementPatience: 'medium',
    financialPower: 'high',
    youthFocus: 'low',
    keyAttributes: [
      'Sürekli başarı beklentisi',
      'Yüksek medya ilgisi ve baskısı',
      'Yıldız oyuncu transferleri',
      'Her sene şampiyonluk hedefi'
    ]
  }
};

// Function to get team traits based on trait type
export function getTeamTraits(traitType: string): TeamTraits {
  return teamTraitsData[traitType] || teamTraitsData['kurumsal'];
}
