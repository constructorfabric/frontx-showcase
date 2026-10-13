import { BridgeInfoCard } from './BridgeInfoCard';

export const showcase = { title: 'Bridge info card', group: 'demo-mfe', summary: 'What a screen reads from its bridge, as label and value pairs.' } as const;

export default function BridgeInfoCardShowcase() {
  return (
    <BridgeInfoCard
      title="Bridge Info"
      rows={[
        { label: 'Domain ID:', value: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1' },
        { label: 'Instance ID:', value: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.demo.screens.helloworld.v1' },
        { label: 'Current Theme:', value: 'light' },
        { label: 'Current Language:', value: 'en' },
      ]}
    />
  );
}
