# Strategies

### Comparison of Strategies

Feathers offline-first provides several increasingly sophisticated strategies.
Its generally straightforward to change your application to use a more sophisticated one (except for snapshot).

> **ProTip:** The snapshot and realtime (with optimistic mutation while connected) strategies
are available at this time.

The features for each strategy are shown below.


| Feature...................        | snap shot | real time | optimistic mutation | own-data own-net | sync-data sync-net | time-travel |
|-|-|-|-|-|-|-|
| **Replicate partial table**       |           |           |                     |          |           |             |
| - using query syntax              | Y         | Y         | Y                   | Y        | Y         |             |
| - using JS functions              | -         | Y         | Y                   | Y        | Y         |             |
| **Snapshot data on connect**      | Y         | Y         | Y                   | Y        | Y         |             |
| **Is a uuid(1) field required?**  | -         | -         | Y                   | Y        | Y         |             |
|                                   |           |           |                     |          |           |             |
| **Remote changes mutate client**  | -         | Y         | Y                   | Y        | Y         |             |
| - minimal service events          | -         | Y         | Y                   | Y        | Y         |             |
|                                   |           |           |                     |          |           |             |
| **Client can mutate remote data** |           |           |                     |          |           |             |
| - with remote service calls       | -         | Y         | Y                   | Y        | Y         |             |
| - optimistic client mutation      | -         |           | Y                   | Y        | Y         |             |
| **Keep queue while disconnected** |           |           |                     |          |           |             |
| - Keep every call                 | -         | -         | -                   | own-data | sync-data |             |
| - Only record net change          | -         | -         | -                   | own-net  | sync-net  |             |
|                                   |           |           |                     |          |           |             |
| **Process queue on reconnection** | -         | -         | -                   | Y        | Y         |             |
| - Conflict resolution handling    | -         | -         | -                   | -        | Y         |             |
| **Snapshot data on reconnect**    | -         | Y         | Y                   | Y        | Y         |             |
|                                   |           |           |                     |          |           |             |
| **Repository**                    | (2) | (3) | (4) | tba | tba | tba | tba |

> **ProTip:** Note that the realtime strategy supports optimistic mutation only while connected.

> **ProTip:** It is also your responsibility to inform the replicator when a connection
is (re)established or lost using `replicator.connect()` and `replicator.disconnect()`.
A repo handling this for both browser and react native is planned but not yet avalilable.

- (1) [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) (uuid)
- (2) feathers-offline-snapshot
- (3) feathers-offline-realtime
- (4) feathers-offline-realtime with /optimistic-mutator
