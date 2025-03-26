import { COLORSCLASSES } from '@config/styles'
import { featureCollection } from '@turf/turf'
import type { InferEntrySchema } from 'astro:content'
import clsx from 'clsx'
import { BaseMap } from './BaseMap'
import { linePaintSimpleMap } from './statusDefinition'

type Props = {
  features: InferEntrySchema<'routegeometries'>[]
  label: string
}

export const SimpleMap = ({ features, label }: Props) => {
  return (
    <div className="relative mb-20 h-[500px] w-full">
      <BaseMap linePaint={linePaintSimpleMap} featureCollection={featureCollection(features)} />
      <div className="flex w-full items-center gap-4 bg-gray-200 p-2 pl-6">
        <div className={clsx('h-1 w-7', COLORSCLASSES.legendSimpleMap)} />
        {label}
      </div>
    </div>
  )
}
