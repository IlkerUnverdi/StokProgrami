import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Roller
  const roles = ['Admin', 'Mudur', 'SatisElemani', 'Depo', 'Kasa'];
  const hashedPassword = await bcrypt.hash('123456', 10);

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // Araç markaları
  const vehicleBrands = ['Fiat', 'Renault', 'Dacia'];

  for (const brandName of vehicleBrands) {
    await prisma.vehicleBrand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
  }

  // Brand çek
  const fiat = await prisma.vehicleBrand.findUnique({
    where: { name: 'Fiat' },
  });
  const renault = await prisma.vehicleBrand.findUnique({
    where: { name: 'Renault' },
  });
  const dacia = await prisma.vehicleBrand.findUnique({
    where: { name: 'Dacia' },
  });

  if (!fiat || !renault || !dacia) {
    throw new Error('Brand bulunamadı');
  }

  // Vehicle variants
  const vehicleVariants = [
    {
      modelName: 'Egea',
      engine: '1.3 Multijet',
      fuel: 'Diesel',
      yearStart: 2015,
      yearEnd: null,
      vehicleBrandId: fiat.id,
    },
    {
      modelName: 'Egea',
      engine: '1.4 Fire',
      fuel: 'Benzin',
      yearStart: 2015,
      yearEnd: null,
      vehicleBrandId: fiat.id,
    },
    {
      modelName: 'Doblo',
      engine: '1.6 Multijet',
      fuel: 'Diesel',
      yearStart: 2010,
      yearEnd: null,
      vehicleBrandId: fiat.id,
    },
    {
      modelName: 'Clio 4',
      engine: '1.5 dCi',
      fuel: 'Diesel',
      yearStart: 2012,
      yearEnd: 2019,
      vehicleBrandId: renault.id,
    },
    {
      modelName: 'Clio 4',
      engine: '1.2 16V',
      fuel: 'Benzin',
      yearStart: 2012,
      yearEnd: 2019,
      vehicleBrandId: renault.id,
    },
    {
      modelName: 'Clio 5',
      engine: '1.0 TCe',
      fuel: 'Benzin',
      yearStart: 2019,
      yearEnd: null,
      vehicleBrandId: renault.id,
    },
    {
      modelName: 'Megane 4',
      engine: '1.5 dCi',
      fuel: 'Diesel',
      yearStart: 2016,
      yearEnd: null,
      vehicleBrandId: renault.id,
    },
    {
      modelName: 'Duster',
      engine: '1.5 dCi',
      fuel: 'Diesel',
      yearStart: 2018,
      yearEnd: null,
      vehicleBrandId: dacia.id,
    },
    {
      modelName: 'Sandero',
      engine: '1.0 SCe',
      fuel: 'Benzin',
      yearStart: 2021,
      yearEnd: null,
      vehicleBrandId: dacia.id,
    },
  ];

  for (const variant of vehicleVariants) {
    await prisma.vehicleVariant.upsert({
      where: {
        vehicleBrandId_modelName_engine_fuel_yearStart: {
          vehicleBrandId: variant.vehicleBrandId,
          modelName: variant.modelName,
          engine: variant.engine,
          fuel: variant.fuel,
          yearStart: variant.yearStart,
        },
      },
      update: {
        fuel: variant.fuel,
        yearStart: variant.yearStart,
        yearEnd: variant.yearEnd,
      },
      create: variant,
    });
  }

  // Part brand
  const partBrands = ['MGA', 'TRW', 'Valeo'];

  for (const brandName of partBrands) {
    await prisma.partBrand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
  }

  // Category groups + categories
  const categoryData = [
    {
      group: 'Fren',
      categories: [
        'Fren Balatası',
        'Fren Diski',
        'Fren Kampanası',
        'Fren Merkezi',
        'ABS Sensörü',
        'Fren Hortumu',
        'El Fren Teli',
      ],
    },
    {
      group: 'Filtre',
      categories: ['Hava Filtresi', 'Yağ Filtresi', 'Polen Filtresi', 'Yakıt Filtresi'],
    },
    {
      group: 'Süspansiyon ve Direksiyon',
      categories: [
        'Amortisör',
        'Amortisör Takozu',
        'Rot Başı',
        'Rotil',
        'Z Rot',
        'Salıncak',
        'Aks Kafası',
      ],
    },
    {
      group: 'Motor',
      categories: ['Conta', 'Subap', 'Piston', 'Sekman', 'Krank Sensörü', 'Eksantrik Sensörü'],
    },
    {
      group: 'Ateşleme ve Yakıt',
      categories: ['Buji', 'Bobin', 'Enjektör', 'Yakıt Pompası'],
    },
    {
      group: 'Elektrik ve Aydınlatma',
      categories: ['Akü', 'Alternatör', 'Marş Motoru', 'Far', 'Stop', 'Ampul', 'Sigorta', 'Silecek Motoru'],
    },
    {
      group: 'Debriyaj ve Şanzıman',
      categories: ['Debriyaj Seti', 'Baskı Balata', 'Volan', 'Şanzıman Takozu', 'Aks Keçesi'],
    },
    {
      group: 'Soğutma',
      categories: ['Radyatör', 'Devirdaim', 'Termostat', 'Fan', 'Genleşme Kabı'],
    },
    {
      group: 'Klima ve Isıtma',
      categories: ['Klima Kompresörü', 'Kalorifer Radyatörü', 'Klima Radyatörü', 'Üfleç Motoru'],
    },
    {
      group: 'Egzoz',
      categories: ['Egzoz Manifoldu', 'Katalizör', 'Susturucu', 'Oksijen Sensörü'],
    },
    {
      group: 'Kaporta',
      categories: ['Tampon', 'Çamurluk', 'Kaput', 'Bagaj Kapağı', 'Kapı', 'Izgara', 'Ayna'],
    },
    {
      group: 'Cam ve Silecek',
      categories: ['Ön Cam', 'Arka Cam', 'Cam Krikosu', 'Silecek', 'Silecek Kolu'],
    },
    {
      group: 'İç Trim ve Döşeme',
      categories: ['Torpido Parçası', 'Kapı Kolu İç', 'Konsol Parçası', 'Fitil'],
    },
    {
      group: 'Sensör ve Elektronik',
      categories: ['MAP Sensörü', 'MAF Sensörü', 'Park Sensörü', 'ABS Sensörü', 'Hız Sensörü'],
    },
    {
      group: 'Sarf Malzemeleri',
      categories: ['Antifriz', 'Fren Hidroliği', 'Motor Yağı', 'Şanzıman Yağı'],
    },
  ];

  for (const item of categoryData) {
    const group = await prisma.categoryGroup.upsert({
      where: { name: item.group },
      update: {},
      create: { name: item.group },
    });

    for (const categoryName of item.categories) {
      await prisma.category.upsert({
        where: { name: categoryName },
        update: {
          categoryGroupId: group.id,
        },
        create: {
          name: categoryName,
          categoryGroupId: group.id,
        },
      });
    }
  }

  // Admin user
  const adminRole = await prisma.role.findUnique({
    where: { name: 'Admin' },
  });

  if (!adminRole) throw new Error('Admin rolü yok');

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('Seed tamamlandı');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
