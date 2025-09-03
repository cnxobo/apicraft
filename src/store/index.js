import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockCollections, mockEnvironments } from "@/data/mockData";

// 主题状态管理
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        set({ theme });
        // 应用主题到DOM
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },
    }),
    {
      name: "theme-storage",
    }
  )
);

// 布局状态管理
export const useLayoutStore = create((set, get) => ({
  // 左侧面板状态
  leftPanelWidth: 300,
  leftPanelCollapsed: false,

  // 右侧面板状态
  rightPanelWidth: 300,
  rightPanelCollapsed: true,

  // 设置左侧面板宽度
  setLeftPanelWidth: (width) =>
    set({ leftPanelWidth: Math.max(200, Math.min(600, width)) }),

  // 切换左侧面板折叠状态
  toggleLeftPanel: () =>
    set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed })),

  // 设置右侧面板宽度
  setRightPanelWidth: (width) =>
    set({ rightPanelWidth: Math.max(200, Math.min(600, width)) }),

  // 切换右侧面板折叠状态
  toggleRightPanel: () =>
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed })),
}));

// API集合状态管理
export const useApiStore = create(
  persist(
    (set, get) => ({
      // API集合数据
      collections: mockCollections,

      // 当前打开的标签页
      tabs: [],
      activeTabId: null,

      // 当前选中的API
      selectedApiId: null,

      // 请求历史
      requestHistory: [],

      // 环境变量
      environments: mockEnvironments,
      activeEnvironment: "dev",

      // 添加集合
      addCollection: (collection) =>
        set((state) => ({
          collections: [
            ...state.collections,
            { ...collection, id: collection.id || Date.now().toString() },
          ],
        })),

      // 添加API到集合
      addApiToCollection: (collectionId, api) =>
        set((state) => ({
          collections: state.collections.map((col) =>
            col.id === collectionId
              ? {
                  ...col,
                  apis: [
                    ...(col.apis || []),
                    { ...api, id: api.id || Date.now().toString() },
                  ],
                }
              : col
          ),
        })),

      // 打开新标签页
      openTab: (api) =>
        set((state) => {
          const existingTab = state.tabs.find((tab) => tab.id === api.id);
          if (existingTab) {
            return { activeTabId: api.id };
          }

          const newTab = {
            id: api.id,
            title: api.name,
            type: "request",
            data: api,
            modified: false,
          };

          return {
            tabs: [...state.tabs, newTab],
            activeTabId: api.id,
          };
        }),

      // 关闭标签页
      closeTab: (tabId) =>
        set((state) => {
          const newTabs = state.tabs.filter((tab) => tab.id !== tabId);
          const newActiveTabId =
            state.activeTabId === tabId
              ? newTabs.length > 0
                ? newTabs[newTabs.length - 1].id
                : null
              : state.activeTabId;

          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
          };
        }),

      // 设置活动标签页
      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      // 更新标签页数据
      updateTab: (tabId, data) =>
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, data: { ...tab.data, ...data }, modified: true }
              : tab
          ),
        })),

      // 添加请求历史
      addRequestHistory: (request) =>
        set((state) => ({
          requestHistory: [
            {
              ...request,
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
            },
            ...state.requestHistory.slice(0, 99), // 保留最近100条记录
          ],
        })),

      // 设置活动环境
      setActiveEnvironment: (envId) => set({ activeEnvironment: envId }),
    }),
    {
      name: "api-storage",
    }
  )
);
