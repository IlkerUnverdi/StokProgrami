'use client';


import { useState } from 'react';
import { ProductPageHeader } from './components/ProductPageHeader';
import { ProductFilters } from './components/ProductFilters';
import ProductTable from './components/ProductTable';
import ProductImagePreviewModal from './components/ProductImagePreviewModal';

import type {
  ProductListItem,
} from '@/types/product';
import { useSalesCart } from '@/hooks/useSalesCart';
import { usePurchaseHistory } from '@/hooks/usePurchaseHistory';
import { useProductsData } from '@/hooks/useProductsData';
import { useVehicleFilters } from '@/hooks/useVehicleFilters';
import { useProductFilters } from '@/hooks/useProductFilters';
import { PurchaseHistoryModal } from './components/PurchaseHistoryModal';

export default function ProductsListPage() {
  const {
    products,
    categories,
    vehicleVariants,
    loading,
    error,
  } = useProductsData();

  const {
    vehicleBrandId,
    vehicleModelName,
    vehicleYearRange,
    vehicleEngine,
    setVehicleBrandId,
    setVehicleModelName,
    setVehicleYearRange,
    setVehicleEngine,
    availableVehicleBrands,
    availableVehicleModels,
    availableVehicleYearRanges,
    availableVehicleEngines,
  } = useVehicleFilters(vehicleVariants);

  const {
    search,
    setSearch,
    categoryGroupId,
    setCategoryGroupId,
    categoryId,
    setCategoryId,
    categoryGroups,
    filteredCategories,
    filteredProducts,
  } = useProductFilters({
    products,
    categories,
    vehicleBrandId,
    vehicleModelName,
    vehicleYearRange,
    vehicleEngine,
  });

  const [previewProduct, setPreviewProduct] = useState<ProductListItem | null>(
    null,
  );

  const {
    cartQuantities,
    selectedQuantities,
    cartTotalQuantity,
    increaseSelectedQuantity,
    decreaseSelectedQuantity,
    addToSalesCart,
  } = useSalesCart();

  const {
    selectedProduct: purchaseHistoryProduct,
    purchaseHistory,
    purchaseHistoryLoading,
    purchaseHistoryOpen,
    openPurchaseHistory,
    closePurchaseHistory,
  } = usePurchaseHistory();


  return (
    <div className="space-y-6">
      <ProductPageHeader cartTotalQuantity={cartTotalQuantity} />

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categoryGroupId={categoryGroupId}
        onCategoryGroupChange={setCategoryGroupId}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        vehicleBrandId={vehicleBrandId}
        onVehicleBrandChange={setVehicleBrandId}
        vehicleModelName={vehicleModelName}
        onVehicleModelChange={setVehicleModelName}
        vehicleYearRange={vehicleYearRange}
        onVehicleYearRangeChange={setVehicleYearRange}
        vehicleEngine={vehicleEngine}
        onVehicleEngineChange={setVehicleEngine}
        categoryGroups={categoryGroups}
        filteredCategories={filteredCategories}
        availableVehicleBrands={availableVehicleBrands}
        availableVehicleModels={availableVehicleModels}
        availableVehicleYearRanges={availableVehicleYearRanges}
        availableVehicleEngines={availableVehicleEngines}
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
       ) : null}

      <ProductTable
        products={filteredProducts}
        loading={loading}
        selectedQuantities={selectedQuantities}
        cartQuantities={cartQuantities}
        onIncreaseQuantity={increaseSelectedQuantity}
        onDecreaseQuantity={decreaseSelectedQuantity}
        onAddToCart={(product) => addToSalesCart(product)}
        onOpenPurchaseHistory={(product) => {
          void openPurchaseHistory(product);
        }}
        onPreviewImage={setPreviewProduct}
      />
      
      <PurchaseHistoryModal
        open={purchaseHistoryOpen}
        loading={purchaseHistoryLoading}
        productName={purchaseHistoryProduct?.name}
        purchaseHistory={purchaseHistory}
        onClose={closePurchaseHistory}
      />

      <ProductImagePreviewModal
        open={Boolean(previewProduct)}
        imageUrl={previewProduct?.imageUrl}
        productName={previewProduct?.name}
        onClose={() => setPreviewProduct(null)}
      />
    </div>
  );
}