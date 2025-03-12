export const parseLatLngString = (input: string | undefined) => {
  if (!input) return undefined
  if (!input.includes(',')) return undefined

  const [lat, lng] = input.split(',').map(Number)
  return { lng, lat }
}
