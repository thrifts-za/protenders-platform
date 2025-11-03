Update migration progress after completing a task or milestone.

Steps:
1. Ask user what was completed
2. Update .claude/migration-status.md:
   - Check off completed tasks [x]
   - Update progress percentages
   - Update "Last Updated" timestamp
   - Add entry to Update History section
3. Update .claude/project-context.md:
   - Update "Last Updated" timestamp
   - Update "Current Phase" if changed
   - Update task checklists
   - Update status tables
4. Commit changes with message: "Update migration progress: [what changed]"
5. Display updated status summary

Always update BOTH files to keep them in sync.
