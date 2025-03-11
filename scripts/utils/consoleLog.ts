import colors from 'colors'

export const logPrefix = (input: string) => {
  return `[rsv-shared] ${input}`
}

type Rest = (Record<string, any> | string)[]

export const consoleLogSubjectIntro = (input: string, ...rest: Rest) => {
  console.log(colors.inverse.white(logPrefix(input)), ...rest)
}

export const consoleLogSubjectOutroSuccess = (input: string, ...rest: Rest) => {
  console.log(colors.inverse.green(logPrefix(input)), ...rest)
}

export const consoleLogSubjectError = (input: string, ...rest: Rest) => {
  console.log(colors.inverse.red(logPrefix(input)), ...rest)
}

export const consoleLogSubjectWarning = (input: string, ...rest: Rest) => {
  console.log(colors.inverse.yellow(logPrefix(input)), ...rest)
}

export const consoleLogSubjectNote = (input: string, ...rest: Rest) => {
  console.log(colors.gray(logPrefix(input)), ...rest)
}
