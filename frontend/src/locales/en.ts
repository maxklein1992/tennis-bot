/**
 * English translation of the marketing site copy.
 * Structure must stay in sync with `nl.ts` (same keys, same array lengths/order).
 */
export const en = {
  nav: {
    howItWorks: 'How it works',
    aboutUs: 'About us',
    contact: 'Contact',
    dashboardCta: 'Go to dashboard',
  },
  footer: {
    home: 'Home',
    howItWorks: 'How it works',
    aboutUs: 'About us',
    contact: 'Contact',
  },
  home: {
    heroTitle: 'Automatically book your court',
    heroSubtitle:
      'ReserveringBot automatically books your regular court at the KNLTB every week, the moment it ' +
      'becomes available — without you having to keep watching for it yourself.',
    heroCta: 'Go to dashboard',
    whatIsTitle: 'What is ReserveringBot?',
    whatIsText:
      'ReserveringBot is the easiest way to never miss your regular court again. Set your ' +
      'day, time, and court with the KNLTB once — the bot then automatically checks when it ' +
      'opens up and books it for you instantly, every week.',
  },
  howItWorksSection: {
    heading: 'How it works',
    intro:
      'In four simple steps, ReserveringBot arranges your regular court, without you having to wait ' +
      'or click yourself.',
    steps: [
      {
        title: 'Sign up',
        description: 'Create a free ReserveringBot account in a couple of minutes.',
      },
      {
        title: 'Enter your KNLTB details',
        description: 'Fill in your KNLTB login details and your regular court preferences.',
      },
      {
        title: 'Set up a weekly booking',
        description: 'Choose the day, time, and court you want to play every week.',
      },
      {
        title: 'The bot books automatically',
        description: 'As soon as the court becomes available, ReserveringBot books it for you automatically.',
      },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        question: 'How exactly does ReserveringBot work?',
        answer:
          'You set up a fixed schedule: a day, time, and court you want to play every week. As soon ' +
          'as the KNLTB court planning opens for that date, ReserveringBot immediately tries to book the ' +
          'desired court on your behalf, without you having to keep waiting for it yourself.',
      },
      {
        question: 'How often does it try to book?',
        answer:
          'For each schedule, ReserveringBot makes one booking attempt, at the time you configured for ' +
          'when the court becomes available. If the booking succeeds, you\'ll see it right away in your dashboard.',
      },
      {
        question: 'What happens if no court is available?',
        answer:
          'If the desired court is already taken at that moment, the attempt fails gracefully and you ' +
          'receive a notification in your dashboard. ReserveringBot does not pick an alternative court or time; ' +
          'your schedule simply stays active for the following week.',
      },
      {
        question: 'Is my KNLTB password safe?',
        answer:
          'Your password is stored encrypted on our server, solely so we can log in to the KNLTB on ' +
          'your behalf while booking. We do our best to keep it as safe as possible, but as with any ' +
          'service that uses a password, we cannot give absolute guarantees. We recommend not reusing a ' +
          'password you also use elsewhere.',
      },
      {
        question: 'Can I have multiple fixed schedules booked at the same time?',
        answer:
          'Yes, you can create multiple schedules, for example for different days or playing partners. ' +
          'Each schedule is processed independently, at its own time.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    subtitle:
      'ReserveringBot is a one-person hobby project — no support team, no queue. Got a question, found ' +
      'a bug, or have an idea for a new feature? Feel free to email me, I usually reply quickly.',
    mailButton: 'Email us: {{email}}',
  },
  about: {
    title: 'About this bot',
    paragraph1:
      'At our tennis club, regular courts open up a fixed number of days in advance — and they\'re fully ' +
      'booked within minutes. Logging in at just the right moment and clicking "book" myself turned ' +
      'out not to be sustainable in practice, so this bot was born: it automatically checks whether ' +
      'the court becomes available and books it immediately, every week again.',
    paragraph2:
      'It\'s a hobby project by a single developer (Max), originally built to book his mother\'s ' +
      'regular court at the KNLTB every week. Not a commercial product, no team behind it — just a ' +
      'small piece of automation that takes a tedious recurring chore off your hands.',
    paragraph3:
      'This dashboard shows which bookings are running, when the next attempt is, and how the ' +
      'previous one went.',
  },
  howItWorksPage: {
    title: 'How ReserveringBot works',
    intro:
      'ReserveringBot takes the weekly puzzle of court bookings off your hands. Below you can read ' +
      'exactly what happens, from registration to a booked court.',
    steps: [
      {
        title: '1. Sign up',
        description:
          'Create a free account with your email address and a password. You use this account to ' +
          'log in to your ReserveringBot dashboard, separate from your KNLTB account.',
      },
      {
        title: '2. Enter your KNLTB details',
        description:
          'Fill in your KNLTB login details so ReserveringBot can log in to your club\'s booking module ' +
          'on your behalf. Your details are stored securely and only used to make court bookings — ' +
          'never for anything else.',
      },
      {
        title: '3. Set up a weekly booking',
        description:
          'Indicate on which day and time you want to play every week, on which court (or courts), ' +
          'and optionally with whom. You can set up multiple recurring bookings side by side and turn ' +
          'them on or off at any time.',
      },
      {
        title: '4. The bot books automatically',
        description:
          'As soon as the court becomes available according to the KNLTB booking system (usually a ' +
          'few days in advance), ReserveringBot tries to book it right away. If the booking doesn\'t succeed ' +
          'the first time — for example due to a temporary glitch or high traffic on the platform — the ' +
          'bot automatically retries, at short intervals, until the booking succeeds or the booking ' +
          'window closes.',
      },
    ],
    faq: {
      q1: 'What if it doesn\'t work out once?',
      a1:
        'Should a booking unexpectedly fail (for example because the court turns out to be taken ' +
        'after all, or the KNLTB website is temporarily unreachable), you\'ll see this right away in ' +
        'your dashboard, including the reason. ReserveringBot keeps trying as long as the booking window is open.',
      q2: 'How quickly is a booking made?',
      a2:
        'The bot continuously checks whether your court has opened up for booking and acts within ' +
        'seconds of it becoming available — faster than you could click yourself.',
    },
  },
  languageSwitcher: {
    nl: 'Nederlands',
    en: 'English',
  },
};
