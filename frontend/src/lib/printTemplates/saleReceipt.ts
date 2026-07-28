// frontend/src/lib/printTemplates/saleReceipt.ts

import { api } from '@/lib/api';
type SaleItem = {
  id: number;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  product: {
    id: number;
    name: string;
    barcode?: string | null;
    partBrand?: { name: string } | null;
    oemCodes?: { code: string; isPrimary: boolean }[];
    referenceCodes?: { code: string }[];
  };
};

type Sale = {
  id: number;
  saleNo: string;
  grandTotal: string | number;
  note?: string | null;
  createdAt: string;
  currentAccount?: {
    id?: number;
    name: string;
    phone?: string | null;
  } | null;
  items: SaleItem[];
};

type CurrentAccountMovementDetail = {
  id: number;
  type: 'DEBT' | 'PAYMENT';
  amount: string | number;
  note?: string | null;
  createdAt: string;
  sale?: {
    saleNo?: string;
    items?: SaleItem[];
  } | null;
};

type CurrentAccountDetail = {
  id: number;
  name: string;
  phone?: string | null;
  currentAccountMovements?: CurrentAccountMovementDetail[];
};

type PaymentBadge = {
  label: string;
  value: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('tr-TR');
}

function getCleanSaleNote(note?: string | null) {
  if (!note) return '';

  return note
    .split('|')
    .map((item) => item.trim())
    .filter((item) => {
      const lower = item.toLocaleLowerCase('tr');

      return !(
        lower.startsWith('nakit:') ||
        lower.startsWith('kart:') ||
        lower.startsWith('havale/eft:') ||
        lower.startsWith('cari borç:')
      );
    })
    .join(' | ');
}

function getPaymentBadges(note?: string | null): PaymentBadge[] {
  if (!note) return [];

  return note
    .split('|')
    .map((item) => item.trim())
    .map((item) => {
      const [rawLabel, ...rest] = item.split(':');
      const value = rest.join(':').trim();

      if (!rawLabel || !value) return null;

      const lowerLabel = rawLabel.toLocaleLowerCase('tr');

      if (
        !lowerLabel.includes('nakit') &&
        !lowerLabel.includes('kart') &&
        !lowerLabel.includes('havale') &&
        !lowerLabel.includes('cari')
      ) {
        return null;
      }

      return {
        label: rawLabel.trim(),
        value,
      };
    })
    .filter((payment): payment is PaymentBadge => Boolean(payment));
}

function getPrimaryOem(item: SaleItem) {
  const primary = item.product.oemCodes?.find((code) => code.isPrimary);
  return primary?.code || item.product.oemCodes?.[0]?.code || '-';
}

function getPrimaryReference(item: SaleItem) {
  return item.product.referenceCodes?.[0]?.code || '-';
}

function groupSaleItems(items: SaleItem[]) {
  const map = new Map<number, SaleItem>();

  for (const item of items) {
    const existing = map.get(item.product.id);

    if (existing) {
      map.set(item.product.id, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        lineTotal: String(Number(existing.lineTotal) + Number(item.lineTotal)),
      });
    } else {
      map.set(item.product.id, item);
    }
  }

  return Array.from(map.values());
}
import { buildCurrentAccountStatementHtml } from './currentAccountStatement';

export async function printSaleReceipt(sale: Sale) {
  const groupedItems = groupSaleItems(sale.items);
  const paymentBadges = getPaymentBadges(sale.note);
  const itemCount = groupedItems.reduce(
    (sum: number, item: SaleItem) => sum + item.quantity,
    0,
  );
  const cleanNote = getCleanSaleNote(sale.note);

  let accountStatementPage = '';

  if (sale.currentAccount?.id) {
    try {
      const [detailRes, balanceRes] = await Promise.all([
        api.get<CurrentAccountDetail>(`/current-accounts/${sale.currentAccount.id}`),
        api.get<{ balance: number }>(`/current-accounts/${sale.currentAccount.id}/balance`),
      ]);

      accountStatementPage = buildCurrentAccountStatementHtml(
        detailRes.data,
        Number(balanceRes.data.balance ?? 0),
        true,
      );
    } catch (err) {
      console.error('SALE PRINT ACCOUNT STATEMENT ERROR:', err);
    }
  }

  const rows = groupedItems
    .map(
      (item: SaleItem, index: number) => `
        <tr>
          <td class="muted">${index + 1}</td>
          <td>
            <div class="product-name">${item.product.name}</div>
            <div class="product-meta">${item.product.partBrand?.name || '-'}</div>
          </td>
          <td>${getPrimaryOem(item)}</td>
          <td>${getPrimaryReference(item)}</td>
          <td class="right">${item.quantity}</td>
          <td class="right">${Number(item.unitPrice).toFixed(2)} ₺</td>
          <td class="right strong">${Number(item.lineTotal).toFixed(2)} ₺</td>
        </tr>
      `,
    )
    .join('');

  const payments =
    paymentBadges.length > 0
      ? paymentBadges
          .map(
            (payment: PaymentBadge) => `
              <div class="summary-row">
                <span>${payment.label}</span>
                <strong>${payment.value} ₺</strong>
              </div>
            `,
          )
          .join('')
      : '<div class="summary-row"><span>Ödeme</span><strong>-</strong></div>';

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <title>${sale.saleNo}</title>

        <style>
          * { box-sizing: border-box; }

          @page {
            size: A4;
            margin: 14mm;
          }

          body {
            margin: 0;
            background: #ffffff;
            color: #151515;
            font-family: "Arial Unicode MS", "DejaVu Sans", Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 13mm 16mm 14mm;
            background: #ffffff;
          }

          .page-break {
            page-break-before: always;
          }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 28px;
            padding-bottom: 16px;
            border-bottom: 1px solid #cfcfcf;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .brand-logo {
            width: 96px;
            height: 96px;
            object-fit: contain;
          }

          .brand-name {
            font-size: 30px;
            font-weight: 800;
          }

          .brand-subtitle {
            margin-top: 4px;
            color: #666666;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .brand-info {
            margin-top: 10px;
            color: #666666;
            font-size: 11px;
            line-height: 1.45;
          }

          .document-title {
            text-align: right;
          }

          .document-title .label {
            color: #444444;
            font-size: 13px;
            font-weight: 700;
          }

          .document-title .number {
            margin-top: 7px;
            font-size: 28px;
            font-weight: 800;
          }

          .document-title .date {
            margin-top: 6px;
            color: #666666;
            font-size: 12px;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: 1.4fr 0.8fr 0.8fr;
            gap: 18px;
            margin-top: 20px;
            padding-bottom: 18px;
            border-bottom: 1px solid #eeeeee;
          }

          .meta-label {
            color: #777777;
            font-size: 11px;
            font-weight: 700;
          }

          .meta-value {
            margin-top: 7px;
            font-size: 16px;
            font-weight: 700;
          }

          .meta-sub {
            margin-top: 4px;
            color: #777777;
            font-size: 12px;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 24px;
            margin-bottom: 10px;
          }

          .section-header h2 {
            margin: 0;
            font-size: 17px;
            font-weight: 800;
          }

          .section-header span {
            color: #777777;
            font-size: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            border-top: 1px solid #151515;
            border-bottom: 1px solid #151515;
            padding: 9px 8px;
            text-align: left;
            font-size: 11px;
            font-weight: 800;
          }

          td {
            border-bottom: 1px solid #eeeeee;
            padding: 10px 8px;
            font-size: 12px;
            vertical-align: top;
          }

          .right {
            text-align: right;
            white-space: nowrap;
          }

          .muted {
            color: #777777;
          }

          .strong {
            font-weight: 800;
          }

          .product-name {
            font-weight: 700;
          }

          .product-meta {
            margin-top: 3px;
            color: #777777;
            font-size: 11px;
          }

          .bottom {
            display: grid;
            grid-template-columns: 1fr 310px;
            gap: 28px;
            margin-top: 26px;
          }

          .note {
            min-height: 100px;
            border-top: 1px solid #dddddd;
            padding-top: 12px;
          }

          .note-title,
          .summary-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .note-text {
            margin-top: 9px;
            color: #555555;
            font-size: 12px;
            line-height: 1.45;
          }

          .summary {
            border-top: 1px solid #151515;
            padding-top: 12px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 6px 0;
            color: #555555;
            font-size: 12px;
          }

          .summary-row strong {
            color: #111111;
          }

          .grand-total {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-top: 12px;
            padding: 14px 0 0;
            border-top: 1px solid #dddddd;
            font-size: 20px;
            font-weight: 900;
          }

          .grand-total span:last-child {
            color: #b91c1c;
          }

          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 58px;
          }

          .signature {
            border-top: 1px solid #cccccc;
            padding-top: 8px;
            text-align: center;
            color: #777777;
            font-size: 11px;
          }

          .footer {
            margin-top: 38px;
            padding-top: 10px;
            border-top: 1px solid #eeeeee;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            color: #777777;
            font-size: 11px;
          }

          .green { color: #166534; }
          .red { color: #b91c1c; }
          .debt { color: #b91c1c; font-weight: 800; }
          .payment { color: #166534; font-weight: 800; }

          .movement-detail { line-height: 1.3; }
          .movement-sub {
            margin-top: 2px;
            color: #777777;
            font-size: 8px;
          }

          .statement-top {
            display: block;
            margin-top: 22px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eeeeee;
          }

          .statement-section {
            margin-top: 20px;
            margin-bottom: 8px;
          }

          .statement-table th,
          .statement-table td {
            padding: 5px 6px;
            font-size: 8.5px;
          }

          .statement-balance-footer {
            margin-top: 26px;
            display: flex;
            justify-content: flex-end;
          }

          .statement-balance-card {
            min-width: 240px;
            border-top: 2px solid #151515;
            padding-top: 12px;
            text-align: right;
          }

          .statement-balance-label {
            color: #777777;
            font-size: 11px;
            font-weight: 700;
          }

          .statement-balance-value {
            margin-top: 6px;
            font-size: 28px;
            font-weight: 900;
          }

          @media print {
            .page {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
            }

            .brand-logo {
              width: 98px;
              height: 98px;
            }
          }
        </style>
      </head>

      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              <img src="/branding/logo-square.png" class="brand-logo" />
              <div>
                <div class="brand-name">ENES OTOMOTİV</div>
                <div class="brand-subtitle">Yedek Parça</div>
                <div class="brand-info">
                  Oto yedek parça satış ve cari takip belgesi<br />
                  Tel: 0555 077 17 02
                </div>
              </div>
            </div>

            <div class="document-title">
              <div class="label">Satış Fişi</div>
              <div class="number">${sale.saleNo}</div>
              <div class="date">${formatDateTime(sale.createdAt)}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div class="meta-label">Müşteri / Cari</div>
              <div class="meta-value">${sale.currentAccount?.name || 'Peşin Satış'}</div>
              <div class="meta-sub">${sale.currentAccount?.phone || 'Telefon bilgisi yok'}</div>
            </div>

            <div>
              <div class="meta-label">Ürün Adedi</div>
              <div class="meta-value">${itemCount}</div>
              <div class="meta-sub">Toplam satılan ürün</div>
            </div>

            <div>
              <div class="meta-label">Satış No</div>
              <div class="meta-value">${sale.saleNo}</div>
              <div class="meta-sub">Sistem satış kaydı</div>
            </div>
          </div>

          <div class="section-header">
            <h2>Satılan Ürünler</h2>
            <span>${groupedItems.length} farklı ürün</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Ürün</th>
                <th>OEM</th>
                <th>Reference</th>
                <th class="right">Adet</th>
                <th class="right">Birim Fiyat</th>
                <th class="right">Satır Toplamı</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="bottom">
            <div class="note">
              <div class="note-title">Not / Açıklama</div>
              <div class="note-text">${cleanNote || 'Bu satış için not girilmedi.'}</div>
            </div>

            <div class="summary">
              <div class="summary-title">Ödeme Özeti</div>
              ${payments}

              <div class="grand-total">
                <span>Genel Toplam</span>
                <span>${Number(sale.grandTotal).toFixed(2)} ₺</span>
              </div>
            </div>
          </div>

          <div class="signatures">
            <div class="signature">Teslim Eden</div>
            <div class="signature">Teslim Alan</div>
          </div>

          <div class="footer">
            <div>Enes Otomotiv Yedek Parça</div>
            <div>Satış No: ${sale.saleNo}</div>
            <div>Bu belge sistem tarafından oluşturulmuştur.</div>
          </div>
        </div>

        ${accountStatementPage}

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 250);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}