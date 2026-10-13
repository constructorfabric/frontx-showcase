import { Troubleshooting } from './Troubleshooting';

export const showcase = { title: 'Troubleshooting', group: 'docs', summary: 'A titled list of symptoms, each opening what to check.' } as const;

export default function TroubleshootingShowcase() {
  return (
    <Troubleshooting
      id="troubleshooting"
      title="If something looks different"
      items={[
        { summary: 'The menu has no example screens', text: 'Stop the development servers and restart with FRONTX_INCLUDE_TEMPLATE_EXAMPLES=1 npm run dev:all. The templates hide their example entries without this flag.' },
        { summary: 'The old title is still visible', text: 'Check that you changed _blank-mfe/src/screens/home/i18n/en.json, that the host language is English, and that you restarted dev:all after saving.' },
        { summary: 'The workspace or a port cannot be found', text: 'Run from my-app, not from the outer frontx-start folder. The examples use ports 5173, 3001, 3099, 3201 and 3202; stop a previous run before restarting.' },
      ]}
    />
  );
}
