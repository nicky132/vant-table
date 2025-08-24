# 加载更多

当数据量较大时，可以使用加载更多功能来分页加载数据，提升页面性能和用户体验。

## 基础加载更多

```vue
<template>
  <VantTable 
    :headers="headers" 
    :data="data"
    :enable-load-more="true"
    :load-more-loading="loadMoreLoading"
    :load-more-finished="loadMoreFinished"
    :load-more-error="loadMoreError"
    @load-more="handleLoadMore"
  />
</template>

<script setup>
import { ref } from 'vue'

const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'title', label: '文章标题', width: 250 },
  { key: 'author', label: '作者', width: 120 },
  { key: 'category', label: '分类', width: 100 },
  { key: 'publishTime', label: '发布时间', width: 150 }
])

const data = ref([
  { id: 1, title: 'Vue.js 3.0 新特性详解', author: '张三', category: '前端', publishTime: '2024-01-01' },
  { id: 2, title: 'React Hooks 实战指南', author: '李四', category: '前端', publishTime: '2024-01-02' },
  { id: 3, title: 'TypeScript 进阶教程', author: '王五', category: '后端', publishTime: '2024-01-03' },
  { id: 4, title: 'Node.js 性能优化', author: '赵六', category: '后端', publishTime: '2024-01-04' },
  { id: 5, title: 'CSS Grid 布局详解', author: '陈七', category: '前端', publishTime: '2024-01-05' }
])

let currentPage = 1
const pageSize = 5

const handleLoadMore = async () => {
  loadMoreLoading.value = true
  loadMoreError.value = false
  
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const nextPage = currentPage + 1
    const newData = generateMockData(nextPage, pageSize)
    
    if (newData.length === 0) {
      loadMoreFinished.value = true
    } else {
      data.value.push(...newData)
      currentPage = nextPage
    }
  } catch (error) {
    loadMoreError.value = true
    console.error('加载更多数据失败:', error)
  } finally {
    loadMoreLoading.value = false
  }
}

// 生成模拟数据
function generateMockData(page, size) {
  const startId = (page - 1) * size + 1
  const endId = page * size
  const mockData = []
  
  const titles = [
    'JavaScript 异步编程', 'Python 数据分析', 'Java 设计模式', 'Go 语言入门',
    'Docker 容器技术', 'Kubernetes 实战', 'MySQL 优化技巧', 'Redis 缓存策略',
    'MongoDB 文档数据库', '微服务架构设计'
  ]
  
  const authors = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十']
  const categories = ['前端', '后端', '数据库', '运维', '架构']
  
  for (let i = startId; i <= Math.min(endId, 50); i++) { // 最多50条数据
    mockData.push({
      id: i,
      title: titles[(i - 1) % titles.length],
      author: authors[(i - 1) % authors.length],
      category: categories[(i - 1) % categories.length],
      publishTime: `2024-01-${String(i).padStart(2, '0')}`
    })
  }
  
  return mockData
}
</script>
```

## 自定义加载状态

```vue
<template>
  <VantTable 
    :headers="headers" 
    :data="data"
    :enable-load-more="true"
    :load-more-loading="loadMoreLoading"
    :load-more-finished="loadMoreFinished"
    :load-more-error="loadMoreError"
    :load-more-offset="100"
    load-more-loading-text="正在加载更多商品..."
    load-more-finished-text="没有更多商品了 🛍️"
    load-more-error-text="加载失败，点击重试 🔄"
    @load-more="handleLoadMore"
  />
  
  <div style="margin-top: 16px; text-align: center; color: #666; font-size: 14px;">
    <p>已加载 {{ data.length }} 条数据</p>
    <p v-if="!loadMoreFinished">向下滚动加载更多</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'name', label: '商品名称', width: 200 },
  { key: 'price', label: '价格', width: 100, type: 'currency' },
  { key: 'sales', label: '销量', width: 100 },
  { key: 'rating', label: '评分', width: 100 },
  { key: 'category', label: '分类', width: 120 }
])

const data = ref([
  { id: 1, name: 'iPhone 15 Pro', price: 7999, sales: 1200, rating: 4.8, category: '手机' },
  { id: 2, name: 'MacBook Air M2', price: 8999, sales: 800, rating: 4.9, category: '电脑' },
  { id: 3, name: 'iPad Pro 11"', price: 6799, sales: 600, rating: 4.7, category: '平板' },
  { id: 4, name: 'Apple Watch Series 9', price: 2999, sales: 1500, rating: 4.6, category: '手表' },
  { id: 5, name: 'AirPods Pro 2', price: 1899, sales: 2000, rating: 4.8, category: '耳机' }
])

let currentPage = 1
let totalPages = 8 // 总共8页数据

const handleLoadMore = async () => {
  loadMoreLoading.value = true
  loadMoreError.value = false
  
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // 模拟随机失败（10%概率）
    if (Math.random() < 0.1) {
      throw new Error('网络错误')
    }
    
    const nextPage = currentPage + 1
    
    if (nextPage > totalPages) {
      loadMoreFinished.value = true
      return
    }
    
    const newData = generateProductData(nextPage)
    data.value.push(...newData)
    currentPage = nextPage
    
  } catch (error) {
    loadMoreError.value = true
    console.error('加载失败:', error)
  } finally {
    loadMoreLoading.value = false
  }
}

function generateProductData(page) {
  const products = [
    { name: 'Samsung Galaxy S24', category: '手机' },
    { name: 'Dell XPS 13', category: '电脑' },
    { name: 'Surface Pro 9', category: '平板' },
    { name: 'Garmin Fenix 7', category: '手表' },
    { name: 'Sony WH-1000XM5', category: '耳机' },
    { name: 'Google Pixel 8', category: '手机' },
    { name: 'ThinkPad X1 Carbon', category: '电脑' },
    { name: 'Galaxy Tab S9', category: '平板' },
    { name: 'Fitbit Versa 4', category: '手表' },
    { name: 'Bose QuietComfort', category: '耳机' }
  ]
  
  const baseId = (page - 1) * 5
  return products.slice(0, 5).map((product, index) => ({
    id: baseId + index + 1,
    name: product.name,
    price: Math.floor(Math.random() * 8000) + 2000,
    sales: Math.floor(Math.random() * 2000) + 100,
    rating: (Math.random() * 1 + 4).toFixed(1),
    category: product.category
  }))
}
</script>
```

## 结合选择功能的加载更多

```vue
<template>
  <div>
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span>已选择 {{ selectedKeys.length }} 项</span>
        <button 
          v-if="selectedKeys.length > 0"
          @click="handleBatchDelete"
          style="margin-left: 16px; padding: 4px 12px; background: #ff4d4f; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          批量删除
        </button>
      </div>
      <div>
        总计: {{ data.length }} 条数据
      </div>
    </div>
    
    <VantTable 
      :headers="headers" 
      :data="data"
      selectable
      v-model:selected-keys="selectedKeys"
      :enable-load-more="true"
      :load-more-loading="loadMoreLoading"
      :load-more-finished="loadMoreFinished"
      :load-more-error="loadMoreError"
      @load-more="handleLoadMore"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedKeys = ref([])
const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'email', label: '邮箱', width: 200 },
  { key: 'name', label: '姓名', width: 120 },
  { key: 'company', label: '公司', width: 150 },
  { key: 'role', label: '职位', width: 120 },
  { key: 'status', label: '状态', width: 100 }
])

const data = ref([
  { id: 1, email: 'john@example.com', name: '约翰', company: 'Google', role: '工程师', status: '活跃' },
  { id: 2, email: 'jane@example.com', name: '简', company: 'Meta', role: '设计师', status: '活跃' },
  { id: 3, email: 'bob@example.com', name: '鲍勃', company: 'Apple', role: '产品经理', status: '暂停' },
  { id: 4, email: 'alice@example.com', name: '爱丽丝', company: 'Microsoft', role: '工程师', status: '活跃' },
  { id: 5, email: 'tom@example.com', name: '汤姆', company: 'Amazon', role: '架构师', status: '活跃' }
])

let currentPage = 1

const handleLoadMore = async () => {
  loadMoreLoading.value = true
  loadMoreError.value = false
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const nextPage = currentPage + 1
    const newUsers = generateUserData(nextPage, 5)
    
    if (newUsers.length === 0 || nextPage > 10) {
      loadMoreFinished.value = true
    } else {
      data.value.push(...newUsers)
      currentPage = nextPage
    }
  } catch (error) {
    loadMoreError.value = true
  } finally {
    loadMoreLoading.value = false
  }
}

const handleSelectionChange = (event) => {
  console.log('选择变化:', event.selectedRows.length)
}

const handleBatchDelete = () => {
  if (confirm(`确定删除选中的 ${selectedKeys.value.length} 条数据吗？`)) {
    // 从数据中移除选中的项
    data.value = data.value.filter(item => !selectedKeys.value.includes(item.id.toString()))
    selectedKeys.value = []
  }
}

function generateUserData(page, count) {
  const names = ['李明', '王芳', '张伟', '刘洋', '陈静', '杨帆', '黄磊', '赵丽', '周杰', '吴娜']
  const companies = ['腾讯', '阿里巴巴', '字节跳动', '美团', '滴滴', '京东', '网易', '百度', '小米', '华为']
  const roles = ['工程师', '产品经理', '设计师', '测试工程师', '架构师', '运营专员', '数据分析师']
  const statuses = ['活跃', '暂停', '待审核']
  
  const baseId = (page - 1) * count
  const result = []
  
  for (let i = 0; i < count && baseId + i < 50; i++) {
    const id = baseId + i + 1
    const name = names[i % names.length]
    result.push({
      id,
      email: `user${id}@example.com`,
      name,
      company: companies[i % companies.length],
      role: roles[i % roles.length],
      status: statuses[i % statuses.length]
    })
  }
  
  return result
}
</script>
```

## 加载更多配置选项

```vue
<template>
  <div>
    <div style="margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <h4>配置选项</h4>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 12px;">
        <label>
          <input type="checkbox" v-model="enableLoadMore" />
          启用加载更多
        </label>
        <label>
          <input type="checkbox" v-model="showLoadMoreUI" />
          显示加载更多UI
        </label>
        <label>
          触发偏移量:
          <input 
            type="number" 
            v-model.number="loadMoreOffset" 
            style="width: 80px; margin-left: 8px;"
            min="10"
            max="200"
          />px
        </label>
        <label>
          页面大小:
          <select v-model.number="pageSize" style="margin-left: 8px;">
            <option value="5">5条</option>
            <option value="10">10条</option>
            <option value="20">20条</option>
          </select>
        </label>
      </div>
    </div>
    
    <VantTable 
      :headers="headers" 
      :data="data"
      :enable-load-more="enableLoadMore"
      :load-more-loading="loadMoreLoading"
      :load-more-finished="loadMoreFinished"
      :load-more-error="loadMoreError"
      :load-more-offset="loadMoreOffset"
      :show-load-more-ui="showLoadMoreUI"
      load-more-loading-text="加载中，请稍候..."
      load-more-finished-text="已加载全部数据"
      load-more-error-text="加载失败，点击重试"
      @load-more="handleLoadMore"
    />
    
    <div style="margin-top: 16px; padding: 12px; background: #e6f7ff; border-radius: 6px;">
      <p><strong>状态信息:</strong></p>
      <p>• 当前页码: {{ currentPage }}</p>
      <p>• 每页大小: {{ pageSize }}</p>
      <p>• 数据总数: {{ data.length }}</p>
      <p>• 加载状态: {{ loadMoreLoading ? '加载中' : '空闲' }}</p>
      <p>• 是否完成: {{ loadMoreFinished ? '是' : '否' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// 配置选项
const enableLoadMore = ref(true)
const showLoadMoreUI = ref(true)
const loadMoreOffset = ref(50)
const pageSize = ref(5)

// 状态变量
const loadMoreLoading = ref(false)
const loadMoreFinished = ref(false)
const loadMoreError = ref(false)
const currentPage = ref(1)

const headers = ref([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'title', label: '标题', width: 250 },
  { key: 'views', label: '浏览量', width: 100 },
  { key: 'likes', label: '点赞数', width: 100 },
  { key: 'createTime', label: '创建时间', width: 150 }
])

const data = ref([
  { id: 1, title: '如何学习Vue.js', views: 1500, likes: 89, createTime: '2024-01-01 10:00' },
  { id: 2, title: 'React vs Vue对比', views: 2300, likes: 156, createTime: '2024-01-02 14:30' },
  { id: 3, title: 'JavaScript异步编程', views: 1800, likes: 92, createTime: '2024-01-03 09:15' }
])

// 监听页面大小变化，重置数据
watch(pageSize, () => {
  resetData()
})

const handleLoadMore = async () => {
  loadMoreLoading.value = true
  loadMoreError.value = false
  
  try {
    // 模拟API调用延迟
    const delay = Math.random() * 1000 + 500 // 0.5-1.5秒随机延迟
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // 模拟10%的失败率
    if (Math.random() < 0.1) {
      throw new Error('模拟网络错误')
    }
    
    const nextPage = currentPage.value + 1
    const maxPages = Math.ceil(100 / pageSize.value) // 假设总共100条数据
    
    if (nextPage > maxPages) {
      loadMoreFinished.value = true
      return
    }
    
    const newData = generateBlogData(nextPage, pageSize.value)
    data.value.push(...newData)
    currentPage.value = nextPage
    
  } catch (error) {
    loadMoreError.value = true
    console.error('加载更多失败:', error)
  } finally {
    loadMoreLoading.value = false
  }
}

const resetData = () => {
  currentPage.value = 1
  loadMoreFinished.value = false
  loadMoreError.value = false
  
  // 重新生成初始数据
  data.value = generateBlogData(1, Math.min(pageSize.value, 3))
}

function generateBlogData(page, size) {
  const titles = [
    'Vue 3 Composition API详解', 'TypeScript实战指南', 'React Hooks最佳实践',
    'Node.js性能优化技巧', 'CSS Grid布局教程', 'JavaScript设计模式',
    'webpack配置详解', 'Docker容器化部署', '微服务架构设计',
    'MongoDB数据库优化', 'Redis缓存策略', 'MySQL索引优化'
  ]
  
  const baseId = (page - 1) * size
  const result = []
  
  for (let i = 0; i < size; i++) {
    const id = baseId + i + 1
    if (id > 100) break // 最多100条数据
    
    result.push({
      id,
      title: titles[(id - 1) % titles.length],
      views: Math.floor(Math.random() * 5000) + 500,
      likes: Math.floor(Math.random() * 300) + 20,
      createTime: new Date(2024, 0, id).toLocaleString('zh-CN')
    })
  }
  
  return result
}
</script>
```

## 加载更多最佳实践

### 1. 性能优化
- **合理设置页面大小**: 根据内容复杂度和网络状况选择合适的页面大小
- **触发时机优化**: 设置合适的 `load-more-offset` 值，在用户滚动到接近底部时触发加载
- **请求去重**: 防止用户快速滚动时发起多个重复请求

### 2. 用户体验
- **加载状态反馈**: 提供清晰的加载中、加载完成、加载失败的状态提示
- **错误重试机制**: 加载失败时允许用户点击重试
- **数据预加载**: 可以考虑在用户即将滚动到底部前提前加载数据

### 3. 数据管理
- **状态持久化**: 在用户离开页面再回来时保持加载状态
- **内存管理**: 对于长列表考虑虚拟滚动或者定期清理旧数据
- **缓存机制**: 对已加载的数据进行合理缓存

### 4. 错误处理
- **网络错误**: 处理网络连接异常的情况
- **服务器错误**: 处理服务器返回错误的情况  
- **数据异常**: 处理返回数据格式异常的情况

### 5. 与其他功能的配合
- **选择功能**: 加载新数据时保持已选择项的状态
- **排序过滤**: 在有排序或过滤条件时，确保新加载的数据也符合当前条件
- **搜索功能**: 搜索状态下的加载更多需要传递搜索条件