# .claude Directory - Project Intelligence Center

> **Purpose:** Living documentation system for AI agents and developers
>
> **Philosophy:** Keep it 200% up-to-date with every progress milestone
>
> **Last Updated:** 2024-11-03 08:00 UTC

---

## 📁 Directory Structure

```
.claude/
├── README.md                    # This file - overview and protocols
├── project-context.md          # Current project state (ALWAYS READ FIRST)
├── migration-status.md         # Detailed progress tracking
├── settings.local.json         # Claude Code permissions
└── commands/                   # Slash commands for quick actions
    ├── status.md              # /status - Check current progress
    ├── update-progress.md     # /update-progress - Update tracking docs
    ├── next-task.md           # /next-task - Get next priority task
    ├── migrate-api.md         # /migrate-api - Migrate an API route
    └── check-blockers.md      # /check-blockers - View and resolve blockers
```

---

## 🎯 Purpose & Philosophy

### Why This Directory Exists

1. **Single Source of Truth:** All AI agents and developers start here
2. **Always Current:** Updated after every milestone (200% accuracy)
3. **Contextual Awareness:** Provides complete project context instantly
4. **Progress Tracking:** Real-time status of migration phases
5. **Quick Actions:** Slash commands for common operations

### The 200% Rule

**Principle:** Update these docs BEFORE marking any task complete

**Why 200% and not 100%?**
- 100% = "We did the work"
- 200% = "We did the work AND documented it accurately"

This ensures documentation never lags behind reality.

---

## 📋 File Descriptions

### 1. project-context.md

**Purpose:** High-level project overview and current state

**Update Frequency:** After every significant milestone

**Contains:**
- Project overview and tech stack
- Codebase locations (old and new)
- Current migration phase
- Infrastructure details
- Key commands
- Next immediate actions

**When to update:**
- ✅ After completing a migration phase
- ✅ After fixing critical bugs
- ✅ After infrastructure changes
- ✅ After deployment
- ✅ When priorities change

### 2. migration-status.md

**Purpose:** Detailed progress tracking for all migration phases

**Update Frequency:** After completing ANY task

**Contains:**
- Phase-by-phase progress
- Task checklists with completion status
- Current blockers (P0, P1, P2)
- Timeline with target dates
- Metrics and visualizations
- Update history

**When to update:**
- ✅ After completing any task (mark [x])
- ✅ After discovering a blocker
- ✅ After resolving a blocker
- ✅ When starting a new phase
- ✅ When adjusting timeline estimates

### 3. commands/

**Purpose:** Reusable slash commands for common operations

**Available Commands:**
- `/status` - Quick status check
- `/update-progress` - Update tracking documents
- `/next-task` - Get next priority task
- `/migrate-api [name]` - Migrate an API route
- `/check-blockers` - View and resolve blockers

**How to use:**
Simply type the command in your conversation with Claude Code.

---

## 🔄 Update Protocol

### The Sacred Update Workflow

**RULE:** Update docs → Commit → THEN mark task complete

```bash
# Bad ❌
git add src/
git commit -m "Fixed TypeScript errors"
# (Forgot to update .claude docs!)

# Good ✅
1. Fix the TypeScript errors
2. Update .claude/migration-status.md (mark tasks complete)
3. Update .claude/project-context.md (update current phase)
4. git add .
5. git commit -m "Fix TypeScript errors + update migration status"
```

### Commit Message Format

When updating .claude docs, use clear commit messages:

```
✅ Good examples:
- "Update migration status: TypeScript errors fixed"
- "Update project context: Prisma configured"
- "Migration progress: Search API migrated to Next.js"

❌ Bad examples:
- "Update docs"
- "Changes"
- "WIP"
```

---

## 🤖 For AI Agents

### Before Starting ANY Task

1. **Read project-context.md** - Get current state
2. **Read migration-status.md** - Check blockers and progress
3. **Verify priorities** - Ensure you're working on highest priority
4. **Check dependencies** - Make sure prerequisites are met

### After Completing ANY Task

1. **Update migration-status.md:**
   - Mark task complete [x]
   - Update progress percentage
   - Add update history entry
   - Update "Last Updated" timestamp

2. **Update project-context.md:**
   - Update "Current Phase" if changed
   - Update task checklists
   - Update "Last Updated" timestamp
   - Update "Next Immediate Actions"

3. **Commit changes:**
   ```bash
   git add .claude/
   git commit -m "Update migration progress: [what you completed]"
   ```

4. **Announce completion:**
   Tell the user what you completed and what's updated in docs.

### When Discovering Blockers

1. **Document immediately** in migration-status.md:
   - Add to Blockers section
   - Assign priority (P0/P1/P2)
   - Describe impact
   - Propose solution

2. **Update project-context.md:**
   - Add to Critical Blocker section if P0
   - Adjust "Next Immediate Actions"

3. **Alert user:**
   Notify about blocker and suggested resolution path.

---

## 👥 For Human Developers

### Getting Started

1. Read `.claude/project-context.md` first
2. Check `.claude/migration-status.md` for current progress
3. Use `/status` command for quick overview
4. Use `/next-task` to see what to work on

### After Completing Work

**You MUST update the .claude docs!**

```bash
# 1. Update the tracking files
nano .claude/migration-status.md
nano .claude/project-context.md

# 2. Mark tasks complete with [x]
# 3. Update timestamps
# 4. Commit with descriptive message

git add .claude/
git commit -m "Update migration progress: [task name]"
git push
```

### Slash Commands

Use these for quick actions:
- `/status` - See current progress
- `/check-blockers` - View blockers
- `/next-task` - Get next task
- `/update-progress` - Interactive update helper
- `/migrate-api search` - Migrate search API

---

## 📊 Progress Tracking Guidelines

### What to Track

**DO Track:**
- ✅ Task completion (mark with [x])
- ✅ Blockers discovered or resolved
- ✅ Phase transitions
- ✅ Time estimates (actuals vs estimates)
- ✅ Infrastructure changes
- ✅ Deployment milestones

**DON'T Track:**
- ❌ Minor code style changes
- ❌ Comment updates
- ❌ Trivial refactoring
- ❌ Documentation typo fixes (outside .claude/)

### Progress Percentage Calculation

```
Phase Progress = (Completed Tasks / Total Tasks) × 100

Example:
Phase 2 (Type System):
- Completed: 10 fixes
- Remaining: 5 fixes
- Progress: (10 / 15) × 100 = 67%
```

Update percentages after each task completion.

---

## 🚨 Critical Rules

### The 10 Commandments of .claude

1. **Thou shalt read project-context.md before starting work**
2. **Thou shalt update docs after every milestone**
3. **Thou shalt mark tasks complete with [x]**
4. **Thou shalt update timestamps**
5. **Thou shalt document blockers immediately**
6. **Thou shalt keep progress percentages accurate**
7. **Thou shalt commit .claude changes separately**
8. **Thou shalt use descriptive commit messages**
9. **Thou shalt not let docs become stale**
10. **Thou shalt maintain 200% accuracy**

### Breaking the Rules

If docs become out of sync:
1. **Stop all work immediately**
2. **Audit current state**
3. **Update all .claude docs to reflect reality**
4. **Commit corrections**
5. **Resume work**

**Never** let docs lag more than 1 task behind reality.

---

## 🎯 Success Metrics

### How to Know Docs Are Healthy

**Good Signs ✅:**
- Timestamps are recent (within last work session)
- Task checkboxes reflect actual completion
- Progress percentages match reality
- No P0 blockers undocumented
- "Next Immediate Actions" is accurate

**Bad Signs ❌:**
- Timestamps are days old
- Completed work not checked off
- Progress percentages way off
- Known blockers not documented
- "Next actions" list stale tasks

### Monthly Audit

Once per month, do a full audit:
1. Verify all task statuses
2. Recalculate all progress percentages
3. Clean up completed phases
4. Archive outdated information
5. Commit audit results

---

## 📝 Templates

### Adding New Commands

Create: `.claude/commands/your-command.md`

```markdown
Brief description of what this command does.

Steps:
1. First step
2. Second step
3. Third step

Output format:
- What to display
- How to format it
```

### Adding New Tracking Documents

If you need a new tracking doc:
1. Create file in `.claude/` directory
2. Add to this README
3. Document update protocol
4. Link from project-context.md

---

## 🔗 Quick Links

### Internal Docs
- [Project Context](.claude/project-context.md)
- [Migration Status](.claude/migration-status.md)
- [Commands](.claude/commands/)

### External Docs
- [Migration Plan](../Plans/COMPREHENSIVE_MIGRATION_DOCUMENTATION.md)
- [Render Config](../Plans/RENDER_CONFIGURATION.md)
- [Deployment Guide](../Plans/DEPLOYMENT_GUIDE.md)

### Codebase Locations
- **New Platform:** `/Users/nkosinathindwandwe/DevOps/protenders-platform`
- **Old TenderAPI:** `/Users/nkosinathindwandwe/DevOps/TenderAPI`
- **GitHub:** https://github.com/thrifts-za/protenders-platform

---

## 💡 Pro Tips

### For Maximum Efficiency

1. **Use slash commands** - Faster than manual doc reading
2. **Update in real-time** - Don't wait until end of day
3. **Commit docs separately** - Makes history cleaner
4. **Be specific** - "Fixed 10 TypeScript errors" > "Fixed some errors"
5. **Link to commits** - Reference Git commits in updates

### Common Pitfalls to Avoid

❌ **Batch updates** - Don't update docs once per day
✅ **Incremental updates** - Update after each task

❌ **Vague descriptions** - "Made progress"
✅ **Specific details** - "Migrated search API, added error handling"

❌ **Stale timestamps** - From yesterday
✅ **Current timestamps** - From this session

❌ **Unchecked completed tasks** - [ ] Done but not marked
✅ **Checked off immediately** - [x] Done and documented

---

## 🎉 Conclusion

This .claude directory is the **brain** of the project. It knows:
- Where we are (current state)
- Where we're going (next tasks)
- What's blocking us (P0/P1 issues)
- How to get there (commands and docs)

**Keep it alive. Keep it accurate. Keep it 200%.**

---

**Questions?** Update this README!

**Found a better way?** Update the protocol and document it!

**Docs out of sync?** Stop and fix them immediately!

---

**Last Updated:** 2024-11-03 08:00 UTC
**Maintained By:** Everyone (AI agents + developers)
**Accuracy Target:** 200%
