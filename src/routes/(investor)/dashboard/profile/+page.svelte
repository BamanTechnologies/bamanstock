<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { DatePicker } from "$lib/components/ui/date-picker/index.js";

  let fullName = $state("John Doe");
  let phoneNumber = $state("+1234565759");
  let dateOfBirth = $state<Date | undefined>(undefined);
  let emailAddress = $state("johndoe@gmail.com");
  let gender = $state("Male");
  let address = $state("California, USA");

  function handleChangePhoto() {
    // TODO: Implement photo change
    console.log("Change photo");
  }

  function handleSaveChange() {
    // TODO: Implement save functionality
    console.log("Save changes", {
      fullName,
      phoneNumber,
      dateOfBirth,
      emailAddress,
      gender,
      address,
    });
  }
</script>

<div class="flex-1 px-6 py-6 space-y-6">
  <!-- Profile Section -->
  <div class="bg-card border border-border rounded-lg p-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="w-20 h-20 rounded-full bg-muted flex items-center justify-center"
        >
          <Icon iconName="icon/user" size={40} class="text-muted-foreground" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-foreground mb-1">John Doe</h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Investor</span>
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <span class="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        class="border-info bg-[#4DA0E6] text-white hover:bg-info/10"
        onclick={handleChangePhoto}
      >
        Change Photo
      </Button>
    </div>
  </div>

  <!-- Personal Information Section -->
  <div class="bg-card border border-border rounded-lg p-6">
    <h3 class="text-lg font-semibold text-foreground mb-6">
      Personal Information
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-4">
        <!-- Full Name -->
        <div class="space-y-2">
          <label for="full-name" class="text-sm font-medium text-foreground">
            Full Name
          </label>
          <Input
            id="full-name"
            type="text"
            bind:value={fullName}
            class="w-full"
          />
        </div>

        <!-- Phone Number -->
        <div class="space-y-2">
          <label for="phone-number" class="text-sm font-medium text-foreground">
            Phone Number
          </label>
          <Input
            id="phone-number"
            type="tel"
            bind:value={phoneNumber}
            class="w-full"
          />
        </div>

        <!-- Date of Birth -->
        <DatePicker
          id="date-of-birth"
          label="Date of Birth"
          bind:value={dateOfBirth}
          placeholder="MM/DD/YYYY"
          maxDate={new Date()}
        />
      </div>

      <!-- Right Column -->
      <div class="space-y-4">
        <!-- Email Address -->
        <div class="space-y-2">
          <label
            for="email-address"
            class="text-sm font-medium text-foreground"
          >
            Email Address
          </label>
          <Input
            id="email-address"
            type="email"
            bind:value={emailAddress}
            class="w-full"
          />
        </div>

        <!-- Gender -->
        <Dropdown
          id="gender"
          label="Gender"
          bind:value={gender}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ]}
        />

        <!-- Address -->
        <Dropdown
          id="address"
          label="Address"
          bind:value={address}
          options={[
            { value: "California, USA", label: "California, USA" },
            { value: "New York, USA", label: "New York, USA" },
            { value: "Texas, USA", label: "Texas, USA" },
            { value: "Florida, USA", label: "Florida, USA" },
          ]}
        />
      </div>
    </div>

    <!-- Save Change Button -->
    <div class="flex justify-end mt-6">
      <Button
        class="bg-[#4DA0E6] text-white hover:bg-info/90"
        onclick={handleSaveChange}
      >
        Save Change
      </Button>
    </div>
  </div>
</div>
