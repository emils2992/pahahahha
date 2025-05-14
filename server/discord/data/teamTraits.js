// Team traits data

function getTeamTraits(traitType) {
  const traits = {
    'kurumsal': {
      description: 'Kurumsal yapıya sahip istikrarlı bir kulüp. Uzun vadeli planlara önem verir.',
      mediaPressure: 'medium',
      fanExpectations: 'medium',
      managementPatience: 'high',
      financialPower: 'high',
      youthFocus: 'medium',
      keyAttributes: ['Sabır', 'İstikrar', 'Planlama', 'Profesyonellik']
    },
    'çalkantılı': {
      description: 'Yönetim ve kadro sık sık değişiyor. Hızlı sonuç beklentisi yüksek.',
      mediaPressure: 'high',
      fanExpectations: 'high',
      managementPatience: 'low',
      financialPower: 'medium',
      youthFocus: 'low',
      keyAttributes: ['Baskı', 'Sık Değişim', 'Kısa Vade', 'Sonuç Odaklılık']
    },
    'sansasyonel': {
      description: 'Büyük transfer hamleleriyle tanınan, her zaman gündemde olmayı seven bir kulüp.',
      mediaPressure: 'high',
      fanExpectations: 'high',
      managementPatience: 'medium',
      financialPower: 'high',
      youthFocus: 'low',
      keyAttributes: ['Medya İlgisi', 'Büyük Transferler', 'Sansasyon', 'Yüksek Profil']
    },
    'default': {
      description: 'Standart bir futbol kulübü.',
      mediaPressure: 'medium',
      fanExpectations: 'medium',
      managementPatience: 'medium',
      financialPower: 'medium',
      youthFocus: 'medium',
      keyAttributes: ['Denge', 'Standart', 'Ortalama']
    }
  };
  
  // Return requested trait or default if not found
  return traits[traitType] || traits.default;
}

module.exports = {
  getTeamTraits
};