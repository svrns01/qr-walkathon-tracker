# QR Walkathon Tracker

## Objective

Track participants across the complete walkathon route using
QR codes scanned at checkpoints.

## Participants

- Initial participants imported from Excel
- Approximately 200 participants
- Admin can add participants
- Admin can edit participants
- Admin can mark participants as dropped out
- Admin can reactivate participants
- Participants can join during the event

## QR

- One unique QR per participant
- Same QR used throughout the 6-day event
- QR printed on physical ID card
- QR contains an opaque token

## Checkpoints

- 6-day walkathon
- 34 checkpoints/event locations
- Admin can add/edit/disable checkpoints
- Volunteers are assigned to checkpoints

## Scanning

- QR scanning through PWA
- Latest scan wins if scanned twice at same checkpoint
- Invalid QR rejected
- Dropped-out participant rejected
- Actual scan time recorded

## Offline

- Scanner works without internet
- Offline scans stored locally
- Automatic synchronization when online
- Duplicate synchronization prevented