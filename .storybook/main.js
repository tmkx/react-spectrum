
module.exports = {
  core: {
    builder: "storybook-builder-parcel",
  },
  stories: ['../packages/@react-spectrum/picker/stories/Picker.stories.{js,jsx,ts,tsx}'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-controls',
    'storybook-dark-mode',
    './custom-addons/provider/register',
    './custom-addons/descriptions/register',
    './custom-addons/theme/register',
    '@storybook/addon-interactions'
  ],
  features: {
    interactionsDebugger: true
  },
  typescript: {
    check: false,
    reactDocgen: false
  },
  reactOptions: {
    strictMode: process.env.STRICT_MODE
  },
};
