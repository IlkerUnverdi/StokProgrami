import Link from 'next/link';

const settingCards = [
  {
    title: 'Ürün Ayarları',
    description:
      'Ürün kategorileri, parça markaları, ürün kod yapıları ve ürün tanımlama ayarlarını yönetin.',
    href: '/dashboard/settings/products',
    status: 'Hazır',
    initial: 'Ü',
  },
  {
    title: 'Kategori Ayarları',
    description:
      'Motor, fren, ateşleme gibi kategori gruplarını ve krank mili, buji, fren balatası gibi alt kategorileri yönetin.',
    href: '/dashboard/settings/categories',
    status: 'Planlandı',
    initial: 'K',
  },
  {
    title: 'Marka Ayarları',
    description:
      'Valeo, Bosch, TRW, MGA gibi parça markalarını ekleyin, düzenleyin veya pasifleştirin.',
    href: '/dashboard/settings/brands',
    status: 'Planlandı',
    initial: 'M',
  },
  {
    title: 'Araç Ayarları',
    description:
      'Araç markaları, modelleri ve motor/varyant bilgilerini yönetin.',
    href: '/dashboard/settings/vehicles',
    status: 'Planlandı',
    initial: 'A',
  },
  {
    title: 'Cari Ayarları',
    description:
      'Cari hesap grupları, varsayılan limitler ve cari yönetimi ile ilgili sistem ayarlarını yönetin.',
    href: '/dashboard/settings/current-accounts',
    status: 'Hazır',
    initial: 'C',
  },
  {
    title: 'Kullanıcı Ayarları',
    description:
      'Yeni kullanıcı oluşturma, rol atama ve kullanıcı durumlarını yönetin.',
    href: '/dashboard/settings/users',
    status: 'Planlandı',
    initial: 'K',
  },
  {
    title: 'Firma Ayarları',
    description:
      'Firma bilgileri, logo, adres ve PDF çıktılarında görünecek bilgileri yönetin.',
    href: '/dashboard/settings/company',
    status: 'Planlandı',
    initial: 'F',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Sistem Ayarları
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-500">
          StokProgrami içinde ürün, araç, kullanıcı ve firma yapılandırmalarını
          buradan yönetin. Sık kullanılan ayarlar tek merkezde toplanır.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingCards.map((card) => {
          const isReady = card.status === 'Hazır';

          return (
            <Link
              key={card.title}
              href={card.href}
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isReady
                  ? 'border-neutral-200 hover:border-red-300'
                  : 'border-dashed border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-700">
                  {card.initial}
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isReady
                      ? 'bg-green-50 text-green-700'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {card.status}
                </span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-neutral-900 group-hover:text-red-700">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-800">
        <div className="font-semibold">Önemli mimari not</div>
        <p className="mt-1 leading-6">
          Kullanıcı ayarları sadece ekran yapmakla bitmez. Rol ve yetki kontrolü
          backend tarafında zorunlu olmalı. Yoksa normal personel yanlışlıkla
          kullanıcı oluşturabilir veya kritik ayarları değiştirebilir.
        </p>
      </div>
    </div>
  );
}