import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import type { TopAgent } from '@inbox-shared/api/dashboardTypes';
import type { Translate } from '@inbox-shared/i18n/translate';
import { IdentityAvatar } from '@inbox-shared/ui/IdentityAvatar';
import { formatCount } from './dashboardSelectors';

export type TopAgentsCardProps = {
  agents: TopAgent[];
  t: Translate;
};

/**
 * Row 3's ranked list card: the kit's item rows, each with the rank, an
 * avatar, the agent's name and a resolved-count Badge, ranked by that same
 * count.
 */
export function TopAgentsCard({ agents, t }: TopAgentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('top_agents')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {agents.map((agent, index) => (
            <Item key={agent.id} size="xs" role="listitem">
              <ItemMedia>
                <Text variant="meta" tone="muted" render={<span />}>
                  {index + 1}
                </Text>
              </ItemMedia>
              <ItemMedia>
                <IdentityAvatar name={agent.name} size="sm" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{agent.name}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Badge variant="secondary">{formatCount(agent.resolvedCount)}</Badge>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
