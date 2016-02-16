# Feathers vs X

The following sections compare Feathers to other software choices that seem similar or may overlap with the use cases of Feathers.

Due to the bias of these comparisons being on the Feathers website, we attempt to only use facts. Below you can find a feature comparison table and in each section you can get more detailed comparisons.

If you find something invalid or out of date in the comparisons, please [create an issue](https://github.com/feathersjs/feathers-docs/issues/new) (or better yet, a [pull request](https://github.com/feathersjs/feathers-docs/compare)) and we'll address it as soon as possible.

## Feature Comparison

> Due to the fact that the ease of implementation is subjective based on a developer's skill set and experience we only consider a feature supported if it is officially supported by the framework or platform, regardless of how easy it is (ie. there are official plugins, guides or SDKs).

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
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
        </tr>
        <tr>
            <td><strong>Real Time From Server</strong></td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>No</td>
        </tr>
        <tr>
            <td><strong>Real Time From Client</strong></td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes. Called DDP.</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>No</td>
        </tr>
        <tr>
            <td><strong>Universal JavaScript</strong></td>
            <td>Yes</td>
            <td>No</td>
            <td>No</td>
            <td>No</td>
            <td>No</td>
            <td>No</td>
        </tr>
        <tr>
            <td><strong>Client Agnostic</strong></td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes and No. Can be hacked</td>
            <td>Yes</td>
            <td>Yes via SDKs and bindings</td>
            <td>Yes</td>
        </tr>
        <tr>
            <td><strong>Email/Password Auth</strong></td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>Yes</td>
        </tr>
        <tr>
            <td><strong>Token Auth</strong></td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>Yes</td>
        </tr>
        <tr>
            <td><strong>OAuth</strong></td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>No</td>
        </tr>
        <tr>
            <td><strong>Self Hosted</strong></td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>No</td>
            <td>Yes</td>
        </tr>
        <tr>
            <td><strong>Hosting Support</strong></td>
            <td>No</td>
            <td>No</td>
            <td>Yes</td>
            <td>No</td>
            <td>Yes</td>
            <td>No</td>
        </tr>
        <tr>
            <td><strong>Pagination</strong></td>
            <td>Yes</td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
        </tr>
        <tr>
            <td><strong>Databases</strong></td>
            <td>10+ databases. Multiple ORMs</td>
            <td>No official. Many community modules and examples</td>
            <td>MongoDB</td>
            <td>10+ databases. 1 ORM</td>
            <td>Unknown</td>
            <td>MongoDB</td>
        </tr>
        <tr>
            <td><strong>Analytics</strong></td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>Yes</td>
        </tr>
        <tr>
            <td><strong>Admin Dashboard</strong></td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>Yes</td>
            <td>No. Left to developer</td>
        </tr>
        <tr>
            <td><strong>Push Notifications</strong></td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>No. Left to developer</td>
            <td>No</td>
            <td>Yes</td>
        </tr>
    </tbody>
</table>