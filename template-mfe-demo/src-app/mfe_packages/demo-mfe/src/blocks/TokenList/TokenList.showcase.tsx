import { TokenList } from './TokenList';

export const showcase = { title: 'Token list', group: 'demo-mfe', summary: 'Token names in two columns.' } as const;

export default function TokenListShowcase() {
  return <TokenList tokens={['--background', '--foreground', '--primary', '--primary-foreground']} />;
}
