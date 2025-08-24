import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VantTable from '../src/VantTable.vue'

// Mock Vant components inline
vi.mock('vant', () => ({
  VanLoading: { name: 'VanLoading' },
  VanEmpty: { name: 'VanEmpty' },
  VanIcon: { name: 'VanIcon' },
  VanButton: { name: 'VanButton' }
}))

// Mock DOM APIs
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  writable: true,
  value: vi.fn(() => ({
    width: 800,
    height: 48,
    top: 0,
    left: 0,
    bottom: 48,
    right: 800
  }))
})

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn((cb) => setTimeout(cb, 0))
})

// Mock basic data
const mockHeaders = [
  { key: 'id', label: 'ID', width: 100 },
  { key: 'name', label: '姓名', width: 120 }
]

const mockData = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]

describe('VantTable Basic Tests', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(VantTable, {
      props: {
        headers: mockHeaders,
        data: mockData,
        width: '100%',
        height: 400
      }
    })
  })

  describe('基础渲染', () => {
    it('应该正确渲染表格容器', () => {
      expect(wrapper.find('.vant-table-wrapper').exists()).toBe(true)
    })

    it('应该正确渲染表头', () => {
      const headers = wrapper.findAll('.vant-th')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('应该正确渲染数据', () => {
      const tbody = wrapper.find('.vant-tbody')
      expect(tbody.exists()).toBe(true)
    })
  })

  describe('组件实例方法', () => {
    it('应该暴露必要的API方法', () => {
      const instance = wrapper.vm
      
      expect(typeof instance.clearSelection).toBe('function')
      expect(typeof instance.getSelectedRowKeys).toBe('function')
      expect(typeof instance.getSelectedRows).toBe('function')
      expect(typeof instance.setSelectedRowKeys).toBe('function')
    })
  })

  describe('基础功能验证', () => {
    it('应该支持宽高设置', () => {
      const container = wrapper.find('.vant-table-wrapper')
      expect(container.attributes('style')).toContain('width: 100%')
      expect(container.attributes('style')).toContain('height: 400px')
    })

    it('应该支持数据变化', async () => {
      const newData = [{ id: 3, name: '王五' }]
      
      await wrapper.setProps({ data: newData })
      await nextTick()
      
      // 验证数据已更新
      const instance = wrapper.vm
      expect(instance.filteredAndSortedData.length).toBe(1)
    })
  })
})