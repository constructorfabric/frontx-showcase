import type { ComponentType } from 'react';
import { ClipboardCheckIcon, CodeIcon, FolderKanbanIcon, HeadsetIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Item,
  ItemContent,
  ItemMedia,
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@gears-frontx/ui-kit';
import type { WorkloadMetric } from '@inbox-shared/api/dashboardTypes';
import type { Translate } from '@inbox-shared/i18n/translate';
import { CardStrip } from '@inbox-shared/blocks/CardGrid';
import { formatCount, workloadPercent } from './dashboardSelectors';
import { workloadLabel } from './datasetLabels';

export type WorkloadStripProps = {
  workload: WorkloadMetric[];
  t: Translate;
};

const ICON_BY_METRIC_ID: Record<string, ComponentType> = {
  'support-load': HeadsetIcon,
  'dev-backlog': CodeIcon,
  'crm-tasks': FolderKanbanIcon,
  'qa-reviews': ClipboardCheckIcon,
};

/**
 * Row 4, full width: four related workload metrics side by side, each a kit
 * item row with its icon and a progress bar whose label and readout (value
 * of capacity) sit above the bar, so a fourth team dimension (QA) sits
 * alongside Support/Dev/CRM at the same visual weight.
 */
export function WorkloadStrip({ workload, t }: WorkloadStripProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('team_workload')}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardStrip>
          {workload.map((metric) => {
            const Icon = ICON_BY_METRIC_ID[metric.id] ?? FolderKanbanIcon;
            const percent = workloadPercent(metric);
            const readout = t('workload_value', { value: formatCount(metric.value), max: formatCount(metric.max) });
            return (
              <Item key={metric.id} size="xs">
                <ItemMedia variant="icon" aria-hidden="true">
                  <Icon />
                </ItemMedia>
                <ItemContent>
                  <Progress value={percent}>
                    <ProgressLabel>{workloadLabel(metric.id, t)}</ProgressLabel>
                    <ProgressValue>{() => readout}</ProgressValue>
                  </Progress>
                </ItemContent>
              </Item>
            );
          })}
        </CardStrip>
      </CardContent>
    </Card>
  );
}
