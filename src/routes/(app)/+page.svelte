<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import heroBackground from "$assets/landing/hero-background.png";
  import browserScreenshot from "$assets/landing/browser-screenshot.png";

  let faqOpen = $state<Record<number, boolean>>({ 0: true });

  function toggleFaq(index: number) {
    faqOpen[index] = !faqOpen[index];
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section
    class="relative overflow-hidden bg-cover bg-center flex items-center"
    style="background-image: url({heroBackground}); height: 984px; margin-top: -72px; padding-top: 64px;"
  >
    <div class="container mx-auto px-6 relative z-10 -mt-48">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <!-- Main Headline -->
        <h1
          class="text-5xl lg:text-6xl font-bold text-foreground leading-tight"
        >
          Manage Your Stock. Know Your Business.
        </h1>

        <!-- Sub-headline -->
        <p class="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
          A privacy-first stock management platform for investors and merchants
          control branches, track inventory, and view performance in one unified
          dashboard.
        </p>

        <!-- CTA Buttons -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <Button
            href="/onboarding/role"
            size="lg"
            class="bg-info text-info-foreground hover:bg-info/90 min-w-[200px]"
          >
            Get Started Now
            <Icon iconName="icon/arrow-right" size={20} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            href="#features"
            class="min-w-[200px]"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Dashboard Screenshot Section - Positioned between hero and trusted section -->
  <section class="relative -mt-24 lg:-mt-64 mb-16 lg:mb-24 z-20">
    <div class="container mx-auto px-6">
      <div class="max-w-7xl mx-auto">
        <!-- Dashboard Screenshot Placeholder -->
        <div
          class="rounded-2xl shadow-2xl overflow-hidden border border-border bg-card"
        >
          <img
            src={browserScreenshot}
            alt="BamanStock Dashboard"
            class="w-full h-auto"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Trusted by Leading Businesses Section -->
  <!-- <section class="py-16 lg:py-24 bg-background">
    <div class="container mx-auto px-6">
      <div class="max-w-6xl mx-auto">
        <h2
          class="text-3xl lg:text-4xl font-bold text-foreground text-center mb-12"
        >
          Trusted by Leading Businesses
        </h2>
        <div
          class="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
        >
          Company Logos
          <div class="flex items-center justify-center h-12">
            <span class="text-2xl font-bold text-foreground">Ephemeral</span>
          </div>
          <div class="flex items-center justify-center h-12">
            <span class="text-2xl font-bold text-foreground">Wildcrafted</span>
          </div>
          <div class="flex items-center justify-center h-12">
            <span class="text-2xl font-bold text-foreground">Codecraft_</span>
          </div>
          <div class="flex items-center justify-center h-12">
            <span class="text-2xl font-bold text-foreground">Convergence</span>
          </div>
          <div class="flex items-center justify-center h-12">
            <span class="text-2xl font-bold text-foreground">ImgCompress</span>
          </div>
        </div>
      </div>
    </div>
  </section> -->

  <!-- Features Section -->
  <section id="features" class="py-16 lg:py-24 bg-white">
    <div class="container mx-auto px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <span
            class="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4"
          >
            Features
          </span>
          <h2 class="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            The Clear Way to Manage Your Stock.
          </h2>
          <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simplify operations and gain total visibility with features designed
            to give investors confidence and merchants efficiency.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature Card 1 -->
          <div class="p-8 bg-card border border-border rounded-lg">
            <div
              class="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center mb-6"
            >
              <Icon iconName="icon/package" size={24} class="text-info" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Smart Inventory Control
            </h3>
            <p class="text-muted-foreground">
              From stock levels to item movement, you'll always know what's
              available, and where.
            </p>
          </div>

          <!-- Feature Card 2 -->
          <div class="p-8 bg-card border border-border rounded-lg">
            <div
              class="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center mb-6"
            >
              <Icon iconName="icon/building" size={24} class="text-info" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Branch & Merchant Management
            </h3>
            <p class="text-muted-foreground">
              Assign merchants and products to specific branches with complete
              clarity and flexibility.
            </p>
          </div>

          <!-- Feature Card 3 -->
          <div class="p-8 bg-card border border-border rounded-lg">
            <div
              class="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center mb-6"
            >
              <Icon iconName="icon/bar-chart" size={24} class="text-info" />
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-3">
              Powerful Reporting & Insights
            </h3>
            <p class="text-muted-foreground">
              Generate clean, accurate reports that help investors understand
              performance at a glance.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- How It Works Section -->
  <section
    id="how-it-works"
    class="py-16 lg:py-24"
    style="background-color: #F7FBFF; height: 728px;"
  >
    <div class="container mx-auto px-6">
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Side -->
          <div class="max-w-lg">
            <div class="flex items-center gap-2 mb-4">
              <div
                class="w-5 h-5 bg-warning rounded flex items-center justify-center"
              >
                <Icon
                  iconName="icon/search"
                  size={12}
                  class="text-warning-foreground"
                />
              </div>
              <span class="text-sm text-muted-foreground"
                >Trusted by Growing Businesses</span
              >
            </div>
            <h2
              class="font-bold text-foreground mb-6"
              style="font-size: 45px; line-height: 1.2;"
            >
              Three Steps to Your Most Organized Workflow
            </h2>
            <Button
              href="#features"
              class="bg-info text-info-foreground hover:bg-info/90"
            >
              Learn more
              <Icon iconName="icon/arrow-right" size={16} />
            </Button>
          </div>

          <!-- Right Side - Steps -->
          <div>
            <!-- Step 01 -->
            <div style="width: 305px; height: 204px;">
              <div
                class="font-bold text-muted-foreground/20 select-none pointer-events-none"
                style="font-family: 'Sora', sans-serif; font-size: 100px; line-height: 1;"
              >
                01
              </div>
              <div style="padding-left: 45px; margin-top: -35px;">
                <h3 class="text-xl font-semibold text-foreground mb-2">
                  Create Your Account
                </h3>
                <p class="text-foreground mb-3">
                  Sign up using your email and choose your role.
                </p>
                <div class="w-12 h-0.5 bg-warning"></div>
              </div>
            </div>

            <!-- Step 02 -->
            <div style="width: 305px; height: 204px; margin-left: auto;">
              <div
                class="font-bold text-muted-foreground/20 select-none pointer-events-none"
                style="font-family: 'Sora', sans-serif; font-size: 100px; line-height: 1;"
              >
                02
              </div>
              <div style="padding-left: 45px; margin-top: -35px;">
                <h3 class="text-xl font-semibold text-foreground mb-2">
                  Set Up Your Workspace
                </h3>
                <p class="text-foreground mb-3">
                  Add your team, locations, merchants, or deals.
                </p>
                <div class="w-12 h-0.5 bg-warning"></div>
              </div>
            </div>

            <!-- Step 03 -->
            <div style="width: 305px; height: 204px;">
              <div
                class="font-bold text-muted-foreground/20 select-none pointer-events-none"
                style="font-family: 'Sora', sans-serif; font-size: 100px; line-height: 1;"
              >
                03
              </div>
              <div style="padding-left: 45px; margin-top: -35px;">
                <h3 class="text-xl font-semibold text-foreground mb-2">
                  Track, Manage & Grow
                </h3>
                <p class="text-foreground mb-3">
                  View real-time data, monitor deal progress, and automate
                  communications.
                </p>
                <div class="w-12 h-0.5 bg-warning"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="py-16 lg:py-24 bg-white relative">
    <div class="container mx-auto px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="font-bold text-foreground mb-4" style="font-size: 45px;">
            What our customers have to say about our product.
          </h2>
          <p class="text-xl text-muted-foreground">
            Proven. Reliable. Loved by Users. ❤️
          </p>
        </div>

        <!-- Testimonials Grid -->
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Testimonial 1 -->
          <div class="relative p-8 bg-card border border-border rounded-lg">
            <Icon iconName="icon/quote" size={48} class="text-muted/30 mb-4" />
            <p class="text-foreground mb-6 text-lg">
              Before switching, we were juggling spreadsheets, WhatsApp chats,
              and scattered files. Now everything locations, merchants, and deal
              statuses is in one place.
            </p>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-info flex items-center justify-center text-info-foreground font-semibold"
              >
                SM
              </div>
              <span class="text-foreground font-medium">Sophia M.</span>
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="relative p-8 bg-card border border-border rounded-lg">
            <Icon iconName="icon/quote" size={48} class="text-muted/30 mb-4" />
            <p class="text-foreground mb-6 text-lg">
              As an investor managing multiple locations, keeping track of
              merchants and stock movements was always chaotic. This dashboard
              gives me real-time insights on everything.
            </p>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-info flex items-center justify-center text-info-foreground font-semibold"
              >
                NA
              </div>
              <span class="text-foreground font-medium">Nathan A.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Call to Action Section -->
  <section
    class="py-16 lg:py-24 mx-[93px] rounded-4xl"
    style="background-color: #0E416C;"
  >
    <div class="container mx-auto">
      <div class="max-w-4xl mx-auto text-center text-white">
        <!-- Rating -->
        <div class="flex items-center justify-center gap-2 mb-4">
          <div class="flex gap-1">
            {#each Array(5) as _}
              <Icon
                iconName="icon/star"
                size={20}
                class="text-warning fill-warning"
              />
            {/each}
          </div>
          <span class="text-white font-semibold">4.9/5</span>
        </div>

        <!-- User Icons -->
        <div class="flex items-center justify-center gap-2 mb-2">
          <div class="w-8 h-8 rounded-full bg-green-500"></div>
          <div class="w-8 h-8 rounded-full bg-yellow-500"></div>
          <div class="w-8 h-8 rounded-full bg-purple-500"></div>
          <div class="w-8 h-8 rounded-full bg-orange-500"></div>
          <div
            class="w-8 h-8 rounded-full bg-white text-foreground flex items-center justify-center text-xs font-bold"
          >
            100K+
          </div>
        </div>
        <p class="text-white/90 mb-8">
          Over 100K+ Entrepreneurs, and business choose us
        </p>

        <!-- Main CTA Content -->
        <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
          Start Managing Your Stock With Confidence Today.
        </h2>
        <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Simplify stock tracking, empower your merchants, and gain real-time
          insights across all locations, all in one clean interface.
        </p>
        <Button
          href="/onboarding/role"
          size="lg"
          class="bg-info text-info-foreground hover:bg-info/90 min-w-[200px]"
        >
          Get Started Now
          <Icon iconName="icon/arrow-right" size={20} />
        </Button>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="py-16 lg:py-24 bg-white">
    <div class="container mx-auto px-6">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="font-bold text-foreground mb-4" style="font-size: 45px;">
            Frequently Asked Questions
          </h2>
          <p class="text-xl text-muted-foreground">
            Everything you need to know about Baman Stock
          </p>
        </div>

        <!-- FAQ Items -->
        <div class="space-y-4">
          <!-- FAQ Item 1 -->
          <div class="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              onclick={() => toggleFaq(0)}
            >
              <h3 class="text-lg font-semibold text-foreground">
                How does BamanStock work?
              </h3>
              <Icon
                iconName={faqOpen[0] ? "icon/minus" : "icon/plus"}
                size={20}
                class="text-info transition-transform"
              />
            </button>
            {#if faqOpen[0]}
              <div class="px-6 pb-6 text-muted-foreground">
                BamanStock is designed to help investors manage multiple
                merchants and locations from one centralized dashboard.
                Investors create locations (branches), assign merchants to those
                locations, and link specific stock items to each location.
              </div>
            {/if}
          </div>

          <!-- FAQ Item 2 -->
          <div class="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              onclick={() => toggleFaq(1)}
            >
              <h3 class="text-lg font-semibold text-foreground">
                Can merchants manage stock on their own?
              </h3>
              <Icon
                iconName={faqOpen[1] ? "icon/minus" : "icon/plus"}
                size={20}
                class="text-info transition-transform"
              />
            </button>
            {#if faqOpen[1]}
              <div class="px-6 pb-6 text-muted-foreground">
                Yes, merchants can manage their own stock within the locations
                assigned to them. They have access to update inventory levels,
                track stock movements, and view reports for their specific
                locations.
              </div>
            {/if}
          </div>

          <!-- FAQ Item 3 -->
          <div class="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              onclick={() => toggleFaq(2)}
            >
              <h3 class="text-lg font-semibold text-foreground">
                What is the purpose of locations in the system?
              </h3>
              <Icon
                iconName={faqOpen[2] ? "icon/minus" : "icon/plus"}
                size={20}
                class="text-info transition-transform"
              />
            </button>
            {#if faqOpen[2]}
              <div class="px-6 pb-6 text-muted-foreground">
                Locations represent physical branches or stores where stock is
                managed. They allow investors to organize their business across
                multiple sites, assign different merchants to each location, and
                track inventory separately for each branch.
              </div>
            {/if}
          </div>

          <!-- FAQ Item 4 -->
          <div class="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              onclick={() => toggleFaq(3)}
            >
              <h3 class="text-lg font-semibold text-foreground">
                How secure is my data on BamanStock?
              </h3>
              <Icon
                iconName={faqOpen[3] ? "icon/minus" : "icon/plus"}
                size={20}
                class="text-info transition-transform"
              />
            </button>
            {#if faqOpen[3]}
              <div class="px-6 pb-6 text-muted-foreground">
                We take data security seriously. All data is encrypted in
                transit and at rest, and we follow industry best practices for
                privacy and security. Your information is never shared with
                third parties without your explicit consent.
              </div>
            {/if}
          </div>

          <!-- FAQ Item 5 -->
          <div class="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              onclick={() => toggleFaq(4)}
            >
              <h3 class="text-lg font-semibold text-foreground">
                Can I make changes later to different locations?
              </h3>
              <Icon
                iconName={faqOpen[4] ? "icon/minus" : "icon/plus"}
                size={20}
                class="text-info transition-transform"
              />
            </button>
            {#if faqOpen[4]}
              <div class="px-6 pb-6 text-muted-foreground">
                Absolutely! You can add, edit, or remove locations at any time.
                You can also reassign merchants, update stock items, and modify
                location settings as your business needs evolve.
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Form Section -->
  <section class="py-16 lg:py-24 bg-white">
    <div class="container mx-auto px-6">
      <div class="max-w-6xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <h2 class="font-bold text-foreground mb-4" style="font-size: 45px;">
            How we can help you?
          </h2>
        </div>

        <!-- Contact Form -->
        <form class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <!-- Left Column -->
            <div class="space-y-6 flex flex-col">
              <!-- Full Name -->
              <div>
                <label
                  for="fullName"
                  class="block text-sm font-medium text-foreground mb-2"
                >
                  Your full name*
                </label>
                <div class="relative">
                  <input
                    type="text"
                    id="fullName"
                    placeholder="What's your name?"
                    class="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-info focus:border-transparent bg-white"
                  />
                  <Icon
                    iconName="icon/smile"
                    size={20}
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              <!-- Phone Number -->
              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-foreground mb-2"
                >
                  Your phone number
                </label>
                <div class="relative">
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    class="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-info focus:border-transparent bg-white"
                  />
                  <Icon
                    iconName="icon/phone"
                    size={20}
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6 flex flex-col">
              <!-- Email -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-foreground mb-2"
                >
                  Your email address*
                </label>
                <div class="relative">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    class="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-info focus:border-transparent bg-white"
                  />
                  <Icon
                    iconName="icon/mail"
                    size={20}
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              <!-- Subject -->
              <div>
                <label
                  for="subject"
                  class="block text-sm font-medium text-foreground mb-2"
                >
                  Your subject
                </label>
                <div class="relative">
                  <input
                    type="text"
                    id="subject"
                    placeholder="How can we help you?"
                    class="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-info focus:border-transparent bg-white"
                  />
                  <Icon
                    iconName="icon/file-text"
                    size={20}
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Message - Full Width -->
          <div>
            <label
              for="message"
              class="block text-sm font-medium text-foreground mb-2"
            >
              Your message
            </label>
            <div class="relative">
              <textarea
                id="message"
                rows={6}
                placeholder="Describe about your project"
                class="w-full min-h-[150px] px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-info focus:border-transparent resize-none bg-white"
              ></textarea>
              <Icon
                iconName="icon/message-circle"
                size={20}
                class="absolute right-4 top-4 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          <!-- Privacy Statement and Send Button -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <!-- Privacy Statement -->
            <p class="text-sm text-muted-foreground">
              We are committed to protecting your privacy. We will never collect
              information about you without your explicit consent.
            </p>

            <!-- Send Button -->
            <div class="flex justify-end">
              <Button
                type="submit"
                class="bg-info text-info-foreground hover:bg-info/90 px-8 py-3"
              >
                Send Message
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>

  <!-- Footer Section -->
  <footer class="bg-[#F8F8F8]">
    <div style="background: #F0F7FC; position: relative;">
      <div
        style="background: linear-gradient(to bottom, rgba(77, 160, 230, 0.1) 0%, rgba(77, 160, 230, 0.1) 38%, rgba(255, 255, 255, 0.1) 100%); position: absolute; inset: 0; pointer-events: none;"
      ></div>
      <div style="position: relative; z-index: 1;">
        <div class="container mx-auto px-6 py-12">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Left Side: Brand and Contact Info -->
            <div class="space-y-4">
              <!-- Logo/Brand -->
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-info">BAMANST</span>
                <Icon iconName="icon/bar-chart" size={24} class="text-info" />
                <span class="text-2xl font-bold text-info">CK</span>
              </div>

              <!-- Address -->
              <p class="text-foreground text-sm">
                123 Research Blvd street, Austin, TX 78759
              </p>

              <!-- Phone Number -->
              <p class="text-foreground text-sm">+1 234 567 890</p>
            </div>

            <!-- Right Side: Legal Links and Social Media -->
            <div class="flex flex-col items-start lg:items-end space-y-6">
              <!-- Legal Links -->
              <div class="flex flex-wrap gap-6 lg:gap-8">
                <a
                  href="/terms"
                  class="text-foreground text-sm hover:text-info transition-colors"
                >
                  Terms of Use
                </a>
                <a
                  href="/privacy"
                  class="text-foreground text-sm hover:text-info transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/disclaimer"
                  class="text-foreground text-sm hover:text-info transition-colors"
                >
                  Disclaimer
                </a>
              </div>

              <!-- Social Media Icons -->
              <div class="flex gap-4">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="YouTube"
                >
                  <Icon
                    iconName="social/youtube"
                    size={20}
                    class="text-white"
                  />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Twitter"
                >
                  <Icon
                    iconName="social/twitter"
                    size={20}
                    class="text-white"
                  />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Icon
                    iconName="social/instagram"
                    size={20}
                    class="text-white"
                  />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Icon
                    iconName="social/facebook"
                    size={20}
                    class="text-white"
                  />
                </a>
              </div>
            </div>
          </div>

          <!-- Copyright Section -->
          <div class="border-t border-border pt-6">
            <p class="text-foreground text-sm text-center">
              Copyright © 2025. Bamanstock All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</div>
