import { ref } from 'vue'

export default function useColor(h = 212, s = 93, l = 53) {
  const baseH = ref(h)
  const baseS = ref(s)
  const baseL = ref(l)
  const stepH = ref(-2.5)
  const stepS = ref(1)
  const stepL = ref(2.5)
  const maxColorSpan = ref(5)
  const spanH = ref(maxColorSpan.value * stepH.value)
  const spanS = ref(maxColorSpan.value * stepS.value)
  const spanL = ref(maxColorSpan.value * stepL.value)

  function getBackgroundColor(index: number, count: number) {
    const sH = count > maxColorSpan.value ? spanH.value / count : stepH.value
    const sS = count > maxColorSpan.value ? spanS.value / count : stepS.value
    const sL = count > maxColorSpan.value ? spanL.value / count : stepL.value

    return `hsl(${baseH.value + index * sH}, 
        ${Math.min(100, baseS.value + index * sS )}%, 
        ${Math.min(100, baseL.value + index * sL)}%)`
  }

  return { baseH, baseS, baseL, getBackgroundColor }
}
