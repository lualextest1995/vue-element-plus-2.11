<template>
  <div class="demo">
    <div>
      <el-cascader
        v-model="value"
        popper-class="custom-header"
        :options="options"
        :props="props"
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="2"
        clearable
        style="width: 400px"
      >
        <template #header>
          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
            全部
          </el-checkbox>
        </template>
        <template #default="{ node, data }">
          <span v-if="data.value === 7">
            <span>{{ data.label }}</span>
            <el-icon :size="16" class="custom-icon" @click.stop="handleIconClick">
              <Setting />
            </el-icon>
          </span>
          <span v-else>{{ data.label }}</span>
        </template>
        <template #footer>
          <el-button link size="small" @click="handleClear"> 清除 </el-button>
        </template>
      </el-cascader>
      <el-cascader
        v-model="value"
        :options="options"
        :props="props"
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="2"
        clearable
        style="width: 400px"
      >
        <template #header>
          <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
            全部
          </el-checkbox>
        </template>
        <template #default="{ node, data }">
          <span v-if="data.value === 7">
            <span>{{ data.label }}</span>
            <el-icon :size="16" class="custom-icon" @click.stop="handleIconClick">
              <Setting />
            </el-icon>
          </span>
          <span v-else>{{ data.label }}</span>
        </template>
        <template #footer>
          <el-button link size="small" @click="handleClear"> 清除 </el-button>
        </template>
      </el-cascader>
    </div>
    <div>
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        class="demo-tabs"
        closable
        @tab-remove="removeTab"
      >
        <el-tab-pane
          v-for="item in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >
          {{ item.content }}
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Setting } from '@element-plus/icons-vue'

const props = { multiple: true }
const checkAll = ref(true)
const indeterminate = ref(false)

const options = ref([
  {
    value: 1,
    label: '後台',
    children: [
      { value: 11, label: '後台登入失敗' },
      { value: 12, label: '玩家充值或取款' },
    ],
  },
  {
    value: 2,
    label: '遊戲類型',
    children: [
      { value: 21, label: '遊戲單日監控' },
      { value: 22, label: '遊戲實時監控' },
    ],
  },
  {
    value: 3,
    label: '代理',
    children: [
      { value: 31, label: '代理日盈利' },
      { value: 32, label: '代理月盈利' },
      { value: 33, label: '代理流水' },
      { value: 34, label: '新房代理日盈利' },
    ],
  },
  {
    value: 4,
    label: '轉殊代理',
    children: [
      { value: 41, label: '特殊代理月盈利' },
      { value: 42, label: '特殊代理日盈利' },
    ],
  },
  {
    value: 5,
    label: '玩家',
    children: [
      { value: 51, label: '黑名單' },
      { value: 52, label: '玩家日盈利' },
      { value: 53, label: '大額玩家' },
      { value: 54, label: '單筆上下線' },
    ],
  },
  {
    value: 6,
    label: '大額玩家',
    children: [{ value: 61, label: '大額玩家上線通知' }],
  },
  {
    value: 7,
    label: '自訂義',
  },
])

const customValues = [
  [1, 11], // 後台 -> 後台登入失敗
  [5, 51], // 玩家 -> 黑名單
  [2, 21], // 遊戲類型 -> 遊戲單日監控
]

// 輔助函數：檢查路徑是否相等
const isPathEqual = (path1, path2) => {
  if (path1.length !== path2.length) return false
  return path1.every((val, idx) => val === path2[idx])
}

// 輔助函數：檢查是否為自訂義相關的路徑
const isCustomRelatedPath = (path) => {
  // 檢查是否為「自訂義」本身
  if (path.length === 1 && path[0] === 7) return true
  // 檢查是否在 customValues 中
  return customValues.some((cv) => isPathEqual(cv, path))
}

const getAllValuePaths = computed(() => {
  const result = []
  const queue = options.value.map((node) => ({
    node,
    path: [node.value],
  }))

  while (queue.length > 0) {
    const { node, path } = queue.shift()
    if (node.children?.length) {
      node.children.forEach((child) => {
        queue.push({ node: child, path: [...path, child.value] })
      })
    } else {
      result.push(path)
    }
  }
  return result
})

// 預設勾選全部
const value = ref(getAllValuePaths.value)

watch(value, (val, oldVal) => {
  if (val.length === 0) {
    checkAll.value = false
    indeterminate.value = false
  } else if (val.length === getAllValuePaths.value.length) {
    checkAll.value = true
    indeterminate.value = false
  } else {
    indeterminate.value = true
  }

  // 如果勾選全部，只顯示「全部」tab
  if (val.length === getAllValuePaths.value.length) {
    editableTabs.value = [
      {
        title: '全部',
        name: 'all',
        content: '全部內容',
      },
    ]
    editableTabsValue.value = 'all'
    return
  }

  // 如果之前是全部勾選，現在不是，需要生成個別 tabs
  const wasAllSelected = oldVal && oldVal.length === getAllValuePaths.value.length
  if (wasAllSelected && val.length > 0) {
    // 清空 tabs，重新生成
    editableTabs.value = []

    // 為所有勾選的項目創建 tab
    val.forEach((path) => {
      const leafValue = path[path.length - 1]

      // 尋找對應的標籤名稱
      const findLabel = (nodes, targetPath, currentPath = []) => {
        for (const node of nodes) {
          const newPath = [...currentPath, node.value]
          if (isPathEqual(newPath, targetPath)) {
            return node.label
          }
          if (node.children) {
            const result = findLabel(node.children, targetPath, newPath)
            if (result) return result
          }
        }
        return null
      }

      const label = findLabel(options.value, path)
      if (label) {
        editableTabs.value.push({
          title: label,
          name: String(leafValue),
          content: `${label} content`,
        })
      }
    })

    // 切換到第一個 tab
    if (editableTabs.value.length > 0) {
      editableTabsValue.value = editableTabs.value[0].name
    }
    return
  }

  // 取得當前所有勾選的最裡層值
  const currentLeafValues = new Set(val.map((path) => path[path.length - 1]))

  // 取得之前所有勾選的最裡層值
  const oldLeafValues = new Set((oldVal || []).map((path) => path[path.length - 1]))

  // 找出新增的項目
  const addedValues = [...currentLeafValues].filter((v) => !oldLeafValues.has(v))

  // 找出移除的項目
  const removedValues = [...oldLeafValues].filter((v) => !currentLeafValues.has(v))

  // 檢查是否勾選了「自定義」選項（value = 7）
  if (addedValues.includes(7)) {
    // 執行原本 footer 自定義按鈕的操作
    value.value = [
      [7], // 自訂義
      ...customValues,
    ]
    return
  }

  // 檢查是否取消勾選了「自定義」選項
  if (removedValues.includes(7)) {
    // 清掉自訂義相關的勾選
    value.value = val.filter((path) => !isCustomRelatedPath(path))
    return
  }

  // 移除「全部」tab（如果存在）
  editableTabs.value = editableTabs.value.filter((tab) => tab.name !== 'all')

  // 處理新增的項目：打開對應的 tab
  addedValues.forEach((leafValue) => {
    const path = val.find((p) => p[p.length - 1] === leafValue)
    if (path) {
      // 尋找對應的標籤名稱
      const findLabel = (nodes, targetPath, currentPath = []) => {
        for (const node of nodes) {
          const newPath = [...currentPath, node.value]
          if (isPathEqual(newPath, targetPath)) {
            return node.label
          }
          if (node.children) {
            const result = findLabel(node.children, targetPath, newPath)
            if (result) return result
          }
        }
        return null
      }

      const label = findLabel(options.value, path)
      if (label) {
        // 檢查 tab 是否已存在
        const existingTab = editableTabs.value.find((tab) => tab.name === String(leafValue))
        if (!existingTab) {
          // 新增 tab
          editableTabs.value.push({
            title: label,
            name: String(leafValue),
            content: `${label} content`,
          })
        }
        // 切換到該 tab
        editableTabsValue.value = String(leafValue)
      }
    }
  })

  // 處理移除的項目：關閉對應的 tab
  removedValues.forEach((leafValue) => {
    const tabName = String(leafValue)
    const tabs = editableTabs.value
    let activeName = editableTabsValue.value

    // 如果要刪除的是當前活動的 tab，需要切換到其他 tab
    if (activeName === tabName) {
      tabs.forEach((tab, index) => {
        if (tab.name === tabName) {
          const nextTab = tabs[index + 1] || tabs[index - 1]
          if (nextTab) {
            activeName = nextTab.name
          }
        }
      })
      editableTabsValue.value = activeName
    }

    // 移除 tab
    editableTabs.value = tabs.filter((tab) => tab.name !== tabName)
  })
})

const handleCheckAll = (val) => {
  indeterminate.value = false
  value.value = val ? getAllValuePaths.value : []
}

const handleClear = () => {
  value.value = []
}

const handleIconClick = () => {
  // 處理 icon 點擊事件
  console.log('設定 icon 被點擊了')
  // 您可以在這裡添加其他操作，例如：
  // - 打開設定對話框
  // - 觸發自訂義操作
  // - 顯示提示訊息
  alert('點擊了自訂義設定')
}

const editableTabsValue = ref('all')
const editableTabs = ref([
  {
    title: '全部',
    name: 'all',
    content: '全部內容',
  },
])

const removeTab = (targetName) => {
  // 如果是「全部」tab，取消全選
  if (targetName === 'all') {
    // 取消全選會觸發 watch，自動清空 tabs
    checkAll.value = false
    value.value = []
    return
  }

  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName)

  // 取消對應的勾選
  const leafValue = Number(targetName)
  value.value = value.value.filter((path) => {
    const pathLeafValue = path[path.length - 1]
    return pathLeafValue !== leafValue
  })
}
</script>

<style lang="scss">
// 使用自定義的 popper-class="custom-header" 來限定作用範圍，避免污染其他 cascader 組件
.custom-header.el-cascader__dropdown {
  .el-cascader-panel {
    .el-cascader-menu:first-child {
      .el-cascader-node:last-child {
        .el-cascader-node__label {
          padding-left: 10px;
          padding-right: 20px;
          overflow: visible;
        }
        .el-checkbox {
          visibility: hidden !important;
        }
        .custom-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          cursor: pointer;
          transition: transform 0.2s;
          &:hover {
            transform: translateY(-50%) scale(1.1);
            color: #409efc;
          }
        }
      }
    }
  }
}
</style>
