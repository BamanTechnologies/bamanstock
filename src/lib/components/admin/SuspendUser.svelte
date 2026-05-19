<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { fade, scale } from 'svelte/transition';

  let { isOpen = $bindable(), onConfirm, userName } = $props();

  function close() { isOpen = false; }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" transition:fade>
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" transition:scale={{ start: 0.95 }}>
      <div class="p-6 flex justify-between items-center border-b border-slate-50">
        <h3 class="text-xl font-bold text-slate-900">Suspend user account?</h3>
        <button onclick={close} class="text-slate-400 hover:text-slate-600">
          <Icon iconName="icon/menu" size={20} class="rotate-45" /> </button>
      </div>
      
      <div class="p-8">
        <p class="text-slate-500 leading-relaxed">
          This will prevent the user <span class="font-bold text-slate-900">{userName}</span> from accessing the platform until reactivated.
        </p>
      </div>

      <div class="p-6 bg-slate-50 flex justify-end gap-3">
        <button onclick={close} class="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">
          Cancel
        </button>
        <button onclick={() => { onConfirm(); close(); }} class="px-6 py-2.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200">
          Suspend Account
        </button>
      </div>
    </div>
  </div>
{/if}