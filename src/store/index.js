import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockCollections, mockEnvironments } from "@/data/mockData";
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

// 环境变量状态管理
export const useEnvironmentStore = create(
  persist(
    (set, get) => ({
      // 环境变量数据
      environmentData: {
        globals: {
          id: "globals",
          name: "Globals",
          variables: [
            {
              id: "var_1",
              name: "host",
              type: "string",
              initialValue: "http://localhost:8081",
              currentValue: "http://localhost:8081"
            },
            {
              id: "var_2",
              name: "token",
              type: "string",
              initialValue: "eyJhbGciOi...",
              currentValue: "eyJhbGciOi..."
            }
          ]
        },
        environments: [
          {
            id: "env_1",
            name: "1-local",
            variables: [
              {
                id: "var_3",
                name: "bihost",
                type: "string",
                initialValue: "http://localhost:8090",
                currentValue: "http://localhost:8090"
              },
              {
                id: "var_4",
                name: "currentTime",
                type: "datetime",
                initialValue: "2025-05-07 11:07:04",
                currentValue: "2025-05-07 11:07:04"
              }
            ]
          },
          {
            id: "env_2",
            name: "staging",
            variables: []
          }
        ]
      },

      // 当前选中的环境
      selectedEnvironmentId: "globals",

      // 创建新环境
      createEnvironment: (name) => {
        const newEnv = {
          id: `env_${Date.now()}`,
          name,
          variables: []
        };
        set((state) => ({
          environmentData: {
            ...state.environmentData,
            environments: [...state.environmentData.environments, newEnv]
          }
        }));
        return newEnv.id;
      },

      // 删除环境
      deleteEnvironment: (envId) => {
        set((state) => ({
          environmentData: {
            ...state.environmentData,
            environments: state.environmentData.environments.filter(env => env.id !== envId)
          },
          selectedEnvironmentId: state.selectedEnvironmentId === envId ? "globals" : state.selectedEnvironmentId
        }));
      },

      // 重命名环境
      renameEnvironment: (envId, newName) => {
        set((state) => ({
          environmentData: {
            ...state.environmentData,
            environments: state.environmentData.environments.map(env =>
              env.id === envId ? { ...env, name: newName } : env
            )
          }
        }));
      },

      // 添加变量
      addVariable: (envId, variable) => {
        const newVariable = {
          id: `var_${Date.now()}`,
          name: variable.name || "",
          type: variable.type || "string",
          initialValue: variable.initialValue || "",
          currentValue: variable.currentValue || variable.initialValue || ""
        };

        set((state) => {
          if (envId === "globals") {
            return {
              environmentData: {
                ...state.environmentData,
                globals: {
                  ...state.environmentData.globals,
                  variables: [...state.environmentData.globals.variables, newVariable]
                }
              }
            };
          } else {
            return {
              environmentData: {
                ...state.environmentData,
                environments: state.environmentData.environments.map(env =>
                  env.id === envId
                    ? { ...env, variables: [...env.variables, newVariable] }
                    : env
                )
              }
            };
          }
        });
        return newVariable.id;
      },

      // 更新变量
      updateVariable: (envId, varId, updates) => {
        set((state) => {
          if (envId === "globals") {
            return {
              environmentData: {
                ...state.environmentData,
                globals: {
                  ...state.environmentData.globals,
                  variables: state.environmentData.globals.variables.map(variable =>
                    variable.id === varId ? { ...variable, ...updates } : variable
                  )
                }
              }
            };
          } else {
            return {
              environmentData: {
                ...state.environmentData,
                environments: state.environmentData.environments.map(env =>
                  env.id === envId
                    ? {
                        ...env,
                        variables: env.variables.map(variable =>
                          variable.id === varId ? { ...variable, ...updates } : variable
                        )
                      }
                    : env
                )
              }
            };
          }
        });
      },

      // 删除变量
      deleteVariable: (envId, varId) => {
        set((state) => {
          if (envId === "globals") {
            return {
              environmentData: {
                ...state.environmentData,
                globals: {
                  ...state.environmentData.globals,
                  variables: state.environmentData.globals.variables.filter(variable => variable.id !== varId)
                }
              }
            };
          } else {
            return {
              environmentData: {
                ...state.environmentData,
                environments: state.environmentData.environments.map(env =>
                  env.id === envId
                    ? { ...env, variables: env.variables.filter(variable => variable.id !== varId) }
                    : env
                )
              }
            };
          }
        });
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
    }),
    {
      name: "environment-storage",
    }
  )
);

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
            data: { environmentId, environmentName },
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
        })),

      // 设置活动环境
      setActiveEnvironment: (envId) => set({ activeEnvironment: envId }),
    }),
    {
      name: "api-storage",
    }
  )
);
