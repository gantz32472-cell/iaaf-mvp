# DM Reply Templates

This document describes DM reply optimization helpers.

## API

`GET /api/dm-rules/templates`

Returns predefined templates for quick setup in DM Rules UI.

## Behavior updates

- `targetUrl` is appended to outgoing `reply1` text if not already included.
- `cooldownHours` is now enforced:
  - same user + same rule within cooldown window -> no additional reply is sent.

