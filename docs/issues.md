# Issues

These are some observed bugs that we're looking into fixing.

## UI

- Mobile UI is "busted."

## Posts

- New posts do not render properly when first added to lists.
  - They render properly upon refresh.

## Masquerading

- Masquerading remains after clearing the database.
  - This is because masquerade data is stored in local storage.

## Text Input

- Having multiple windows open can break the text input.
  - I believe this is an issue with auto-saving.
- Autocomplete for hashtags and mentions needs to be improved.
  - It places the box in the wrong location, especially when a lot of text has been entered beforehand.
  - It places the cursor in the middle of the word rather than at the end.

## Search

- Search results show items multiple times and out of order.

## Other

- There appears to be a way to [accidentally] add an agent to the bibliography.
