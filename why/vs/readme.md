# Feathers vs X

The following sections compare Feathers to other software choices that seem similar or may overlap with the use cases of Feathers.

Due to the bias of these comparisons being on the Feathers website, we attempt to only use facts. Below you can find a feature comparison table and in each section you can get more detailed comparisons.

If you find something invalid or out of date in the comparisons, please [create an issue](https://github.com/feathersjs/feathers-docs/issues/new) (or better yet, a [pull request](https://github.com/feathersjs/feathers-docs/compare)) and we'll address it as soon as possible.

## Feature Comparison

> Due to the fact that ease of implementation is subjective and primarily related to a developer's skill set and experience we only consider a feature supported if it is officially supported by the framework or platform, regardless of how easy it is to implement (aka. are there official plugins, guides or SDKs?).

<!-- -->

#### Legend

✅: Officially supported with a guide or core module

❌: Not supported

🤓: Community supported or left to developer

<table>
    <thead>
        <tr>
            <th><strong>Feature</strong></th>
            <th><strong>Feathers</strong></th>
            <th><strong>Express</strong></th>
            <th><strong>Meteor</strong></th>
            <th><strong>Sails</strong></th>
            <th><strong>Firebase</strong></th>
            <th><strong>Parse</strong></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>REST API</strong></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Real Time From Server</strong></td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><strong>Real Time From Client</strong></td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅ (DDP)</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><strong>Universal JavaScript</strong></td>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><strong>React Native Support</strong></td>
            <td>✅</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><strong>Client Agnostic</strong></td>
            <td>✅</td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>✅ 🤓 (SDKs)</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Email/Password Auth</strong></td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Token Auth</strong></td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>OAuth</strong></td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><strong>Self Hosted</strong></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Hosting Support</strong></td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
        <tr>
            <td><strong>Pagination</strong></td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Databases</strong></td>
            <td>10+ databases. Multiple ORMs</td>
            <td>❌ 🤓</td>
            <td>MongoDB</td>
            <td>10+ databases. 1 ORM</td>
            <td>Unknown</td>
            <td>MongoDB</td>
        </tr>
        <tr>
            <td><strong>Analytics</strong></td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Admin Dashboard</strong></td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌ 🤓</td>
        </tr>
        <tr>
            <td><strong>Push Notifications</strong></td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>❌</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Offline Mode</strong></td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <td><strong>Hot Code Push</strong></td>
            <td>❌ 🤓</td>
            <td>❌ 🤓</td>
            <td>✅</td>
            <td>❌ 🤓</td>
            <td>❌</td>
            <td>❌</td>
        </tr>
    </tbody>
</table>