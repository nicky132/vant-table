<template>
  <div class="vant-table-wrapper" :class="{ 'has-load-more': enableLoadMore && showLoadMoreUi }" :style="containerStyle" data-active-fix="true">
    <!-- 加载中状态 -->
    <div v-if="loading" class="vant-table-loading">
      <VanLoading size="24px" />
    </div>
    <!-- Table主体布局容器 -->
    <div class="vant-table-layout-wrapper" ref="layoutWrapperRef">
      <!-- 表头区域 -->
      <div class="vant-table-header" ref="headerRef" :style="{
        marginLeft: hasLeftFixedContent ? `${leftFixedTotalWidth}px` : '0',
        marginRight: hasRightFixedColumns ? `${columnsInfo.rightFixedWidth}px` : '0'
      }">
        <div class="vant-table-header__content" ref="headerContentRef">
          <table class="vant-table vant-table--header" :style="tableStyle">
            <colgroup>
              <col v-for="header in columnsInfo.computedHeaders" :key="header.key" :style="getColStyle(header)" />
            </colgroup>
            <thead class="vant-thead">
              <tr class="vant-thead-row vant-thead-row--main" ref="headerRowRef">
                <th
                  v-for="header in columnsInfo.computedHeaders"
                  :key="header.key"
                  :class="getHeaderClass(header)"
                  :style="getHeaderStyle(header)"
                  :data-key="header.key"
                  :ref="el => setHeaderElementRef(el, header.key, 'main')">
                  <div class="vant-th__content" @click="handleSort(header)">
                    <span class="vant-th__text">{{ header.label }}</span>
                    <div v-if="header.sortable" class="vant-th__sort-icon">
                      <svg
                        class="vant-sort-icon"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none">
                        <path
                          :class="[
                            'vant-sort-icon__asc',
                            {
                              'vant-sort-icon--active':
                                sortConfig.key === header.key && sortConfig.direction === 'asc'
                            }
                          ]"
                          d="M3.96569 4C3.60932 4 3.43086 3.56914 3.68284 3.31716L5.71716 1.28284C5.87337 1.12663 6.12663 1.12663 6.28284 1.28284L8.31716 3.31716C8.56914 3.56914 8.39068 4 8.03431 4L3.96569 4Z"
                          stroke-linejoin="round" />
                        <path
                          :class="[
                            'vant-sort-icon__desc',
                            {
                              'vant-sort-icon--active':
                                sortConfig.key === header.key && sortConfig.direction === 'desc'
                            }
                          ]"
                          d="M8.03431 8C8.39068 8 8.56914 8.43086 8.31716 8.68284L6.28284 10.7172C6.12663 10.8734 5.87337 10.8734 5.71716 10.7172L3.68284 8.68284C3.43086 8.43086 3.60932 8 3.96569 8H8.03431Z"
                          stroke-linejoin="round" />
                      </svg>
                    </div>
                    <i
                      v-if="header.filterable"
                      class="van-icon van-icon-filter-o vant-th__filter-icon"
                      :class="{ 'vant-th__filter-icon--active': isFilterActive(header.key) }"
                      @click.stop="toggleFilter(header.key)">
                    </i>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      <!-- 表体区域 -->
      <div class="vant-table-body" :style="bodyWrapperStyle" @scroll="handleScroll" @wheel="handleMainTableWheel" @touchstart="handleMainTableTouchStart" @touchmove="handleMainTableTouchMove" @touchend="handleMainTableTouchEnd" ref="bodyRef">
        <table class="vant-table vant-table--body" :style="tableStyle">
          <colgroup>
            <col v-for="header in columnsInfo.computedHeaders" :key="header.key" :style="getColStyle(header)" />
          </colgroup>
          <tbody class="vant-tbody" ref="tbodyRef">
            <!-- 空数据状态 -->
            <tr v-if="!filteredAndSortedData.length">
              <td
                :colspan="columnsInfo.computedHeaders.length"
                class="vant-td vant-td--empty">
                <div class="vant-empty-content">
                  <VanEmpty :description="hasActiveFilters ? '没有符合条件的数据' : '暂无数据'" />
                </div>
              </td>
            </tr>

            <!-- 数据行 -->
            <template v-else>
              <template
                v-for="(row, rowIndex) in filteredAndSortedData"
                :key="getRowKey(row, rowIndex)">
                <!-- 主行 -->
                <tr
                  :class="getRowClass(rowIndex, row)"
                  :style="getRowStyle(rowIndex)"
                  :data-row-index="rowIndex"
                  :ref="el => setRowElementRef(el, rowIndex, 'main')"
                  @click="handleSingleRowHighlight($event, rowIndex); handleRowClick(row, rowIndex)"
                  @mouseenter="handleRowMouseEnter(rowIndex)"
                  @mouseleave="handleRowMouseLeave(rowIndex)">

                  <td
                    v-for="(header, colIndex) in columnsInfo.computedHeaders"
                    :key="header.key"
                    :class="getCellClass(header, row, rowIndex)"
                    :style="getCellStyle(header)"
                    :data-key="header.key"
                    @click="handleSingleRowHighlight($event, rowIndex); handleCellClick(row, header, rowIndex, colIndex, $event)">
                    <div class="vant-td__content">
                      <div
                        v-if="header.showDataBar && !isRowTotal(row)"
                        class="vant-td__data-bar"
                        :style="getDataBarStyle(getCellValue(row, header.key), header.key)"></div>
                      <span
                        :class="{ 'vant-td__link': header.link, 'vant-td__text': !header.link }">
                        <component
                          v-if="header.renderCell"
                          :is="
                            renderCustomCell(
                              getCellValue(row, header.key),
                              row,
                              header,
                              rowIndex,
                              colIndex
                            )
                          " />
                        <template v-else>
                          {{ formatCellValue(getCellValue(row, header.key), header) }}
                        </template>
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- 扩展行 -->
                <tr
                  v-if="expandable && isExpanded(row, rowIndex)"
                  :class="['vant-tr', 'vant-tr--expanded']"
                  :data-expanded-row-index="rowIndex">
                  <td
                    :colspan="columnsInfo.computedHeaders.length"
                    class="vant-td vant-td--expanded">
                    <div class="vant-td__expand-content">
                      <slot name="expanded" :row="row" :rowIndex="rowIndex">
                        <div class="vant-expand-panel">
                          <div class="vant-expand-panel__header">
                            <h4>详细信息</h4>
                          </div>
                          <div class="vant-expand-panel__content">
                            <div
                              v-for="(value, key) in row"
                              :key="key"
                              class="vant-field vant-field--readonly">
                              <div class="vant-field__label">{{ key }}:</div>
                              <div class="vant-field__value">{{ value }}</div>
                            </div>
                          </div>
                        </div>
                      </slot>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 左侧固定列 -->
    <div v-if="hasLeftFixedContent" class="vant-table-fixed vant-table-fixed--left" :style="leftFixedStyle">
      <!-- 固定列表头 -->
      <div class="vant-table-fixed__header" :style="fixedHeaderWrapperStyle">
        <table class="vant-table vant-table--header" :style="leftHeaderTableStyle">
          <colgroup>
            <col v-if="selectable" :style="selectionColStyle" />
            <col v-if="expandable" :style="expandColStyle" />
            <col v-for="header in columnsInfo.leftFixedColumns" :key="header.key" :style="getColStyle(header)" />
          </colgroup>
          <thead class="vant-thead">
            <tr class="vant-thead-row vant-thead-row--left" ref="leftHeaderRowRef">
              <th
                v-if="selectable"
                :class="getFixedHeaderClass('selection', 'left')"
                :style="getSelectionHeaderStyle()">
                <div class="vant-th__content">
                  <div class="vant-selection-header">
                    <VCheckbox
                      v-if="!isRadioMode"
                      :model-value="isAllSelected"
                      :indeterminate="isIndeterminate"
                      @update:model-value="handleSelectAll"
                      :disabled="!selectableRows.length || allRowsDisabled" />
                    <span v-else class="vant-selection-header__text">选择</span>
                  </div>
                </div>
              </th>

              <th
                v-if="expandable"
                :class="getFixedHeaderClass('expand', 'left')"
                :style="getExpandHeaderStyle()">
                <div class="vant-th__content"></div>
              </th>

              <th
                v-for="header in columnsInfo.leftFixedColumns"
                :key="header.key"
                :class="getFixedHeaderClass(header, 'left')"
                :style="getFixedHeaderStyle(header)"
                :data-key="header.key"
                :ref="el => setHeaderElementRef(el, header.key, 'left')">
                <div class="vant-th__content" @click="handleSort(header)">
                  <span class="vant-th__text">{{ header.label }}</span>
                  <div v-if="header.sortable" class="vant-th__sort-icon">
                    <svg
                      class="vant-sort-icon"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none">
                      <path
                        :class="[
                          'vant-sort-icon__asc',
                          {
                            'vant-sort-icon--active':
                              sortConfig.key === header.key && sortConfig.direction === 'asc'
                          }
                        ]"
                        d="M3.96569 4C3.60932 4 3.43086 3.56914 3.68284 3.31716L5.71716 1.28284C5.87337 1.12663 6.12663 1.12663 6.28284 1.28284L8.31716 3.31716C8.56914 3.56914 8.39068 4 8.03431 4L3.96569 4Z"
                        stroke-linejoin="round" />
                      <path
                        :class="[
                          'vant-sort-icon__desc',
                          {
                            'vant-sort-icon--active':
                              sortConfig.key === header.key && sortConfig.direction === 'desc'
                          }
                        ]"
                        d="M8.03431 8C8.39068 8 8.56914 8.43086 8.31716 8.68284L6.28284 10.7172C6.12663 10.8734 5.87337 10.8734 5.71716 10.7172L3.68284 8.68284C3.43086 8.43086 3.60932 8 3.96569 8H8.03431Z"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <i
                    v-if="header.filterable"
                    class="van-icon van-icon-filter-o vant-th__filter-icon"
                    :class="{ 'vant-th__filter-icon--active': isFilterActive(header.key) }"
                    @click.stop="toggleFilter(header.key)">
                  </i>
                </div>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <!-- 固定列表体 -->
      <div class="vant-table-fixed__body" :style="leftBodyWrapperStyle" ref="leftBodyWrapperRef" @wheel="handleFixedColumnWheel" @touchstart="handleFixedColumnTouchStart" @touchmove="handleFixedColumnTouchMove" @touchend="handleFixedColumnTouchEnd">
        <table class="vant-table vant-table--body" :style="leftBodyTableStyle">
          <colgroup>
            <col v-if="selectable" :style="selectionColStyle" />
            <col v-if="expandable" :style="expandColStyle" />
            <col v-for="header in columnsInfo.leftFixedColumns" :key="header.key" :style="getColStyle(header)" />
          </colgroup>
          <tbody class="vant-tbody" ref="leftTbodyRef">
            <!-- 空数据状态 -->
            <tr v-if="!filteredAndSortedData.length">
              <td
                :colspan="(selectable ? 1 : 0) + (expandable ? 1 : 0) + columnsInfo.leftFixedColumns.length"
                class="vant-td vant-td--empty">
                <div class="vant-empty-content">
                  <VanEmpty :description="hasActiveFilters ? '没有符合条件的数据' : '暂无数据'" />
                </div>
              </td>
            </tr>

            <!-- 数据行 -->
            <template v-else>
              <template
                v-for="(row, rowIndex) in filteredAndSortedData"
                :key="getRowKey(row, rowIndex)">
                <!-- 主行 -->
                <tr
                  :class="getRowClass(rowIndex, row)"
                  :style="getRowStyle(rowIndex)"
                  :data-row-index="rowIndex"
                  :ref="el => setRowElementRef(el, rowIndex, 'left')"
                  @click="handleSingleRowHighlight($event, rowIndex); handleRowClick(row, rowIndex)"
                  @mouseenter="handleRowMouseEnter(rowIndex)"
                  @mouseleave="handleRowMouseLeave(rowIndex)">
                  <!-- 选择列 -->
                  <td
                    v-if="selectable"
                    :class="getFixedCellClass('selection', row, rowIndex, 'left')"
                    :style="getSelectionCellStyle()"
                    @click.stop="handleCellSelect(row, rowIndex, $event)">
                    <div class="vant-td__content">
                      <VCheckbox
                        v-if="!isRadioMode"
                        :model-value="isRowSelected(row, rowIndex)"
                        :disabled="isRowDisabled(row, rowIndex)"
                        @update:model-value="checked => handleRowSelect(row, rowIndex, checked)" />
                      <VRadio
                        v-else
                        :model-value="isRowSelected(row, rowIndex)"
                        :disabled="isRowDisabled(row, rowIndex)"
                        @update:model-value="checked => handleRowSelect(row, rowIndex, checked)" />
                    </div>
                  </td>

                  <td
                    v-if="expandable"
                    :class="getFixedCellClass('expand', row, rowIndex, 'left')"
                    :style="getExpandCellStyle()"
                    @click.stop="toggleExpand(row, rowIndex)">
                    <div class="vant-td__content">
                      <i
                        class="van-icon van-icon-arrow vant-td__expand-icon"
                        :class="{ 'vant-td__expand-icon--expanded': isExpanded(row, rowIndex) }">
                      </i>
                    </div>
                  </td>

                  <td
                    v-for="(header, colIndex) in columnsInfo.leftFixedColumns"
                    :key="header.key"
                    :class="getFixedCellClass(header, row, rowIndex, 'left')"
                    :style="getFixedCellStyle(header)"
                    :data-key="header.key"
                    @click="handleSingleRowHighlight($event, rowIndex); handleCellClick(row, header, rowIndex, colIndex, $event)">
                    <div class="vant-td__content">
                      <div
                        v-if="header.showDataBar && !isRowTotal(row)"
                        class="vant-td__data-bar"
                        :style="getDataBarStyle(getCellValue(row, header.key), header.key)"></div>
                      <span
                        :class="{ 'vant-td__link': header.link, 'vant-td__text': !header.link }">
                        <component
                          v-if="header.renderCell"
                          :is="
                            renderCustomCell(
                              getCellValue(row, header.key),
                              row,
                              header,
                              rowIndex,
                              colIndex
                            )
                          " />
                        <template v-else>
                          {{ formatCellValue(getCellValue(row, header.key), header) }}
                        </template>
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- 扩展行（固定列部分）-->
                <tr
                  v-if="expandable && isExpanded(row, rowIndex)"
                  :class="['vant-tr', 'vant-tr--expanded']"
                  :data-expanded-row-index="rowIndex">
                  <td
                    :colspan="(selectable ? 1 : 0) + (expandable ? 1 : 0) + columnsInfo.leftFixedColumns.length"
                    class="vant-td vant-td--expanded vant-td--fixed">
                    <div class="vant-td__expand-content vant-td__expand-content--fixed">
                      <!-- 在固定列中显示部分字段信息 -->
                      <div class="vant-expand-panel">
                        <div class="vant-expand-panel__content vant-expand-panel__content--fixed">
                          <div
                            v-if="columnsInfo.leftFixedColumns[0]"
                            class="vant-field vant-field--readonly">
                            <div class="vant-field__label">{{ columnsInfo.leftFixedColumns[0].label }}:</div>
                            <div class="vant-field__value">{{ getCellValue(row, columnsInfo.leftFixedColumns[0].key) }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- 左侧固定列的加载更多占位 -->
      <div v-if="enableLoadMore && showLoadMoreUi" class="vant-table-load-more vant-table-load-more--fixed-left" :style="fixedColumnLoadMorePositionStyle">
        <div v-if="loadMoreLoading" class="vant-table-load-more__loading">
          <VanLoading size="16px" />
          <span>{{ loadMoreLoadingText }}</span>
        </div>
        <div
          v-else-if="loadMoreError"
          class="vant-table-load-more__error"
          @click="$emit('load-more')">
          <span>{{ loadMoreErrorText }}</span>
        </div>
        <div v-else-if="loadMoreFinished" class="vant-table-load-more__finished">
          <span>{{ loadMoreFinishedText }}</span>
        </div>
        <div v-else class="vant-table-load-more__ready">
          <span>{{ loadMoreReadyText }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧固定列 -->
    <div v-if="hasRightFixedColumns" class="vant-table-fixed vant-table-fixed--right" :style="rightFixedStyle">
      <!-- 固定列表头 -->
      <div class="vant-table-fixed__header" :style="fixedHeaderWrapperStyle">
        <table class="vant-table vant-table--header" :style="rightHeaderTableStyle">
          <colgroup>
            <col v-for="header in columnsInfo.rightFixedColumns" :key="header.key" :style="getColStyle(header)" />
          </colgroup>
          <thead class="vant-thead">
            <tr class="vant-thead-row vant-thead-row--right" ref="rightHeaderRowRef">
              <th
                v-for="header in columnsInfo.rightFixedColumns"
                :key="header.key"
                :class="getFixedHeaderClass(header, 'right')"
                :style="getFixedHeaderStyle(header)"
                :data-key="header.key"
                :ref="el => setHeaderElementRef(el, header.key, 'right')">
                <div class="vant-th__content" @click="handleSort(header)">
                  <span class="vant-th__text">{{ header.label }}</span>
                  <div v-if="header.sortable" class="vant-th__sort-icon">
                    <svg
                      class="vant-sort-icon"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none">
                      <path
                        :class="[
                          'vant-sort-icon__asc',
                          {
                            'vant-sort-icon--active':
                              sortConfig.key === header.key && sortConfig.direction === 'asc'
                          }
                        ]"
                        d="M3.96569 4C3.60932 4 3.43086 3.56914 3.68284 3.31716L5.71716 1.28284C5.87337 1.12663 6.12663 1.12663 6.28284 1.28284L8.31716 3.31716C8.56914 3.56914 8.39068 4 8.03431 4L3.96569 4Z"
                        stroke-linejoin="round" />
                      <path
                        :class="[
                          'vant-sort-icon__desc',
                          {
                            'vant-sort-icon--active':
                              sortConfig.key === header.key && sortConfig.direction === 'desc'
                          }
                        ]"
                        d="M8.03431 8C8.39068 8 8.56914 8.43086 8.31716 8.68284L6.28284 10.7172C6.12663 10.8734 5.87337 10.8734 5.71716 10.7172L3.68284 8.68284C3.43086 8.43086 3.60932 8 3.96569 8H8.03431Z"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <i
                    v-if="header.filterable"
                    class="van-icon van-icon-filter-o vant-th__filter-icon"
                    :class="{ 'vant-th__filter-icon--active': isFilterActive(header.key) }"
                    @click.stop="toggleFilter(header.key)">
                  </i>
                </div>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <!-- 固定列表体 -->
      <div class="vant-table-fixed__body" :style="rightBodyWrapperStyle" ref="rightBodyWrapperRef" @wheel="handleFixedColumnWheel" @touchstart="handleFixedColumnTouchStart" @touchmove="handleFixedColumnTouchMove" @touchend="handleFixedColumnTouchEnd">
        <table class="vant-table vant-table--body" :style="rightBodyTableStyle">
          <colgroup>
            <col v-for="header in columnsInfo.rightFixedColumns" :key="header.key" :style="getColStyle(header)" />
          </colgroup>
          <tbody class="vant-tbody" ref="rightTbodyRef">
            <!-- 空数据状态 -->
            <tr v-if="!filteredAndSortedData.length">
              <td
                :colspan="columnsInfo.rightFixedColumns.length"
                class="vant-td vant-td--empty">
                <div class="vant-empty-content">
                  <VanEmpty :description="hasActiveFilters ? '没有符合条件的数据' : '暂无数据'" />
                </div>
              </td>
            </tr>

            <!-- 数据行 -->
            <template v-else>
              <template
                v-for="(row, rowIndex) in filteredAndSortedData"
                :key="getRowKey(row, rowIndex)">
                <!-- 主行 -->
                <tr
                  :class="getRowClass(rowIndex, row)"
                  :style="getRowStyle(rowIndex)"
                  :data-row-index="rowIndex"
                  :ref="el => setRowElementRef(el, rowIndex, 'right')"
                  @click="handleSingleRowHighlight($event, rowIndex); handleRowClick(row, rowIndex)"
                  @mouseenter="handleRowMouseEnter(rowIndex)"
                  @mouseleave="handleRowMouseLeave(rowIndex)">
                  <td
                    v-for="(header, colIndex) in columnsInfo.rightFixedColumns"
                    :key="header.key"
                    :class="getFixedCellClass(header, row, rowIndex, 'right')"
                    :style="getFixedCellStyle(header)"
                    :data-key="header.key"
                    @click="handleSingleRowHighlight($event, rowIndex); handleCellClick(row, header, rowIndex, colIndex, $event)">
                    <div class="vant-td__content">
                      <div
                        v-if="header.showDataBar && !isRowTotal(row)"
                        class="vant-td__data-bar"
                        :style="getDataBarStyle(getCellValue(row, header.key), header.key)"></div>
                      <span
                        :class="{ 'vant-td__link': header.link, 'vant-td__text': !header.link }">
                        <component
                          v-if="header.renderCell"
                          :is="
                            renderCustomCell(
                              getCellValue(row, header.key),
                              row,
                              header,
                              rowIndex,
                              colIndex
                            )
                          " />
                        <template v-else>
                          {{ formatCellValue(getCellValue(row, header.key), header) }}
                        </template>
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- 扩展行（右固定列部分）-->
                <tr
                  v-if="expandable && isExpanded(row, rowIndex)"
                  :class="['vant-tr', 'vant-tr--expanded']"
                  :data-expanded-row-index="rowIndex">
                  <td
                    :colspan="columnsInfo.rightFixedColumns.length"
                    class="vant-td vant-td--expanded vant-td--fixed">
                    <div class="vant-td__expand-content vant-td__expand-content--fixed">
                      <!-- 右侧固定列的扩展内容 -->
                      <div class="vant-expand-panel">
                        <div class="vant-expand-panel__content vant-expand-panel__content--fixed">
                          <div
                            v-if="columnsInfo.rightFixedColumns[0]"
                            class="vant-field vant-field--readonly">
                            <div class="vant-field__label">{{ columnsInfo.rightFixedColumns[0].label }}:</div>
                            <div class="vant-field__value">{{ getCellValue(row, columnsInfo.rightFixedColumns[0].key) }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- 右侧固定列的加载更多占位 -->
      <div v-if="enableLoadMore && showLoadMoreUi" class="vant-table-load-more vant-table-load-more--fixed-right" :style="fixedColumnLoadMorePositionStyle">
        <div v-if="loadMoreLoading" class="vant-table-load-more__loading">
          <VanLoading size="16px" />
          <span>{{ loadMoreLoadingText }}</span>
        </div>
        <div
          v-else-if="loadMoreError"
          class="vant-table-load-more__error"
          @click="$emit('load-more')">
          <span>{{ loadMoreErrorText }}</span>
        </div>
        <div v-else-if="loadMoreFinished" class="vant-table-load-more__finished">
          <span>{{ loadMoreFinishedText }}</span>
        </div>
        <div v-else class="vant-table-load-more__ready">
          <span>{{ loadMoreReadyText }}</span>
        </div>
      </div>
    </div>

    <!-- 横向滚动条（与table布局容器平级，参考vtable，覆盖整个宽度） -->
    <div
      v-if="showHorizontalScrollbar"
      class="vant-table-scroll-x-virtual"
      :style="horizontalScrollbarContainerStyle">
      <!-- 滚动条主体包装器 - 覆盖整个宽度 -->
      <div
        class="vant-table-scroll-x-wrapper"
        :style="scrollbarWrapperStyle"
        ref="scrollbarWrapperRef"
        @click="handleScrollbarTrackClick">
        <!-- 滚动条手柄 -->
        <div
          class="vant-table-scroll-x-handle"
          :class="{
            'vant-table-scroll-x-handle--visible': isScrollbarVisible,
            'vant-table-scroll-x-handle--dragging': isDragging
          }"
          :style="scrollbarHandleStyle"
          ref="scrollbarHandleRef"
          @mousedown="handleScrollbarMouseDown"
          @mouseenter="handleScrollbarMouseEnter"
          @mouseleave="handleScrollbarMouseLeave">
          <!-- 滚动条内部空间 -->
          <div class="vant-table-scroll-x-space" :style="scrollbarSpaceStyle"></div>
        </div>
      </div>
    </div>

    <!-- 加载更多状态 -->
    <div v-if="enableLoadMore && showLoadMoreUi" class="vant-table-load-more">
      <div v-if="loadMoreLoading" class="vant-table-load-more__loading">
        <VanLoading size="16px" />
        <span>{{ loadMoreLoadingText }}</span>
      </div>
      <div
        v-else-if="loadMoreError"
        class="vant-table-load-more__error"
        @click="$emit('load-more')">
        <span>{{ loadMoreErrorText }}</span>
      </div>
      <div v-else-if="loadMoreFinished" class="vant-table-load-more__finished">
        <span>{{ loadMoreFinishedText }}</span>
      </div>
      <div v-else class="vant-table-load-more__ready">
        <span>{{ loadMoreReadyText }}</span>
      </div>
    </div>

    <!-- 选择操作工具栏 -->
    <!-- <div v-if="selectable && selectedRows.length > 0" class="vant-table-selection-toolbar">
      <div class="vant-table-selection-toolbar__content">
        <div class="vant-table-selection-toolbar__info">
          <span class="vant-table-selection-toolbar__count">
            已选择 {{ selectedRows.length }} 项
            <span v-if="selectableRows.length > 0" class="vant-table-selection-toolbar__total">
              / 共 {{ selectableRows.length }} 项
            </span>
          </span>
          <van-button
            type="default"
            size="mini"
            @click="clearSelection"
            class="vant-table-selection-toolbar__clear">
            取消选择
          </van-button>
        </div>
        <div class="vant-table-selection-toolbar__actions">
          <slot
            name="selection-actions"
            :selectedRows="selectedRows"
            :selectedRowKeys="selectedRowKeys"
            :selectableRows="selectableRows">
            <van-button
              type="danger"
              size="mini"
              @click="handleBatchDelete"
              :disabled="!selectedRows.length">
              批量删除 ({{ selectedRows.length }})
            </van-button>
          </slot>
        </div>
      </div>
    </div> -->
    <!-- 过滤弹窗 - 居中模态对话框，teleport到body避免容器限制 -->
    <template v-for="header in (filterableHeadersWithState || [])" :key="`filter-${header.key}`">
      <Teleport to="body">
        <VanPopup
          v-if="filterStates[header.key]?.show || false"
          v-model:show="filterStates[header.key].show"
          position="center"
          :style="{ zIndex: 99999 }"
          :lazy-render="true"
          :destroy-on-close="true"
          closeable
          @click-overlay="onClickOverlay"
          round
          class="vant-filter-modal-popup vant-filter-modal-popup--teleport van-overlay">
        <div class="vant-filter-modal">
          <div class="vant-filter-modal__header">
            <span class="vant-filter-modal__title">过滤 {{ header.label }}</span>
            <VanIcon
              name="cross"
              class="vant-filter-modal__close"
              @click="handleFilterClose(header.key)" />
          </div>

          <div class="vant-filter-modal__content">
            <!-- VTable风格：搜索框 -->
            <div class="vant-filter-search">
              <VanField
                v-model="filterStates[header.key].value"
                placeholder="搜索..."
                size="small"
                clearable />
            </div>
            
            <!-- VTable风格：选项列表 -->
            <div class="vant-filter-v-options">
              <!-- 全部选项 -->
              <div class="vant-filter-v-option">
                <VanCheckbox
                  :model-value="!activeFilters[header.key] || activeFilters[header.key].values?.length === 0"
                  @update:model-value="selectAllFilterOptions(header.key)">
                  <span class="vant-filter-v-option__text">全部</span>
                </VanCheckbox>
              </div>
              
              <!-- 可选项列表 -->
              <div
                v-for="option in getFilteredOptions(header.key)"
                :key="option"
                class="vant-filter-v-option">
                <VanCheckbox
                  :model-value="isOptionSelected(header.key, option)"
                  @update:model-value="toggleFilterOption(header.key, option)">
                  <span class="vant-filter-v-option__text">{{ option }}</span>
                </VanCheckbox>
              </div>
            </div>
          </div>

          <!-- VTable风格操作按钮 -->
          <div class="vant-filter-modal__actions">
            <VanButton block @click="resetFilter(header.key)">重置</VanButton>
            <VanButton block type="primary" @click="applyFilter(header.key)">确定</VanButton>
          </div>
        </div>
        </VanPopup>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, h, Teleport } from 'vue'
import { Checkbox as VanCheckbox, Field as VanField, Button as VanButton, Popup as VanPopup, Loading as VanLoading, Empty as VanEmpty, Icon as VanIcon } from 'vant'
import { useScrollHandlers } from './composables/useScrollHandlers.js'
import { useLoadMore } from './composables/useLoadMore.js'
import { useSelection } from './composables/useSelection.js'
import { useTableEvents } from './composables/useTableEvents.js'
import { useTableFilters } from './composables/useTableFilters.js'
import { useTableSorting } from './composables/useTableSorting.js'
import { useTableState } from './composables/useTableState.js'
import { useTableComputed } from './composables/useTableComputed.js'
import { useTableUtils } from './composables/useTableUtils.js'
import { useScrollbar } from './composables/useScrollbar.js'
import { useTableStyles } from './composables/useTableStyles.js'
import { useTableHandlers } from './composables/useTableHandlers.js'

// ========== vtable风格的自定义复选框组件 ==========
const VCheckbox = {
  name: 'VCheckbox',
  props: {
    modelValue: Boolean,
    indeterminate: Boolean,
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleChange = event => {
      if (props.disabled) return
      emit('update:modelValue', event.target.checked)
    }

    return () =>
      h(
        'div',
        {
          class: [
            'vant-table-checkbox',
            {
              'vant-table-checkbox--checked': props.modelValue,
              'vant-table-checkbox--indeterminate': props.indeterminate,
              'vant-table-checkbox--disabled': props.disabled
            }
          ],
          onClick: e => {
            e.stopPropagation()
            if (!props.disabled) {
              emit('update:modelValue', !props.modelValue)
            }
          }
        },
        [
          h('input', {
            type: 'checkbox',
            class: 'vant-table-checkbox__input',
            checked: props.modelValue,
            disabled: props.disabled,
            onChange: handleChange
          }),
          // h('span', { class: 'vant-table-checkbox__icon' }, [
          //   props.indeterminate
          //     ? h('span', { class: 'vant-table-checkbox__indeterminate-icon' }, '—')
          //     : props.modelValue
          //     ? h('span', { class: 'vant-table-checkbox__check-icon' }, '✓')
          //     : null
          // ])
        ]
      )
  }
}

// ========== vtable风格的自定义单选框组件 ==========
const VRadio = {
  name: 'VRadio',
  props: {
    modelValue: Boolean,
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleChange = event => {
      if (props.disabled) return
      emit('update:modelValue', event.target.checked)
    }

    return () =>
      h(
        'div',
        {
          class: [
            'vant-table-radio',
            {
              'vant-table-radio--checked': props.modelValue,
              'vant-table-radio--disabled': props.disabled
            }
          ],
          onClick: e => {
            e.stopPropagation()
            if (!props.disabled) {
              emit('update:modelValue', true)
            }
          }
        },
        [
          h('input', {
            type: 'radio',
            class: 'vant-table-radio__input',
            checked: props.modelValue,
            disabled: props.disabled,
            onChange: handleChange
          }),
          h('span', { class: 'vant-table-radio__icon' }, [
            props.modelValue ? h('span', { class: 'vant-table-radio__dot' }) : null
          ])
        ]
      )
  }
}

// Props 定义
const props = defineProps({
  headers: { type: Array, required: true, default: () => [] },
  data: { type: Array, required: true, default: () => [] },
  width: { type: [Number, String], default: '100%' },
  height: { type: [Number, String], default: 'auto' },
  minWidth: { type: Number, default: 300 },
  totalRowKey: { type: String, default: 'isTotal' },
  bordered: { type: Boolean, default: true },
  striped: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  sortProp: { type: String, default: null },
  sortType: { type: String, default: null },
  highlightIndex: { type: Number, default: -1 },
  // 高亮颜色配置
  highlightColor: { type: String, default: '#e6f4ff' }, // 点击高亮背景色
  highlightBorderColor: { type: String, default: '#1677ff' }, // 点击高亮边框色
  // 新增：复选行高亮颜色配置
  selectedRowColor: { type: String, default: '#e6f4ff' }, // 复选行背景色
  selectedRowBorderColor: { type: String, default: '#40a9ff' }, // 复选行边框色

  // ========== 选择功能相关Props ==========
  selectable: { type: Boolean, default: false },
  selectMode: {
    type: String,
    default: 'checkbox',
    validator: v => ['checkbox', 'radio'].includes(v)
  },
  selectOnRowClick: { type: Boolean, default: false },
  preserveSelection: { type: Boolean, default: false },
  selectableFilter: { type: Function, default: null },
  maxSelectCount: { type: Number, default: 0 },
  rowKey: { type: [String, Function], default: 'id' },
  selectedKeys: { type: Array, default: () => [] },

  // 加载更多
  enableLoadMore: { type: Boolean, default: false },
  showLoadMoreUi: { type: Boolean, default: false }, // 是否显示加载更多的UI
  loadMoreLoading: { type: Boolean, default: false },
  loadMoreFinished: { type: Boolean, default: false },
  loadMoreError: { type: Boolean, default: false },
  loadMoreOffset: { type: Number, default: 50 },
  loadMoreLoadingText: { type: String, default: '加载中...' },
  loadMoreFinishedText: { type: String, default: '没有更多了' },
  loadMoreErrorText: { type: String, default: '加载失败，点击重试' },
  loadMoreReadyText: { type: String, default: '上拉加载更多' }
})

// Emits 定义
const emit = defineEmits([
  'sort-change',
  'cell-click',
  'row-click',
  'expand-change',
  'load-more',
  'filter-change',
  'update:selected-keys',
  'selection-change',
  'select-all',
  'select',
  'batch-delete'
])

// 响应式数据
const headerRef = ref(null)
const headerContentRef = ref(null)
const headerRowRef = ref(null)
const leftHeaderRowRef = ref(null)
const rightHeaderRowRef = ref(null)
const bodyRef = ref(null)
const tbodyRef = ref(null)
const leftFixedRef = ref(null)
const leftBodyWrapperRef = ref(null)
const leftTbodyRef = ref(null)
const rightFixedRef = ref(null)
const rightBodyWrapperRef = ref(null)
const rightTbodyRef = ref(null)
const layoutWrapperRef = ref(null) // 新增布局容器引用

// iOS触摸优化清理函数
let cleanupTouchOptimization = null

// 全局按钮点击监听器清理函数
let globalButtonClickHandler = null

// 滚动条相关引用
const scrollbarWrapperRef = ref(null)
const scrollbarHandleRef = ref(null)

// 高度管理系统
const dynamicHeaderHeight = ref(48)
const dynamicRowHeights = ref(new Map())
const expandedRowHeights = ref(new Map())
const isHeaderSyncing = ref(false)
const isRowSyncing = ref(false)

// 选择功能状态管理
const internalSelectedKeys = ref(new Set(props.selectedKeys || []))
const lastSelectedIndex = ref(-1)

// 使用滚动处理组合函数
const {
  isLoadingMore,
  savedScrollPosition,
  savedDataLength,
  savedScrollHeight,
  intoRunScroll,
  lastScrollTop,
  vxeStyleAbsoluteSync,
  handleMainTableWheel,
  handleFixedColumnWheel
} = useScrollHandlers(
  props,
  emit,
  bodyRef,
  leftBodyWrapperRef,
  rightBodyWrapperRef,
  scrollTop,
  scrollLeft,
  isDevelopment
)
// 使用加载更多组合函数
useLoadMore(
  props, 
  bodyRef, 
  leftBodyWrapperRef, 
  rightBodyWrapperRef, 
  scrollTop, 
  scrollLeft,
  filteredAndSortedData,
  measureAndSyncHeaderHeight,
  measureAndSyncRowHeights,
  isDevelopment,
  isLoadingMore,
  savedScrollPosition,
  savedDataLength,
  savedScrollHeight,
  lastScrollTop,
  intoRunScroll
)

// 获取行的唯一标识
const getRowKey = (row, rowIndex) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, rowIndex)
  }
  return row[props.rowKey] || `row-${rowIndex}`
}

// 使用选择功能组合函数
const {
  selectedKeysSet,
  selectedRows,
  selectedRowKeys,
  isAllSelected,
  isIndeterminate,
  handleRowSelect,
  handleRowClick,
  handleSelectAll,
  clearSelection,
  isRowSelected
} = useSelection(props, emit, filteredAndSortedData, getRowKey, isDevelopment)

// 使用表格事件组合函数
const {
  handleFixedColumnTouchStart,
  handleFixedColumnTouchMove,
  handleFixedColumnTouchEnd,
  handleMainTableTouchStart,
  handleMainTableTouchMove,
  handleMainTableTouchEnd
} = useTableEvents(
  bodyRef,
  leftBodyWrapperRef,
  rightBodyWrapperRef,
  scrollTop,
  scrollLeft,
  vxeStyleAbsoluteSync,
  getGlobalMaxScrollTop,
  updateShadowState,
  isDevelopment,
  emit,
  props,
  isLoadingMore,
  savedScrollPosition
)

// 基础数据源
const rawData = computed(() => props.data)

// 使用过滤功能组合函数
const {
  filterStates,
  activeFilters,
  hasActiveFilters,
  filteredData,
  toggleFilter,
  isFilterActive,
  handleFilterClose,
  toggleFilterOption,
  applyTextFilter,
  resetFilter,
  clearFilters
} = useTableFilters(props, rawData, columnsInfo, isDevelopment)

// 使用排序功能组合函数
const {
  sortConfig,
  sortedData,
  handleSort,
  resetSort,
  setSort
} = useTableSorting(props, emit, filteredData, isDevelopment)

// 最终过滤并排序的数据
const filteredAndSortedData = computed(() => sortedData.value)

// 使用表格状态组合函数
const {
  hoveredRowIndex,
  selectedRowIndex,
  expandedRows,
  isDragging,
  dragStartX,
  dragStartScrollLeft,
  isScrollbarVisible,
  autoHideTimer,
  smoothScrollAnimation,
  containerWidth,
  scrollTop,
  scrollLeft,
  lastScrollTop: lastScrollTopState,
  lastScrollLeft,
  headerHeight,
  isHeaderMeasuring,
  isRowMeasuring,
  rowHeightMap,
  expandedRowHeightMap,
  headerElementRefs,
  rowElementRefs,
  setHeaderElementRef,
  setRowElementRef,
  isRowExpanded,
  toggleRowExpansion,
  measureAndSyncHeaderHeight,
  measureAndSyncRowHeights,
  updateContainerWidth
} = useTableState(props, emit, bodyRef, leftBodyWrapperRef, rightBodyWrapperRef, layoutWrapperRef, isDevelopment)

// 使用表格计算属性组合函数
const {
  columnsInfo,
  isMobile,
  hasLeftFixedContent,
  hasRightFixedColumns,
  leftFixedTotalWidth,
  normalColumnsTotalWidth,
  hasHorizontalScrollbar,
  scrollbarHandleWidth,
  scrollbarHandleLeft,
  containerStyle,
  tableStyle,
  bodyWrapperStyle,
  getRowStyle,
  getColStyle,
  getHeaderClass,
  getHeaderStyle,
  getRowClass,
  EXPAND_WIDTH,
  SELECTION_WIDTH,
  SCROLLBAR_HEIGHT
} = useTableComputed(props, containerWidth, scrollTop, scrollLeft, headerHeight, filteredAndSortedData, rowHeightMap)

// 使用表格工具函数
const {
  getCellValue,
  isRowTotal,
  formatCellValue,
  renderCell,
  horizontalScrollbarContainerStyle,
  scrollbarLeftCornerStyle,
  scrollbarRightCornerStyle,
  scrollbarWrapperStyle,
  scrollbarHandleStyle,
  scrollbarSpaceStyle,
  handleCellClick: handleCellClickUtil,
  handleRowClick: handleRowClickUtil,
  handleBatchDelete
} = useTableUtils(props, emit, columnsInfo, containerWidth, scrollLeft, hasHorizontalScrollbar, leftFixedTotalWidth, hasRightFixedColumns, scrollbarHandleWidth, scrollbarHandleLeft, isDragging, isScrollbarVisible, SCROLLBAR_HEIGHT)

// 使用滚动条处理函数
const {
  smoothScrollTo,
  showScrollbar,
  startAutoHideTimer,
  handleScrollbarMouseEnter,
  handleScrollbarMouseLeave,
  handleScrollbarMouseDown,
  handleScrollbarTrackClick,
  scrollToLeft,
  scrollToRight,
  scrollToColumn
} = useScrollbar(bodyRef, scrollLeft, containerWidth, columnsInfo, isDragging, isScrollbarVisible, autoHideTimer, smoothScrollAnimation, syncScroll, updateShadowState)

// 使用表格样式
const {
  selectionColStyle,
  getSelectionHeaderStyle,
  getSelectionCellStyle,
  expandColStyle,
  shouldHideFixedColumns,
  isScrolledToRight,
  leftFixedStyle,
  rightFixedStyle,
  fixedHeaderWrapperStyle,
  leftHeaderTableStyle,
  rightHeaderTableStyle,
  leftBodyWrapperStyle,
  rightBodyWrapperStyle,
  fixedColumnLoadMorePositionStyle,
  leftBodyTableStyle,
  rightBodyTableStyle,
  loadMoreAreaStyle,
  hasHorizontalScrollbar: showHorizontalScrollbar
} = useTableStyles(props, columnsInfo, leftFixedTotalWidth, hasRightFixedColumns, hasLeftFixedContent, scrollLeft, containerWidth, headerHeight, EXPAND_WIDTH, SELECTION_WIDTH, SCROLLBAR_HEIGHT)

// 使用表格事件处理
const {
  getRowStyle: getRowStyleHandler,
  getExpandHeaderStyle,
  getExpandCellStyle,
  handleScroll,
  handleHeaderClick,
  handleRowClick: handleRowClickHandler,
  handleCellClick: handleCellClickHandler,
  handleRowDoubleClick,
  handleCellDoubleClick,
  handleRowMouseEnter,
  handleRowMouseLeave,
  handleRowContextMenu,
  handleCellContextMenu
} = useTableHandlers(props, emit, scrollTop, scrollLeft, lastScrollTop, lastScrollLeft, intoRunScroll, isLoadingMore, isDevelopment, vxeStyleAbsoluteSync, handleLoadMore, updateShadowState, syncScroll, MIN_ROW_HEIGHT, dynamicRowHeights, EXPAND_WIDTH)

const isDevelopment = ref(process.env.NODE_ENV === 'development')

// 是否为单选模式
const isRadioMode = computed(() => props.selectMode === 'radio')

// ========== 函数别名和缺失函数定义 ==========

// 别名函数 - 用于模板中使用的主要函数
const renderCustomCell = renderCell

// 缺失函数定义 - 这些函数可能在其他composable中定义，但模板中需要使用
const getCellClass = (header, row, rowIndex) => {
  return [
    'vant-td',
    {
      'vant-td--fixed': header.fixed,
      'vant-td--link': header.link,
      'vant-td--total': isRowTotal(row)
    }
  ]
}

const getCellStyle = (header) => {
  return {
    width: header.width ? `${header.width}px` : 'auto',
    minWidth: header.minWidth ? `${header.minWidth}px` : 'auto',
    textAlign: header.align || 'left'
  }
}

const getDataBarStyle = (value, key) => {
  // 简单的数据条样式实现
  const percentage = Math.max(0, Math.min(100, Number(value) || 0))
  return {
    width: `${percentage}%`,
    backgroundColor: '#1677ff'
  }
}

const handleSingleRowHighlight = (event, rowIndex) => {
  selectedRowIndex.value = rowIndex
}

const isExpanded = (row, rowIndex) => {
  return isRowExpanded(getRowKey(row, rowIndex))
}

const toggleExpand = (row, rowIndex) => {
  toggleRowExpansion(getRowKey(row, rowIndex))
}
</script>



