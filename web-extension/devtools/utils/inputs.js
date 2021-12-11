function round(value, precision = 5) {
  const multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}

function registerInputs() {
  // Binded spans
  document.querySelectorAll('[data-bind]').forEach((elem) => {
    const path = elem.getAttribute('data-bind')

    // Initial value
    elem.innerHTML = store.get(`${path}.value`) ?? store.get(`${path}.default`)

    // On change
    store.bind(`${path}.value`, (value) => {
      elem.innerHTML = value
    })
  })

  // Selects
  document.querySelectorAll('select').forEach((select) => {
    const path = select.getAttribute('data-value')

    // Initial value
    select.value = store.get(`${path}.value`) ?? store.get(`${path}.default`)

    // When the value changes in the store
    store.bind(`${path}.value`, (value) => {
      select.value = value
    })

    // When the user changes the value in the select
    select.addEventListener('change', (evt) => {
      store.set(`${path}.value`, evt.target.value)
    })
  })

  // Plus/minus inputs
  document.querySelectorAll('.input-plus-minus').forEach((wrapper) => {
    const path = wrapper.getAttribute('data-value')

    const [minus, plus] = wrapper.querySelectorAll('button')
    const input = wrapper.querySelector('input')

    const { value, default: defaultValue, min, step, max } = store.get(`${path}`)

    // Initial value
    input.value = value ?? defaultValue
    input.placeholder = defaultValue

    // When the value changes in the store
    store.bind(`${path}.value`, (value) => {
      input.value = value
    })

    // When the user changes the value in the input
    input.addEventListener('change', (evt) => {
      let val = parseFloat(evt.target.value)

      if (isNaN(val)) {
        val = defaultValue
      }

      store.set(`${path}.value`, val)
    })

    minus.addEventListener('click', () => {
      let val = parseFloat(input.value)

      if (round(val % step) == 0) {
        val -= step
      } else {
        val -= val % step
      }

      if (val < min) {
        val = min
      }

      store.set(`${path}.value`, round(val))
    })

    plus.addEventListener('click', () => {
      let val = parseFloat(input.value)

      if (round(val % step) == 0) {
        val += step
      } else {
        val += val % step
      }

      if (val > max) {
        val = max
      }

      store.set(`${path}.value`, round(val))
    })
  })

  // Switches
  document.querySelectorAll('.switch input').forEach((input) => {
    const path = input.getAttribute('data-value')

    // Initial value
    input.checked = store.get(path)

    // When the value changes in the store
    store.bind(path, (value) => {
      input.checked = value
    })

    // When the user changes the value in the switch
    input.addEventListener('change', (evt) => {
      store.set(path, evt.target.checked)
    })
  })

  // Regex list
  document.querySelectorAll('.regex-list').forEach((list) => {
    const path = list.getAttribute('data-value')
    const [experiment] = path.split('.')

    const input = list.querySelector('input')
    const domList = list.querySelector('ul:first-of-type')

    const printRegexes = () => {
      domList.innerHTML = ''

      store.get(path).forEach((regex, index) => {
        const experimentRunning = store.get(`${experiment}.enabled`)

        const li = document.createElement('li')
        li.innerHTML = `
          <div class="option">
            <div class="text-regex">
              <span>${new RegExp(regex).toString()}</span>
              <button ${experimentRunning ? 'disabled' : ''}>X</button>
            </div>
          </div>`

        li.querySelector('button').addEventListener('click', () => {
          store.set(
            path,
            store.get(path).filter((_, i) => i !== index)
          )
        })

        domList.appendChild(li)
      })
    }

    // Initial list
    printRegexes()

    // When the list changes in the store
    store.bind(path, () => {
      printRegexes()
    })

    // When the user adds a regex to the list
    input.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') {
        evt.preventDefault()

        const regex = input.value

        if (regex && !store.get(path).includes(regex)) {
          store.set(path, [...store.get(path), regex])

          input.value = ''
        }
      }
    })
  })
}
