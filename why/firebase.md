## Feathers vs. Firebase

Firebase is a hosted platform for mobile or web applications. Just like Feathers Firebase provides REST and real-time APIs but also includes CDN support.

Firebase is a closed-source, paid hosted service starting at 5$/month with the next plan level starting at 49$/month. Feathers is open source and can run on any hosting platform like Heroku or Modulus or on your own servers, for example on EC2 or Digital Ocean.

Firebase has JavaScript and mobile clients and also provides framework specific bindings. Feathers currently focusses on universal usage in JavaScript environments and does not have any framework specific bindings. Mobile applications can use Feathers REST and websocket endpoints directly but at the moment there are no Feathers specific iOS and Android clients.

For more technical details on the difference and how to potentially migrate an application you can read [how to use Feathers as an open source alternative to Firebase](https://medium.com/all-about-feathersjs/using-feathersjs-as-an-open-source-alternative-to-firebase-b5d93c200cee#.olu25brld).
