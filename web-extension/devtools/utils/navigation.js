/**
 * Handle section navigation:
 * - Click on link
 * - Scroll to the corresponding section
 * - Click in the section
 */
function handleSectionNavigation() {
  const sectionsIntersection = new Map()
  let lastClickedSection = null

  const onIntersectionChange = (entries) => {
    entries.forEach((entry) => {
      sectionsIntersection.set(entry.target, entry.intersectionRatio)
    })

    if (sectionsIntersection.get(lastClickedSection) >= 0.95) {
      setActive(lastClickedSection.id)
    } else {
      const maxRatio = Math.max(...sectionsIntersection.values())
      const maxRatioSection = [...sectionsIntersection.entries()].find(
        ([, ratio]) => ratio === maxRatio
      )

      setActive(maxRatioSection[0].id)
    }
  }

  const observer = new IntersectionObserver(onIntersectionChange, {
    root: document.querySelector('main'),
    rootMargin: '0px',
    threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1],
  })

  document.querySelectorAll('section').forEach((section) => {
    observer.observe(section)
  })

  document.querySelectorAll('nav .menu a').forEach((link) => {
    link.addEventListener('click', (event) => {
      let { target } = event

      while (!target.hash) {
        target = target.parentNode
      }

      event.preventDefault()
      const section = document.querySelector(target.hash)
      lastClickedSection = section

      section.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth',
      })

      // In case no scroll is needed
      onIntersectionChange([])
    })
  })

  document.querySelectorAll('main section').forEach((section) => {
    section.addEventListener('click', () => {
      setActive(section.id)
    })
  })

  function setActive(id) {
    // Reset all nav links
    document.querySelectorAll('nav .menu a').forEach((link) => {
      link.classList.remove('active')
    })

    // Set the active link
    document.querySelector(`nav .menu a[href="#${id}"]`).classList.add('active')

    // Reset all sections
    document.querySelectorAll('main section').forEach((section) => {
      section.classList.remove('active')
    })

    // Set the active section
    document.querySelector(`#${id}`).classList.add('active')
  }
}

function toggleNavRunning(category, running) {
  const nav = document.querySelector(`nav .menu a[href="#${category}"]`)
  nav.classList.toggle('running', running)
}
