import { BASE_CONFIG } from '@config/config'
import { COLORS, COLORSCLASSES, LINKCLASSES } from '@config/styles'
import { z } from 'astro/zod'
import { consoleLogSubjectIntro, consoleLogSubjectOutroSuccess } from './utils/consoleLog'

const zodBASE_CONFIG = z
  .object({
    GITHUB_REPO_NAME: z.string(),
    PRODUCTION_URL: z.string().url(),
    META: z
      .object({
        title: z.string(),
        description: z.string(),
      })
      .strict(),
    FONTNAME: z.string(),
    USE_MATOMO: z.boolean(),
  })
  .strict()

const zodLINKCLASSES = z
  .object({
    link: z.string(),
    groupLink: z.string(),
    button: z.string(),
  })
  .strict()

const zodCOLORSCLASSES = z
  .object({
    proseLink: z.string(),
    heroTextBg: z.string(),
    heroImageOverlay: z.string(),
    factsBg: z.string(),
    factNumber: z.string(),
    factDesc: z.string(),
    faqNumberBg: z.string(),
    milestoneHeadline: z.string(),
    scrollTopLink: z.string(),
    navigatorText: z.string(),
    navigationUnderline: z.string(),
    navigatorMobileLink: z.string(),
    quotesButton: z.string(),
    quotesPersonName: z.string(),
    quotesPersonPosition: z.string(),
    pageNoteFoundTitle: z.string(),
    routesListMarker: z.string(),
    barChartFill: z.string(),
    mapStatusIdea: z.string(),
    mapStatusCheck: z.string(),
    mapStatusPlanning: z.string(),
    mapStatusInProgress: z.string(),
    mapStatusDone: z.string(),
    legendSimpleMap: z.string(),
  })
  .strict()

const zodCOLORS = z
  .object({
    heroPin: z.string(),
    milestoneDone: z.string(),
    mapDefault: z.string(),
    mapStatusIdea: z.string(),
    mapStatusCheck: z.string(),
    mapStatusPlanning: z.string(),
    mapStatusInProgress: z.string(),
    mapStatusDone: z.string(),
  })
  .strict()

export const validateConfig = () => {
  consoleLogSubjectIntro('Validate configs')

  zodBASE_CONFIG.parse(BASE_CONFIG)
  zodLINKCLASSES.parse(LINKCLASSES)

  zodLINKCLASSES.parse(LINKCLASSES)
  zodCOLORSCLASSES.parse(COLORSCLASSES)
  zodCOLORS.parse(COLORS)

  consoleLogSubjectOutroSuccess('Configs validated')
}
