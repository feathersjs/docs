# Forgot Password

This cookbook is a basic example that shows how to create a `forgot-password` service. Because resetting passwords requires sending emails (and/or texts), additional model properties and config, etc, it is not covered by the official feathers-authentication library. Instead, you are encouraged to use the following example and change it as needed.

Prerequisites

- A service setup to send emails. Checkout [feathers-mailer](https://github.com/feathersjs-ecosystem/feathers-mailer).
- Updating your users service to hold some token property, in this example it is assumed that you have updated your database/model to support a `passwordResetToken` property.
- Add some secret and url config. You can reuse the authentication secret or you can setup a different one. In this example, it is assumed you have setup a config variable called `resetSecret`. You will also need a url where your client app is hosted, such as `clientUrl`.

```js
// services/forgot-password.class.js

const jwt = require("jsonwebtoken");
const { BadRequest } = require("straightline-utils/errors");

class Service {
  setup(app) {
    this.app = app;
    this.usersService = app.service("api/users");
    this.emailService = app.service("mailer");
  }

  async create(data, params) {
    const { email } = data;

    const resetSecret = this.app.get("resetSecret");
    // const resetSecret = this.app.get('authentication').secret;
    // const resetSecret = 'MY_SECRET';

    const clientUrl = this.app.get("clientUrl");
    // const clientUrl = 'https.myapp.com';

    // Note we don't really need a payload here. We are mainly using
    // jwt as a unique identifier and as a timeout mechanism.
    const passwordResetToken = jwt.sign({}, resetSecret, { expiresIn: "1d" });

    const [user] = await this.usersService.find({
      query: {
        email,
        $limit: 1,
      },
      paginate: false,
    });

    // Pro Tip - Use findOne(). See findOne cookbook.
    // const user = await this.usersService.findOne({ query: { email } });

    if (user) {
      await this.usersService.patch(user.id, { passwordResetToken });
      await this.emailService.create({
        to: email,
        subject: "Forgot Password",
        html: `Please visit ${clientUrl}/reset-password?token=${passwordResetToken} to reset your password.`,
      });
    }

    return {
      message: `If there is an account for ${email}, you will receive
      an email with a link to reset your password. Be sure to check your spam filter.`,
    };
  }

  async get(passwordResetToken, params) {
    const [user] = await this.usersService.find({
      query: {
        passwordResetToken,
        $limit: 1,
      },
      paginate: false,
    });

    // Pro Tip - Use findOne(). See findOne cookbook.
    // const user = await this.usersService.findOne({
    //   query: { passwordResetToken }
    // });

    if (!user) {
      return { valid: false };
    }

    const resetSecret = this.app.get("resetSecret");

    return verifyToken(passwordResetToken, resetSecret)
      .then(() => {
        return { valid: true };
      })
      .catch(() => {
        return { valid: false };
      });
  }

  async update(passwordResetToken, data, params) {
    const { password } = data;

    const [user] = await this.usersService.find({
      query: {
        passwordResetToken,
        $limit: 1,
      },
      paginate: false,
    });

    // Pro Tip - Use findOne(). See findOne cookbook.
    // const user = await this.usersService.findOne({
    //   query: { passwordResetToken }
    // });

    if (!user) {
      throw new BadRequest("Password reset token is invalid.");
    }

    const resetSecret = this.app.get("resetSecret");

    try {
      jwt.verify(passwordResetToken, resetSecret);
    } catch (error) {
      throw new BadRequest("Password reset token is invalid.");
    }

    await this.usersService.patch(user.id, {
      password,
      passwordResetToken: null,
    });

    // Only the email is required here. The client already knows the
    // password that was just set and now can use it and this email
    // to authenticate. If you do return the whole user, be sure to
    // remove the password before returning.
    return { email: user.email };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
```
