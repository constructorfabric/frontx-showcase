import type { ReactNode } from 'react';
import { Check, Plus } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Progress,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@gears-frontx/ui-kit';
import { SampleCaption, SampleLines, SampleOptional, SampleRow, SampleSpread, SampleStack } from '@gears-frontx/site-blocks/KitShowcase';
import { chartArt } from '@site-shared/content/brandArt';

/** The sample keys the home outline's kit showcase may name, in the order of its tiles. */
export const KIT_SAMPLES = ['button', 'input', 'checkbox', 'tabs', 'table', 'avatar', 'badge', 'progress', 'area', 'bar', 'distribution', 'trends'] as const;

// @cpt-algo:cpt-template-site-algo-home-screen-kit-sample:p1
/**
 * The live, inert kit sample a showcase tile shows, by the sample key the outline names: kit components as they are, laid out by the showcase block's sample helpers; the chart samples are brand art over the kit's chart container. An unknown key shows nothing.
 * @param name - the tile's sample key
 * @param t - the screen's string lookup
 */
export function kitSample(name: string, t: (key: string) => string): ReactNode {
  switch (name) {
    // @cpt-begin:cpt-template-site-algo-home-screen-kit-sample:p1:inst-component-sample
    case 'button':
      return (
        <SampleStack>
          <Button icon={<Plus />}>{t('kit.sample.create')}</Button>
          <SampleRow>
            <Button size="sm" variant="outline">
              {t('kit.sample.cancel')}
            </Button>
            <SampleOptional>
              <Button size="sm" variant="ghost" icon={<Check />}>
                {t('kit.sample.done')}
              </Button>
            </SampleOptional>
          </SampleRow>
        </SampleStack>
      );
    case 'input':
      return (
        <SampleStack>
          <Input placeholder={t('kit.sample.search')} aria-label={t('kit.sample.search')} />
          <Input defaultValue={t('kit.sample.projectValue')} aria-label={t('kit.sample.projectName')} />
          <SampleCaption label={t('kit.sample.projectName')} />
        </SampleStack>
      );
    case 'checkbox':
      return (
        <SampleStack>
          <Label>
            <Checkbox defaultChecked /> {t('kit.sample.shared')}
          </Label>
          <Label>
            <Checkbox /> {t('kit.sample.notifications')}
          </Label>
          <Label>
            <Switch defaultChecked /> {t('kit.sample.autosave')}
          </Label>
        </SampleStack>
      );
    case 'tabs':
      return (
        <SampleStack>
          <Tabs defaultValue="overview">
            {/* The line variant: the default pill track insets its active tab by 3px, under the design checker's 4px card-padding floor. */}
            <TabsList variant="line" size="sm">
              <TabsTrigger value="overview">{t('kit.sample.overview')}</TabsTrigger>
              <TabsTrigger value="activity">{t('kit.sample.activity')}</TabsTrigger>
            </TabsList>
          </Tabs>
          <SampleCaption label={t('kit.sample.loading')} />
          <SampleLines>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </SampleLines>
        </SampleStack>
      );
    case 'table':
      // The header and two rows: at the kit's row height a third row would not fit the tile. The first row is selected, the kit's highlight.
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('kit.sample.name')}</TableHead>
              <TableHead>{t('kit.sample.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(
              [
                ['row1', 'ready'],
                ['row2', 'draft'],
              ] as const
            ).map(([row, status], index) => (
              <TableRow key={row} data-state={index === 0 ? 'selected' : undefined}>
                <TableCell>{t(`kit.sample.${row}`)}</TableCell>
                <TableCell>
                  <Badge variant="outline" size="xs">
                    {t(`kit.sample.${status}`)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    case 'avatar':
      return (
        <SampleStack>
          <AvatarGroup>
            {(
              [
                ['AM', 'accent'],
                ['JK', 'neutral'],
                ['RL', 'accent'],
              ] as const
            ).map(([initials, tone]) => (
              <Avatar key={initials}>
                <AvatarFallback tone={tone}>{initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <SampleCaption label={t('kit.sample.members')} />
        </SampleStack>
      );
    case 'badge':
      return (
        <SampleStack>
          <SampleSpread>
            {t('kit.sample.release')}
            <Badge size="xs">
              <Check aria-hidden />
              {t('kit.sample.ready')}
            </Badge>
          </SampleSpread>
          <SampleRow>
            <Badge size="xs">{t('kit.sample.published')}</Badge>
            <Badge variant="outline" size="xs">
              {t('kit.sample.draft')}
            </Badge>
            <SampleOptional>
              <Badge variant="secondary" size="xs">
                {t('kit.sample.beta')}
              </Badge>
            </SampleOptional>
          </SampleRow>
          <SampleRow>
            <Badge variant="outline" size="xs">
              {t('kit.sample.ui')}
            </Badge>
            <Badge variant="outline" size="xs">
              {t('kit.sample.api')}
            </Badge>
            <SampleOptional>
              <Badge variant="secondary" size="xs">
                {t('kit.sample.updates')}
              </Badge>
            </SampleOptional>
          </SampleRow>
        </SampleStack>
      );
    case 'progress':
      return (
        <SampleStack>
          <SampleCaption label={t('kit.sample.upload')} value="72%" />
          <Progress value={72} aria-label={t('kit.sample.upload')} />
          <SampleCaption label={t('kit.sample.setup')} value="100%" />
          <Progress value={100} aria-label={t('kit.sample.setup')} />
        </SampleStack>
      );
    // @cpt-end:cpt-template-site-algo-home-screen-kit-sample:p1:inst-component-sample
    // @cpt-begin:cpt-template-site-algo-home-screen-kit-sample:p1:inst-chart-sample
    case 'area':
    case 'bar':
      return chartArt(name);
    case 'distribution':
      return chartArt('distribution', { centre: t('kit.sample.sources') });
    case 'trends':
      return chartArt('trends', { label: t('kit.sample.activityTrend'), value: t('kit.sample.activityValue') });
    // @cpt-end:cpt-template-site-algo-home-screen-kit-sample:p1:inst-chart-sample
    // @cpt-begin:cpt-template-site-algo-home-screen-kit-sample:p1:inst-no-sample
    default:
      return null;
    // @cpt-end:cpt-template-site-algo-home-screen-kit-sample:p1:inst-no-sample
  }
}
