import { SwatchGrid } from './SwatchGrid';

export const showcase = { title: 'Swatch grid', group: 'demo-mfe', summary: 'The palette as swatches painted with their token pairs.' } as const;

export default function SwatchGridShowcase() {
  return (
    <SwatchGrid
      swatches={[
        { token: 'background', name: 'Background' },
        { token: 'foreground', name: 'Foreground' },
        { token: 'primary', name: 'Primary' },
        { token: 'secondary', name: 'Secondary' },
        { token: 'muted', name: 'Muted' },
        { token: 'accent', name: 'Accent' },
        { token: 'destructive', name: 'Destructive' },
      ]}
    />
  );
}
