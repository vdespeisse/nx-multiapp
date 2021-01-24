import { mount } from '@vue/test-utils'
import Logo from '@/common/components/Logo.vue'

describe('Logo', () => {
  test('is a instance', () => {
    const wrapper = mount(Logo)
    expect(wrapper.vm).to_be_truthy()
  })
})
