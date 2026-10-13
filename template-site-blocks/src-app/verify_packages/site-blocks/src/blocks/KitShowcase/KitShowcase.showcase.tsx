import { createElement, type ReactNode } from 'react';
import { Check, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarGroup, Badge, Button, Checkbox, Input, Label, Progress, Skeleton, Switch, Tabs, TabsList, TabsTrigger } from '@gears-frontx/ui-kit';
import { ChartThumb } from '@gears-frontx/site-brand/art/ChartThumb';
import { KitShowcase, SampleCaption, SampleLines, SampleOptional, SampleRow, SampleSpread, SampleStack } from './KitShowcase';

export const showcase = { title: 'Kit showcase', group: 'section', summary: 'Live, inert kit samples in titled groups of tiles, each tile one link to its catalogue page.', fullBleed: true } as const;

const tile = (title: string, slug: string, sample: ReactNode) => ({ title, link: createElement('a', { href: `./?screen=catalogue;route=components/${slug}` }), sample });

export default function KitShowcaseShowcase() {
  return (
    <KitShowcase
      id="showcase-kit-showcase"
      label="FrontX UI Kit"
      title={'One visual language.\nEvery interaction.'}
      lead="A shared vocabulary for your interfaces. Explore the components, then use them in your application."
      action={{ label: 'Explore UI Kit', link: createElement('a', { href: './?screen=catalogue' }) }}
      groups={[
        {
          title: 'Input & interaction',
          tiles: [
            tile(
              'Buttons',
              'button',
              <SampleStack>
                <Button icon={<Plus />}>Create</Button>
                <SampleRow>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                  <SampleOptional>
                    <Button size="sm" variant="ghost" icon={<Check />}>
                      Done
                    </Button>
                  </SampleOptional>
                </SampleRow>
              </SampleStack>,
            ),
            tile(
              'Text fields',
              'input',
              <SampleStack>
                <Input placeholder="Search" aria-label="Search" />
                <Input defaultValue="My project" aria-label="Project name" />
                <SampleCaption label="Project name" />
              </SampleStack>,
            ),
            tile(
              'Selection',
              'checkbox',
              <SampleStack>
                <Label>
                  <Checkbox defaultChecked /> Shared UI
                </Label>
                <Label>
                  <Switch defaultChecked /> Auto save
                </Label>
              </SampleStack>,
            ),
            tile(
              'Tabs',
              'tabs',
              <SampleStack>
                <Tabs defaultValue="overview">
                  <TabsList variant="line" size="sm">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                </Tabs>
                <SampleLines>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </SampleLines>
              </SampleStack>,
            ),
          ],
        },
        {
          title: 'Data & feedback',
          tiles: [
            tile(
              'People',
              'avatar',
              <SampleStack>
                <AvatarGroup>
                  <Avatar>
                    <AvatarFallback tone="accent">AM</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback tone="neutral">JK</AvatarFallback>
                  </Avatar>
                </AvatarGroup>
                <SampleCaption label="Members" />
              </SampleStack>,
            ),
            tile(
              'Status & badges',
              'badge',
              <SampleStack>
                <SampleSpread>
                  <SampleCaption label="Release" />
                  <Badge size="xs">Ready</Badge>
                </SampleSpread>
                <SampleRow>
                  <Badge size="xs">Published</Badge>
                  <Badge variant="outline" size="xs">
                    Draft
                  </Badge>
                </SampleRow>
              </SampleStack>,
            ),
            tile(
              'Progress',
              'progress',
              <SampleStack>
                <SampleCaption label="Uploading files" value="72%" />
                <Progress value={72} aria-label="Uploading files" />
              </SampleStack>,
            ),
          ],
        },
        {
          title: 'Charts & trends',
          tiles: [tile('Area charts', 'chart', <ChartThumb chart="area" />), tile('Bar charts', 'chart', <ChartThumb chart="bar" />)],
        },
      ]}
    />
  );
}
