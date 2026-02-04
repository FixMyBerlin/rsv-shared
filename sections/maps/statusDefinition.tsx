import { COLORS, COLORSCLASSES } from '@config/styles'
import type { RouteGeometryFeature } from '@shared/cms/routegeometries.schema'
import planningIcon from '@shared/sections/maps/statusIcons/planning.png'
import ideaIcon from '@shared/sections/maps/statusIcons/idea.png'
import checkIcon from '@shared/sections/maps/statusIcons/check.png'
import in_progressIcon from '@shared/sections/maps/statusIcons/in_progress.png'
import doneIcon from '@shared/sections/maps/statusIcons/done.png'
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
  ["Idee", {
    color: COLORS.mapStatusIdea,
    icon: ideaIcon,
    label: 'Idee',
    colorClass: COLORSCLASSES.mapStatusIdea,
  }],
  ["Prüfung", {
    color: COLORS.mapStatusCheck,
    icon: checkIcon,
    label: 'Prüfung',
    colorClass: COLORSCLASSES.mapStatusCheck,
  }],
  [
    'In Planung',
    {
      color: COLORS.mapStatusPlanning,
      icon: planningIcon,
      label: 'Planung',
      colorClass: COLORSCLASSES.mapStatusPlanning,
    },
  ],
  ["Umsetzung", {
    color: COLORS.mapStatusInProgress,
    icon: in_progressIcon,
    label: 'Umsetzung',
    colorClass: COLORSCLASSES.mapStatusInProgress,
  }],
  ["Fertig", {
    color: COLORS.mapStatusDone,
    icon: doneIcon,
    label: 'Fertig',
    colorClass: COLORSCLASSES.mapStatusDone,
  }],
])

const statusLineStyling = [
  'match',
  ['get', 'status'],
  'Idee',
  routeSegmentStatus.get('Idee')?.color || 'red',
  'Prüfung',
  routeSegmentStatus.get('Prüfung')?.color || 'red',
  'In Planung',
  routeSegmentStatus.get('In Planung')?.color || 'red',
  'Umsetzung',
  routeSegmentStatus.get('Umsetzung')?.color || 'red',
  'Fertig',
  routeSegmentStatus.get('Fertig')?.color || 'red',
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
