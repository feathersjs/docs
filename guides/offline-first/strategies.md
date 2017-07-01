# Strategies

## Comparison of Strategies

Feathers offline-first provides several increasingly sophisticated strategies.
Its generally straightforward to change your application to use a more sophisticated one (except for snapshot).

> **ProTip:** The snapshot, realtime, and realtime with optimistic mutation strategies are available at this time.

The features for each strategy are shown below.


| Feature                           | snap shot | real time | optimistic mutation | own-data | own-net | sync-data | sync-net | time-travel |
|-----------------------------------|-----------|-----------|---------------------|----------|---------|-----------|----------|-------------|
|**Replicate partial table**        | Y         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
| - Using query syntax              | Y         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
| - Using JS functions              | -         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
| **Replicate to client**           | Y         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
| **Is a uuid field required?**     | -         | -         | Y                   | Y        | Y       | Y         | Y        |             |
|                                   |           |           |                     |          |         |           |          |             |
| **Snapshot data at startup**      | Y         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
| **Remote changes mutate client**  | -         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
| - Minimize service events         | -         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
| **Client changes mutate remote**  | -         | -         | Y                   | Y        | Y       | Y         | Y        |             |
| **Keep queue while disconnected** |           |           |                     |          |         |           |          |             |
| - Keep every call                 | -         | -         | -                   | Y        | -       | Y         | -        |             |
| - Only record net change          | -         | -         | -                   | -        | Y       | -         | Y        |             |
|                                   |           |           |                     |          |         |           |          |             |
| **Process queue on reconnection** | -         | -         | -                   | Y        | Y       | Y         | Y        |             |
| - Conflict resolution handling    | -         | -         | -                   | -        | -       | Y         | Y        |             |
| **Snapshot on reconnect**         | -         | Y         | Y                   | Y        | Y       | Y         | Y        |             |
|                                   |           |           |                     |          |         |           |          |             |
| **Repository**                    | feathers-offline-snapshot | feathers-offline-realtime | feathers-offline-realtime/ optimistic-mutator |          |         |           |          |             |