import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockCollections, mockEnvironments } from "@/data/mockData";
import { environmentDB, collectionDB } from "@/utils/indexedDB";
import i18n from "@/i18n";

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

// 语言状态管理
export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: "zh", // 默认中文
      setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language);
      },
    }),
    {
      name: "language-storage",
    }
  )
);

// 布局状态管理
export const useLayoutStore = create((set, get) => ({
  // 左侧面板状态
  leftPanelWidth: 300,
  leftPanelCollapsed: false,
  leftPanelActiveView: 'collections', // 'collections' | 'environments'

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

  // 设置左侧面板活动视图
  setLeftPanelActiveView: (view) => set({ leftPanelActiveView: view }),
}));

// 环境变量状态管理 - 使用 IndexedDB
export const useEnvironmentStore = create((set, get) => ({
  // 环境变量数据
  environmentData: {
    globals: {
      id: "globals",
      name: "Globals",
      variables: []
    },
    environments: []
  },

  // 当前选中的环境
  selectedEnvironmentId: "globals",

  // 数据加载状态
  isLoading: false,
  isInitialized: false,

  // 初始化数据从 IndexedDB 加载
  initializeData: async () => {
    set({ isLoading: true });
    try {
      const [environments, globals] = await Promise.all([
        environmentDB.getAll(),
        environmentDB.getGlobals()
      ]);

      // 过滤掉 globals，因为我们单独处理
      const filteredEnvs = environments.filter(env => env.id !== 'globals');

      set({
        environmentData: {
          globals: globals || { id: "globals", name: "Globals", variables: [] },
          environments: filteredEnvs || []
        },
        isInitialized: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to initialize environment data:', error);
      set({ isLoading: false });
    }
  },

  // 创建新环境
  createEnvironment: async (name) => {
    const newEnv = {
      id: `env_${Date.now()}`,
      name,
      variables: []
    };

    try {
      await environmentDB.save(newEnv);
      set((state) => ({
        environmentData: {
          ...state.environmentData,
          environments: [...state.environmentData.environments, newEnv]
        }
      }));
      return newEnv.id;
    } catch (error) {
      console.error('Failed to create environment:', error);
      throw error;
    }
  },

  // 删除环境
  deleteEnvironment: async (envId) => {
    try {
      await environmentDB.delete(envId);
      set((state) => ({
        environmentData: {
          ...state.environmentData,
          environments: state.environmentData.environments.filter(env => env.id !== envId)
        },
        selectedEnvironmentId: state.selectedEnvironmentId === envId ? "globals" : state.selectedEnvironmentId
      }));
    } catch (error) {
      console.error('Failed to delete environment:', error);
      throw error;
    }
  },

  // 重命名环境
  renameEnvironment: async (envId, newName) => {
    try {
      const environment = get().environmentData.environments.find(env => env.id === envId);
      if (environment) {
        const updatedEnv = { ...environment, name: newName };
        await environmentDB.save(updatedEnv);
        set((state) => ({
          environmentData: {
            ...state.environmentData,
            environments: state.environmentData.environments.map(env =>
              env.id === envId ? updatedEnv : env
            )
          }
        }));
      }
    } catch (error) {
      console.error('Failed to rename environment:', error);
      throw error;
    }
  },

  // 添加变量
  addVariable: async (envId, variable) => {
    const newVariable = {
      id: `var_${Date.now()}`,
      name: variable.name || "",
      type: variable.type || "regular", // 简化为 regular 或 encrypted
      value: variable.value || ""
    };

    try {
      let updatedEnv;
      const state = get();

      if (envId === "globals") {
        updatedEnv = {
          ...state.environmentData.globals,
          variables: [...state.environmentData.globals.variables, newVariable]
        };
        await environmentDB.save(updatedEnv);
        set({
          environmentData: {
            ...state.environmentData,
            globals: updatedEnv
          }
        });
      } else {
        const environment = state.environmentData.environments.find(env => env.id === envId);
        if (environment) {
          updatedEnv = {
            ...environment,
            variables: [...environment.variables, newVariable]
          };
          await environmentDB.save(updatedEnv);
          set({
            environmentData: {
              ...state.environmentData,
              environments: state.environmentData.environments.map(env =>
                env.id === envId ? updatedEnv : env
              )
            }
          });
        }
      }
      return newVariable.id;
    } catch (error) {
      console.error('Failed to add variable:', error);
      throw error;
    }
  },

  // 更新变量
  updateVariable: async (envId, varId, updates) => {
    try {
      let updatedEnv;
      const state = get();

      if (envId === "globals") {
        updatedEnv = {
          ...state.environmentData.globals,
          variables: state.environmentData.globals.variables.map(variable =>
            variable.id === varId ? { ...variable, ...updates } : variable
          )
        };
        await environmentDB.save(updatedEnv);
        set({
          environmentData: {
            ...state.environmentData,
            globals: updatedEnv
          }
        });
      } else {
        const environment = state.environmentData.environments.find(env => env.id === envId);
        if (environment) {
          updatedEnv = {
            ...environment,
            variables: environment.variables.map(variable =>
              variable.id === varId ? { ...variable, ...updates } : variable
            )
          };
          await environmentDB.save(updatedEnv);
          set({
            environmentData: {
              ...state.environmentData,
              environments: state.environmentData.environments.map(env =>
                env.id === envId ? updatedEnv : env
              )
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to update variable:', error);
      throw error;
    }
  },

  // 删除变量
  deleteVariable: async (envId, varId) => {
    try {
      let updatedEnv;
      const state = get();

      if (envId === "globals") {
        updatedEnv = {
          ...state.environmentData.globals,
          variables: state.environmentData.globals.variables.filter(variable => variable.id !== varId)
        };
        await environmentDB.save(updatedEnv);
        set({
          environmentData: {
            ...state.environmentData,
            globals: updatedEnv
          }
        });
      } else {
        const environment = state.environmentData.environments.find(env => env.id === envId);
        if (environment) {
          updatedEnv = {
            ...environment,
            variables: environment.variables.filter(variable => variable.id !== varId)
          };
          await environmentDB.save(updatedEnv);
          set({
            environmentData: {
              ...state.environmentData,
              environments: state.environmentData.environments.map(env =>
                env.id === envId ? updatedEnv : env
              )
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to delete variable:', error);
      throw error;
    }
  },

  // 设置选中的环境
  setSelectedEnvironment: (envId) => set({ selectedEnvironmentId: envId }),

  // 获取当前选中的环境数据
  getSelectedEnvironment: () => {
    const state = get();
    if (state.selectedEnvironmentId === "globals") {
      return state.environmentData.globals;
    }
    return state.environmentData.environments.find(env => env.id === state.selectedEnvironmentId);
  }
}));

// API集合状态管理 - 使用 IndexedDB
export const useApiStore = create((set, get) => ({
  // API集合数据
  collections: [],

  // 当前打开的标签页
  tabs: [],
  activeTabId: null,

  // 当前选中的API
  selectedApiId: null,

  // 请求历史
  requestHistory: [],

  // 数据加载状态
  isLoading: false,
  isInitialized: false,

  // 初始化数据从 IndexedDB 加载
  initializeCollections: async () => {
    set({ isLoading: true });
    try {
      const collections = await collectionDB.getAll();
      set({
        collections: collections || [],
        isInitialized: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to initialize collections:', error);
      set({ isLoading: false });
    }
  },

  // 添加集合
  addCollection: async (collection) => {
    const newCollection = {
      ...collection,
      id: collection.id || Date.now().toString()
    };

    try {
      await collectionDB.save(newCollection);
      set((state) => ({
        collections: [...state.collections, newCollection]
      }));
      return newCollection;
    } catch (error) {
      console.error('Failed to add collection:', error);
      throw error;
    }
  },

  // 添加API到集合
  addApiToCollection: async (collectionId, api) => {
    const newApi = {
      ...api,
      id: api.id || Date.now().toString()
    };

    try {
      const state = get();
      const collection = state.collections.find(col => col.id === collectionId);
      if (collection) {
        const updatedCollection = {
          ...collection,
          apis: [...(collection.apis || []), newApi]
        };
        await collectionDB.save(updatedCollection);
        set({
          collections: state.collections.map(col =>
            col.id === collectionId ? updatedCollection : col
          )
        });
      }
      return newApi;
    } catch (error) {
      console.error('Failed to add API to collection:', error);
      throw error;
    }
  },

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

  // 创建新的请求标签页
  createNewTab: () =>
    set((state) => {
      const newTabId = `new_request_${Date.now()}`;
      const newTab = {
        id: newTabId,
        title: "Untitled Request",
        type: "request",
        data: {
          id: newTabId,
          name: "Untitled Request",
          method: "GET",
          url: "",
          headers: [],
          params: [],
          body: {
            type: "none",
            raw: "",
            formData: [],
            urlencoded: []
          },
          auth: {
            type: "none"
          }
        },
        modified: false,
      };

      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTabId,
      };
    }),

  // 创建新环境标签页
  createNewEnvironmentTab: () =>
    set((state) => {
      const newTabId = `new_environment_${Date.now()}`;
      const newTab = {
        id: newTabId,
        title: "New Environment",
        type: "environment",
        data: {
          id: null, // Will be set when environment is created
          name: "",
          isNew: true
        },
        modified: false,
      };

      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTabId,
      };
    }),

  // 打开环境变量标签页
  openEnvironmentTab: (environmentId, environmentName) =>
    set((state) => {
      const tabId = `env_${environmentId}`;
      const existingTab = state.tabs.find((tab) => tab.id === tabId);
      if (existingTab) {
        return { activeTabId: tabId };
      }

      const newTab = {
        id: tabId,
        title: environmentName,
        type: "environment",
        data: {
          environmentId,
          environmentName,
          isNew: false
        },
        modified: false,
      };

      return {
        tabs: [...state.tabs, newTab],
        activeTabId: tabId,
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
    }))
}));
