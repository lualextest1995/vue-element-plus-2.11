import { onMounted, onBeforeUnmount } from 'vue'
import Sortable from 'sortablejs'

/**
 * 拖拉排序 - 簡單到白痴都能用
 * @param {string} selector - CSS 選擇器
 * @param {Ref<Array>} items - 要排序的陣列(直接傳 ref)
 * @param {Object} options - Sortable 選項(可選)
 */
export function useSortable(selector, items, options = {}) {
  let sortable = null

  onMounted(() => {
    const el = document.querySelector(selector)
    if (!el) return

    sortable = Sortable.create(el, {
      animation: 150,
      ...options,
      onEnd: (e) => {
        // 移動元素 - 就這麼簡單
        const [item] = items.value.splice(e.oldIndex, 1)
        items.value.splice(e.newIndex, 0, item)

        // 如果用戶要做其他事,讓他們自己做
        options.onEnd?.(e)
      }
    })
  })

  onBeforeUnmount(() => {
    sortable?.destroy()
  })

  return { sortable: () => sortable }
}
