// frontend/src/lib/printTemplates/currentAccountStatement.ts
import { escapeHtml } from '@/utils/html';

type SaleItem = {
  id: number;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  product: {
    id: number;
    name: string;
    partBrand?: { name: string } | null;
  };
};

type CurrentAccountMovementDetail = {
  id: number;
  type: 'DEBT' | 'PAYMENT' | 'CREDIT';
  amount: string | number;
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | null;
  note?: string | null;
  createdAt: string;
  sale?: {
    saleNo?: string;
    items?: SaleItem[];
  } | null;
  purchase?: {
    purchaseNo?: string;
    items?: SaleItem[];
  } | null;
  returnDocument?: {
    returnNo?: string;
    items?: SaleItem[];
  } | null;
};

type CurrentAccountDetail = {
  id: number;
  name: string;
  phone?: string | null;
  currentAccountMovements?: CurrentAccountMovementDetail[];
};

type ManualPayment = {
  id: number;
  amount: string | number;
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | null;
  note?: string | null;
  createdAt: string;
  currentAccount?: {
    id: number;
    name: string;
    phone?: string | null;
  } | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('tr-TR');
}

function getCollectionPaymentLabel(
  method?: 'CASH' | 'CARD' | 'TRANSFER' | null,
) {
  if (method === 'CASH') return 'Nakit';
  if (method === 'CARD') return 'Kart';
  if (method === 'TRANSFER') return 'Havale/EFT';
  return 'Yöntem yok';
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

export function buildCurrentAccountStatementHtml(
  account: CurrentAccountDetail,
  currentBalance: number,
  pageBreak = false,
) {
  const movements: CurrentAccountMovementDetail[] = (account.currentAccountMovements ?? [])
    .slice()
    .sort((a, b) => {
      const dateDiff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      if (dateDiff !== 0) return dateDiff;

      return a.id - b.id;
    })
    .slice(-20);

  const statementRows = movements
    .map((movement) => {
      const sign = movement.type === 'DEBT' ? '+' : '-';
      const label =
        movement.type === 'CREDIT'
          ? 'İade Mahsubu'
          : movement.type === 'PAYMENT'
            ? 'Tahsilat'
            : movement.purchase
              ? 'Alış'
              : 'Satış';
      const amountClass = movement.type === 'DEBT' ? 'debt' : 'payment';
      const documentItems =
        movement.sale?.items ??
        movement.purchase?.items ??
        movement.returnDocument?.items ??
        [];
      const groupedItems = documentItems.length
        ? groupSaleItems(documentItems)
        : [];

      const itemSummary = groupedItems.length
        ? groupedItems
            .map(
              (item) =>
                `${item.quantity}x ${escapeHtml(item.product.name)}${
                  item.product.partBrand?.name
                    ? ` (${escapeHtml(item.product.partBrand.name)})`
                    : ''
                }`,
            )
            .join('<br />')
        : movement.type === 'PAYMENT'
          ? `Ödeme yöntemi: ${getCollectionPaymentLabel(movement.paymentMethod)}${
              movement.note ? `<br />Not: ${escapeHtml(movement.note)}` : ''
            }`
          : escapeHtml(movement.note || '-');

      const itemCount = groupedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const documentNo =
        movement.sale?.saleNo ??
        movement.purchase?.purchaseNo ??
        movement.returnDocument?.returnNo ??
        '-';

      return `
        <tr>
          <td>${formatDateTime(movement.createdAt)}</td>
          <td>${label}</td>
          <td>${escapeHtml(documentNo)}</td>
          <td>
            <div class="movement-detail">${itemSummary}</div>
            ${itemCount > 0 ? `<div class="movement-sub">${itemCount} ürün</div>` : ''}
          </td>
          <td class="right ${amountClass}">
            ${sign}${Number(movement.amount).toFixed(2)} ₺
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div class="page ${pageBreak ? 'page-break' : ''}">
      <div class="header compact-header">
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
          <div class="label">Cari Hesap Dökümü</div>
          <div class="number">${escapeHtml(account.name)}</div>
          <div class="date">${formatDateTime(new Date().toISOString())}</div>
        </div>
      </div>

      <div class="statement-top">
        <div>
          <div class="meta-label">Cari / Müşteri</div>
          <div class="meta-value">${escapeHtml(account.name)}</div>
          <div class="meta-sub">${escapeHtml(account.phone || 'Telefon bilgisi yok')}</div>
        </div>
      </div>

      <div class="section-header statement-section">
        <h2>Son 20 Cari Hareket</h2>
        <span>Eski işlemden yeni işleme doğru sıralanmıştır</span>
      </div>

      <table class="statement-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Tür</th>
            <th>Satış No</th>
            <th>İçerik / Ödeme Yöntemi</th>
            <th class="right">Tutar</th>
          </tr>
        </thead>

        <tbody>
          ${
            statementRows ||
            '<tr><td colspan="5" class="empty">Cari hareket bulunamadı.</td></tr>'
          }
        </tbody>
      </table>

      <div class="statement-balance-footer">
        <div class="statement-balance-card">
          <div class="statement-balance-label">Güncel Bakiye</div>
          <div class="statement-balance-value ${currentBalance > 0 ? 'red' : 'green'}">
            ${currentBalance.toFixed(2)} ₺
          </div>
        </div>
      </div>

      <div class="footer statement-footer">
        <div>Enes Otomotiv Yedek Parça</div>
        <div>Cari: ${escapeHtml(account.name)}</div>
        <div>Bu belge sistem tarafından oluşturulmuştur.</div>
      </div>
    </div>
  `;
}

export async function printCurrentAccountStatement(
  payment: ManualPayment,
  account: CurrentAccountDetail,
  currentBalance: number,
) {
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <title>${escapeHtml(account.name)} Cari Döküm</title>
        <style>
          ${getCurrentAccountStatementStyle()}
        </style>
      </head>

      <body>
        ${buildCurrentAccountStatementHtml(account, currentBalance, false)}

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

export function getCurrentAccountStatementStyle() {
  return `
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

    .statement-top {
      display: block;
      margin-top: 22px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eeeeee;
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

    .statement-table {
      width: 100%;
      border-collapse: collapse;
    }

    .statement-table th,
    .statement-table td {
      border-bottom: 1px solid #eeeeee;
      padding: 5px 6px;
      font-size: 8.5px;
      vertical-align: top;
    }

    .statement-table th {
      border-top: 1px solid #151515;
      border-bottom: 1px solid #151515;
      text-align: left;
      font-weight: 900;
    }

    .right {
      text-align: right;
      white-space: nowrap;
    }

    .green { color: #166534; }
    .red { color: #b91c1c; }
    .debt { color: #b91c1c; font-weight: 800; }
    .payment { color: #166534; font-weight: 800; }

    .movement-detail {
      line-height: 1.3;
    }

    .movement-sub {
      margin-top: 2px;
      color: #777777;
      font-size: 8px;
    }

    .payment .movement-detail,
    .payment-detail {
      color: #166534;
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
  `;
}
