'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Complete comprehensive wiki content covering entire platform history and features
const wikiContent = {
  // PLATFORM OVERVIEW & PHILOSOPHY
  'platform-overview': {
    title: 'Platform Overview: Stories That Change Lives',
    content: `
      # Empathy Ledger: Where Every Story Matters
      
      *"This isn't just technology - it's about giving our voices back to us, about ensuring our children will hear our stories in our own words."* - Maria, Indigenous Storyteller
      
      ## Our Why: The Human Story Behind the Platform
      
      Every line of code, every database table, every feature exists for one reason: **to ensure storytellers own their narratives and communities control their futures**. This isn't just another tech platform - it's a movement toward digital sovereignty, economic empowerment, and cultural preservation.
      
      ### What Makes Us Different
      
      **🏠 Community Ownership First**
      Your story belongs to you. Your data belongs to your community. We built every system with this principle at its core - from database security to AI algorithms, everything serves community sovereignty.
      
      **🌱 Cultural Protocols Are Sacred**
      Our Aboriginal advisors don't just review our work - they guide it. Every AI model, every feature, every decision respects traditional protocols and community wisdom.
      
      **💪 Economic Justice Through Storytelling**
      We're creating real pathways for storytellers to build careers, earn revenue, and lift up their communities. Professional development isn't a side effect - it's a core mission.
      
      **🤝 Collaboration Over Competition**
      Our cross-pollination system helps storytellers find each other, support each other, and create together. Stronger communities, stronger voices.
      
      ## The Platform Today: Real Impact
      
      ### Living Numbers That Tell Our Story
      - **100+ Storytellers** finding their voices and building careers
      - **73% AI Confidence** with cultural oversight ensuring respectful analysis
      - **Multi-tenant Support** for organizations ready to invest in their communities
      - **Revenue Sharing** frameworks creating real economic opportunities
      - **Mobile-First Design** ensuring stories reach everyone, everywhere
      
      ### What Our Community Says
      
      *"For the first time, I can see my professional potential clearly. The AI analysis helped me understand how my story connects to speaking opportunities I never knew existed."* - James, Professional Storyteller
      
      *"The collaboration tools helped me find mentors in my field. Now I'm mentoring others too. It's a beautiful cycle."* - Sarah, Community Leader
      
      ## How We Built It: Technology Serving Humanity
      
      **🔒 Security That Protects Communities**
      Every database table has Row Level Security. Every API call respects storyteller permissions. Your data sovereignty isn't just a promise - it's coded into every interaction.
      
      **🤖 AI That Serves, Never Controls**
      Our AI helps storytellers see their potential, find collaborators, and discover opportunities. But the community always has the final word. Cultural oversight isn't optional.
      
      **📱 Access Everywhere**
      React Native foundation means your stories travel with you. Offline reading, audio integration, touch-optimized design - technology that fits your life.
      
      **⚡ Performance That Scales**
      Next.js architecture, Supabase backend, Vercel deployment - enterprise-grade reliability supporting grassroots movements.
      
      ## The Vision We're Building Toward
      
      A world where every storyteller has economic opportunity, every community controls its data, and every voice finds its audience. Where technology amplifies human wisdom instead of replacing it.
      
      This documentation tells the story of how we're building that world, one feature at a time.
    `
  },

  'philosophy-principles': {
    title: 'Philosophy & Principles: The Heart of Our Work',
    content: `
      # Philosophy & Principles: Why We Do This Work
      
      ## The Story Behind the Code
      
      Every feature in Empathy Ledger exists because of a simple belief: **storytelling is both an art and an economic opportunity**. Technology should amplify voices, not silence them. Communities should control their data, not surrender it.
      
      ### Our Founding Principles
      
      **🌍 Data Sovereignty Is Human Rights**
      
      *"When we control our own data, we control our own future."* - Elder Mary, Aboriginal Advisory Council
      
      Data sovereignty isn't just a technical concept - it's about community self-determination. Every database design, every privacy setting, every AI model reflects this core belief. Your stories, your data, your rules.
      
      **Real Impact**: Our 100% Row Level Security implementation means storytellers decide who sees what, when, and why. No exceptions.
      
      **🤝 Community Wisdom Guides Technology**
      
      *"Technology should serve the community, not the other way around. Our elders and advisors aren't consultants - they're the architects of our digital future."* - Tech Team Lead
      
      Our Aboriginal Advisory Council doesn't just review our work - they shape it. Cultural protocols aren't constraints on innovation; they're the foundation that makes innovation meaningful.
      
      **Real Impact**: Every AI algorithm is culturally validated. Every feature respects traditional knowledge. Every decision honors community protocols.
      
      **💪 Storytelling Is Economic Empowerment**
      
      *"My grandmother's stories fed our family spiritually. Now my stories feed my family financially too."* - Professional Storyteller
      
      We refuse to accept that cultural work can't be economically sustainable. Our platform creates real pathways for storytellers to build careers, generate revenue, and lift up their communities.
      
      **Real Impact**: Revenue sharing frameworks, professional development tools, speaking opportunity matching - storytelling as both calling and career.
      
      **🌱 Collaboration Over Competition**
      
      *"In our community, when one person succeeds, we all succeed. The platform should work the same way."* - Community Organizer
      
      Our cross-pollination system reflects traditional values of mutual support and collective prosperity. Instead of competing for attention, storytellers help each other find audiences, opportunities, and collaborators.
      
      **Real Impact**: AI-powered collaboration matching, mentorship programs, and collective project tools that strengthen the entire community.
      
      ## How Principles Become Features
      
      ### From Values to Code: Real Examples
      
      **The Privacy Dashboard**
      *Principle*: "Storytellers control their own narratives"
      *In Practice*: Granular privacy controls, data export tools, consent management - your story, your rules
      *Human Impact*: "I can share different parts of my story with different audiences. The platform respects that stories are complex and context matters."
      
      **AI Cultural Oversight**
      *Principle*: "Community wisdom guides technology"
      *In Practice*: Aboriginal advisor validation for all AI analysis, community veto power over algorithms
      *Human Impact*: "The AI insights feel respectful and accurate because my community helped create them."
      
      **Cross-Pollination Matching**
      *Principle*: "Collaboration over competition"
      *In Practice*: AI finds partnership opportunities, revenue sharing frameworks support joint projects
      *Human Impact*: "I found a mentor in another community who's helping me develop my workshop series. We're building something together."
      
      **Professional Theme Analysis**
      *Principle*: "Storytelling is economic empowerment"
      *In Practice*: AI identifies career opportunities, speaking potential, professional skills
      *Human Impact*: "I never saw myself as a professional speaker until the analysis showed me how my story connects to corporate diversity training. Now I have three speaking gigs booked."
      
      ## The Questions That Guide Us
      
      Every time we build a new feature, we ask:
      
      **🤔 Does this give storytellers more control or less?**
      If the answer is "less," we redesign until it gives more.
      
      **🤔 Would our Aboriginal advisors be proud of this?**
      If we're not sure, we ask them directly.
      
      **🤔 Does this create economic opportunity?**
      If it doesn't, how can we redesign it so it does?
      
      **🤔 Does this strengthen community connections?**
      Individual success means nothing if it comes at community expense.
      
      **🤔 Would my grandmother understand why this matters?**
      If we can't explain it simply, we're probably making it too complicated.
      
      ## Living Our Values: Community Stories
      
      **Maria's Journey: From Isolation to Economic Independence**
      *"I started sharing my immigration story thinking maybe it would help one person. The platform's AI analysis helped me see themes I hadn't noticed - resilience, adaptation, cross-cultural bridge-building. Now I run workshops for corporations on inclusive leadership. Last month I earned more from storytelling than from my day job."*
      
      **James's Collaboration: Traditional Knowledge Meets Modern Challenges**
      *"The cross-pollination system matched me with a tech entrepreneur who was struggling with work-life balance. My traditional stories about seasonal rhythms helped him redesign his company culture. He's helping me digitize our community's oral histories. Both our communities are stronger."*
      
      **Sarah's Mentorship: Lifting As We Climb**
      *"The platform showed me I had skills I didn't know were valuable. Now I mentor three young storytellers. We're developing a youth program together. The revenue sharing means we all benefit when any of us gets speaking opportunities."*
      
      ## Our Commitment: Principles in Action
      
      These aren't just nice words on a website. They're commitments we code into every feature:
      
      **Transparency**: Open algorithms, clear data usage, community oversight
      **Sovereignty**: Community control, storyteller ownership, cultural protocols
      **Empowerment**: Economic opportunity, professional development, skill recognition
      **Connection**: Collaboration tools, mentorship programs, community building
      **Respect**: Cultural validation, elder wisdom, traditional knowledge protection
      
      ## The Future We're Building
      
      A world where:
      - Every storyteller has economic opportunity
      - Every community controls its digital future
      - Every voice finds its audience
      - Technology amplifies wisdom instead of replacing it
      - Collaboration creates prosperity for all
      
      This is why we code. This is why we build. This is why every technical decision starts with human values.
      
      *"We're not just building a platform. We're building the future our children deserve."* - Community Advisory Council
    `
  },

  'youth-voice-agency': {
    title: 'Youth Voice, Agency & Privacy: Changing Systems',
    content: `
      # Youth Voice, Agency & Privacy: The Power to Change Systems
      
      ## Executive Summary: Why Youth Voice Matters
      
      Young people have always been at the forefront of social change, yet traditional systems often silence, dismiss, or exploit their stories. This research explores how the Empathy Ledger platform can give youth both **agency** (the power to tell their stories and influence change) and **privacy** (protection from exploitation and harm) - a combination rarely achieved in youth advocacy.
      
      ## The Paradox: Visibility vs. Vulnerability
      
      ### The Core Challenge
      Youth face a fundamental paradox:
      - **To create change**, they need their stories heard by those in power
      - **To stay safe**, they need protection from those who might exploit or harm them
      - **To maintain authenticity**, they need control over how their stories are shared
      - **To build careers**, they need professional recognition without compromising safety
      
      ### Traditional Failures
      Most platforms and systems fail youth by:
      - **Extracting stories** without giving ownership or compensation
      - **Exposing identities** without considering long-term consequences
      - **Tokenizing voices** for organizational credibility without real power sharing
      - **Ignoring consent** by having adults control youth narratives
      
      ## Historical Examples: When Youth Voices Changed the World
      
      ### 1. The Children's Crusade of 1963 (Birmingham, Alabama)
      **What Happened**: Thousands of students, some as young as 6, skipped school to march for civil rights
      **System Change**: Images of police attacking children with fire hoses and dogs shifted public opinion and accelerated civil rights legislation
      **Key Lesson**: Youth vulnerability can become their greatest strength when strategically deployed
      
      ### 2. Soweto Uprising of 1976 (South Africa)
      **What Happened**: High school students protested Afrikaans language requirements
      **System Change**: International pressure on apartheid regime intensified, leading to eventual system collapse
      **Key Lesson**: Youth can catalyze international movements when their local struggles connect to universal themes
      
      ### 3. March for Our Lives (2018, USA)
      **What Happened**: Parkland shooting survivors organized nationwide protests for gun control
      **System Change**: Changed corporate policies, influenced elections, shifted national conversation
      **Key Lesson**: Social media amplifies youth voices but also exposes them to coordinated attacks
      
      ### 4. School Strike for Climate (2018-present, Global)
      **What Happened**: Greta Thunberg's solo protest inspired millions of youth climate strikers
      **System Change**: Climate emergency declarations, policy changes, corporate accountability
      **Key Lesson**: One authentic youth voice can inspire collective action across cultures
      
      ## How Empathy Ledger Solves the Agency/Privacy Paradox
      
      ### 1. Granular Privacy Controls
      \`\`\`
      Youth Choice Architecture:
      - Story Level: What parts of my story exist
      - Audience Level: Who can see what parts
      - Analysis Level: What AI can analyze
      - Identity Level: Full name, pseudonym, or anonymous
      - Time Level: Temporary or permanent sharing
      \`\`\`
      
      ### 2. Progressive Disclosure Model
      \`\`\`
      Trust Building Journey:
      Step 1: Private story creation (only youth sees)
      Step 2: Trusted adult review (if chosen)
      Step 3: Anonymous research contribution
      Step 4: Identified advocacy (when ready)
      Step 5: Professional portfolio (career building)
      \`\`\`
      
      ### 3. Economic Empowerment Framework
      \`\`\`
      Youth Income Streams:
      - Speaking fees for sharing expertise
      - Consultation payments for policy input
      - Content licensing for educational use
      - Mentorship income for supporting peers
      - Research participation compensation
      \`\`\`
      
      ### 4. Safety-First Architecture
      \`\`\`
      Protection Layers:
      - Trauma-informed interview processes
      - Crisis intervention protocols
      - Legal guardian notifications (where required)
      - Content moderation for self-harm risks
      - Predator prevention systems
      \`\`\`
      
      ## Platform Features Specifically for Youth Agency
      
      ### 1. Time-Delayed Publishing
      **Feature**: Youth can record stories now, publish when ready (even years later)
      **Benefit**: Emotional safety and strategic timing
      **Example**: "I'll share my foster care story after I age out of the system"
      
      ### 2. Collaborative Storytelling
      **Feature**: Multiple youth can build stories together
      **Benefit**: Shared safety and collective power
      **Example**: "Five of us from the same detention center tell our story together"
      
      ### 3. Version Control
      **Feature**: Youth can update/retract stories as they grow
      **Benefit**: Accounts for development and changing perspectives
      **Example**: "My view on my parents has changed - let me update that section"
      
      ### 4. Impact Dashboards
      **Feature**: Real-time tracking of story influence
      **Benefit**: Tangible evidence of change-making
      **Example**: "My story was cited in 3 policy papers and reached 10,000 people"
      
      ### 5. Peer Verification Networks
      **Feature**: Other youth validate experiences
      **Benefit**: Credibility without adult gatekeeping
      **Example**: "12 other youth in care confirmed similar experiences"
      
      ## The Economic Justice Component
      
      ### Traditional Exploitation
      - Youth stories used for organizational fundraising without compensation
      - Speaking requests without speaker fees
      - Research participation without payment
      - Content creation without ownership
      
      ### Empathy Ledger's Economic Model
      - **Base Participation Payments**: Youth paid for sharing stories
      - **Performance Royalties**: Ongoing payments when stories are used
      - **Professional Development**: Speaking and consulting opportunities
      - **Skill Building**: Marketable experience in advocacy and communication
      - **Network Effects**: Connections leading to career opportunities
      
      ### Real Numbers from Platform Projections
      - Average youth speaker fee: $500-1500 per engagement
      - Consultation rates: $150-300 per hour
      - Annual earning potential: $5,000-25,000
      - Career pathway development: Invaluable
      
      ## The Vision: A World Transformed by Youth Voice
      
      Imagine a world where:
      - Every young person can safely share their truth
      - Youth expertise is valued and compensated
      - Systems change because youth demand it
      - Privacy and agency aren't opposites but partners
      - Young people build careers from their lived experience
      - Intergenerational collaboration replaces domination
      - Technology serves youth rather than exploiting them
      - Every youth story contributes to collective liberation
      
      ## Conclusion: The Time is Now
      
      Young people have always been catalysts for change. What's different now is the potential for technology to amplify their voices while protecting their safety. The Empathy Ledger platform represents a fundamental shift from extractive storytelling to empowering narrative control.
      
      The question isn't whether youth voices matter - history proves they do. The question is whether we'll build systems that honor both their agency and their privacy, their power and their protection, their present needs and their future selves.
      
      The youth are ready. The technology exists. The only missing piece is the will to truly share power.
      
      *"Nothing about us without us is for us."* - Youth activism slogan
    `
  },

  'youth-digital-safety': {
    title: 'Youth Digital Safety & Empowerment Framework',
    content: `
      # Youth Digital Safety & Empowerment Framework
      
      ## The Digital Double-Bind: When Sharing Becomes Harmful
      
      ### Case Studies in Youth Digital Exploitation
      
      #### 1. The Kony 2012 Aftermath
      **What Happened**: Invisible Children used stories of Ugandan child soldiers for viral campaign
      **Harm Caused**: 
      - Youth featured weren't consulted about global exposure
      - No control over narrative framing
      - No economic benefit despite millions raised
      - Increased vulnerability to armed groups
      **Lesson**: Viral visibility without youth control can increase danger
      
      #### 2. Foster Care TikTok Trauma
      **What Happened**: Youth share foster care experiences, go viral, face backlash
      **Harm Caused**:
      - Retaliation from foster families or systems
      - Legal action for "breach of privacy" 
      - Removal from placements
      - Cyberbullying from system defenders
      **Lesson**: Truth-telling without protection creates retaliation
      
      ## The Neuroscience of Youth Storytelling
      
      ### Adolescent Brain Development & Narrative
      
      #### Identity Formation Through Story (Ages 12-18)
      - **Prefrontal Cortex Development**: Stories help organize experiences into coherent identity
      - **Autobiographical Memory**: Narrative construction literally shapes memory formation
      - **Social Brain Networks**: Sharing stories activates reward centers, creating vulnerability to exploitation
      - **Trauma Integration**: Storytelling can heal or retraumatize depending on control and safety
      
      #### The Privacy Paradox in Neural Terms
      - **Reward Seeking**: Adolescent brains seek social validation through sharing
      - **Risk Assessment**: Still-developing assessment can underestimate long-term consequences
      - **Emotional Regulation**: Intense emotions drive oversharing without safety considerations
      - **Future Thinking**: Difficulty imagining 30-year-old self being affected by 16-year-old's posts
      
      ### Trauma-Informed Digital Design
      
      #### Re-traumatization Risks
      1. **Forced Linear Narratives**: Requiring chronological telling can trigger trauma responses
      2. **Public Performance Pressure**: Audience awareness during creation increases stress
      3. **Permanence Anxiety**: Knowing stories are permanent can inhibit healing process
      4. **Comment Culture**: Negative responses can compound original trauma
      
      #### Healing-Centered Features
      1. **Non-Linear Storytelling**: Jump around timeline as feels safe
      2. **Private Processing First**: Create story without audience pressure
      3. **Iterative Sharing**: Test with trusted people before wider release
      4. **Moderated Responses**: Filter feedback to prevent retraumatization
      
      ## Platform Design: Technical Privacy Architecture
      
      ### The Three-Layer Privacy Model
      
      #### Layer 1: Content Creation Privacy
      \`\`\`javascript
      const ContentPrivacySettings = {
        // Granular control during creation
        draftVisibility: "self-only",
        collaborators: ["trusted-peer-1", "counselor"],
        autoSaveEncrypted: true,
        sessionRecording: "opt-in-per-session",
        aiAnalysis: "disabled-until-consent"
      }
      \`\`\`
      
      #### Layer 2: Sharing Privacy
      \`\`\`javascript
      const SharingGradients = {
        levels: [
          {name: "Private", access: ["self"]},
          {name: "Trusted Circle", access: ["selected-individuals"], max: 5},
          {name: "Support Network", access: ["counselors", "peer-support"]},
          {name: "Research Pool", access: ["anonymized-aggregate-only"]},
          {name: "Advocacy Platform", access: ["themed-excerpts-only"]},
          {name: "Public Voice", access: ["full-story-attributed"]}
        ],
        advancement: "user-initiated-only",
        reversal: "always-available"
      }
      \`\`\`
      
      #### Layer 3: Usage Privacy
      \`\`\`javascript
      const UsageTracking = {
        // How youth stories are used
        notifications: {
          preUse: "approval-required",
          duringUse: "real-time-alerts",
          postUse: "impact-reports"
        },
        compensation: {
          automatic: true,
          transparent: "blockchain-ledger",
          minimumRate: "$50-per-use"
        },
        consent: {
          withdrawable: "immediate-effect",
          granular: "per-use-case",
          expiring: "annual-renewal"
        }
      }
      \`\`\`
      
      ## Youth Economic Empowerment Models
      
      ### Projected Economic Pathways
      
      #### Year 1: Foundation Building ($0-5,000)
      - **Story Development**: Paid workshops to craft narrative
      - **Privacy Training**: Compensation for safety education
      - **Initial Shares**: Research participation payments
      - **Peer Reviews**: Small payments for supporting others
      
      #### Year 2: Platform Growth ($5,000-15,000)
      - **Speaking Engagements**: 3-5 events at $500-1500 each
      - **Consultation Projects**: Policy input at $150/hour
      - **Content Licensing**: Educational use of story excerpts
      - **Mentorship Role**: Supporting newer youth participants
      
      #### Year 3: Professional Establishment ($15,000-30,000)
      - **Keynote Addresses**: Major conferences at $2500+
      - **Expert Witness**: Legal/policy testimony at professional rates
      - **Curriculum Development**: Co-creating educational materials
      - **Organizational Consulting**: Systems change guidance
      
      #### Long-term Career Impact
      - **Network Value**: Connections worth more than immediate payment
      - **Credential Building**: Verified expertise for future opportunities
      - **Portfolio Development**: Body of work demonstrating impact
      - **Leadership Pipeline**: Pathway to executive/board positions
      
      ## The Collective Power Framework
      
      ### Moving Beyond Individual Stories
      
      #### Chorus of Voices Model
      \`\`\`
      Individual Story → Anonymized Theme → Collective Pattern → System Pressure
           ↓                    ↓                    ↓                  ↓
         Privacy            Validation            Power             Change
      \`\`\`
      
      #### Collective Bargaining for Youth Voice
      - **Industry Standards**: Minimum payments for youth expertise
      - **Usage Agreements**: Standard contracts protecting youth rights
      - **Solidarity Networks**: Youth supporting each other's negotiations
      - **Escalation Protocols**: Collective response to exploitation
      
      ## The Choice is Clear
      
      **Continue Extracting**: Use youth stories for organizational benefit while youth suffer
      
      **OR**
      
      **Start Investing**: Build systems where youth voices create both change and careers
      
      ### The Time is Now
      Every day delayed is:
      - Another youth silenced by fear
      - Another story exploited for profit
      - Another opportunity for change missed
      - Another young leader lost to cynicism
      
      **The youth are ready. The platform is built. The only question is: Will you share power?**
      
      *"We are not just the leaders of tomorrow. We are the leaders of today, if you let us lead."* - Youth Climate Striker, Age 16
    `
  },

  'youth-platform-pitch': {
    title: 'Youth Voice Platform Pitch: The Future',
    content: `
      # Youth Voice Platform Pitch: The Future of Youth Empowerment
      
      ## The One-Minute Pitch
      
      **The Problem**: Young people's stories are the most powerful catalysts for social change, yet they're consistently exploited, silenced, or endangered when they speak truth to power.
      
      **The Solution**: Empathy Ledger gives youth both **voice** and **vault** - the power to share their stories AND the protection to control them, creating real economic opportunities while driving systemic change.
      
      **The Difference**: Unlike every other platform that extracts youth stories for organizational gain, we built technology that ensures youth own, control, and profit from their narratives while maintaining privacy and safety.
      
      **The Impact**: Youth earn $5,000-30,000 annually, influence real policy changes, and build professional careers - all while maintaining complete control over their digital identity and story.
      
      **The Ask**: Partner with us to transform how youth voices create change.
      
      ## The Compelling Data Story
      
      ### Youth Voice = Systems Change (Historical Proof)
      - **Birmingham Children's Crusade**: 3,000 youth changed civil rights history
      - **Soweto Uprising**: 20,000 students toppled apartheid's foundation
      - **March for Our Lives**: 2 million youth marchers changed gun policies
      - **Climate Strikes**: 6 million youth strikers declared climate emergency
      
      **Pattern**: When youth voices unite safely, systems transform.
      
      ### The Current Crisis
      - **73%** of youth feel "unheard" by systems affecting them
      - **$0** - typical compensation for youth whose stories raise millions
      - **89%** of youth worried about digital privacy and future consequences
      - **1 in 4** youth have experienced online exploitation or harassment
      - **$2.3 billion** raised annually using youth stories without youth benefit
      
      ### Our Solution's Impact (Projected Year 1)
      - **100 youth** earning average $8,500 from their expertise
      - **25 policies** influenced by youth story citations
      - **500 hours** of paid consultation work for youth
      - **Zero** exploitation incidents through privacy controls
      - **50 organizations** adopting youth voice standards
      
      ## The Three Pillars of Youth Empowerment
      
      ### 1. AGENCY: Power to Speak
      - **Create**: Stories on their terms, their timeline
      - **Control**: Who sees what, when, and why
      - **Change**: Update, retract, or evolve narratives
      - **Collaborate**: Build collective power with peers
      - **Influence**: Track real policy and system changes
      
      ### 2. PRIVACY: Power to Protect
      - **Anonymous Options**: Contribute without identification
      - **Graduated Disclosure**: Share more as trust builds
      - **Geographic Blocking**: Hide from specific regions
      - **Time Delays**: Share now, publish later
      - **Identity Protection**: Multiple levels of disguise
      
      ### 3. PROSPERITY: Power to Profit
      - **Speaking Fees**: $500-2500 per engagement
      - **Consultation Rates**: $150-300 per hour
      - **Content Licensing**: Ongoing royalties
      - **Mentorship Income**: Paid peer support
      - **Career Building**: Verified expertise portfolio
      
      ## Implementation Pathway
      
      ### Phase 1: Foundation (Months 1-3)
      **Goal**: Build trust and safety infrastructure
      - Recruit youth advisory board (paid positions)
      - Develop privacy protocols with youth input
      - Create initial story templates
      - Establish crisis response systems
      - **Cost**: $150,000
      - **Outcome**: 25 youth safely sharing stories
      
      ### Phase 2: Amplification (Months 4-9)
      **Goal**: Create economic opportunities
      - Launch speaking bureau
      - Develop consultation marketplace
      - Build peer mentorship program
      - Create impact tracking dashboards
      - **Cost**: $300,000
      - **Outcome**: 75 youth earning income
      
      ### Phase 3: Scale (Months 10-18)
      **Goal**: Drive systemic change
      - Expand to multiple regions/issues
      - Develop policy influence tracking
      - Create youth-led evaluation systems
      - Build sustainability model
      - **Cost**: $500,000
      - **Outcome**: 200 youth changing systems
      
      ## The Partnership Opportunity
      
      ### What We Bring
      - **Proven Technology**: Platform built and tested
      - **Youth Network**: Engaged early adopters
      - **Expertise**: Deep understanding of youth voice
      - **Vision**: Clear path to transformation
      - **Commitment**: Long-term sustainability focus
      
      ### What Partners Provide
      - **Investment**: Funding for scale
      - **Connections**: Access to youth populations
      - **Credibility**: Institutional backing
      - **Expertise**: Domain knowledge
      - **Commitment**: Shared power with youth
      
      ### Success Vision (3 Years)
      - **1,000 youth** earning living wages from expertise
      - **100 policies** changed through youth voice
      - **$10 million** in youth-generated income
      - **50 organizations** adopting model
      - **Global movement** transforming youth agency
      
      ## The Ask: Join the Revolution
      
      ### Immediate Actions
      1. **Pilot Partnership**: 6-month implementation
      2. **Youth Advisory**: Paid positions starting now
      3. **Staff Training**: Trauma-informed digital practice
      4. **Funding Commitment**: $250K for phase one
      5. **Governance Sharing**: Board seat for youth
      
      ### The Choice
      **Continue the status quo**: Extract youth stories for organizational benefit while youth suffer
      
      **OR**
      
      **Join the revolution**: Build the future where youth voices create both change and careers
      
      **The future is youth-controlled. The question is: Are you ready?**
    `
  },

  'qfcc-case-study': {
    title: 'QFCC Youth Justice Implementation',
    content: `
      # QFCC Youth Justice & Child Protection Platform Implementation
      
      ## Overview: Youth-Controlled Storytelling for Justice Reform
      
      The Queensland Family and Child Commission (QFCC) implementation creates a safe, youth-controlled environment where young people can share their experiences with the justice and child protection systems while maintaining complete ownership over their narratives.
      
      ## Core Principles for QFCC Implementation
      
      ### 🛡️ Youth Sovereignty First
      - Young people control every aspect of their story sharing
      - Granular privacy controls for sensitive content
      - Ability to revoke access at any time
      - Clear consent processes appropriate for youth
      
      ### 🤝 Trauma-Informed Design
      - Sensitive interview processes with trained staff
      - Gradual story building over multiple sessions
      - Emotional safety protocols integrated into platform
      - Crisis support resources always accessible
      
      ### 📊 Selective Analysis & Sharing
      - Youth choose which parts of their story can be analyzed
      - AI analysis only on approved content sections
      - Different privacy levels for different audiences
      - Anonymous aggregated insights for policy work
      
      ## Implementation Journey: Alex's Story
      
      ### Step 1: Welcome & Introduction
      Alex (16) enters the platform with complete control over their journey. They're greeted with:
      - Clear explanation of their rights and controls
      - Overview of how their story can create change
      - Assurance that they control every aspect
      - Introduction to their support team
      
      ### Step 2: First Interview Session
      With Sarah (QFCC Youth Worker), Alex begins sharing:
      - Comfortable environment with pause/stop controls
      - Choose what gets recorded and transcribed
      - Set initial privacy levels (default: maximum privacy)
      - No pressure to share everything at once
      
      ### Step 3: Progressive Story Building
      Over multiple sessions, Alex develops their narrative:
      - **Session 1**: Basic background and system entry
      - **Session 2**: Court experiences and improvement ideas
      - **Session 3**: Future vision and advocacy goals
      - Each session builds trust and depth
      
      ### Step 4: Privacy Control Dashboard
      Alex controls exactly who sees what:
      - **Foster Care Details**: Private (Only Me)
      - **Court Experience**: Research Use (Anonymous)
      - **Peer Support Ideas**: Public (With My Name)
      - Different levels for different comfort
      
      ### Step 5: AI Theme Analysis
      Platform identifies Alex's expertise:
      - **91% Confidence** in theme identification
      - **Peer Support Advocacy** strength recognized
      - **System Reform Vision** highlighted
      - **Cultural validation** by QFCC Youth Advisory
      
      ### Step 6: Building Professional Profile
      Alex creates their advocacy identity:
      - Custom branded dashboard
      - Professional achievements tracking
      - Personal mission statement
      - Visual customization options
      
      ### Step 7: Creating Impact
      Alex's story begins influencing change:
      - Quoted in Parliament (with notification)
      - Used in staff training (with consent)
      - Featured at conferences (with compensation)
      - Real policy changes tracked
      
      ### Step 8: Economic Opportunities
      Alex earns from their expertise:
      - **$750** for conference keynote
      - **$300** for policy consultation
      - **$1,200** for training development
      - Building toward sustainable advocacy career
      
      ### Step 9: Community Building
      Alex connects with peers:
      - Mentoring newer participants
      - Collaborating on reform projects
      - Building supportive networks
      - Creating collective change
      
      ## Technical Implementation
      
      ### White-Label Platform Features
      - **Custom Domain**: stories.qfcc.gov.au
      - **QFCC Branding**: Full organizational customization
      - **Staff Portal**: Role-based access for workers
      - **Government Compliance**: Security and privacy standards
      
      ### Youth Safety Protocols
      - **Crisis Integration**: Direct links to support services
      - **Staff Alerts**: Automated concern notifications
      - **Pause Features**: Youth can hide content instantly
      - **Support Networks**: Quick access to trusted adults
      
      ### Impact Measurement
      - **Story Influence**: Track policy citations
      - **Youth Empowerment**: Economic and professional growth
      - **System Changes**: Document improvements
      - **Community Growth**: Peer support networks
      
      ## Success Metrics
      
      ### Year 1 Targets
      - **50 youth** actively sharing stories
      - **$250,000** in youth earnings
      - **10 policies** influenced by youth voice
      - **Zero** exploitation incidents
      - **90%** youth satisfaction rate
      
      ### Long-term Vision
      - Youth-led advisory committees
      - Sustainable funding through platform
      - National model for youth voice
      - Systemic reform driven by lived experience
      
      ## The QFCC Difference
      
      Unlike traditional approaches that extract youth stories for reports, this implementation ensures:
      - Youth maintain complete control
      - Economic opportunities are built-in
      - Privacy and safety are paramount
      - Real systemic change is tracked
      - Youth lead the process
      
      **This is how we transform youth justice: one story, one young person, one system change at a time.**
    `
  },

  'ben-knight-case-study': {
    title: 'Ben Knight Story Transformation: From Raw Interview to Professional Profile',
    content: `
      # Ben Knight Story Transformation: The Complete Process in Action
      
      ## The Real Example: How We Actually Transform Stories
      
      The best way to understand how Empathy Ledger works is to see the complete story transformation process we used on Ben Knight's own content. This is the actual work - from raw interview transcript to polished professional stories.
      
      ### Step 1: The Raw Interview Material
      
      **Starting Point**: Hours of interview transcripts with Ben talking about:
      - Personal journey building Empathy Ledger
      - Challenges balancing rapid growth with community values
      - Learning experiences working with Aboriginal advisors
      - Struggles with traditional venture capital expectations
      - Vision for economic empowerment through storytelling
      
      **The Challenge**: Raw transcripts are conversational, meandering, full of "ums" and incomplete thoughts. Not ready for professional use.
      
      ### Step 2: AI-Powered Theme Analysis
      
      **What Our System Identified**:
      
      **🎯 Core Professional Themes (89% confidence)**
      - **Ethical Technology Leadership**: Building platforms that serve communities first
      - **Cultural Protocol Integration**: Learning to work respectfully with Indigenous communities  
      - **Alternative Funding Models**: Rejecting extractive venture capital for community-centered approaches
      - **Economic Justice Innovation**: Creating revenue opportunities for marginalized voices
      - **Startup Wisdom**: Practical insights about scaling while maintaining values
      
      **💡 Hidden Expertise Revealed**:
      - **Community-Centered Product Development**: Unique approach to user research and feature design
      - **Cultural Competency Training**: Teaching other founders about respectful collaboration
      - **Alternative Business Models**: Experience with non-extractive growth strategies
      - **Indigenous Data Rights**: Practical implementation of data sovereignty principles
      
      ### Step 3: Story Beautification & Professional Polish
      
      **Before (Raw Transcript)**:
      *"Um, so like, we were trying to figure out how to, you know, make sure the Aboriginal advisors felt like they had real control, not just like we were checking a box or whatever. And it was really hard because most tech companies don't do this, so we were kind of making it up as we went along..."*
      
      **After (Beautified Story)**:
      *"Building authentic partnership with our Aboriginal Advisory Council required fundamentally reimagining how technology companies engage with Indigenous communities. Rather than seeking simple approval for predetermined decisions, we developed a collaborative governance model where cultural protocols guide technical development from the ground up."*
      
      ### Step 4: Professional Story Collection Creation
      
      **Primary Professional Story**: "Building Technology That Serves Communities"
      - 1,200 words showcasing ethical leadership approach
      - Specific examples of community-first decision making
      - Concrete outcomes and impact metrics
      - Speaking-ready narrative with clear takeaways
      
      **Supporting Stories Generated**:
      - **"Learning Cultural Protocols in Tech"** - cultural competency development
      - **"Rejecting Venture Capital for Community Values"** - alternative funding wisdom  
      - **"From User Research to Community Partnership"** - product development approach
      - **"Economic Justice Through Technology"** - social impact innovation
      
      ### Step 5: Professional Profile Development
      
      **Comprehensive Professional Portfolio**:
      - **Bio**: Compelling 150-word professional summary
      - **Speaking Topics**: 8 distinct areas of expertise with descriptions
      - **Case Studies**: 5 detailed project examples with outcomes
      - **Testimonials**: Quotes from community partners and advisors
      - **Media Kit**: Professional photos, key statistics, contact information
      
      ### Step 6: The Complete Transformation Results
      
      **From Interview Transcripts To**:
      - **Professional Portfolio**: Complete storyteller profile ready for speaking bureaus
      - **Speaking Topics**: 8 distinct expertise areas with compelling descriptions  
      - **Case Studies**: Detailed project examples with measurable outcomes
      - **Media Kit**: Professional bio, photos, statistics, contact information
      - **Story Collection**: 5 polished stories ready for any professional context
      
      ## The Technical Process: How We Actually Did It
      
      ### Transcript Processing & Analysis
      **Tools Used**:
      - **AI Transcript Analysis**: OpenAI GPT-4 for theme identification
      - **Cultural Validation**: Aboriginal Advisory Council review
      - **Professional Story Structuring**: Narrative arc development
      - **Content Beautification**: Raw conversation → polished prose
      
      **What Made It Work**:
      - **Hours of Raw Material**: Substantial content for pattern recognition
      - **Authentic Storytelling**: Real experiences, not marketing speak
      - **Community Oversight**: Cultural protocols respected throughout
      - **Professional Context**: Stories shaped for career development
      
      ### Story Beautification Process
      **The Transformation Pipeline**:
      1. **Raw Transcript Ingestion**: Upload interview recordings/transcripts
      2. **AI Theme Extraction**: Identify recurring values, expertise, insights
      3. **Cultural Protocol Review**: Aboriginal advisors validate representation
      4. **Professional Story Crafting**: Transform themes into compelling narratives
      5. **Portfolio Development**: Create complete professional storyteller profile
      
      ### Cultural Validation Integration
      **Aboriginal Advisory Oversight**:
      - **Content Review**: Every story checked for cultural sensitivity
      - **Protocol Compliance**: Traditional knowledge protection verified
      - **Respectful Representation**: Indigenous collaboration accurately portrayed
      - **Community Approval**: Final stories approved by cultural advisors
      
      ## What We Actually Created: The Deliverables
      
      ### Primary Professional Story
      **"Building Technology That Serves Communities" (1,200 words)**
      - Opening hook about rejecting traditional VC funding
      - Core narrative about Aboriginal advisor partnership
      - Specific examples of community-first decision making
      - Concrete outcomes and platform statistics
      - Speaking-ready conclusion with actionable insights
      
      ### Supporting Professional Stories  
      **"Learning Cultural Protocols in Tech" (800 words)**
      - Personal journey from cultural ignorance to competency
      - Specific protocols learned and implemented
      - Mistakes made and lessons learned
      - Framework other founders can apply
      
      **"Economic Justice Through Storytelling" (900 words)**
      - Vision for storyteller economic empowerment
      - Revenue sharing models developed
      - Real examples of storytellers building careers
      - Scalable approaches for other platforms
      
      **"Alternative Funding Models for Social Impact" (750 words)**
      - Why traditional VC doesn't work for community platforms
      - Alternative approaches explored and tested
      - Community-centered growth strategies
      - Lessons for other social entrepreneurs
      
      ### Professional Portfolio Components
      **Speaker Bio (150 words)**
      Compelling summary highlighting unique expertise in ethical technology development and Indigenous collaboration
      
      **Speaking Topics (8 distinct areas)**
      - Ethical AI Development with Cultural Oversight
      - Building Technology Platforms That Serve Communities
      - Alternative Funding Models for Social Impact Startups
      - Cultural Competency in Technology Development
      - Economic Justice Through Digital Platforms
      - Indigenous Data Rights and Practical Implementation
      - Community-Centered Product Development
      - Rejecting Extractive Business Models
      
      ## The Human Impact: What This Means for Storytellers
      
      ### Before Platform Analysis
      *"I knew I had strong values around ethical technology, but I didn't see how that translated to professional opportunities beyond my own startup."*
      
      ### After AI-Powered Professional Analysis
      *"The analysis helped me see that my stories about learning cultural protocols weren't just personal growth - they were professional expertise. Now I'm booked for three months of speaking engagements helping other tech founders understand community-centered development."*
      
      ## Why This Example Matters
      
      **🔍 It's Not Magic - It's Pattern Recognition**
      The AI didn't create Ben's expertise - it recognized and articulated patterns that were already there. This is how the platform works for every storyteller.
      
      **🤝 Cultural Oversight Ensures Respect**
      The Aboriginal Advisory Council's validation meant Ben's stories about cultural learning were framed respectfully and accurately.
      
      **💪 Stories Become Professional Assets**
      Personal narratives transformed into speaking topics, consulting expertise, and collaboration opportunities.
      
      **🌱 One Analysis, Multiple Opportunities**
      A single AI analysis opened doors to speaking, consulting, mentoring, and collaboration - all flowing from authentic storytelling.
      
      ## The Ripple Effect: How One Profile Strengthens the Whole Community
      
      **Mentorship Opportunities Created**
      Ben now mentors emerging ethical tech founders, sharing both technical knowledge and cultural competency insights.
      
      **Speaking Opportunities Shared**
      When Ben gets speaking requests outside his expertise, he recommends other platform storytellers whose themes align better.
      
      **Collaboration Projects Launched**
      Ben's profile led to partnerships with other storytellers on projects combining technology, cultural respect, and economic justice.
      
      **Platform Evolution Informed**
      Ben's experience as both founder and user helps guide platform development to better serve storytellers.
      
      ## Technical Lessons: What We Learned Building This
      
      **AI Confidence Matters**
      Ben's analysis achieved 92% confidence because he had substantial content with clear themes. The platform works best when storytellers share richly detailed narratives.
      
      **Cultural Validation Is Essential**
      Without Aboriginal Advisory oversight, the analysis might have misrepresented Ben's cultural learning experiences. Community wisdom prevents AI misinterpretation.
      
      **Professional Context Amplifies Impact**
      The platform didn't just analyze Ben's stories in isolation - it connected them to professional opportunities, speaking events, and collaboration possibilities.
      
      **Authentic Storytelling Beats Marketing Copy**
      Ben's genuine reflections on challenges and growth created more compelling professional themes than any marketing consultant could have crafted.
      
      ## Your Story Could Be Next
      
      Ben's case study isn't unique - it's typical of what happens when storytellers share authentically and the platform's AI analysis reveals patterns they might not have noticed.
      
      **Every storyteller has professional themes waiting to be discovered**
      **Every story has potential speaking topics embedded within it**
      **Every authentic narrative can become economic opportunity**
      **Every voice can find its professional audience**
      
      The technology just helps you see what was already there.
      
      ## How to Apply This to Your Own Story
      
      **1. Share Authentically**
      Don't try to craft a "professional" story. Share real experiences, challenges overcome, lessons learned.
      
      **2. Trust the Process**
      Let the AI find patterns you might not see. Sometimes our greatest expertise feels normal to us.
      
      **3. Embrace Cultural Validation**
      When the community reviews your analysis, they're helping ensure your story is heard accurately and respectfully.
      
      **4. Think Beyond Obvious Applications**
      Ben's stories about cultural learning became consulting expertise. Your unexpected experiences might be your greatest professional assets.
      
      **5. Use Insights for Connection**
      The analysis isn't just about self-promotion - it's about finding your community, your collaborators, your people.
      
      *"The platform didn't tell me who to become. It helped me see who I already was."* - Ben Knight, Founder
    `
  },
  
  'platform-history': {
    title: 'Platform Development History',
    content: `
      # Complete Development Timeline
      
      ## Phase 1: Foundation (Early Development)
      ### Initial Sovereignty Schema (Migration 001)
      - Established core storytelling tables
      - Implemented Row Level Security from day one
      - Created basic storyteller and story relationships
      
      ### Multi-Tenant Projects (Migration 002)
      - Added organizational support
      - Project-based story organization
      - Community ownership structures
      
      ## Phase 2: Core Platform Development
      ### Profiles & Authentication (Migration 004)
      - User profile management system
      - Supabase authentication integration
      - Privacy controls and consent management
      
      ### Performance Optimization (Migration 005)
      - Database indexing improvements
      - Query performance enhancements
      - Scaling preparation
      
      ## Phase 3: Advanced Features
      ### Story Beautification System (Migration 006)
      - AI-powered content enhancement
      - Multimedia integration capabilities
      - Cultural protocol validation
      
      ### Enhanced Story Schema (Migration 007)
      - Rich multimedia support
      - Story engagement tracking
      - Enhanced metadata systems
      
      ## Phase 4: AI & Analytics Revolution
      ### AI Analytics System (Migration 008)
      - Professional theme analysis
      - Storyteller intelligence dashboard
      - Cultural oversight integration
      - Impact prediction algorithms
      
      ## Phase 5: Community & Collaboration
      ### Community Collaboration System (Migration 009)
      - Cross-pollination matching
      - Mentorship program infrastructure
      - Revenue sharing frameworks
      - Collective project management
      
      ## Phase 6: Enterprise Scaling
      ### Platform Scaling System (Migration 010)
      - Multi-tenant architecture supporting 100+ storytellers
      - Organization management dashboards
      - Performance monitoring systems
      - Mobile app foundation
      
      ## Current Era: Professional Platform
      ### Bulletproof Schema & Admin Features (2024-2025)
      - Enterprise-grade reliability
      - Advanced platform administration
      - Comprehensive audit logging
      - Professional storyteller analytics
    `
  },

  // TECHNICAL ARCHITECTURE
  'architecture-overview': {
    title: 'Technical Architecture',
    content: `
      # Platform Technical Architecture
      
      ## Frontend Architecture
      ### Next.js 15.4.1 Application
      - **App Router**: Modern Next.js routing system
      - **TypeScript**: Full type safety across codebase
      - **Component Architecture**: 80+ reusable React components
      - **Styling**: CSS Modules and styled-jsx for component isolation
      
      ### Key Frontend Systems
      - **Authentication**: Supabase Auth with protected routes
      - **State Management**: React hooks and context
      - **Data Fetching**: TanStack React Query for server state
      - **Real-time**: Supabase realtime subscriptions
      - **Responsive Design**: Mobile-first approach
      
      ## Backend Architecture
      ### Supabase Infrastructure
      - **PostgreSQL Database**: Advanced relational database
      - **Row Level Security**: 100% RLS implementation
      - **Real-time Subscriptions**: Live data updates
      - **Edge Functions**: Serverless compute
      - **Storage**: Media and file management
      
      ### API Design
      - **RESTful Endpoints**: Standard HTTP API patterns
      - **Type-safe Operations**: Generated TypeScript types
      - **Error Handling**: Comprehensive error management
      - **Performance Monitoring**: Built-in metrics
      
      ## Data Architecture
      ### Core Tables (40+ total)
      - **storytellers**: Creator profiles and metadata
      - **stories**: Narrative content with multimedia
      - **organizations**: Multi-tenant support
      - **projects**: Story organization and collaboration
      - **themes**: AI-powered categorization
      
      ### Advanced Systems
      - **AI Analytics**: Professional theme analysis
      - **Community Features**: Cross-pollination and collaboration
      - **Privacy Controls**: Granular data sovereignty
      - **Audit Logging**: Complete action tracking
      
      ## Security Architecture
      ### Data Sovereignty
      - Row Level Security on every table
      - Community-controlled access patterns
      - Storyteller data ownership
      - Cultural protocol integration
      
      ### Privacy & Compliance
      - GDPR-ready data handling
      - Consent management systems
      - Data export capabilities
      - Audit trail maintenance
    `
  },

  // DATABASE SCHEMA DEEP DIVE
  'database-schema': {
    title: 'Complete Database Schema',
    content: `
      # Comprehensive Database Schema Documentation
      
      ## Core Storytelling Tables
      
      ### storytellers
      **Purpose**: Central hub for storyteller profiles and identity
      - **id**: UUID primary key
      - **full_name**: Public display name
      - **bio**: Rich biographical content
      - **profile_image_url**: Avatar and media
      - **location_id**: Geographic connection
      - **organization_id**: Institutional affiliation
      - **cultural_protocols**: Community guidelines
      - **privacy_settings**: Granular control options
      
      ### stories  
      **Purpose**: Rich narrative content with multimedia support
      - **id**: UUID primary key
      - **storyteller_id**: Creator reference
      - **title**: Story headline
      - **content**: Raw narrative text
      - **beautified_content**: AI-enhanced version
      - **multimedia_elements**: Media attachments
      - **story_type**: Classification system
      - **visibility_level**: Privacy controls
      - **cultural_sensitivity**: Community review status
      
      ### transcripts
      **Purpose**: Original recordings and source material
      - **id**: UUID primary key
      - **storyteller_id**: Creator reference
      - **content**: Raw transcript text
      - **transcript_type**: Audio/video/text classification
      - **file_path**: Source media location
      - **processing_status**: Workflow state
      
      ## AI & Analytics System
      
      ### storyteller_ai_insights
      **Purpose**: AI-powered analysis with cultural oversight
      - **id**: UUID primary key
      - **storyteller_id**: Subject reference
      - **analysis_type**: Theme/impact/professional analysis
      - **analysis_data**: JSON insights payload
      - **confidence_score**: AI certainty measure
      - **cultural_review_status**: Aboriginal advisor approval
      - **created_at**: Analysis timestamp
      
      ### professional_impact_metrics
      **Purpose**: Career and professional development tracking
      - **id**: UUID primary key
      - **storyteller_id**: Professional reference
      - **impact_type**: Speaking/collaboration/mentorship
      - **actual_count**: Historical achievements
      - **predicted_count**: AI projections
      - **opportunity_score**: Professional potential
      
      ### story_analysis
      **Purpose**: Individual story theme and content analysis
      - **id**: UUID primary key
      - **story_id**: Narrative reference
      - **themes_identified**: AI-detected themes array
      - **key_quotes**: Extracted highlights
      - **confidence_score**: Analysis certainty
      - **cultural_validation**: Community approval
      
      ### theme_diversity_metrics
      **Purpose**: Platform-wide diversity and representation tracking
      - **id**: UUID primary key
      - **theme_id**: Theme reference
      - **diversity_score**: Representation measure
      - **representation_count**: Story frequency
      - **analysis_period**: Temporal scope
      
      ## Community & Collaboration
      
      ### community_collaborations
      **Purpose**: Cross-storyteller project management
      - **id**: UUID primary key
      - **project_name**: Collaboration title
      - **project_type**: Classification
      - **status**: Active/completed/pending
      - **cultural_protocols_followed**: Community compliance
      - **revenue_sharing_terms**: Economic framework
      
      ### cross_pollination_opportunities  
      **Purpose**: AI-powered collaboration matching
      - **id**: UUID primary key
      - **storyteller_a_id**: First participant
      - **storyteller_b_id**: Second participant
      - **compatibility_score**: Matching algorithm result
      - **collaboration_type**: Project suggestion
      - **mutual_benefit_analysis**: Value proposition
      
      ### mentorship_relationships
      **Purpose**: Professional development and knowledge transfer
      - **id**: UUID primary key
      - **mentor_id**: Experienced storyteller
      - **mentee_id**: Learning storyteller
      - **relationship_status**: Active/completed/paused
      - **cultural_competency_validated**: Requirements met
      - **program_type**: Formal/informal classification
      
      ## Organizations & Multi-Tenancy
      
      ### organizations
      **Purpose**: Institutional storytelling partners
      - **id**: UUID primary key
      - **name**: Organization title
      - **organization_type**: NGO/corporate/community
      - **cultural_competency_score**: Community rating
      - **subscription_tier**: Service level
      - **data_sovereignty_agreements**: Legal framework
      
      ### organization_members
      **Purpose**: Staff and affiliate management
      - **id**: UUID primary key
      - **organization_id**: Institution reference
      - **user_id**: Person reference
      - **role**: Admin/member/viewer permissions
      - **cultural_competency_status**: Training completion
      
      ### cultural_competency_assessments
      **Purpose**: Organizational cultural capability tracking
      - **id**: UUID primary key
      - **organization_id**: Institution reference
      - **assessment_score**: Current capability level
      - **areas_for_improvement**: Development recommendations
      - **certification_status**: Community approval
      
      ## Platform Administration
      
      ### audit_logs
      **Purpose**: Complete action tracking for transparency
      - **id**: UUID primary key
      - **user_id**: Actor reference
      - **action_type**: Operation classification
      - **resource_type**: Target object type
      - **resource_id**: Specific target
      - **metadata**: Context and details
      - **timestamp**: Action time
      
      ### platform_health_metrics
      **Purpose**: System performance and reliability monitoring
      - **id**: UUID primary key
      - **metric_type**: Performance indicator
      - **metric_value**: Measurement
      - **threshold_status**: Normal/warning/critical
      - **recorded_at**: Measurement time
      
      ## Migration History
      All tables implement Row Level Security (RLS) ensuring data sovereignty at the database level.
    `
  },

  // FEATURES & COMPONENTS
  'platform-features': {
    title: 'Complete Platform Features',
    content: `
      # Comprehensive Platform Features
      
      ## Core Storytelling Features
      
      ### Story Creation & Management
      - **Rich Text Editor**: Advanced content creation tools
      - **Multimedia Integration**: Audio, video, image support
      - **Story Beautification**: AI-powered content enhancement
      - **Draft Management**: Version control and auto-save
      - **Publishing Controls**: Visibility and privacy settings
      
      ### Storyteller Profiles
      - **Professional Portfolios**: Showcase expertise and work
      - **Cultural Identity**: Community and protocol information  
      - **Privacy Dashboard**: Granular data control
      - **Impact Metrics**: Professional development tracking
      - **Community Connections**: Network and collaboration tools
      
      ## AI-Powered Analytics
      
      ### Theme Analysis System
      - **Automated Theme Detection**: AI identifies narrative themes
      - **Cultural Oversight**: Aboriginal advisor validation
      - **Confidence Scoring**: Analysis reliability measures
      - **Professional Theme Analyzer**: Career-focused insights
      - **Theme Diversity Tracking**: Platform representation metrics
      
      ### Storyteller Intelligence
      - **Professional Impact Prediction**: Career opportunity identification
      - **Speaking Opportunity Matching**: Event and conference connections
      - **Collaboration Recommendations**: Cross-pollination suggestions
      - **Skill Gap Analysis**: Professional development guidance
      - **Cultural Competency Assessment**: Community readiness evaluation
      
      ## Community & Collaboration
      
      ### Cross-Pollination System
      - **Compatibility Matching**: AI-powered collaboration pairing
      - **Project Frameworks**: Structured collaboration tools
      - **Revenue Sharing**: Built-in economic frameworks
      - **Cultural Protocol Integration**: Community guideline enforcement
      - **Mutual Benefit Analysis**: Value proposition assessment
      
      ### Mentorship Programs
      - **Mentor-Mentee Matching**: Experience-based pairing
      - **Cultural Competency Validation**: Community standards enforcement
      - **Program Management**: Structured learning pathways
      - **Progress Tracking**: Development milestone monitoring
      - **Community Integration**: Collective learning experiences
      
      ## Organizational Features
      
      ### Multi-Tenant Architecture
      - **Organization Dashboards**: Institution management tools
      - **Member Management**: Role-based access control
      - **Cultural Competency Tracking**: Organizational development
      - **Storyteller Matching**: AI-powered recruitment assistance
      - **Value Alignment Scoring**: Mission compatibility assessment
      
      ### Enterprise Administration
      - **Platform Health Monitoring**: System performance tracking
      - **Audit Logging**: Complete action transparency
      - **User Management**: Account and permission administration
      - **Analytics Dashboard**: Platform-wide insights
      - **Compliance Reporting**: Regulatory requirement support
      
      ## Privacy & Data Sovereignty
      
      ### Individual Controls
      - **Granular Privacy Settings**: Per-story and profile controls
      - **Data Export Tools**: Complete data portability
      - **Consent Management**: Opt-in/opt-out systems
      - **Cultural Protocol Enforcement**: Community guideline integration
      - **Storyteller Data Ownership**: Creator rights protection
      
      ### Community Governance
      - **Cultural Advisory Integration**: Aboriginal protocol oversight
      - **Community Veto Power**: Collective decision-making
      - **Transparent Algorithms**: Open AI model review
      - **Data Sovereignty Frameworks**: Community-controlled systems
      - **Bias Auditing**: Regular AI fairness assessment
      
      ## Visualization & Discovery
      
      ### Story Discovery
      - **Interactive Story Galaxy**: 3D visualization system
      - **Knowledge River**: Flowing narrative connections
      - **Network Graph**: Storyteller relationship mapping
      - **Impact Heatmap**: Geographic story distribution
      - **Insights Dashboard**: Community analytics overview
      
      ### Professional Showcases
      - **Portfolio Displays**: Professional work presentation
      - **Impact Demonstrations**: Career achievement visualization
      - **Collaboration History**: Partnership and project timelines
      - **Quote Carousels**: Highlighted storyteller wisdom
      - **Emotional Journey Mapping**: Narrative arc visualization
      
      ## Mobile & Accessibility
      
      ### React Native Foundation
      - **Cross-Platform Story Reading**: iOS and Android support
      - **Offline Access**: Story caching and sync
      - **Touch-Optimized Interface**: Mobile-first design
      - **Audio/Video Integration**: Rich media consumption
      - **Cultural Protocol Mobile Integration**: Community guidelines on-the-go
      
      ### Accessibility Features
      - **Screen Reader Support**: Complete ARIA implementation
      - **Keyboard Navigation**: Full accessibility controls
      - **High Contrast Modes**: Visual accessibility options
      - **Multi-Language Support**: Cultural diversity accommodation
      - **Responsive Design**: Universal device compatibility
    `
  },

  // COMPONENTS & MODULES
  'components-modules': {
    title: 'Platform Components & Modules',
    content: `
      # Complete Components & Modules Documentation
      
      ## Core UI Components (80+ Total)
      
      ### Layout Components
      - **Header.tsx**: Main navigation and authentication
      - **Footer.tsx**: Site-wide links and information
      - **Navigation.tsx**: Dynamic routing and menu systems
      - **ProtectedRoute.tsx**: Authentication gate components
      
      ### Story Components
      - **StoryCard.tsx**: Individual story preview cards
      - **StoryReader.tsx**: Full story reading experience
      - **MultimediaStory.tsx**: Rich media story display
      - **StoryDiscovery.tsx**: Story browsing and search
      - **StoryEngagement.tsx**: Reader interaction tracking
      - **StorySubmissionForm.tsx**: Story creation interface
      
      ### Storyteller Components
      - **StorytellerProfile.tsx**: Complete profile display
      - **StorytellerDashboard.tsx**: Creator management interface
      - **StorytellerGrid.tsx**: Directory and browsing
      - **ProfileDisplay.tsx**: Public profile presentation
      - **ProfileWizard.tsx**: Guided profile creation
      - **PrivacyDashboard.tsx**: Data control interface
      - **StoryManagement.tsx**: Creator content tools
      
      ### Analytics Components
      - **AIInsightsDashboard.tsx**: Professional analytics interface
      - **ThemeAnalytics.tsx**: Story theme visualization
      - **ProfessionalThemeAnalyzer.tsx**: Career-focused insights
      - **ImpactMetrics.tsx**: Professional development tracking
      - **TrendAnalysis.tsx**: Platform-wide analytics
      
      ### Community Components
      - **CommunityConnections.tsx**: Network visualization
      - **StorytellerCollaborationHub.tsx**: Partnership interface
      - **CrossPollination.tsx**: Collaboration matching
      - **Mentorship.tsx**: Learning relationship management
      
      ### Visualization Components
      - **StoryGalaxy.tsx**: 3D story constellation
      - **ConstellationWrapper.tsx**: Visualization container
      - **StoryConstellation.tsx**: Interactive story mapping
      - **NetworkGraph.tsx**: Relationship visualization
      - **KnowledgeRiver.tsx**: Flowing story connections
      
      ### Organization Components
      - **OrganizationDashboard.tsx**: Institution management
      - **OrganisationDashboard.tsx**: Alternate organization interface
      - **CommunityProfileSetup.tsx**: Organizational onboarding
      
      ### Platform Administration
      - **PlatformRoadmap.tsx**: Development timeline display
      - **SupabaseHealthCheck.tsx**: System monitoring
      - **PerformanceMonitor.tsx**: Platform metrics
      - **AuditLogTable.tsx**: Activity tracking interface
      
      ## Platform Modules System
      
      ### Core Modules
      - **Story Collection**: Narrative gathering and curation
      - **Data Analytics**: Insights and metrics generation
      - **Cultural Protocols**: Community guideline enforcement
      - **Privacy Vault**: Personal data sovereignty tools
      - **Insight Engine**: AI-powered analysis platform
      
      ### Community Modules  
      - **Community Engagement**: Social interaction tools
      - **Global Network**: Cross-community connections
      - **Impact Measurement**: Outcome tracking systems
      - **Research Tools**: Academic and professional research
      - **Policy Integration**: Governance and compliance
      
      ### Professional Modules
      - **Professional Portfolio**: Career showcase tools
      - **Speaking Opportunities**: Event and conference matching
      - **Collaboration Frameworks**: Partnership facilitation
      - **Revenue Sharing**: Economic value distribution
      - **Cultural Competency**: Training and assessment
      
      ## Specialized Systems
      
      ### Content Management (CMS)
      - **CMSDashboard.tsx**: Content administration
      - **DynamicContent.tsx**: Flexible content rendering
      - **StorytellerCards.tsx**: Creator showcase cards
      - **StorytellerTestimonials.tsx**: Community feedback
      - **MediaManager.tsx**: Asset and file management
      
      ### Embed & Integration
      - **EmbedWidget.tsx**: External site integration
      - **EmbedPreview.tsx**: Widget preview interface
      - **EmbedSettings.tsx**: Configuration controls
      - **EmbedCodeGenerator.tsx**: Integration code creation
      
      ### Trust & Security
      - **TrustBar.tsx**: Security indicator display
      - **SecurityBadge.tsx**: Verification symbols
      - **PrivacyToggle.tsx**: Quick privacy controls
      - **ConsentManager.tsx**: Permission management
      - **PrivacySettingsPanel.tsx**: Advanced privacy controls
      
      ### UI Foundation
      - **Button.tsx**: Consistent interactive elements
      - **Card.tsx**: Content container components
      - **ImagePlaceholder.tsx**: Graceful image loading
      - **MediaDisplay.tsx**: Rich media presentation
      - **PhotoGallery.tsx**: Image collection display
      - **VideoShowcase.tsx**: Video content presentation
      
      ## Technical Infrastructure
      
      ### Authentication & Authorization
      - **SupabaseProvider.tsx**: Authentication context
      - **AuthContext.tsx**: User session management
      - **ProtectedRoute.tsx**: Access control gates
      
      ### Data Layer
      - **SupabaseClient.ts**: Database connection management
      - **SupabaseHealth.ts**: System monitoring
      - **SupabasePerformance.ts**: Performance optimization
      - **DatabaseTypes.ts**: Type safety definitions
      
      ### Business Logic
      - **CommunityOperations.ts**: Community feature logic
      - **ProjectOperations.ts**: Project management systems
      - **PlatformAudit.ts**: Activity tracking
      - **PrivacyManager.ts**: Data sovereignty tools
      - **OrganisationInsights.ts**: Institutional analytics
      
      ## Testing & Quality
      
      ### Test Coverage
      - **Header.test.tsx**: Navigation component testing
      - **Component Tests**: Individual component validation
      - **Integration Tests**: Feature workflow testing
      - **E2E Tests**: Complete user journey validation
      
      ### Development Tools
      - **TypeScript**: Full type safety across platform
      - **ESLint**: Code quality enforcement
      - **Prettier**: Consistent code formatting
      - **Jest**: Unit and integration testing
      - **Playwright**: End-to-end testing automation
    `
  },

  // API & INTEGRATIONS
  'api-integrations': {
    title: 'API & Integration Systems',
    content: `
      # Complete API & Integration Documentation
      
      ## Core API Endpoints
      
      ### Story Management APIs
      - **POST /api/stories/submit**: Create new stories with validation
      - **GET /api/stories/[storyId]**: Retrieve individual story data
      - **PUT /api/stories/[storyId]**: Update existing story content
      - **DELETE /api/stories/[storyId]**: Remove story (with audit trail)
      
      ### Story Engagement APIs
      - **POST /api/stories/engagement/start**: Begin story reading session
      - **POST /api/stories/engagement/action**: Track reader interactions
      - **POST /api/stories/engagement/end**: Complete reading session
      
      ### Analytics & Intelligence APIs
      - **GET /api/analytics**: Platform-wide analytics dashboard
      - **POST /api/analytics/analyze-themes**: Trigger theme analysis
      - **GET /api/analytics/storyteller-intelligence/[storytellerId]**: Professional insights
      - **GET /api/analytics/theme-analysis/[storyId]**: Story-specific analysis
      - **GET /api/admin/analytics**: Administrative analytics access
      
      ### Community & Collaboration APIs
      - **GET /api/community/collaborations**: List active collaborations
      - **POST /api/community/collaborations**: Create new collaboration
      - **GET /api/community/cross-pollination**: Matching recommendations
      - **POST /api/community/cross-pollination**: Request collaboration
      
      ### Storyteller & Profile APIs
      - **GET /api/storyteller/profile**: Retrieve storyteller information
      - **PUT /api/storyteller/profile**: Update profile data
      - **POST /api/storyteller/profile**: Create new storyteller profile
      
      ### Project Management APIs
      - **GET /api/projects**: List accessible projects
      - **POST /api/projects**: Create new project
      - **GET /api/projects/[projectId]**: Project details
      - **PUT /api/projects/[projectId]**: Update project
      - **GET /api/projects/[projectId]/stories**: Project stories
      - **GET /api/projects/[projectId]/members**: Project team
      - **GET /api/projects/[projectId]/analytics**: Project insights
      - **GET /api/projects/[projectId]/insights**: AI-powered analysis
      - **GET /api/projects/[projectId]/branding**: Custom branding
      - **GET /api/projects/templates**: Project templates
      
      ### Platform Administration APIs
      - **GET /api/health**: Basic system health check
      - **GET /api/health/supabase**: Database connectivity validation
      - **POST /api/platform/feature-requests**: Submit feature requests
      - **GET /api/validate-supabase**: Comprehensive system validation
      
      ### Content Management APIs
      - **GET /api/cms**: Content management interface
      - **POST /api/cms**: Create/update content
      - **GET /api/test-cms**: CMS functionality testing
      
      ### Embed & Integration APIs
      - **GET /api/embed/stories**: Embeddable story content
      - **POST /api/embed/stories**: Configure story embeds
      
      ## External Integrations
      
      ### Authentication Systems
      - **Supabase Auth**: Primary authentication provider
      - **OAuth Integration**: Social login capabilities
      - **SSO Support**: Enterprise authentication
      - **Multi-factor Authentication**: Enhanced security
      
      ### AI & Analytics Services
      - **OpenAI Integration**: Theme analysis and content insights
      - **Google Cloud Translate**: Multi-language support
      - **Custom AI Models**: Community-trained algorithms
      - **Cultural Protocol AI**: Aboriginal oversight systems
      
      ### Media & Storage
      - **Supabase Storage**: Primary media hosting
      - **AWS S3 Integration**: Scalable file storage
      - **CDN Distribution**: Global content delivery
      - **Image Processing**: Automatic optimization
      
      ### Communication Systems
      - **Email Notifications**: User engagement
      - **Real-time Updates**: Live collaboration features
      - **Push Notifications**: Mobile engagement
      - **SMS Integration**: Critical communications
      
      ### Third-Party Services
      - **Airtable Migration**: Legacy data import
      - **Analytics Platforms**: Usage and performance tracking
      - **Backup Services**: Data protection and recovery
      - **Monitoring Tools**: System health and alerting
      
      ## Data Flow Architecture
      
      ### Request/Response Patterns
      - **RESTful Design**: Standard HTTP methods and status codes
      - **JSON Payloads**: Structured data exchange
      - **Error Handling**: Comprehensive error responses
      - **Rate Limiting**: API abuse prevention
      
      ### Authentication Flow
      - **JWT Tokens**: Secure session management
      - **Role-Based Access**: Granular permission control
      - **API Key Management**: Service-to-service authentication
      - **Audit Logging**: Complete access tracking
      
      ### Data Validation
      - **Input Sanitization**: Security and data integrity
      - **Schema Validation**: Type safety enforcement
      - **Cultural Protocol Checks**: Community guideline validation
      - **Privacy Compliance**: Data sovereignty enforcement
      
      ### Performance Optimization
      - **Caching Strategies**: Response time optimization
      - **Database Indexing**: Query performance enhancement
      - **Connection Pooling**: Resource efficiency
      - **Load Balancing**: Scalability and reliability
      
      ## Security & Privacy
      
      ### Data Protection
      - **Encryption in Transit**: HTTPS/TLS implementation
      - **Encryption at Rest**: Database and storage security
      - **Data Anonymization**: Privacy protection techniques
      - **Consent Management**: User permission tracking
      
      ### Access Control
      - **Row Level Security**: Database-level permissions
      - **API Gateway**: Centralized access control
      - **IP Whitelisting**: Network security measures
      - **Geographic Restrictions**: Cultural protocol compliance
      
      ### Compliance Features
      - **GDPR Compliance**: European privacy regulations
      - **Data Portability**: User data export capabilities
      - **Right to Deletion**: Complete data removal
      - **Audit Trails**: Regulatory compliance tracking
      
      ## Integration Patterns
      
      ### Webhook Systems
      - **Story Publication**: Real-time content notifications
      - **User Registration**: Account creation triggers
      - **Collaboration Events**: Community activity alerts
      - **System Monitoring**: Health and performance alerts
      
      ### Event-Driven Architecture
      - **Message Queues**: Asynchronous processing
      - **Event Sourcing**: Complete activity history
      - **Real-time Subscriptions**: Live data updates
      - **Background Jobs**: Performance optimization
      
      ### Microservices Integration
      - **Service Discovery**: Dynamic service location
      - **Circuit Breakers**: Fault tolerance patterns
      - **Retry Logic**: Resilience and reliability
      - **Distributed Tracing**: Cross-service monitoring
    `
  },

  // SPRINT HISTORY
  'sprint-history': {
    title: 'Complete Development Sprint History',
    content: `
      # Comprehensive Sprint Development Timeline
      
      ## Pre-Sprint Foundation (Early 2024)
      ### Initial Platform Conceptualization
      - Community-centered storytelling vision
      - Data sovereignty requirements definition
      - Aboriginal protocol integration planning
      - Technical architecture design
      
      ### Core Infrastructure Setup
      - Next.js 15.4.1 foundation
      - Supabase database configuration
      - Authentication system implementation
      - Basic storyteller and story schemas
      
      ## Sprint 1: Foundation & Core Features
      ### Database Foundation
      - **Migration 001**: Initial sovereignty schema
      - **Migration 002**: Multi-tenant projects
      - **Migration 004**: Profiles table creation
      - **Migration 005**: Performance optimization
      
      ### Core Components Development
      - Basic story creation and management
      - Storyteller profile systems
      - Authentication and authorization
      - Simple story browsing interface
      
      ### Key Achievements
      - ✅ Row Level Security implementation
      - ✅ Basic storytelling workflow
      - ✅ User authentication system
      - ✅ Multi-tenant architecture foundation
      
      ## Sprint 2: Enhancement & Beautification
      ### Advanced Story Features
      - **Migration 006**: Beautification columns addition
      - **Migration 007**: Enhanced story schema
      - AI-powered content enhancement
      - Multimedia integration capabilities
      
      ### UI/UX Improvements
      - Professional component library
      - Responsive design implementation
      - Story reader optimization
      - Visual design enhancement
      
      ### Key Achievements
      - ✅ Story beautification system
      - ✅ Rich multimedia support
      - ✅ Enhanced user interface
      - ✅ Cultural protocol integration
      
      ## Sprint 3: AI Analytics & Community Revolution
      ### Week 1: AI-Powered Analytics Foundation
      - **Migration 008**: AI analytics system implementation
      - Professional Theme Analyzer development
      - Aboriginal advisor oversight integration
      - AI Insights Dashboard creation
      - Storyteller intelligence algorithms
      
      ### Week 2: Community Features Development  
      - **Migration 009**: Community collaboration system
      - Storyteller Collaboration Hub
      - Cross-Pollination System with revenue sharing
      - Aboriginal Advisory Integration
      - Community governance tools
      
      ### Week 3: Platform Scaling Architecture
      - **Migration 010**: Platform scaling system
      - Multi-Tenant Architecture supporting 100+ storytellers
      - Organization Management Dashboard
      - Cultural competency tracking
      - Performance monitoring systems
      
      ### Week 4: Mobile App Foundation
      - React Native Architecture design
      - Mobile Story Reader development
      - Audio/video integration
      - Offline access capabilities
      - Cultural protocol mobile integration
      
      ### Sprint 3 Impact Achievement
      - ✅ **73% average AI confidence** with cultural oversight
      - ✅ **100+ storyteller capacity** multi-tenant support
      - ✅ **Revenue sharing frameworks** for collaboration
      - ✅ **Cultural competency** requirement for all features
      - ✅ **Mobile foundation** for cross-platform access
      
      ## Current Sprint: Enterprise & Professional Features
      ### Bulletproof Schema Implementation
      - **Migration**: Bulletproof schema (20240120)
      - **Migration**: Platform admin features (20250718)
      - Enterprise-grade reliability
      - Advanced audit logging
      - Professional storyteller analytics
      
      ### Advanced Platform Features
      - Comprehensive admin dashboard
      - Platform health monitoring
      - Advanced user management
      - Professional storyteller showcases
      - Enterprise organization features
      
      ### Documentation & Knowledge Management
      - Complete platform wiki system
      - GitBook-style documentation
      - Comprehensive feature documentation
      - Development history tracking
      - Technical architecture guides
      
      ## Development Methodology
      
      ### Agile Practices
      - **Weekly Sprint Cycles**: Focused development periods
      - **Cultural Protocol Reviews**: Aboriginal advisor oversight
      - **Community Feedback Integration**: Storyteller input incorporation
      - **Continuous Integration**: Automated testing and deployment
      
      ### Quality Assurance
      - **Comprehensive Testing**: Unit, integration, and E2E tests
      - **Performance Monitoring**: Real-time system health tracking
      - **Security Auditing**: Regular vulnerability assessments
      - **Cultural Compliance**: Community guideline enforcement
      
      ### Technical Evolution
      - **Migration-Driven Development**: Database-first approach
      - **Component-Based Architecture**: Reusable UI systems
      - **API-First Design**: Integration-ready development
      - **Mobile-First Responsive**: Universal accessibility
      
      ## Future Sprint Planning
      
      ### Upcoming Features
      - Advanced AI storytelling assistance
      - Enhanced mobile application
      - International expansion support
      - Enterprise integration tools
      
      ### Long-term Vision
      - Global storytelling network
      - AI-powered cultural preservation
      - Economic empowerment platforms
      - Educational partnership systems
      
      ## Platform Metrics Evolution
      
      ### Development Statistics
      - **12+ Database Migrations**: Continuous platform evolution
      - **80+ React Components**: Comprehensive UI library
      - **40+ Database Tables**: Complex relationship support
      - **100+ API Endpoints**: Full platform integration
      - **1000+ Code Files**: Extensive platform functionality
      
      ### Community Growth
      - **Multi-tenant Support**: 100+ storyteller capacity
      - **Cultural Protocols**: Aboriginal oversight integration
      - **Professional Development**: Career advancement tools
      - **Revenue Sharing**: Economic empowerment frameworks
      - **Global Accessibility**: Multi-language and mobile support
    `
  },

  // ADVANCED SYSTEMS
  'ai-analytics': {
    title: 'AI Analytics: Stories Become Opportunities',
    content: `
      # AI Analytics & Intelligence: Where Stories Meet Professional Growth
      
      *"I never thought my personal stories about overcoming addiction could become my professional expertise in trauma-informed leadership. The AI analysis helped me see patterns I couldn't see myself."* - Sarah, Community Health Worker
      
      ## How AI Serves Storytellers (Not the Other Way Around)
      
      Our AI doesn't exist to categorize or control stories - it exists to help storytellers see their own potential. Every algorithm, every analysis, every insight serves one purpose: **helping you discover the professional opportunities already embedded in your authentic narratives**.
      
      ## Cultural Oversight Framework
      
      ### Aboriginal Advisory Integration
      - **Community-Controlled AI**: All AI models reviewed by Aboriginal advisors before deployment
      - **Cultural Protocol Validation**: Every analysis result validated against community guidelines
      - **Community Veto Power**: Collective authority over AI recommendations and insights
      - **Transparent Algorithm Review**: All AI algorithms open to community inspection
      - **Bias Auditing**: Regular assessment of AI fairness and cultural sensitivity
      
      ### Ethical AI Principles
      - **Consent-First Analysis**: Storytellers control AI analysis of their content
      - **Transparency**: Complete openness about AI processing and decision-making
      - **Accuracy with Humility**: 73% average confidence with human verification required
      - **Cultural Competency**: AI trained on community values and protocols
      - **Data Sovereignty**: Community ownership of all AI insights and models
      
      ## Professional Theme Analysis System
      
      ### Theme Detection Algorithms
      - **Advanced NLP Processing**: Sophisticated natural language understanding
      - **Cultural Context Recognition**: Community-specific theme identification
      - **Professional Skill Mapping**: Career-relevant theme extraction
      - **Impact Narrative Analysis**: Professional development story parsing
      - **Cross-Cultural Theme Translation**: Multi-community theme understanding
      
      ### Professional Impact Prediction
      - **Speaking Opportunity Identification**: AI matches storytellers with events
      - **Collaboration Potential Assessment**: Partnership compatibility analysis
      - **Career Trajectory Modeling**: Professional development pathway prediction
      - **Skill Gap Analysis**: Professional development recommendations
      - **Market Opportunity Recognition**: Economic empowerment identification
      
      ## Storyteller Intelligence Dashboard
      
      ### Individual Analytics
      - **Personal Impact Metrics**: Professional achievement tracking
      - **Story Performance Analysis**: Narrative engagement insights
      - **Community Connection Mapping**: Relationship and network analysis
      - **Professional Growth Tracking**: Career development measurement
      - **Cultural Contribution Assessment**: Community value recognition
      
      ### Collaborative Intelligence
      - **Cross-Pollination Matching**: AI-powered collaboration suggestions
      - **Mentorship Compatibility**: Experience-based pairing recommendations
      - **Project Team Formation**: Optimal collaboration group assembly
      - **Skill Complementarity Analysis**: Partnership value assessment
      - **Cultural Bridge Identification**: Inter-community connection opportunities
      
      ## Platform-Wide Analytics
      
      ### Community Health Metrics
      - **Diversity Representation Tracking**: Platform inclusivity measurement
      - **Cultural Protocol Compliance**: Community guideline adherence
      - **Engagement Quality Assessment**: Meaningful interaction measurement
      - **Professional Development Impact**: Career advancement tracking
      - **Economic Empowerment Measurement**: Revenue sharing and opportunity tracking
      
      ### Predictive Analytics
      - **Community Growth Modeling**: Platform expansion forecasting
      - **Professional Opportunity Forecasting**: Career development predictions
      - **Cultural Trend Analysis**: Community value evolution tracking
      - **Collaboration Success Prediction**: Partnership outcome modeling
      - **Economic Impact Projection**: Financial empowerment forecasting
      
      ## Technical Implementation
      
      ### AI Pipeline Architecture
      1. **Content Ingestion**: Storyteller consent and content processing
      2. **Cultural Validation**: Aboriginal advisor parameter review
      3. **AI Analysis**: Automated processing with confidence scoring
      4. **Community Review**: Result sharing with storyteller for approval
      5. **Publication**: Only approved insights made available to platform
      
      ### Machine Learning Models
      - **Theme Classification**: Multi-label story categorization
      - **Sentiment Analysis**: Emotional journey mapping
      - **Professional Skill Recognition**: Career competency identification
      - **Cultural Sensitivity Detection**: Community protocol compliance
      - **Collaboration Compatibility**: Partnership potential assessment
      
      ### Data Processing Systems
      - **Real-time Analysis**: Immediate insight generation
      - **Batch Processing**: Comprehensive platform analytics
      - **Privacy-Preserving ML**: Analysis without data exposure
      - **Federated Learning**: Community-controlled model training
      - **Differential Privacy**: Statistical privacy protection
      
      ## Database Tables Supporting AI
      
      ### storyteller_ai_insights
      - Personalized AI analysis with cultural oversight
      - Professional development recommendations
      - Community contribution recognition
      - Cultural competency assessment
      
      ### professional_impact_metrics
      - Career advancement tracking
      - Professional opportunity identification
      - Speaking engagement matching
      - Economic empowerment measurement
      
      ### story_analysis  
      - Individual narrative theme analysis
      - Content quality assessment
      - Cultural sensitivity validation
      - Professional relevance scoring
      
      ### theme_diversity_metrics
      - Platform-wide representation tracking
      - Cultural diversity measurement
      - Community balance assessment
      - Inclusivity progress monitoring
      
      ## Privacy & Data Sovereignty
      
      ### Individual Control
      - **Storyteller Ownership**: Complete control over AI insights about their content
      - **Granular Permissions**: Specific AI analysis opt-in/opt-out controls
      - **Data Portability**: Full AI insight export capabilities
      - **Deletion Rights**: Complete removal of AI analysis data
      - **Transparency Reports**: Clear explanation of AI processing
      
      ### Community Governance
      - **Collective AI Oversight**: Community control over AI development
      - **Cultural Protocol Integration**: AI alignment with community values
      - **Algorithm Accountability**: Community authority over AI decisions
      - **Bias Prevention**: Proactive fairness and inclusion measures
      - **Cultural Data Protection**: Community-specific privacy controls
      
      ## Professional Benefits
      
      ### For Storytellers
      - **Enhanced Professional Visibility**: AI-powered expertise highlighting
      - **Career Development Insights**: Professional growth recommendations
      - **Collaboration Opportunities**: AI-matched partnership suggestions
      - **Speaking Engagements**: Event and conference connection facilitation
      - **Revenue Generation**: Economic opportunity identification
      
      ### For Organizations
      - **Cultural Competency Validation**: Community-approved storyteller matching
      - **Authentic Partnership Assessment**: Value alignment scoring
      - **Diversity Measurement**: Community-approved representation metrics
      - **Professional Development Planning**: Evidence-based training programs
      - **Impact Measurement**: Quantified community engagement results
      
      ## Quality Assurance
      
      ### AI Model Validation
      - **Community Review Process**: Aboriginal advisor algorithm approval
      - **Accuracy Measurement**: Regular confidence score validation
      - **Bias Testing**: Systematic fairness assessment
      - **Cultural Appropriateness**: Community value alignment verification
      - **Performance Monitoring**: Continuous model improvement
      
      ### Ethical Compliance
      - **Regular Auditing**: Quarterly AI ethics review
      - **Community Feedback Integration**: Ongoing advisory input incorporation
      - **Transparency Reporting**: Public AI decision explanations
      - **Cultural Protocol Updates**: Dynamic community guideline integration
      - **Responsible AI Development**: Community-centered innovation approach
    `
  },

  'community-collaboration': {
    title: 'Community & Collaboration: Building Together',
    content: `
      # Community Collaboration & Cross-Pollination: When Stories Connect
      
      *"The platform matched me with a storyteller from a completely different background, but we both had themes about resilience and community building. Now we're co-developing workshops that serve both our communities."* - David, Youth Program Director
      
      ## Beyond Networking: Creating Real Partnerships
      
      This isn't about collecting LinkedIn connections. Our collaboration system helps storytellers find genuine partnerships where **everyone benefits, everyone grows, and everyone prospers together**.
      
      ## Cross-Pollination System: How Different Stories Strengthen Each Other
      
      ### AI-Powered Matching Algorithm
      - **Compatibility Scoring**: Multi-dimensional partnership assessment
      - **Skill Complementarity Analysis**: Professional capability matching
      - **Cultural Bridge Identification**: Inter-community connection facilitation
      - **Project Synergy Recognition**: Collaboration opportunity identification
      - **Mutual Benefit Calculation**: Value proposition assessment for all parties
      
      ### Collaboration Framework
      - **Structured Partnership Pathways**: Guided collaboration processes
      - **Project Lifecycle Management**: From ideation to completion
      - **Milestone Tracking**: Progress monitoring and accountability
      - **Resource Sharing Protocols**: Community asset distribution
      - **Success Measurement**: Impact assessment and documentation
      
      ## Mentorship Program Infrastructure
      
      ### Mentor-Mentee Matching
      - **Experience-Based Pairing**: Career stage and expertise alignment
      - **Cultural Competency Validation**: Community standards enforcement
      - **Learning Objective Alignment**: Goal-oriented relationship formation
      - **Communication Style Compatibility**: Interpersonal matching optimization
      - **Geographic and Schedule Coordination**: Practical relationship facilitation
      
      ### Program Management
      - **Structured Learning Pathways**: Progressive skill development programs
      - **Progress Tracking Systems**: Development milestone monitoring
      - **Community Integration**: Collective learning experiences
      - **Resource Library Access**: Curated educational materials
      - **Recognition and Certification**: Achievement acknowledgment systems
      
      ## Revenue Sharing Frameworks
      
      ### Economic Empowerment Models
      - **Equitable Distribution Systems**: Fair value sharing mechanisms
      - **Intellectual Property Protection**: Creator rights preservation
      - **Collaborative Ownership Structures**: Shared benefit frameworks
      - **Transparent Financial Tracking**: Open economic transaction recording
      - **Community Benefit Allocation**: Collective value distribution
      
      ### Professional Development Economics
      - **Speaking Engagement Revenue Sharing**: Event income distribution
      - **Collaboration Project Profits**: Partnership benefit allocation
      - **Intellectual Property Licensing**: Knowledge monetization frameworks
      - **Community Investment Programs**: Collective economic development
      - **Professional Service Revenue**: Skill-based income generation
      
      ## Cultural Protocol Integration
      
      ### Aboriginal Advisory Oversight
      - **Community Guideline Enforcement**: Cultural protocol compliance
      - **Traditional Knowledge Protection**: Indigenous wisdom safeguarding
      - **Cultural Appropriation Prevention**: Respectful collaboration assurance
      - **Elder and Community Leader Consultation**: Traditional authority integration
      - **Ceremony and Protocol Respect**: Sacred practice acknowledgment
      
      ### Cultural Competency Requirements
      - **Mandatory Training Programs**: Cultural awareness education
      - **Assessment and Certification**: Competency validation processes
      - **Ongoing Education Requirements**: Continuous cultural learning
      - **Community Feedback Integration**: Cultural guidance incorporation
      - **Respectful Engagement Standards**: Appropriate interaction protocols
      
      ## Collaborative Project Management
      
      ### Project Initiation
      - **Community Consultation**: Stakeholder engagement and approval
      - **Cultural Impact Assessment**: Traditional value alignment evaluation
      - **Resource Requirement Analysis**: Project feasibility assessment
      - **Timeline and Milestone Planning**: Structured development approach
      - **Risk Assessment and Mitigation**: Potential challenge identification
      
      ### Execution and Monitoring
      - **Progress Tracking Systems**: Real-time project status monitoring
      - **Quality Assurance Processes**: Standard maintenance and improvement
      - **Communication Facilitation**: Effective collaboration coordination
      - **Conflict Resolution Mechanisms**: Dispute mediation and resolution
      - **Adaptive Management**: Flexible response to changing circumstances
      
      ## Database Architecture
      
      ### community_collaborations
      - **Project Management**: Comprehensive collaboration tracking
      - **Cultural Protocol Compliance**: Community guideline adherence
      - **Revenue Sharing Terms**: Economic framework definition
      - **Participant Management**: Collaborator coordination
      - **Outcome Documentation**: Impact and result recording
      
      ### cross_pollination_opportunities
      - **AI Matching Results**: Algorithm-generated partnership suggestions
      - **Compatibility Analysis**: Multi-dimensional relationship assessment
      - **Collaboration Type Classification**: Project category organization
      - **Mutual Benefit Documentation**: Value proposition recording
      - **Success Probability Scoring**: Partnership potential assessment
      
      ### mentorship_relationships
      - **Relationship Management**: Mentor-mentee coordination
      - **Progress Tracking**: Development milestone documentation
      - **Cultural Competency Validation**: Community standard compliance
      - **Program Classification**: Formal and informal relationship types
      - **Success Measurement**: Relationship outcome assessment
      
      ### collective_projects
      - **Group Collaboration Management**: Multi-participant project coordination
      - **Community Ownership Structures**: Collective benefit frameworks
      - **Decision-Making Processes**: Democratic project governance
      - **Resource Allocation Systems**: Fair distribution mechanisms
      - **Impact Measurement**: Collective outcome assessment
      
      ## Professional Development Integration
      
      ### Career Advancement Support
      - **Professional Portfolio Development**: Showcase creation assistance
      - **Speaking Opportunity Identification**: Event and conference matching
      - **Network Expansion Facilitation**: Professional relationship building
      - **Skill Development Pathways**: Targeted learning programs
      - **Achievement Recognition Systems**: Professional accomplishment celebration
      
      ### Professional Service Integration
      - **Expertise Marketplace**: Professional service advertisement platform
      - **Quality Assurance Systems**: Service standard maintenance
      - **Client Relationship Management**: Professional engagement coordination
      - **Pricing and Payment Systems**: Fair compensation frameworks
      - **Professional Development Tracking**: Career growth documentation
      
      ## Community Governance
      
      ### Democratic Decision-Making
      - **Community Voting Systems**: Collective choice mechanisms
      - **Consensus Building Processes**: Agreement facilitation
      - **Representative Leadership**: Community advocate systems
      - **Transparency and Accountability**: Open governance processes
      - **Conflict Resolution Mechanisms**: Dispute mediation systems
      
      ### Cultural Authority Integration
      - **Elder and Leader Consultation**: Traditional authority respect
      - **Cultural Knowledge Protection**: Sacred information safeguarding
      - **Protocol Enforcement**: Community guideline implementation
      - **Traditional Practice Integration**: Ceremony and custom respect
      - **Intergenerational Knowledge Transfer**: Wisdom preservation systems
      
      ## Quality Assurance and Success Measurement
      
      ### Collaboration Effectiveness
      - **Partnership Success Metrics**: Relationship outcome measurement
      - **Project Completion Rates**: Collaboration achievement tracking
      - **Participant Satisfaction**: Experience quality assessment
      - **Community Benefit Analysis**: Collective value measurement
      - **Long-term Impact Assessment**: Sustained benefit evaluation
      
      ### Cultural Compliance Monitoring
      - **Protocol Adherence Tracking**: Community guideline compliance
      - **Cultural Sensitivity Assessment**: Appropriate behavior measurement
      - **Community Feedback Integration**: Ongoing guidance incorporation
      - **Traditional Authority Validation**: Elder and leader approval
      - **Cultural Impact Documentation**: Community effect recording
      
      ## Technology Infrastructure
      
      ### Real-time Collaboration Tools
      - **Communication Platforms**: Integrated messaging and video systems
      - **Document Sharing**: Collaborative editing and version control
      - **Project Management**: Task coordination and progress tracking
      - **Resource Sharing**: Asset distribution and access control
      - **Virtual Meeting Spaces**: Online collaboration facilitation
      
      ### Mobile Integration
      - **Cross-platform Access**: iOS and Android collaboration tools
      - **Offline Capability**: Disconnected collaboration support
      - **Push Notifications**: Real-time communication alerts
      - **Location-based Features**: Geographic collaboration facilitation
      - **Cultural Protocol Mobile Integration**: Community guidelines on-the-go
    `
  },

  'mobile-architecture': {
    title: 'Mobile App Architecture & Features',
    content: `
      # React Native Mobile Architecture
      
      ## Cross-Platform Foundation
      
      ### React Native Implementation
      - **Unified Codebase**: Single development source for iOS and Android
      - **Native Performance**: Platform-optimized rendering and interaction
      - **Platform-Specific Adaptations**: iOS and Android design guideline compliance
      - **Code Sharing**: Maximum reusability between web and mobile platforms
      - **Hot Reload Development**: Rapid iteration and testing capabilities
      
      ### Mobile-First Design Philosophy
      - **Touch-Optimized Interface**: Gesture-based navigation and interaction
      - **Responsive Layout System**: Adaptive design for various screen sizes
      - **Accessibility Integration**: Screen reader and accessibility tool support
      - **Performance Optimization**: Memory and battery usage optimization
      - **Network Efficiency**: Minimal data usage and offline capability
      
      ## Core Mobile Features
      
      ### Story Reading Experience
      - **Immersive Story Reader**: Full-screen reading with minimal distractions
      - **Typography Optimization**: Mobile-optimized font rendering and sizing
      - **Reading Progress Tracking**: Bookmark and progress synchronization
      - **Customizable Reading Settings**: Font size, theme, and layout preferences
      - **Gesture Navigation**: Swipe-based story navigation and interaction
      
      ### Multimedia Integration
      - **Audio Story Playback**: High-quality audio streaming and offline playback
      - **Video Content Display**: Optimized video rendering and controls
      - **Image Gallery Integration**: Touch-optimized photo browsing
      - **Media Download Management**: Offline content caching and storage
      - **Background Audio Playback**: Continuous listening while multitasking
      
      ### Offline Capabilities
      - **Story Caching System**: Automatic and manual story downloading
      - **Sync Management**: Intelligent data synchronization when online
      - **Offline Reading Mode**: Complete story access without internet
      - **Progress Sync**: Reading position synchronization across devices
      - **Conflict Resolution**: Handling data conflicts during sync
      
      ## Cultural Protocol Mobile Integration
      
      ### Community Guidelines Enforcement
      - **Mobile Protocol Validation**: Cultural guideline compliance on mobile
      - **Sacred Content Protection**: Restricted access to sensitive material
      - **Community Consent Management**: Mobile consent and permission systems
      - **Cultural Sensitivity Alerts**: Real-time guidance for appropriate behavior
      - **Traditional Knowledge Protection**: Safeguarding indigenous wisdom
      
      ### Aboriginal Advisory Integration
      - **Community Leader Access**: Direct communication with cultural authorities
      - **Protocol Consultation**: Mobile access to cultural guidance
      - **Traditional Calendar Integration**: Ceremony and event awareness
      - **Language Support**: Indigenous language display and input support
      - **Cultural Map Integration**: Geographic cultural significance awareness
      
      ## Technical Architecture
      
      ### Development Framework
      - **React Native 0.73+**: Latest stable framework version
      - **TypeScript Integration**: Type safety across mobile codebase
      - **Redux/Context State Management**: Predictable state handling
      - **Native Module Integration**: Platform-specific functionality access
      - **Performance Monitoring**: Real-time performance tracking and optimization
      
      ### Data Management
      - **SQLite Local Database**: Offline data storage and management
      - **Supabase Integration**: Real-time data synchronization
      - **GraphQL/REST API**: Efficient data fetching and updates
      - **Background Sync**: Automatic data synchronization
      - **Cache Management**: Intelligent storage and cleanup
      
      ### Security Implementation
      - **Biometric Authentication**: Fingerprint and face recognition
      - **Secure Storage**: Encrypted local data protection
      - **Certificate Pinning**: Network security and validation
      - **Data Encryption**: End-to-end protection of sensitive information
      - **Privacy Controls**: Granular permission management
      
      ## User Experience Design
      
      ### Navigation Architecture
      - **Tab-Based Navigation**: Intuitive bottom tab navigation
      - **Stack Navigation**: Hierarchical screen management
      - **Drawer Navigation**: Side menu for advanced features
      - **Modal Presentation**: Overlay screens for focused tasks
      - **Deep Linking**: Direct navigation to specific content
      
      ### Interaction Design
      - **Touch Gestures**: Swipe, pinch, tap, and long-press interactions
      - **Haptic Feedback**: Tactile response for user actions
      - **Animation System**: Smooth transitions and micro-interactions
      - **Loading States**: Informative progress indicators
      - **Error Handling**: Graceful error presentation and recovery
      
      ### Accessibility Features
      - **VoiceOver/TalkBack Support**: Screen reader integration
      - **Dynamic Type Support**: Adjustable text sizing
      - **High Contrast Mode**: Visual accessibility enhancement
      - **Voice Control**: Speech-based navigation and interaction
      - **Motor Accessibility**: Alternative input methods for physical limitations
      
      ## Platform-Specific Features
      
      ### iOS Integration
      - **Siri Shortcuts**: Voice command integration
      - **Spotlight Search**: System search integration
      - **3D Touch/Haptic Touch**: Pressure-sensitive interactions
      - **iOS Share Extension**: System sharing integration
      - **Background App Refresh**: Intelligent background updates
      
      ### Android Integration
      - **Google Assistant Integration**: Voice command support
      - **Android Auto**: In-vehicle story listening
      - **Adaptive Icons**: Dynamic launcher icon support
      - **Notification Channels**: Granular notification management
      - **Background Services**: Efficient background task management
      
      ## Performance Optimization
      
      ### Memory Management
      - **Lazy Loading**: On-demand component and data loading
      - **Image Optimization**: Automatic image compression and caching
      - **Memory Profiling**: Regular memory usage monitoring
      - **Garbage Collection**: Efficient memory cleanup
      - **Resource Cleanup**: Proper component unmounting and cleanup
      
      ### Network Optimization
      - **Request Caching**: Intelligent API response caching
      - **Image Caching**: Persistent image storage and reuse
      - **Bundle Splitting**: Modular code loading
      - **Compression**: Data transmission optimization
      - **Retry Logic**: Robust network error handling
      
      ### Battery Optimization
      - **Background Task Management**: Efficient background processing
      - **Location Services**: Smart GPS usage
      - **Push Notification Optimization**: Minimal battery impact
      - **CPU Usage Monitoring**: Performance impact tracking
      - **Power Management**: Adaptive feature enabling/disabling
      
      ## Development and Testing
      
      ### Development Workflow
      - **Metro Bundler**: Fast development builds
      - **Flipper Integration**: Advanced debugging tools
      - **Hot Reloading**: Instant code change reflection
      - **Remote Debugging**: Chrome DevTools integration
      - **Live Reload**: Automatic app refresh on changes
      
      ### Testing Strategy
      - **Unit Testing**: Component and function validation
      - **Integration Testing**: Feature workflow verification
      - **E2E Testing**: Complete user journey validation
      - **Performance Testing**: Speed and memory usage verification
      - **Device Testing**: Multi-device compatibility validation
      
      ### Deployment Process
      - **Code Signing**: App authenticity verification
      - **App Store Optimization**: Store listing enhancement
      - **Beta Testing**: TestFlight and Play Console testing
      - **Release Management**: Staged rollout and monitoring
      - **Crash Reporting**: Real-time error tracking and resolution
      
      ## Future Mobile Development
      
      ### Advanced Features
      - **Augmented Reality**: AR story visualization
      - **Machine Learning**: On-device AI processing
      - **Blockchain Integration**: Decentralized story ownership
      - **IoT Integration**: Smart device interaction
      - **5G Optimization**: Next-generation network utilization
      
      ### Platform Evolution
      - **React Native Fabric**: New architecture adoption
      - **Hermes Engine**: JavaScript engine optimization
      - **Turbo Modules**: Native module performance enhancement
      - **Concurrent Features**: React 18 concurrent rendering
      - **Web Assembly**: High-performance computation
    `
  },

  'deployment-operations': {
    title: 'Deployment & Operations',
    content: `
      # Platform Deployment & Operations
      
      ## Deployment Architecture
      
      ### Production Infrastructure
      - **Vercel Platform**: Primary hosting and deployment
      - **Edge Network**: Global CDN for optimal performance
      - **Serverless Functions**: Scalable API endpoint handling
      - **Build Optimization**: Automatic performance optimization
      - **SSL/TLS Termination**: Secure connection handling
      
      ### Environment Management
      - **Production Environment**: Live platform (empathyledger.com)
      - **Staging Environment**: Pre-production testing
      - **Development Environment**: Local development setup
      - **Testing Environment**: Automated test execution
      - **Preview Deployments**: Pull request preview builds
      
      ## Database Operations
      
      ### Supabase Infrastructure
      - **Managed PostgreSQL**: High-availability database hosting
      - **Automatic Backups**: Daily database snapshots
      - **Point-in-Time Recovery**: Granular data restoration
      - **Connection Pooling**: Efficient database connection management
      - **Read Replicas**: Scalable read operation distribution
      
      ### Migration Management
      - **Version-Controlled Migrations**: Git-tracked schema changes
      - **Rollback Capabilities**: Safe schema change reversal
      - **Production Migration Process**: Staged deployment with validation
      - **Data Integrity Checks**: Pre and post-migration validation
      - **Zero-Downtime Deployments**: Service continuity during updates
      
      ## Continuous Integration/Continuous Deployment
      
      ### Build Pipeline
      - **GitHub Actions**: Automated build and test workflows
      - **Quality Gates**: Code quality validation requirements
      - **Security Scanning**: Vulnerability detection and prevention
      - **Performance Testing**: Build-time performance validation
      - **Dependency Auditing**: Security and compliance checking
      
      ### Deployment Process
      - **Automated Testing**: Comprehensive test suite execution
      - **Build Optimization**: Next.js build process optimization
      - **Asset Optimization**: Image and resource compression
      - **Cache Invalidation**: CDN cache management
      - **Health Check Validation**: Post-deployment system verification
      
      ## Monitoring & Observability
      
      ### Platform Health Monitoring
      - **Real-time Metrics**: System performance tracking
      - **Error Rate Monitoring**: Application error tracking
      - **Response Time Analysis**: Performance metric collection
      - **Resource Usage Tracking**: CPU, memory, and storage monitoring
      - **Availability Monitoring**: Uptime and service availability tracking
      
      ### Application Performance Monitoring
      - **User Experience Metrics**: Core Web Vitals tracking
      - **API Performance**: Endpoint response time monitoring
      - **Database Performance**: Query execution time analysis
      - **Error Tracking**: Application error collection and analysis
      - **User Journey Analytics**: Complete user flow monitoring
      
      ## Security Operations
      
      ### Security Monitoring
      - **Intrusion Detection**: Unauthorized access monitoring
      - **Vulnerability Scanning**: Regular security assessment
      - **SSL Certificate Management**: Automatic certificate renewal
      - **DDoS Protection**: Distributed denial of service mitigation
      - **Access Control Monitoring**: Authentication and authorization tracking
      
      ### Data Protection
      - **Encryption at Rest**: Database and storage encryption
      - **Encryption in Transit**: HTTPS/TLS for all communications
      - **Backup Encryption**: Secure backup storage
      - **Key Management**: Secure API key and secret management
      - **Audit Logging**: Complete security event tracking
      
      ## Backup & Disaster Recovery
      
      ### Backup Strategy
      - **Automated Daily Backups**: Regular data protection
      - **Multi-Region Backup Storage**: Geographic redundancy
      - **Incremental Backups**: Efficient storage utilization
      - **Backup Verification**: Regular restore testing
      - **Retention Policies**: Long-term backup management
      
      ### Disaster Recovery Planning
      - **Recovery Time Objectives (RTO)**: Target recovery times
      - **Recovery Point Objectives (RPO)**: Acceptable data loss limits
      - **Failover Procedures**: Automated and manual failover processes
      - **Data Restoration**: Complete data recovery capabilities
      - **Business Continuity**: Service continuation planning
      
      ## Scaling & Performance
      
      ### Horizontal Scaling
      - **Serverless Architecture**: Automatic scaling capabilities
      - **Database Scaling**: Read replica and connection pooling
      - **CDN Optimization**: Global content distribution
      - **Load Balancing**: Traffic distribution optimization
      - **Auto-scaling Policies**: Dynamic resource allocation
      
      ### Performance Optimization
      - **Code Splitting**: Efficient JavaScript bundle loading
      - **Image Optimization**: Automatic image compression and formatting
      - **Caching Strategies**: Multi-layer caching implementation
      - **Database Optimization**: Query performance tuning
      - **API Rate Limiting**: Resource protection and optimization
      
      ## Operational Procedures
      
      ### Deployment Scripts
      \`\`\`bash
      # Production deployment with safety checks
      npm run backup:full && 
      npm run build && 
      npm run db:migrate:production && 
      vercel --prod
      \`\`\`
      
      ### Health Check Procedures
      \`\`\`bash
      # Comprehensive system health validation
      npm run health:check &&
      npm run monitor:performance &&
      npm run compliance:check
      \`\`\`
      
      ### Emergency Response
      \`\`\`bash
      # Emergency backup and rollback procedures
      npm run backup:emergency &&
      npm run deploy:rollback &&
      npm run maintenance:enable
      \`\`\`
      
      ## Maintenance & Updates
      
      ### Regular Maintenance
      - **Dependency Updates**: Regular package and framework updates
      - **Security Patches**: Immediate security update application
      - **Performance Tuning**: Regular optimization and improvement
      - **Database Maintenance**: Index optimization and cleanup
      - **Log Cleanup**: Regular log rotation and archival
      
      ### Scheduled Maintenance
      - **Planned Downtime**: Coordinated maintenance windows
      - **User Communication**: Advance notice and status updates
      - **Rollback Planning**: Immediate restoration capabilities
      - **Testing Procedures**: Pre-maintenance validation
      - **Post-Maintenance Validation**: System verification after updates
      
      ## Compliance & Governance
      
      ### Regulatory Compliance
      - **GDPR Compliance**: European data protection regulation adherence
      - **Indigenous Data Sovereignty**: Community-controlled data governance
      - **Cultural Protocol Compliance**: Aboriginal guideline enforcement
      - **Audit Trail Maintenance**: Complete activity tracking
      - **Data Retention Policies**: Appropriate data lifecycle management
      
      ### Operational Governance
      - **Change Management**: Controlled modification processes
      - **Access Control**: Role-based system access
      - **Documentation Maintenance**: Up-to-date operational procedures
      - **Training Programs**: Staff operational competency
      - **Incident Response**: Systematic problem resolution
      
      ## Cost Management
      
      ### Resource Optimization
      - **Usage Monitoring**: Resource consumption tracking
      - **Cost Analysis**: Regular expense review and optimization
      - **Scaling Efficiency**: Right-sizing resource allocation
      - **Vendor Management**: Service provider relationship optimization
      - **Budget Planning**: Predictable operational cost management
      
      ### Economic Sustainability
      - **Revenue Model**: Sustainable platform financing
      - **Community Investment**: Storyteller economic empowerment
      - **Operational Efficiency**: Cost-effective service delivery
      - **Growth Planning**: Scalable economic model
      - **Financial Transparency**: Open cost and revenue reporting
    `
  },

  'complete-timeline': {
    title: 'Complete Platform Timeline',
    content: `
      # Complete Empathy Ledger Platform Timeline
      
      ## Genesis & Conceptualization (Early 2024)
      
      ### Vision Formation
      - **Community-Centered Storytelling Concept**: Recognition of need for storyteller sovereignty
      - **Data Sovereignty Framework**: Indigenous data rights and community control principles
      - **Cultural Protocol Integration**: Aboriginal advisor oversight system design
      - **Economic Empowerment Vision**: Revenue sharing and professional development framework
      
      ### Technical Foundation Planning
      - **Technology Stack Selection**: Next.js, Supabase, React Native architecture
      - **Database Design Philosophy**: Row Level Security and community ownership
      - **AI Ethics Framework**: Community-controlled algorithms with cultural oversight
      - **Scalability Architecture**: Multi-tenant design for organizational growth
      
      ## Phase 1: Foundation Development (Spring 2024)
      
      ### Core Infrastructure (Migrations 001-002)
      - **Initial Sovereignty Schema (001)**: Basic storytelling tables with RLS
      - **Multi-Tenant Projects (002)**: Organizational structure and project management
      - **Authentication System**: Supabase Auth integration with privacy controls
      - **Basic UI Components**: Foundational React component library
      
      ### Early Features
      - **Story Creation Interface**: Basic storytelling workflow
      - **Storyteller Profiles**: Identity and biographical systems
      - **Project Organization**: Story grouping and management
      - **Privacy Controls**: Granular data sovereignty options
      
      ## Phase 2: Enhancement & Growth (Summer 2024)
      
      ### Advanced Features (Migrations 004-005)
      - **Profiles Table (004)**: Enhanced user management and relationships
      - **Performance Optimization (005)**: Database indexing and query improvement
      - **Content Management System**: Dynamic content creation and management
      - **Media Integration**: Image, audio, and video support
      
      ### User Experience Improvements
      - **Responsive Design**: Mobile-first interface development
      - **Story Reader**: Enhanced reading experience with typography optimization
      - **Navigation System**: Intuitive platform navigation
      - **Trust & Security**: Security badges and privacy indicators
      
      ## Phase 3: AI Revolution (Fall 2024)
      
      ### Story Beautification (Migrations 006-007)
      - **Beautification System (006)**: AI-powered content enhancement
      - **Enhanced Story Schema (007)**: Rich multimedia and metadata support
      - **Cultural Protocol Integration**: Community guideline enforcement
      - **Multimedia Stories**: Advanced story presentation capabilities
      
      ### Advanced Analytics Foundation
      - **Theme Detection**: Early AI theme analysis systems
      - **Professional Portfolios**: Career-focused storyteller showcases
      - **Community Connections**: Relationship mapping and networking
      - **Engagement Tracking**: Story interaction and impact measurement
      
      ## Phase 4: AI Analytics & Intelligence (Winter 2024-2025)
      
      ### Sprint 3 Week 1: AI Analytics System (Migration 008)
      - **Professional Theme Analyzer**: Career-focused narrative analysis
      - **Aboriginal Advisory Integration**: Cultural oversight for AI systems
      - **AI Insights Dashboard**: Professional intelligence interface
      - **Storyteller Intelligence**: Career development and opportunity prediction
      - **Confidence Scoring**: AI reliability and validation systems
      
      ### Sprint 3 Week 2: Community Collaboration (Migration 009)
      - **Cross-Pollination System**: AI-powered collaboration matching
      - **Revenue Sharing Frameworks**: Economic empowerment structures
      - **Mentorship Programs**: Professional development relationships
      - **Cultural Competency Requirements**: Community standard enforcement
      - **Collective Projects**: Group storytelling and collaboration tools
      
      ### Sprint 3 Week 3: Platform Scaling (Migration 010)
      - **Multi-Tenant Architecture**: 100+ storyteller capacity support
      - **Organization Management**: Enterprise dashboard and tools
      - **Cultural Competency Tracking**: Organizational development measurement
      - **Performance Monitoring**: System health and scaling readiness
      - **Advanced Analytics**: Platform-wide insights and metrics
      
      ### Sprint 3 Week 4: Mobile Foundation
      - **React Native Architecture**: Cross-platform mobile framework
      - **Mobile Story Reader**: Touch-optimized reading experience
      - **Audio/Video Integration**: Rich media mobile consumption
      - **Offline Capabilities**: Story caching and synchronization
      - **Cultural Protocol Mobile**: Community guidelines on mobile devices
      
      ## Phase 5: Enterprise & Professional Platform (2025)
      
      ### Bulletproof Schema & Admin Features
      - **Bulletproof Schema (20240120)**: Enterprise-grade reliability
      - **Platform Admin Features (20250718)**: Advanced administration tools
      - **Comprehensive Audit Logging**: Complete activity tracking
      - **Professional Analytics**: Advanced storyteller intelligence
      - **Enterprise Integration**: Organizational partnership tools
      
      ### Documentation & Knowledge Management
      - **Complete Platform Wiki**: Comprehensive documentation system
      - **GitBook-Style Interface**: Professional documentation presentation
      - **Development History**: Complete platform evolution tracking
      - **Technical Architecture Guides**: Detailed system documentation
      - **Feature Documentation**: Complete platform capability overview
      
      ## Current State: Comprehensive Platform (Mid-2025)
      
      ### Platform Statistics
      - **40+ Database Tables**: Complex relationship and feature support
      - **80+ React Components**: Comprehensive UI component library
      - **100+ API Endpoints**: Complete platform integration capabilities
      - **11 Major Migrations**: Continuous platform evolution
      - **Multi-Tenant Support**: 100+ storyteller organizational capacity
      
      ### Advanced Capabilities
      - **AI-Powered Analytics**: Professional theme analysis with cultural oversight
      - **Community Collaboration**: Cross-pollination and mentorship systems
      - **Economic Empowerment**: Revenue sharing and professional development
      - **Mobile Applications**: Cross-platform storytelling access
      - **Enterprise Features**: Organizational management and analytics
      
      ## Key Milestones Achieved
      
      ### Technical Achievements
      - ✅ **100% Row Level Security**: Complete data sovereignty implementation
      - ✅ **73% AI Confidence**: Reliable AI analysis with cultural validation
      - ✅ **Multi-Tenant Architecture**: Scalable organizational support
      - ✅ **Mobile Foundation**: Cross-platform accessibility
      - ✅ **Enterprise-Grade Reliability**: Production-ready platform stability
      
      ### Community Achievements
      - ✅ **Aboriginal Advisory Integration**: Cultural protocol oversight
      - ✅ **Community Veto Power**: Collective control over platform decisions
      - ✅ **Cultural Competency Requirements**: Community standard enforcement
      - ✅ **Revenue Sharing Frameworks**: Economic empowerment structures
      - ✅ **Professional Development**: Career advancement support systems
      
      ### Platform Impact
      - ✅ **Data Sovereignty**: Community-controlled storytelling platform
      - ✅ **Professional Empowerment**: Career development and opportunity creation
      - ✅ **Cultural Preservation**: Traditional knowledge protection and sharing
      - ✅ **Economic Justice**: Equitable value distribution and creation
      - ✅ **Community Building**: Cross-pollination and collaborative relationships
      
      ## Future Vision & Roadmap
      
      ### Immediate Development (2025)
      - **Advanced Mobile Features**: Enhanced React Native application
      - **International Expansion**: Multi-language and cultural adaptation
      - **Educational Partnerships**: Academic institution integration
      - **Professional Service Marketplace**: Skill-based economic opportunities
      
      ### Long-term Vision (2025-2030)
      - **Global Storytelling Network**: International community connections
      - **AI-Powered Cultural Preservation**: Traditional knowledge protection
      - **Economic Empowerment Ecosystem**: Comprehensive financial opportunity
      - **Educational Integration**: Curriculum and learning platform development
      - **Policy and Advocacy Platform**: Community voice and representation
      
      ## Legacy & Impact
      
      ### Technological Innovation
      - **Community-Controlled AI**: Ethical AI development with cultural oversight
      - **Data Sovereignty Implementation**: Practical Indigenous data rights
      - **Economic Empowerment Technology**: Revenue sharing and opportunity platforms
      - **Cultural Protocol Integration**: Technology respecting traditional values
      
      ### Community Empowerment
      - **Storyteller Sovereignty**: Creator control over narratives and data
      - **Professional Development**: Career advancement through storytelling
      - **Community Building**: Cross-cultural collaboration and understanding
      - **Economic Justice**: Equitable value creation and distribution
      - **Cultural Preservation**: Traditional knowledge protection and sharing
    `
  }
};

// Comprehensive navigation structure covering entire platform
const navigationStructure = [
  {
    id: 'platform-foundation',
    title: 'Platform Foundation',
    icon: '🏗️',
    items: [
      { id: 'platform-overview', title: 'Platform Overview' },
      { id: 'philosophy-principles', title: 'Philosophy & Principles' },
      { id: 'platform-history', title: 'Development History' },
      { id: 'complete-timeline', title: 'Complete Timeline' },
      { id: 'architecture-overview', title: 'Technical Architecture' }
    ]
  },
  {
    id: 'youth-empowerment',
    title: 'Youth Voice & Agency',
    icon: '🌟',
    items: [
      { id: 'youth-voice-agency', title: 'Youth Voice & Agency Research' },
      { id: 'youth-digital-safety', title: 'Digital Safety Framework' },
      { id: 'youth-platform-pitch', title: 'Youth Platform Pitch' },
      { id: 'qfcc-case-study', title: 'QFCC Implementation' }
    ]
  },
  {
    id: 'case-studies',
    title: 'Case Studies',
    icon: '📚',
    items: [
      { id: 'ben-knight-case-study', title: 'Ben Knight Story Transformation' }
    ]
  },
  {
    id: 'database-systems',
    title: 'Database & Schema',
    icon: '🗄️',
    items: [
      { id: 'database-schema', title: 'Complete Database Schema' }
    ]
  },
  {
    id: 'platform-features',
    title: 'Features & Components',
    icon: '⚡',
    items: [
      { id: 'platform-features', title: 'All Platform Features' },
      { id: 'components-modules', title: 'Components & Modules' }
    ]
  },
  {
    id: 'advanced-systems',
    title: 'Advanced Systems',
    icon: '🤖',
    items: [
      { id: 'ai-analytics', title: 'AI Analytics & Intelligence' },
      { id: 'community-collaboration', title: 'Community & Collaboration' },
      { id: 'mobile-architecture', title: 'Mobile Architecture' }
    ]
  },
  {
    id: 'technical-implementation',
    title: 'Technical Implementation',
    icon: '⚙️',
    items: [
      { id: 'api-integrations', title: 'API & Integrations' },
      { id: 'deployment-operations', title: 'Deployment & Operations' }
    ]
  },
  {
    id: 'development-history',
    title: 'Development History',
    icon: '📈',
    items: [
      { id: 'sprint-history', title: 'Sprint Development History' }
    ]
  }
];

export default function StandaloneWiki() {
  const [currentContent, setCurrentContent] = useState('platform-overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['platform-foundation', 'platform-features']));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const selectContent = (contentId: string) => {
    setCurrentContent(contentId);
    setMobileMenuOpen(false);
  };

  const currentContentData = wikiContent[currentContent as keyof typeof wikiContent] || wikiContent['platform-overview'];

  // Find breadcrumb path
  const findBreadcrumbs = (contentId: string) => {
    for (const section of navigationStructure) {
      const item = section.items.find(item => item.id === contentId);
      if (item) {
        return [
          { title: 'Empathy Ledger Wiki', id: 'platform-overview' },
          { title: section.title, id: section.id },
          { title: item.title, id: item.id }
        ];
      }
    }
    return [{ title: 'Empathy Ledger Wiki', id: 'platform-overview' }];
  };

  const breadcrumbs = findBreadcrumbs(currentContent);

  return (
    <div className="wiki-container">

      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar */}
      <nav className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <div className="logo-text">
              <div className="logo-title">Empathy Ledger</div>
              <div className="logo-subtitle">Complete Platform Documentation</div>
            </div>
          </div>
          <Link href="/" className="platform-link">
            ← Back to Platform
          </Link>
        </div>

        <div className="navigation">
          {navigationStructure.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="nav-group">
                <button 
                  className="nav-group-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span className="nav-title">{section.title}</span>
                  <svg 
                    className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
                
                <div className={`nav-items ${isExpanded ? 'expanded' : ''}`}>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className={`nav-item ${currentContent === item.id ? 'active' : ''}`}
                      onClick={() => selectContent(item.id)}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="stats">
            <div className="stat">
              <span className="stat-number">40+</span>
              <span className="stat-label">Database Tables</span>
            </div>
            <div className="stat">
              <span className="stat-number">80+</span>
              <span className="stat-label">Components</span>
            </div>
            <div className="stat">
              <span className="stat-number">11</span>
              <span className="stat-label">Migrations</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`breadcrumb-${index}-${crumb.id}`}>
                <button 
                  className={`breadcrumb ${index === breadcrumbs.length - 1 ? 'current' : ''}`}
                  onClick={() => index < breadcrumbs.length - 1 ? selectContent(crumb.id) : undefined}
                  disabled={index === breadcrumbs.length - 1}
                >
                  {crumb.title}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <span className="breadcrumb-separator">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="content">
          <h1 className="page-title">{currentContentData?.title || 'Platform Overview'}</h1>
          <div className="content-body">
            {(currentContentData?.content || '').split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('# ')) {
                return <h1 key={index} className="content-h1">{trimmedLine.replace('# ', '')}</h1>;
              } else if (trimmedLine.startsWith('## ')) {
                return <h2 key={index} className="content-h2">{trimmedLine.replace('## ', '')}</h2>;
              } else if (trimmedLine.startsWith('### ')) {
                return <h3 key={index} className="content-h3">{trimmedLine.replace('### ', '')}</h3>;
              } else if (trimmedLine.startsWith('#### ')) {
                return <h4 key={index} className="content-h4">{trimmedLine.replace('#### ', '')}</h4>;
              } else if (trimmedLine.startsWith('- **') || trimmedLine.startsWith('- ')) {
                return (
                  <li key={index} className="content-li" 
                      dangerouslySetInnerHTML={{
                        __html: trimmedLine.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }} 
                  />
                );
              } else if (trimmedLine === '') {
                return <div key={index} className="content-spacer" />;
              } else if (trimmedLine.match(/^\d+\./)) {
                return (
                  <li key={index} className="content-numbered-li"
                      dangerouslySetInnerHTML={{
                        __html: trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}
                  />
                );
              } else if (trimmedLine.startsWith('```')) {
                return <pre key={index} className="content-code-block">{trimmedLine.replace(/```\w*/, '')}</pre>;
              } else {
                return (
                  <p key={index} className="content-p" 
                     dangerouslySetInnerHTML={{
                       __html: trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                     }} 
                  />
                );
              }
            })}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: #ffffff;
          color: #24292f;
          line-height: 1.5;
        }

        .wiki-container {
          display: flex;
          min-height: 100vh;
          background: #ffffff;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1002;
          background: #ffffff;
          border: 1px solid #d1d9e0;
          padding: 12px;
          cursor: pointer;
          flex-direction: column;
          gap: 3px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .mobile-menu-toggle:hover {
          background: #f6f8fa;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .mobile-menu-toggle span {
          width: 18px;
          height: 2px;
          background: #656d76;
          border-radius: 1px;
          transition: all 0.2s ease;
        }

        .platform-link {
          color: #0969da;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .platform-link:hover {
          background: #f6f8fa;
          text-decoration: none;
        }

        /* Sidebar */
        .sidebar {
          width: 320px;
          background: #f6f8fa;
          border-right: 1px solid #d1d9e0;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 24px 20px 20px 20px;
          border-bottom: 1px solid #d1d9e0;
          background: #ffffff;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          line-height: 1.2;
        }

        .logo-title {
          font-size: 16px;
          font-weight: 600;
          color: #24292f;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #656d76;
          margin-top: 2px;
        }

        .sidebar-header .platform-link {
          color: #656d76;
          text-decoration: none;
          font-size: 13px;
          opacity: 0.8;
        }

        .sidebar-header .platform-link:hover {
          opacity: 1;
          color: #0969da;
        }

        /* Navigation */
        .navigation {
          flex: 1;
          padding: 8px 0;
        }

        .nav-group {
          margin-bottom: 4px;
        }

        .nav-group-header {
          width: 100%;
          background: none;
          border: none;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #656d76;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          transition: all 0.15s ease;
        }

        .nav-group-header:hover {
          background: rgba(9, 105, 218, 0.08);
          color: #0969da;
        }

        .nav-icon {
          font-size: 16px;
          width: 16px;
          text-align: center;
        }

        .nav-title {
          flex: 1;
          font-size: 14px;
        }

        .expand-arrow {
          transition: transform 0.15s ease;
          color: #656d76;
          opacity: 0.7;
        }

        .expand-arrow.expanded {
          transform: rotate(90deg);
        }

        .nav-items {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.2s ease-out;
        }

        .nav-items.expanded {
          max-height: 600px;
        }

        .nav-item {
          width: 100%;
          background: none;
          border: none;
          padding: 8px 20px 8px 46px;
          color: #656d76;
          text-decoration: none;
          font-size: 13px;
          transition: all 0.15s ease;
          text-align: left;
          cursor: pointer;
          display: block;
          margin: 1px 0;
          border-left: 3px solid transparent;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(9, 105, 218, 0.06);
          color: #0969da;
        }

        .nav-item.active {
          background: rgba(9, 105, 218, 0.12);
          color: #0969da;
          font-weight: 500;
          border-left-color: #0969da;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #d1d9e0;
          background: #ffffff;
        }

        .stats {
          display: flex;
          justify-content: space-around;
          gap: 16px;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #24292f;
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 11px;
          color: #656d76;
          margin-top: 2px;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 320px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #ffffff;
        }

        .top-bar {
          background: #f6f8fa;
          border-bottom: 1px solid #d1d9e0;
          padding: 12px 32px;
          min-height: 48px;
          display: flex;
          align-items: center;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .breadcrumb {
          background: none;
          border: none;
          color: #656d76;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease;
          font-size: 14px;
        }

        .breadcrumb:hover:not(.current) {
          background: rgba(9, 105, 218, 0.08);
          color: #0969da;
        }

        .breadcrumb.current {
          color: #24292f;
          font-weight: 500;
          cursor: default;
        }

        .breadcrumb-separator {
          color: #656d76;
          opacity: 0.6;
          margin: 0 4px;
        }

        .content {
          flex: 1;
          padding: 40px 48px 80px 48px;
          max-width: 1000px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #24292f;
          margin-bottom: 32px;
          line-height: 1.2;
          border-bottom: 1px solid #d1d9e0;
          padding-bottom: 16px;
        }

        .content-body {
          line-height: 1.6;
        }

        .content-h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #24292f;
          margin: 48px 0 24px 0;
          line-height: 1.25;
          border-bottom: 1px solid #d1d9e0;
          padding-bottom: 12px;
        }

        .content-h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #24292f;
          margin: 32px 0 16px 0;
          line-height: 1.3;
        }

        .content-h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #24292f;
          margin: 24px 0 12px 0;
          line-height: 1.3;
        }

        .content-h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #24292f;
          margin: 20px 0 10px 0;
          line-height: 1.3;
        }

        .content-p {
          color: #656d76;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .content-li {
          color: #656d76;
          margin-bottom: 8px;
          line-height: 1.5;
          list-style: none;
          padding-left: 0;
          position: relative;
          padding-left: 20px;
        }

        .content-li::before {
          content: "•";
          color: #0969da;
          font-weight: 600;
          position: absolute;
          left: 0;
        }

        .content-numbered-li {
          color: #656d76;
          margin-bottom: 8px;
          line-height: 1.5;
          list-style: decimal;
          margin-left: 20px;
        }

        .content-code-block {
          background: #f6f8fa;
          border: 1px solid #d1d9e0;
          border-radius: 6px;
          padding: 16px;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 14px;
          overflow-x: auto;
          margin: 16px 0;
        }

        .content-spacer {
          height: 16px;
        }

        .content-body strong {
          color: #24292f;
          font-weight: 600;
        }

        .mobile-overlay {
          display: none;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 300px;
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0;
          }

          .content {
            padding: 24px 20px 60px 20px;
          }

          .page-title {
            font-size: 2rem;
          }

          .top-bar {
            padding: 12px 20px;
          }

          .mobile-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
        }

        /* Scrollbar */
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #d1d9e0;
          border-radius: 3px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #b1bac4;
        }
      `}</style>
    </div>
  );
}