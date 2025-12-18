# ≡ƒôû How to Use BillDoors-NotGates: Complete Guide by @Jaime-Lannister

## Start Here: Your First 5 Minutes

---

## ≡ƒÄ» Step 1: Open the Space

Click the BillDoors-NotGates Space link and you'll see a chat interface.

**That's it. You're in.**

---

## ≡ƒÆ¼ Step 2: Describe Your Website Idea

In the chat box, type something like:

**Example 1 (Beginner):**
```
"I want to build a personal portfolio website to showcase my design work. 
I'm a complete beginner with coding. Help?"
```

**Example 2 (Intermediate):**
```
"I want to build a task management app with user authentication. 
I know React but never built a backend. What's the best stack?"
```

**Example 3 (Advanced):**
```
"Building a real-time collaboration app for 10K users. 
Should I use WebSockets or Server-Sent Events?"
```

**Example 4 (Troubleshooting):**
```
"I'm getting this error: 'CORS policy blocked'. 
Here's my code: [paste code]. How do I fix it?"
```

---

## ≡ƒñû Step 3: BillDoors Responds (Skill Calibration)

**First time users** - BillDoors will ask:

```
"Quick questions before we start:

1. How experienced are you with coding?
   A) Complete beginner
   B) I know the basics
   C) Pretty experienced

2. Have you built websites before?
   A) Never touched code
   B) Created simple projects
   C) Built multiple apps

3. How detailed should explanations be?
   A) Explain everything
   B) Balance depth with speed
   C) Quick overview"
```

**Just answer honestly.** This helps BillDoors adjust explanations to your level.

---

## ≡ƒôï Step 4: Phase 1 - Planning & Architecture

**BillDoors will create a comprehensive plan:**

```
≡ƒôî PROJECT OVERVIEW
Vision: Personal portfolio for design work
Target Users: Potential clients, employers
Success Metric: Clients contacting through portfolio

Γ£à PROS (Why This Works)
- Portfolio sites are simple to build
- Great portfolio = good hiring signal
- Fast to prototype

Γ¥î CONS (Real Limitations)
- Need quality design work to showcase
- Photography/image optimization matters
- SEO important for discovery

≡ƒÆí ADVANTAGES
- Portfolio is permanent asset
- Shows real design skills
- Can be rebuilt as skills improve

ΓÜá∩╕Å DISADVANTAGES
- Outdated portfolio looks bad
- Need to maintain content
- Design trends change

≡ƒÄ» FEASIBILITY: YES - 2-4 weeks
- Not complex
- Beginner-friendly
- Great learning project

≡ƒôÉ RECOMMENDED TECH STACK
Frontend: React (modern, popular)
Hosting: Vercel (fast, free)
...

[More detailed analysis]
```

**Then BillDoors asks:**

```
"Does this plan work for you?
1. Any concerns?
2. Any pivots needed?
3. Ready to start building?"
```

**Just say "Yes, let's go!"** or suggest changes.

---

## ≡ƒ¢á∩╕Å Step 5: Phase 2 - Development Setup

BillDoors guides you through environment setup:

```
STEP 1: Install VS Code
- Download from code.visualstudio.com
- Install it
ΓåÆ Tell me when you're done

STEP 2: Install Node.js
- Download from nodejs.org (LTS version)
- Install it
- Open terminal, type: node --version
ΓåÆ Tell me what version you see

STEP 3: Install Git
- Download from git-scm.com
- Install it
ΓåÆ Tell me when done
```

**After each step, BillDoors asks:** "Done? Any issues?"

**Just reply:** "Yes, done!" or "Error: [describe]"

**No rushing.** BillDoors waits for confirmation before moving forward.

---

## ≡ƒÆ╗ Step 6: Phase 3 - Coding Begins

**BillDoors gives you code in small pieces:**

```
"Alright, let's build your Header component.

WHY: Every page needs a header (logo, navigation). 
Instead of repeating code, we make it a reusable component.

HERE'S THE CODE:
```
FILE: src/components/Header.js

import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <h1>My Portfolio</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/portfolio">Portfolio</a>
      </nav>
    </header>
  );
}
```

WHAT THIS DOES:
- Creates a reusable Header component
- Shows title and navigation links
- When rendered, users see it at top of every page

WHY THIS APPROACH:
- Functional components are modern React standard
- Easy to reuse instead of repeating HTML
- Clean separation of concerns

ΓÜá∩╕Å COMMON ERRORS:
| Error | Cause | Fix |
|-------|-------|-----|
| 'Header is not defined' | Forgot to export | Add 'export default' |
| Nothing shows | Forgot to import in parent | Add import statement |
| Styling wrong | CSS class mismatch | Check className matches CSS |

CHECKPOINT:
Γ£ô Have you created file at src/components/Header.js?
Γ£ô Pasted this code exactly?
Γ£ô No errors in console?

Tell me when done!"
```

**You:**
- Create the file
- Copy-paste the code
- Tell BillDoors when done

**BillDoors:**
- Asks if you got errors
- Explains any issues
- Moves to next piece

---

## Γ£à Step 7: Checkpoints After Each Piece

**This is the special sauce.**

After EVERY code block, BillDoors asks:

```
"Are you done adding this code?

Do you:
ΓÿÉ Have the file created?
ΓÿÉ Have code pasted?
ΓÿÉ See it in browser? (or error?)
ΓÿÉ Have any questions?

Just tell me!"
```

**If you have an error:**

```
You: "Getting error: 'undefined is not a function'"

BillDoors: 
"That's a common one. It means [explanation].
Here's the fix: [solution]
Try this and let me know."
```

**No skipping.** Every piece is verified before moving forward.

---

## ≡ƒôè Step 8: Progress Visualization

After each component/feature, BillDoors shows:

```
Γ£à Header Component (Complete)
Γ£à Navigation Styling (Complete)
ΓÅ│ Hero Section (IN PROGRESS - 60% done)
Γ¼£ Feature Cards
Γ¼£ Footer
Γ¼£ Contact Form
Γ¼£ Backend API Setup
Γ¼£ Database Integration

Progress: 30% of project complete
Time spent: ~2 hours
Estimated time remaining: ~5 hours
```

**This keeps you motivated.** You can see what you've built!

---

## ≡ƒÄ» Step 9: Decision Log Reference

Throughout the project, BillDoors maintains a Decision Log:

```
| Decision | Options | Chosen | Why | Trade-offs |
|----------|---------|--------|-----|-----------|
| Frontend Framework | React/Vue/Angular | React | Huge ecosystem, easy to learn | Overkill for small sites |
| Styling | CSS/Tailwind/Styled Components | Tailwind | Fast prototyping, utility-first | Larger CSS file |
| Hosting | Vercel/Netlify/AWS | Vercel | Free, simple, auto-deploy | Less control |
```

**You can always ask:**
```
"Why did we choose Tailwind for styling?"

BillDoors: 
"Good question. We chose Tailwind because:
1. Fast prototyping with utility classes
2. No need to write custom CSS
3. Works great with React
4. Free to use

The trade-off: The CSS file is larger than custom CSS.
But for beginners, speed > optimization."
```

---

## ≡ƒÜÇ Step 10: Deploy Your App (Phase 6)

After code is complete and tested:

```
"Your app is working locally! Now let's deploy.

OPTION 1: Vercel (Recommended)
- Takes 5 minutes
- Free tier
- Auto-deploy when you push to GitHub

OPTION 2: AWS EC2
- More control
- $5-50/month
- 30-60 minutes setup

OPTION 3: GCP
- Similar to AWS
- Google ecosystem
- Good free tier

Which would you like?"

You: "Vercel, easy!"

BillDoors:
"Perfect. Here's exactly what to do:

STEP 1: Push code to GitHub
git add .
git commit -m "Portfolio ready"
git push origin main

[Step-by-step guide continues...]

After each step: 'Done? Any issues?'"
```

**When it's done:**

```
"≡ƒÄë Your portfolio is LIVE!

Visit: https://your-portfolio.vercel.app

Congratulations! You:
Γ£ô Built a real website
Γ£ô Deployed to production
Γ£ô Learned full-stack skills
Γ£ô Have a portfolio piece for jobs

What's next?"
```

---

## ≡ƒô₧ Common Scenarios & How to Respond

### Scenario 1: You Get an Error
```
You: "Error: Cannot read property 'map' of undefined"

BillDoors will:
1. Ask for exact error + code
2. Search Common-Errors-Guide.md
3. Explain the problem
4. Give solution
5. Verify it works

You just need to tell it: "Getting this error: [exact error]"
```

### Scenario 2: You're Confused
```
You: "Wait, why are we using hooks instead of classes?"

BillDoors will:
1. Explain hooks (modern approach)
2. Explain classes (older approach)
3. Why hooks are recommended
4. When you might use classes

Just ask! That's what it's for."
```

### Scenario 3: You Want to Pivot
```
You: "Actually, I want to build a blog instead of portfolio"

BillDoors will:
1. Go back to Phase 1
2. Re-evaluate for blog
3. Discuss implications
4. Update plan
5. Continue from appropriate phase

Just tell it: "I want to change direction to [new idea]"
```

### Scenario 4: You're Stuck on Deployment
```
You: "My site isn't deploying to Vercel. Getting build error."

BillDoors will:
1. Ask for exact build error
2. Reference Deployment-Cheatsheet.md
3. Walk through troubleshooting
4. Fix and verify

Just paste the error and say: "Help me fix this"
```

---

## ≡ƒÄô Learning Tips While Using BillDoors

### Tip 1: Don't Copy-Paste Blindly
- **Read** the code first
- Understand **what it does**
- Then type it out (not paste)
- This makes it stick

### Tip 2: Ask "Why?" Frequently
```
You: "Why are we using useState here?"

Don't just accept answer - dig deeper:
You: "Why not just use a normal variable?"

BillDoors explains the difference
```

### Tip 3: Break Before Moving On
```
After each component, take 5 minutes:
- Play with the code
- Change things
- See what breaks
- Ask BillDoors why it broke

This is how real learning happens!
```

### Tip 4: Reference the Decision Log
```
You: "Hmm, I'm not sure about this choice..."

Just check the Decision Log:
"Oh right, we chose this because X trade-off"

Prevents second-guessing!
```

---

## ΓÜí Quick Command Reference

### When Starting
```
"I want to build a [type] website. Here's my idea: [describe]"
```

### When Stuck
```
"I'm getting this error: [paste exact error]"
"I don't understand why we [did this]"
"Can you explain [concept]?"
```

### When Done With Step
```
"Done with that step!"
"Added the code, no errors"
"Ready for next part"
```

### When Deploying
```
"I'm ready to deploy"
"How do I put this on the internet?"
"What's the deployment process?"
```

### When Confused
```
"Wait, I'm lost. Can you summarize where we are?"
"What files have we created so far?"
"Can you show me the Decision Log again?"
```


## ≡ƒÄ» What NOT to Do

### Γ¥î Don't Skip Checkpoints
```
BillDoors: "Are you done adding this code?"
You: [ignore and move on]
```
**This breaks the system.** The checkpoints catch errors early.

### Γ¥î Don't Copy-Paste Without Reading
```
You just paste code without understanding it
```
**You'll get stuck later.** Read and type, don't paste.

### Γ¥î Don't Ignore Errors
```
You: "There's an error but I'll ignore it"
```
**Errors compound.** Fix them immediately with BillDoors' help.

### Γ¥î Don't Rush Through Planning
```
BillDoors: "Here's the plan..."
You: "Just code, skip planning!"
```
**Bad idea.** Planning prevents building the wrong thing.

---

## ≡ƒÜÇ Success Checklist

By the end, you should have:

```
Γ£à Website running locally on your computer
Γ£à Code on GitHub (version controlled)
Γ£à Site deployed to internet (live URL)
Γ£à Understanding of every decision made
Γ£à Ability to explain your code
Γ£à Skills to build next project faster

If you're missing any of these, ask BillDoors to revisit!
```

---

## ≡ƒô₧ When to Ask BillDoors for Help

**Good times to ask:**
- Getting an error
- Don't understand a concept
- Stuck on a step
- Want alternatives
- Ready to move to next phase
- Code isn't working as expected
- Need deployment help

**BillDoors is there for all of these!**

---

## ≡ƒÄô After Your First Project

**You're now capable of:**
- Planning a website
- Setting up development environment
- Writing frontend code
- Writing backend code (if you went full-stack)
- Testing your work
- Deploying to production

**Next steps:**
- Build a second project (faster this time!)
- Tackle advanced topics (real-time features, payments, etc.)
- Join developer communities
- Contribute to open source
- Get hired! (Your portfolio helps!)

---

## ≡ƒÆ¼ Final Tips

1. **Be specific** - The more detail, the better help you get
2. **Be patient** - Don't rush through checkpoints
3. **Be curious** - Ask "why" frequently
4. **Be active** - Type code, don't just paste
5. **Be honest** - Tell BillDoors when confused

**You're ready! Start with your website idea and let BillDoors guide you.** ≡ƒÜÇ
Good luck building! ≡ƒöÑ
@Jaime-Lannister