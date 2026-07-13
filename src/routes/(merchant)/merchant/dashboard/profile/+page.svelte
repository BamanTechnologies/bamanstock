<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Input from "$lib/components/ui/input/input.svelte"; 

  let profileData = $state({
    fullName: "John Doe",
    email: "johndoe@gmail.com",
    phoneNumber: "+123456759",
    gender: "Male",
    dob: "",
    address: "California, USA"
  });

  function handleSaveChanges() {
    console.log("Saving changes:", profileData);
  }
</script>

<div class="flex-1 px-6 py-8 space-y-8 w-full">
  <header>
    <h1 class="text-2xl font-bold text-foreground">Profile</h1>
  </header>

  <div class="p-6 bg-white border border-border rounded-xl flex items-center justify-between">
    <div class="flex items-center gap-4">
      <img src="/path-to-avatar.png" alt="John Doe" class="w-20 h-20 rounded-full object-cover" />
      <div>
        <h2 class="text-xl font-bold">John Doe</h2>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Investor</span>
          <span class="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase">
            <span class="w-2 h-2 rounded-full bg-green-500"></span> Active
          </span>
        </div>
      </div>
    </div>
    <Button class="bg-info text-white rounded-lg px-6">Change Photo</Button>
  </div>

  <div class="bg-white border border-border rounded-xl overflow-hidden">
    <div class="p-6 border-b border-border">
      <h3 class="text-lg font-semibold">Personal Information</h3>
    </div>
    
    <div class="p-8 space-y-8">
      <div class="grid grid-cols-2 gap-x-12 gap-y-8">
        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Full Name</label>
          <input type="text" bind:value={profileData.fullName} class="w-full p-3 bg-white border border-border rounded-lg" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Email Address</label>
          <input type="email" bind:value={profileData.email} class="w-full p-3 bg-white border border-border rounded-lg" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Phone Number</label>
          <input type="text" bind:value={profileData.phoneNumber} class="w-full p-3 bg-white border border-border rounded-lg" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Gender</label>
          <select bind:value={profileData.gender} class="w-full p-3 bg-white border border-border rounded-lg appearance-none">
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Date of Birth</label>
          <input type="text" placeholder="MM/DD/YYYY" bind:value={profileData.dob} class="w-full p-3 bg-white border border-border rounded-lg" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-muted-foreground">Address</label>
          <input type="text" bind:value={profileData.address} class="w-full p-3 bg-white border border-border rounded-lg" />
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <Button class="bg-info text-white px-10 py-2 rounded-lg" onclick={handleSaveChanges}>
          Save Change
        </Button>
      </div>
    </div>
  </div>
</div>