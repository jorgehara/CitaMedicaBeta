db.clinics.updateOne(
  { slug: 'micitamedica' },
  { $set: {
    'settings.sobreturnoHours.morning.end': '12:15',
    'settings.sobreturnoHours.afternoon.end': '20:15'
  }}
);

// Verificar resultado
printjson(db.clinics.findOne(
  { slug: 'micitamedica' },
  { 'settings.sobreturnoHours': 1, slug: 1 }
));
