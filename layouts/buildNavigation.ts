import { NAVIGATION_LINKS, type NavigatinItem } from '@config/links'
import { getEntry } from 'astro:content'

export const buildNavigation = async () => {
  // For some pages, we can specify if they are active. We filter them here.
  let navigation: NavigatinItem[] = NAVIGATION_LINKS

  const normalize = (href?: string) => (href ?? '').replace(/\/+$/, '')

  const homepage = await getEntry('homepage', 'index')
  if (homepage?.data?.active === false) {
    navigation = navigation.filter((link) => normalize(link.href) !== normalize('/'))
  }

  const surveyresultpage = await getEntry('surveyresultspage', 'index')
  if (surveyresultpage?.data?.active === false) {
    navigation = navigation.filter((link) => normalize(link.href) !== normalize('/beteiligung'))
  }

  const routepage = await getEntry('routepage', 'index')
  if (routepage?.data?.active === false) {
    navigation = navigation.filter((link) => normalize(link.href) !== normalize('/route'))
  }

  const faqspage = await getEntry('faqspage', 'index')
  if (faqspage?.data?.active === false) {
    navigation = navigation.filter((link) => normalize(link.href) !== normalize('/faq'))
  }

  const simplifiedLanguage = await getEntry('simplifiedlanguagepage', 'index')
  if (simplifiedLanguage?.data?.active === false) {
    navigation = navigation.filter((link) => normalize(link.href) !== normalize('/leichte-sprache'))
  }

  return navigation
}
