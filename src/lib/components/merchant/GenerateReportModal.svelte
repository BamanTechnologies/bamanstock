<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let show = false;

  let deliveryMode = "periodically";

  const close = () => dispatch('close');
  const preview = () => dispatch('preview');
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Generate Report</h2>
        <button on:click={close} class="text-gray-400 hover:text-gray-600">
          <Icon iconName="icon/x" size={20} />
        </button>
      </div>

      <div class="p-8 space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">Report Type</label>
            <select class="w-full border rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-info/20">
              <option>Select Report Type</option>
              <option>Sales Report</option>
              <option>Stock Report</option>
            </select>
            <p class="text-[11px] text-info">Choose the category of data you wish to export</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">Send via</label>
            <select class="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
              <option>SMS (Textual Data)</option>
              <option>Email (Attachment)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">Date Range</label>
            <select class="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">Output Format</label>
            <select class="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
              <option>PDF Document</option>
              <option>Excel Spreadsheet</option>
            </select>
          </div>
        </div>

        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-700">Delivery Mode</label>
          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all {deliveryMode === 'now' ? 'border-info bg-info/5' : 'hover:bg-gray-50'}">
              <div>
                <p class="text-sm font-bold">Send Now</p>
                <p class="text-xs text-gray-500">Generate Immediately</p>
              </div>
              <input type="radio" bind:group={deliveryMode} value="now" class="w-4 h-4 text-info" />
            </label>
            <label class="flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all {deliveryMode === 'periodically' ? 'border-info bg-info/5' : 'hover:bg-gray-50'}">
              <div>
                <p class="text-sm font-bold">Send Periodically</p>
                <p class="text-xs text-gray-500">Schedule auto-send</p>
              </div>
              <input type="radio" bind:group={deliveryMode} value="periodically" class="w-4 h-4 text-info" />
            </label>
          </div>
        </div>

        {#if deliveryMode === 'periodically'}
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-gray-700">Delivery Interval</label>
            <select class="w-full border rounded-lg px-4 py-2.5 text-sm bg-white">
              <option>Every Week</option>
              <option>Every Month</option>
            </select>
          </div>
        {/if}
      </div>

      <div class="p-6 border-t flex justify-end gap-3 bg-gray-50/50">
        <button on:click={close} class="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-white transition-colors">Cancel</button>
        <button on:click={preview} class="px-6 py-2.5 border border-info text-info rounded-lg text-sm font-medium hover:bg-info/5 transition-colors">Preview</button>
        <button class="px-6 py-2.5 bg-info text-white rounded-lg text-sm font-medium hover:bg-info/90 transition-shadow shadow-lg shadow-info/20">Generate Report</button>
      </div>
    </div>
  </div>
{/if}