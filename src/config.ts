export default {
  jwt: {
    secretOrKey: 'armist-jwt',
    expiresIn: 86400,
  },
  // You can also use any other email sending services
  mail: {
    service: {
      host: 'app.debugmail.io',
      port: 25,
      secure: false,
      user: 'df0850fd-73ec-41c1-87b1-e901c4ba1825',
      pass: 'f13a4b36-8254-403c-a39a-f5a3814d142d',
    },
    senderCredentials: {
      name: 'expense-tracker',
      email: 'armistman@gmail.com',
    },
  },
  // these are used in the mail templates
  project: {
    name: 'Extracts Tracker',
    address: 'armistman@vk.com',
    logoUrl: 'https://__YOUR_PROJECT_LOGO_URL__',
    slogan: 'Made with ❤️ in Istanbul',
    color: '#123456',
    socials: [
      ['GitHub', '__Project_GitHub_URL__'],
      ['__Social_Media_1__', '__Social_Media_1_URL__'],
      ['__Social_Media_2__', '__Social_Media_2_URL__'],
    ],
    url: 'http://localhost:4200',
    mailVerificationUrl: 'http://localhost:3000/auth/verify',
    mailChangeUrl: 'http://localhost:3000/auth/change-email',
    resetPasswordUrl: 'http://localhost:4200/reset-password',
    termsOfServiceUrl: 'http://localhost:4200/legal/terms',
  },
};
