import { MAPTILER_STYLE, MAXZOOM, MINZOOM } from '@config/map.ts'
import { FieldPrimitive } from '@keystar/ui/field'
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core'
import { linePaintSimpleMap } from '@shared/sections/maps/statusDefinition'
import * as turf from '@turf/turf'
import { ASTRO_ENV } from 'astro:env/client'
import type { FeatureCollection } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useState } from 'react'
import {
  AttributionControl,
  Layer,
  Map,
  Marker,
  NavigationControl,
  Source,
  type ViewState,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre'
import { FieldDataError } from '../copiedFromKeystatic/error'

function parseAsNormalField(value: FormFieldStoredValue) {
  if (value === undefined) {
    return ''
  }
  if (typeof value !== 'string') {
    throw new Error('Must be a string')
  }
  return value
}

export function MapPoint({
  label,
  referenceGeometry,
  defaultValue,
  description,
  validation = {},
}: {
  label: string
  referenceGeometry: FeatureCollection
  defaultValue?: string
  description?: string
  validation?: {
    isRequired?: boolean
  }
}): BasicFormField<string> {
  function validationMessage(value: string) {
    return validation?.isRequired === true && value.length === 0
      ? `${label} must not be empty`
      : undefined
  }
  function validate(value: string) {
    // We cannot acces https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/form/fields/text/validateText.tsx from here to use `return validateText(value)´
    const message = validationMessage(value)
    if (message !== undefined) {
      throw new FieldDataError(message)
    }
    return value
  }
  function parse(input: string) {
    if (!input.includes(',')) return undefined

    const [lat, lng] = input.split(',').map(Number)
    return { lng, lat }
  }
  return {
    // not sure what this one does? why is its only value 'form'?
    kind: 'form',
    // not sure what this one does?
    formKind: undefined,
    label,
    // Input is a React component that includes the props value and onChange.
    // from what I can tell, value is the value that keystatic loads from the file
    // and onChange is a function that takes one argument - the new value for the field
    // Example: https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/form/fields/text/ui.tsx#L7
    Input(props) {
      const markerFallback = turf.centerOfMass(turf.bboxPolygon(turf.bbox(referenceGeometry)))
      const fallbackPosition = {
        longitude: markerFallback.geometry.coordinates[0],
        latitude: markerFallback.geometry.coordinates[1],
      }

      const parsedInput = parse(props.value)
      const [viewState, setViewState] = useState<
        Pick<ViewState, 'latitude' | 'longitude' | 'zoom'>
      >({
        latitude: parsedInput?.lat || fallbackPosition.latitude,
        longitude: parsedInput?.lng || fallbackPosition.longitude,
        zoom: 11,
      })

      const outputString = (viewState: Pick<ViewState, 'latitude' | 'longitude'>) => {
        if (
          viewState.latitude === fallbackPosition.latitude &&
          viewState.longitude === fallbackPosition.longitude
        ) {
          return ''
        }
        return [viewState.latitude.toFixed(6), viewState.longitude.toFixed(6)].join(',')
      }
      const handleMapMove = (event: ViewStateChangeEvent) => {
        setViewState(event.viewState)
        handlePropUpdate(outputString(event.viewState))
      }
      const handlePropUpdate = (output: string | undefined) => {
        props.onChange(output || '')
      }

      return (
        <FieldPrimitive
          description={description}
          label={label}
          isRequired={validation.isRequired}
          errorMessage={validationMessage(props.value)}
        >
          <>
            {ASTRO_ENV === 'development' && (
              <pre>
                {JSON.stringify(
                  {
                    props,
                    fallbackPosition,
                    parsedInput,
                    viewState,
                    output: outputString(viewState),
                  },
                  undefined,
                  2,
                )}
              </pre>
            )}
            <p
              style={{
                fontFamily: 'sans-serif',
                textAlign: 'right',
                margin: 0,
                color: 'darkgray',
                fontSize: 'small',
              }}
            >
              Drag the map to change the position — Currently{' '}
              <pre style={{ display: 'inline' }}>{outputString(viewState) || 'NO POSITION'}</pre>{' '}
              {Boolean(outputString(viewState)) && (
                <button
                  onClick={() => {
                    setViewState((prev) => {
                      return { ...prev, ...fallbackPosition }
                    })
                    handlePropUpdate('')
                  }}
                >
                  Delete
                </button>
              )}
            </p>
            <Map
              {...viewState}
              onMove={handleMapMove}
              minZoom={MINZOOM}
              maxZoom={MAXZOOM}
              mapStyle={MAPTILER_STYLE}
              style={{ width: '100%', height: '400px' }}
              attributionControl={false}
              dragRotate={false}
              scrollZoom={false}
              RTLTextPlugin={undefined}
            >
              <Source id="layer_selectable_features" type="geojson" data={referenceGeometry}>
                <Layer
                  id="layer_selectable_features--lines"
                  type="line"
                  paint={linePaintSimpleMap}
                  filter={['==', '$type', 'LineString']}
                />
              </Source>
              <Marker longitude={viewState.longitude} latitude={viewState.latitude} anchor="center">
                <span style={{ fontSize: '20px' }}>&times;</span>
              </Marker>
              <AttributionControl compact={true} position="bottom-left" />
              <NavigationControl showCompass={false} />
            </Map>
          </>
        </FieldPrimitive>
      )
    },
    // i think this is a function that sets the default value of the field - in this case falls back to blank if no defaultValue is given
    defaultValue() {
      return defaultValue || ''
    },
    // i think this function decodes the value from a string into its working type
    parse(value) {
      return parseAsNormalField(value)
    },
    // i think this function takes the value from its working type and encodes it into a string?
    serialize(value) {
      return { value: value === '' ? '' : value }
    },
    validate(value) {
      return validate(value)
    },

    reader: {
      parse(value) {
        const parsed = parseAsNormalField(value)
        return validate(parsed)
      },
    },
  }
}
