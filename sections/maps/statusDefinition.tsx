import { COLORS, COLORSCLASSES } from '@config/styles'
import type { RouteGeometryFeature } from '@shared/cms/routegeometries.schema'
import planningIcon from '@shared/sections/maps/statusIcons/planning.png'
import type { LineLayerSpecification } from 'react-map-gl/maplibre'

export const routeSegmentStatus: Map<
  RouteGeometryFeature['properties']['status'],
  {
    color: string
    icon: ImageMetadata
    label: string
    colorClass: string
  }
> = new Map([
  // ["idea", {
  //   color: COLORS.mapStatusIdea,
  //   icon: ideaIcon,
  //   label: 'Idee',
  //   colorClass: COLORSCLASSES.mapStatusIdea,
  // }],
  // ["check", {
  //   color: COLORS.mapStatusCheck,
  //   icon: checkIcon,
  //   label: 'Prüfung',
  //   colorClass: COLORSCLASSES.mapStatusCheck,
  // }],
  [
    'In Planung',
    {
      color: COLORS.mapStatusPlanning,
      icon: planningIcon,
      label: 'Planung',
      colorClass: COLORSCLASSES.mapStatusPlanning,
    },
  ],
  // ["in_progress", {
  //   color: COLORS.mapStatusInProgress,
  //   icon: in_progressIcon,
  //   label: 'Umsetzung',
  //   colorClass: COLORSCLASSES.mapStatusInProgress,
  // }],
  // ["done", {
  //   color: COLORS.mapStatusDone,
  //   icon: doneIcon,
  //   label: 'Fertig',
  //   colorClass: COLORSCLASSES.mapStatusDone,
  // }],
])

const statusLineStyling = [
  'match',
  ['get', 'status'],
  // 'idea',
  // routeSegmentStatus.idea.color,
  // 'check',
  // routeSegmentStatus.check.color,
  'In Planung',
  routeSegmentStatus.get('In Planung')?.color || 'red',
  // 'in_progress',
  // routeSegmentStatus.in_progress.color,
  // 'done',
  // routeSegmentStatus.done.color,
  '#ff0000', // fallback
] satisfies Required<LineLayerSpecification>['paint']['line-color']

export const getLinePaintRouteMap = (focusSegment?: string) => {
  return {
    'line-width': 4,
    'line-color': focusSegment
      ? ['case', ['==', ['get', 'subsectionSlug'], focusSegment], statusLineStyling, '#6B7280']
      : statusLineStyling,
  } satisfies LineLayerSpecification['paint']
}

export const linePaintSimpleMap = { 'line-width': 4, 'line-color': COLORS.mapDefault }
