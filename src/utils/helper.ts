function getTaskElement(event: Event) {
  const target = event.target as HTMLElement
  return target.closest('.task') as HTMLElement
}

function getTaskID(event: Event) {
  const element = getTaskElement(event)
  return element.dataset.id
}
function getTaskIndex(event: Event) {
  const element = getTaskElement(event)
  return Number(element.dataset.index)
}

export { getTaskElement, getTaskID, getTaskIndex }
