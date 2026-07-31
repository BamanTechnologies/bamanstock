<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import INSERT_STOCK from "$graphql/mutation/stock/insert.gql";
  import PRODUCT_QUERY from "$graphql/queries/selector/products.gql";
  import PRODUCT_SINGLE_QUERY from "$graphql/queries/product/product_single.gql";
  import LOCATION_QUERY from "$graphql/queries/selector/location.gql";
  import COMPANY_QUERY from "$graphql/queries/selector/company.gql";
  import MERCHANT_QUERY from "$graphql/queries/selector/merchant.gql";

  interface CreateStockModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    onClose,
    onSuccess,
  }: CreateStockModalProps = $props();

  function generateBatchNumber(): string {
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `BT-${digits}`;
  }

  let companyId = $state("");
  let branchId = $state("");
  let productId = $state("");
  let batchNumber = $state(generateBatchNumber());
  let expiryDate = $state("");
  let purchasedPrice = $state("");
  let sellingPrice = $state("");
  let quantity = $state("");
  let unit = $state("");
  let investors: any = $state(null);
  let merchantId = $state("");
  let merchantKey = $state(0);
  let note = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);

  function regenerateBatchNumber() {
    batchNumber = generateBatchNumber();
  }

  const defaultNote = $derived(
    batchNumber ? `Receive batch ${batchNumber}` : "Stock received"
  );

  function resetForm() {
    companyId = "";
    branchId = "";
    productId = "";
    batchNumber = generateBatchNumber();
    expiryDate = "";
    purchasedPrice = "";
    sellingPrice = "";
    quantity = "";
    unit = "";
    investors = null;
    merchantId = "";
    note = "";
    error = null;
  }

  function handleClose() {
    isOpen = false;
    resetForm();
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape" && !loading) {
      handleClose();
    }
  }

  async function handleProductSelect(item: Record<string, any> | null) {
    productId = item?.id ?? "";
    if (!item?.id) return;
    try {
      const client = getAuthClient("investor");
      const res = await client.query({ query: PRODUCT_SINGLE_QUERY, variables: { id: item.id } });
      const product = (res.data as any)?.products_by_pk;
      if (product) {
        unit = product.default_unit ?? "";
        investors = product.investors ?? null;
      }
    } catch {
      // silently fail
    }
  }

  function handleBranchSelect(item: Record<string, any> | null) {
    branchId = item?.id ?? "";
    merchantKey++;
  }

  function handleCompanySelect(item: Record<string, any> | null) {
    companyId = item?.id ?? "";
    branchId = "";
    merchantKey++;
  }

  function handleMerchantSelect(item: Record<string, any> | null) {
    merchantId = item?.id ?? "";
  }

  async function handleSubmit() {
    if (!companyId || !branchId || !productId || !batchNumber || !quantity || !merchantId) {
      error = "Company, Branch, Product, Batch Number, Quantity, and Merchant are required";
      return;
    }

    const qty = Number(quantity);
    if (qty < 0) {
      error = "Quantity cannot be negative";
      return;
    }
    const pPrice = purchasedPrice ? Number(purchasedPrice) : undefined;
    if (pPrice !== undefined && pPrice < 0) {
      error = "Purchased price cannot be negative";
      return;
    }
    const sPrice = sellingPrice ? Number(sellingPrice) : undefined;
    if (sPrice !== undefined && sPrice < 0) {
      error = "Selling price cannot be negative";
      return;
    }

    loading = true;
    error = null;

    try {
      const client = getAuthClient("investor");
      const finalNote = note.trim() || defaultNote;

      const object: Record<string, any> = {
        branch: branchId,
        product_id: productId,
        batch_number: batchNumber,
        quantity: qty,
        unit: unit || undefined,
        created_by: merchantId,
        updated_by: merchantId,
      };

      if (expiryDate) object.expiry_date = expiryDate;
      if (pPrice !== undefined) object.purchased_price = pPrice;
      if (sPrice !== undefined) object.selling_price = sPrice;
      if (investors) object.investors = investors;

      object.stock_movements = {
        data: {
          company_id: companyId,
          branch_id: branchId,
          product_id: productId,
          movement_type: "PURCHASE",
          quantity_delta: qty,
          unit: unit || undefined,
          unit_cost: pPrice,
          unit_price: sPrice,
          reference_type: "receive",
          note: finalNote,
          created_by: merchantId,
        },
      };

      await client.mutate({
        mutation: INSERT_STOCK,
        variables: { object },
      });

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      error = err.message ?? "An unexpected error occurred";
    } finally {
      loading = false;
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={handleEscape}
    role="dialog"
    aria-modal="true"
    aria-labelledby="create-stock-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="create-stock-title" class="text-xl font-bold text-foreground">
          Create New Stock
        </h2>
        <button
          type="button"
          class="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
          onclick={handleClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <Icon iconName="icon/x" size={20} class="text-foreground" />
        </button>
      </div>

      <div class="p-6 space-y-6">
        {#if error}
          <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <Icon iconName="icon/alert-circle" size={16} class="text-destructive shrink-0 mt-0.5" />
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2 md:col-span-2">
            <label for="company" class="text-sm font-medium text-foreground">
              Company
            </label>
            <SearchSelect
              query={COMPANY_QUERY}
              dataKey="companies"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder="Search and select company"
              onSelect={handleCompanySelect}
            />
          </div>

          <div class="space-y-2 md:col-span-2">
            <label for="branch" class="text-sm font-medium text-foreground">
              Branch
            </label>
            {#key companyId}
              <SearchSelect
                query={LOCATION_QUERY}
                dataKey="branches"
                filterBuilder={(s) => {
                  const nameFilter = { name: { _ilike: `%${s}%` } };
                  if (companyId) {
                    return { _and: [nameFilter, { company: { _eq: companyId } }] };
                  }
                  return nameFilter;
                }}
                displayLabel={(item) => item.name}
                placeholder={companyId ? "Search branch in selected company" : "Select a company first"}
                onSelect={handleBranchSelect}
              />
            {/key}
          </div>

          <div class="space-y-2">
            <label for="product" class="text-sm font-medium text-foreground">
              Product
            </label>
            <SearchSelect
              query={PRODUCT_QUERY}
              dataKey="products"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder="Search and select product"
              onSelect={handleProductSelect}
            />
          </div>

          <div class="space-y-2">
            <label for="unit" class="text-sm font-medium text-foreground">
              Unit
            </label>
            <Input
              id="unit"
              type="text"
              bind:value={unit}
              placeholder="Auto-filled from product"
              class="w-full bg-muted/30"
              disabled
            />
          </div>

          <div class="space-y-2 md:col-span-2">
            <label for="batch-number" class="text-sm font-medium text-foreground">
              Batch Number
            </label>
            <div class="flex gap-2">
              <Input
                id="batch-number"
                type="text"
                bind:value={batchNumber}
                class="w-full bg-muted/30 font-mono"
                disabled
              />
              <Button
                type="button"
                variant="outline"
                onclick={regenerateBatchNumber}
                disabled={loading}
                class="shrink-0 border-border text-foreground hover:bg-muted"
                aria-label="Regenerate batch number"
              >
                <Icon iconName="icon/refresh-cw" size={16} />
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <label for="expiry-date" class="text-sm font-medium text-foreground">
              Expiry Date
            </label>
            <Input
              id="expiry-date"
              type="date"
              bind:value={expiryDate}
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="quantity" class="text-sm font-medium text-foreground">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              bind:value={quantity}
              placeholder="0"
              class="w-full"
              disabled={loading}
              min="0"
            />
          </div>

          <div class="space-y-2">
            <label for="purchased-price" class="text-sm font-medium text-foreground">
              Purchased Price
            </label>
            <Input
              id="purchased-price"
              type="number"
              bind:value={purchasedPrice}
              placeholder="0.00"
              class="w-full"
              disabled={loading}
              min="0"
              step="0.01"
            />
          </div>

          <div class="space-y-2">
            <label for="selling-price" class="text-sm font-medium text-foreground">
              Selling Price
            </label>
            <Input
              id="selling-price"
              type="number"
              bind:value={sellingPrice}
              placeholder="0.00"
              class="w-full"
              disabled={loading}
              min="0"
              step="0.01"
            />
          </div>

          <div class="space-y-2 md:col-span-2">
            <label for="merchant" class="text-sm font-medium text-foreground">
              Merchant
            </label>
            {#key merchantKey}
              <SearchSelect
                query={MERCHANT_QUERY}
                dataKey="merchant"
                filterBuilder={(s) => {
                  const nameFilter = {
                    _or: [
                      { first_name: { _ilike: `%${s}%` } },
                      { last_name: { _ilike: `%${s}%` } },
                    ]
                  };
                  if (branchId) {
                    return { _and: [nameFilter, { branch: { _eq: branchId } }] };
                  }
                  return nameFilter;
                }}
                displayLabel={(item) => [item.first_name, item.last_name].filter(Boolean).join(" ")}
                placeholder={branchId ? "Search merchant in selected branch" : "Search and select merchant"}
                onSelect={handleMerchantSelect}
              />
            {/key}
          </div>
        </div>

        <div class="space-y-2">
          <label for="note" class="text-sm font-medium text-foreground">
            Note <span class="text-muted-foreground text-xs">(optional)</span>
          </label>
          <textarea
            id="note"
            bind:value={note}
            placeholder={defaultNote}
            rows="2"
            class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1 resize-none disabled:opacity-50"
            disabled={loading}
          ></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-border">
        <Button
          variant="outline"
          onclick={handleClose}
          disabled={loading}
          class="border-border text-foreground hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          onclick={handleSubmit}
          disabled={loading}
          class="bg-[var(--primary-blue)] text-white hover:opacity-90 min-w-[140px]"
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          Create Stock
        </Button>
      </div>
    </div>
  </div>
{/if}
