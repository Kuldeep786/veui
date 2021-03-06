import { mount } from '@vue/test-utils'
import longpress from '@/directives/longpress'
import { waitTimeout } from '../../../utils'
import config from '@/managers/config'

const DEFAULT_TIMEOUT = config.get('longpress.timeout')
const DEFAULT_REPEAT_INTERVAL = config.get('longpress.repeatInterval')

function isAbout (val, base, error = 80) {
  return val >= base && val < base + error
}

describe('directives/longpress', () => {
  it(`should trigger the handler after ${DEFAULT_TIMEOUT}ms by default`, async done => {
    let called = false
    let time = Date.now()
    const wrapper = mount({
      directives: { longpress },
      template: `<div v-longpress="{
          handler
        }">foo</div>`,
      methods: {
        handler () {
          if (called) {
            return
          }
          called = true

          let timeout = Date.now() - time
          expect(isAbout(timeout, DEFAULT_TIMEOUT)).toBe(true)
          done()
        }
      }
    })
    wrapper.trigger('mousedown')
    await waitTimeout(DEFAULT_TIMEOUT + 500)
    wrapper.trigger('mouseup')
  })

  it('should trigger the handler after specified timeout', async done => {
    let time = Date.now()
    const wrapper = mount({
      directives: { longpress },
      template: `<div v-longpress="{
          handler,
          timeout: 2000
        }">foo</div>`,
      methods: {
        handler () {
          let timeout = Date.now() - time
          expect(isAbout(timeout, 2000)).toBe(true)
          done()
        }
      }
    })
    wrapper.trigger('mousedown')
    await waitTimeout(2000)
    wrapper.trigger('mouseup')
  })

  it(`should trigger the handler repeatedly with repeat option after each ${DEFAULT_REPEAT_INTERVAL}ms by default`, async done => {
    let delays = []
    let repeat = 3
    let time = Date.now()
    const wrapper = mount({
      directives: { longpress },
      template: `<div v-longpress.repeat="{
          handler
        }">foo</div>`,
      methods: {
        handler () {
          let timeout = Date.now() - time
          delays.push(timeout)

          if (delays.length === 4) {
            expect(isAbout(delays[0], DEFAULT_TIMEOUT)).toBe(true)
            expect(
              isAbout(delays[1], DEFAULT_TIMEOUT + DEFAULT_REPEAT_INTERVAL)
            ).toBe(true)
            expect(
              isAbout(delays[2], DEFAULT_TIMEOUT + DEFAULT_REPEAT_INTERVAL * 2)
            ).toBe(true)
            expect(
              isAbout(delays[3], DEFAULT_TIMEOUT + DEFAULT_REPEAT_INTERVAL * 3)
            ).toBe(true)
            done()
          }
        }
      }
    })
    wrapper.trigger('mousedown')
    await waitTimeout(DEFAULT_TIMEOUT + DEFAULT_REPEAT_INTERVAL * repeat + 50)
    wrapper.trigger('mouseup')
  })

  it(`should trigger the handler repeatedly with repeat option after each specified interval`, async done => {
    let delays = []
    let repeat = 3
    let time = Date.now()
    const wrapper = mount({
      directives: { longpress },
      template: `<div v-longpress.repeat="{
          handler,
          repeatInterval: 300
        }">foo</div>`,
      methods: {
        handler () {
          let timeout = Date.now() - time
          delays.push(timeout)

          if (delays.length === 4) {
            expect(isAbout(delays[0], DEFAULT_TIMEOUT)).toBe(true)
            expect(isAbout(delays[1], DEFAULT_TIMEOUT + 300)).toBe(true)
            expect(isAbout(delays[2], DEFAULT_TIMEOUT + 300 * 2)).toBe(true)
            expect(isAbout(delays[3], DEFAULT_TIMEOUT + 300 * 3)).toBe(true)
            done()
          }
        }
      }
    })
    wrapper.trigger('mousedown')
    await waitTimeout(DEFAULT_TIMEOUT + 300 * repeat + 50)
    wrapper.trigger('mouseup')
  })
})
