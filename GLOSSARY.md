# Glossary

This glossary defines the project vocabulary used in this repository.

## Todo

A single item of work that a user wants to remember, track, or complete.

## Task

The same concept as a todo item. Use "todo" as the primary project term, and "task" only as a general everyday synonym when it is more natural in prose.

## Category

A user-defined label that groups related todos, such as work, personal, shopping, or health.

## Completed

A todo whose work is done and marked as finished by the user.

## Remaining

A todo that is still incomplete and therefore counts toward the remaining task total.

## Sort order

The rule used to arrange the visible list of todos, such as newest first, oldest first, alphabetical order, or completed items last.

## Local persistence

A browser-based storage mechanism that keeps data on the user's device without a backend. In this project, it is implemented using localStorage.

## Storage module

The dedicated code layer responsible for reading and writing persisted data. This module is intentionally separated from the UI so the app can migrate to a database later without rewriting the interface logic.

## App screen

The single main interface where the user adds, edits, completes, removes, and sorts todos.

## Custom category

A category created by the user beyond the defaults provided by the app.

## Date

The current day as shown in the interface for planning context.
