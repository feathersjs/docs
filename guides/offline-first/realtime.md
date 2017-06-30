# Realtime

## What is the Realtime strategy?

> Realtime is also commonly called transactional replication.

Realtime typically starts with a snapshot of the remote database data.
As soon as the initial snapshot is taken,
subsequent data changes made at the remote are delivered to the client as they occur (in near real time).
The data changes are applied at the client in the same order as they occurred at the remote.

Realtime is appropriate in each of the following cases:
- You want incremental changes to be propagated to clients as they occur.
- The application requires low latency between the time changes are made at the remote and the changes arrive at the client.
- The application requires access to intermediate data states.
For example, if a row changes five times, realtime allows an application to respond to each change
(such as running hooks), not simply to the net data change to the row.
- The remote has a very high volume of create, update, patch, and remove activity.

## Realtime Case Study

Let's consider an application which shows historical stock prices.

![stock price panel](./assets/realtime-3a.jpg)

The realtime strategy would snapshot the initial historical data.
It would then update the local data with every addition or other mutation made on the remote.


#### Sources:

- (*) [Microsoft](https://docs.microsoft.com/en-us/sql/relational-databases/replication/snapshot-replication)
- (**) [MarinTodorov](https://www.slideshare.net/MarinTodorov/overcome-your-fear-of-implementing-offline-mode-in-your-apps?next_slideshow=1)
