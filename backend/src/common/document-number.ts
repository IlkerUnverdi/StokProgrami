import { Prisma } from '@prisma/client';

export type DocumentNumberType = 'SALE' | 'PURCHASE' | 'QUOTE' | 'RETURN';

const documentPrefixes: Record<DocumentNumberType, string> = {
  SALE: 'SAT',
  PURCHASE: 'ALS',
  QUOTE: 'TKL',
  RETURN: 'IAD',
};

async function findLatestDocumentNo(
  tx: Prisma.TransactionClient,
  type: DocumentNumberType,
) {
  switch (type) {
    case 'SALE': {
      const sale = await tx.sale.findFirst({
        where: { saleNo: { startsWith: 'SAT-' } },
        orderBy: { saleNo: 'desc' },
        select: { saleNo: true },
      });

      return sale?.saleNo ?? null;
    }
    case 'PURCHASE': {
      const purchase = await tx.purchase.findFirst({
        where: { purchaseNo: { startsWith: 'ALS-' } },
        orderBy: { purchaseNo: 'desc' },
        select: { purchaseNo: true },
      });

      return purchase?.purchaseNo ?? null;
    }
    case 'QUOTE': {
      const quote = await tx.quote.findFirst({
        where: { quoteNo: { startsWith: 'TKL-' } },
        orderBy: { quoteNo: 'desc' },
        select: { quoteNo: true },
      });

      return quote?.quoteNo ?? null;
    }
    case 'RETURN': {
      const returnDocument = await tx.return.findFirst({
        where: { returnNo: { startsWith: 'IAD-' } },
        orderBy: { returnNo: 'desc' },
        select: { returnNo: true },
      });

      return returnDocument?.returnNo ?? null;
    }
  }
}

export async function generateDocumentNumber(
  tx: Prisma.TransactionClient,
  type: DocumentNumberType,
) {
  const prefix = documentPrefixes[type];
  const latestDocumentNo = await findLatestDocumentNo(tx, type);
  const latestDocumentNumber = latestDocumentNo
    ? Number.parseInt(latestDocumentNo.slice(prefix.length + 1), 10) || 0
    : 0;

  let counter = await tx.documentCounter.upsert({
    where: { key: type },
    create: {
      key: type,
      value: latestDocumentNumber + 1,
    },
    update: {
      value: {
        increment: 1,
      },
    },
  });

  if (counter.value <= latestDocumentNumber) {
    counter = await tx.documentCounter.update({
      where: { key: type },
      data: {
        value: latestDocumentNumber + 1,
      },
    });
  }

  return `${prefix}-${String(counter.value).padStart(6, '0')}`;
}
