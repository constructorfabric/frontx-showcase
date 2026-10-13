import { Button } from '@gears-frontx/ui-kit';
import { PageHeader } from './PageHeader';

export const showcase = { title: 'Page header', group: 'demo-mfe', summary: 'The title of a demo screen with its description and screen-wide actions.' } as const;

export default function PageHeaderShowcase() {
  return (
    <PageHeader
      title="Widgets Host"
      description="Two instances of one widget entry and a third widget render concurrently in the slot below."
      actions={
        <>
          <Button variant="outline" size="sm">Ping alpha</Button>
          <Button variant="outline" size="sm">Ping beta</Button>
        </>
      }
    />
  );
}
