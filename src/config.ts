export default {
  jwt: {
    secretOrKey: 'armist-jwt',
    expiresIn: 86400,
  },
  // You can also use any other email sending services
  mail: {
    service: {
      host: 'app.debugmail.io',
      port: 9025,
      secure: false,
      user: 'df0850fd-73ec-41c1-87b1-e901c4ba1825',
      pass: 'f13a4b36-8254-403c-a39a-f5a3814d142d',
    },
    senderCredentials: {
      name: 'Expense Tracker',
      email: 'armistman@gmail.com',
    },
  },
  // these are used in the mail templates
  project: {
    name: 'Expense Tracker',
    address: 'armistman@gmail.com',
    logoUrl:
      'https://images.pexels.com/photos/18037898/pexels-photo-18037898.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    slogan: 'Made with ❤️ by Rafael Fatkulin',
    color: '#123456',
    socials: [['GitHub', 'https://github.com/RafaelFatkulin']],
    url: 'http://localhost:5173',
    mailVerificationUrl: 'http://localhost:5173/email-verify',
    mailChangeUrl: 'http://localhost:5173/change-email',
    resetPasswordUrl: 'http://localhost:5173/reset-password',
    termsOfServiceUrl: 'http://localhost:5173/legal/terms',
  },
};
