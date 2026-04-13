/** Format a snake_case key into Title Case */
export const formatName = (str) => {
  return String(str || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/** Subject display name overrides */
export const subjectDisplayNames = {
  medical_exam: 'Läkarexamen',
  korkortsteori: 'Körkortsteori',
}

/** Topic display name overrides */
export const topicDisplayOverrides = {
  allmanmedicin: 'Allmänmedicin',
  oron_nasa_hals: 'Öron-näsa-hals',
  trafik_och_vagmarken: 'Trafik och Vägmärken',
  vagmarken_auto: 'Vägmärken (Auto)',
  akutmedicin: 'Akutmedicin',
  diabetologi: 'Diabetologi',
  endokrinologi: 'Endokrinologi',
  gastroenterologi: 'Gastroenterologi',
  hematologi: 'Hematologi',
  hepatologi: 'Hepatologi',
  internmedicin: 'Internmedicin',
  kardiologi: 'Kardiologi',
  klinisk_farmakologi: 'Klinisk Farmakologi',
  lungmedicin: 'Lungmedicin',
  neurologi: 'Neurologi',
  njurmedicin: 'Njurmedicin',
  ortopedi: 'Ortopedi',
  psykiatri: 'Psykiatri',
}

export const getSubjectDisplayName = (subjectKey) => {
  return subjectDisplayNames[subjectKey] || formatName(subjectKey)
}

export const getTopicDisplayName = (topicKey) => {
  const key = String(topicKey || '').replace(/\.ya?ml$/i, '')
  return topicDisplayOverrides[key] || formatName(key)
}
