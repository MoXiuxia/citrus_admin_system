import { mount } from '@vue/test-utils'
import Login from '../../../src/components/Login.vue'
import router from '../../../src/router'

// Mock fetch
global.fetch = jest.fn()

describe('Login 组件单元测试', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })
    fetch.mockClear()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  test('应该正确渲染登录表单', () => {
    expect(wrapper.find('h2').text()).toBe('陈皮信息管理系统')
    expect(wrapper.findAll('.tab-btn').length).toBe(3)
    expect(wrapper.find('input[placeholder="请输入账号"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="请输入密码"]').exists()).toBe(true)
  })

  test('应该切换标签页', async () => {
    const adminTab = wrapper.findAll('.tab-btn')[1]
    await adminTab.trigger('click')
    
    expect(wrapper.vm.activeTab).toBe('admin')
    expect(wrapper.find('input[placeholder="请输入管理员账号"]').exists()).toBe(true)
  })

  test('应该处理用户登录', async () => {
    // Mock 成功的登录响应
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: '登录成功',
        user: { id: 1, username: 'testuser' }
      })
    })

    // 设置表单数据
    await wrapper.find('input[placeholder="请输入账号"]').setValue('testuser')
    await wrapper.find('input[placeholder="请输入密码"]').setValue('password')
    
    // 触发登录
    await wrapper.find('button').trigger('click')

    // 检查是否调用了正确的 API
    expect(fetch).toHaveBeenCalledWith('/api/user-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password'
      })
    })
  })

  test('应该显示登录错误信息', async () => {
    // Mock 失败的登录响应
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: '账号或密码错误'
      })
    })

    await wrapper.find('input[placeholder="请输入账号"]').setValue('wronguser')
    await wrapper.find('input[placeholder="请输入密码"]').setValue('wrongpass')
    await wrapper.find('button').trigger('click')

    // 等待 Vue 更新
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.message.error').text()).toContain('账号或密码错误')
  })

  test('应该验证表单输入', async () => {
    // 不输入任何内容直接点击登录
    await wrapper.find('button').trigger('click')

    // 等待 Vue 更新
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.message.error').text()).toContain('请输入账号和密码')
  })
})