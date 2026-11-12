# 01: Todo storage foundation

**What to build:** Establish the data model and local browser persistence for the personal todo app so the UI can safely read and write todo data without mixing storage logic into the interface.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Define the todo data shape with text, category, completion state, and timestamps.
- [ ] Store and retrieve todos from browser localStorage through a dedicated storage module.
- [ ] Keep the storage API easy to replace later with a database-backed implementation.
