import { FieldPrimitive } from '@keystar/ui/field'
import type { BasicFormField, FormFieldStoredValue } from '@keystatic/core'
import { HexColorInput, HexColorPicker } from 'react-colorful'
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

export function ColorPicker({
  label,
  defaultValue,
  description,
  validation = {},
}: {
  label: string
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
      return (
        <FieldPrimitive
          description={description}
          label={label}
          isRequired={validation.isRequired}
          errorMessage={validationMessage(props.value)}
        >
          <div
            style={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <HexColorPicker color={props.value} onChange={props.onChange} />
            <HexColorInput color={props.value} name={`${label} hex`} onChange={props.onChange} />
          </div>
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
