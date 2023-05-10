import { ref } from 'vue'

export default function useColor(BASE_H = 212, BASE_S = 93, BASE_L = 53) {
  const STEP_H = 3
  const STEP_L = 1
  const MAX_COLOR_SPAN = 7
  const SPAN_H = MAX_COLOR_SPAN * STEP_H
  const SPAN_L = MAX_COLOR_SPAN * STEP_L

  function getBackgroundColor(index: number, count: number) {
    const sH = count > MAX_COLOR_SPAN && !index ? SPAN_H / count : STEP_H
    const sL = count > MAX_COLOR_SPAN && !index  ? SPAN_L / count : STEP_L

    return `hsl(${BASE_H + index * sH}, 
        ${index ? BASE_S - 10 : BASE_S }%, 
        ${BASE_L + index * sL}%)`
  }

  return { getBackgroundColor }
}
