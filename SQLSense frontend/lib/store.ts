import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Query {
  id: string
  naturalLanguage: string
  sql: string
  dialect: "postgresql" | "mysql" | "sqlite"
  timestamp: Date
  type: string
}

interface Schema {
  id: string
  name: string
  description: string
  diagram: string
  version: number
  author: string
  timestamp: Date
}

interface User {
  id: string
  name: string
  email: string
  tokens: number
  badges: string[]
  queriesCount: number
  schemasCount: number
}

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Queries
  queries: Query[]
  addQuery: (query: Omit<Query, "id" | "timestamp">) => void

  // Schemas
  schemas: Schema[]
  addSchema: (schema: Omit<Schema, "id" | "timestamp">) => void
  updateSchema: (id: string, updates: Partial<Schema>) => void

  // Rewards
  addTokens: (amount: number) => void
  spendTokens: (amount: number) => boolean
  addBadge: (badge: string) => void

  // Current session
  currentQuery: string
  setCurrentQuery: (query: string) => void
  currentDialect: "postgresql" | "mysql" | "sqlite"
  setCurrentDialect: (dialect: "postgresql" | "mysql" | "sqlite") => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: {
        id: "1",
        name: "Demo User",
        email: "demo@sqlsense.com",
        tokens: 25,
        badges: ["Bronze"],
        queriesCount: 42,
        schemasCount: 5,
      },
      queries: [
        {
          id: "1",
          naturalLanguage: "Show me all users who registered last month",
          sql: "SELECT * FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH);",
          dialect: "mysql",
          timestamp: new Date(Date.now() - 86400000),
          type: "SELECT",
        },
        {
          id: "2",
          naturalLanguage: "Count total orders by status",
          sql: "SELECT status, COUNT(*) as total FROM orders GROUP BY status;",
          dialect: "postgresql",
          timestamp: new Date(Date.now() - 172800000),
          type: "SELECT",
        },
      ],
      schemas: [
        {
          id: "1",
          name: "E-commerce Database",
          description: "Main database schema for online store",
          diagram: "graph TD\n  A[Users] --> B[Orders]\n  B --> C[Order_Items]\n  C --> D[Products]",
          version: 3,
          author: "Demo User",
          timestamp: new Date(Date.now() - 259200000),
        },
      ],
      currentQuery: "",
      currentDialect: "postgresql",

      // Actions
      setUser: (user) => set({ user }),

      addQuery: (query) => {
        const newQuery: Query = {
          ...query,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        }
        set((state) => ({
          queries: [newQuery, ...state.queries],
          user: state.user
            ? {
                ...state.user,
                queriesCount: state.user.queriesCount + 1,
                tokens: state.user.tokens + 1,
              }
            : null,
        }))
      },

      addSchema: (schema) => {
        const newSchema: Schema = {
          ...schema,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        }
        set((state) => ({
          schemas: [newSchema, ...state.schemas],
          user: state.user
            ? {
                ...state.user,
                schemasCount: state.user.schemasCount + 1,
              }
            : null,
        }))
      },

      updateSchema: (id, updates) => {
        set((state) => ({
          schemas: state.schemas.map((schema) => (schema.id === id ? { ...schema, ...updates } : schema)),
        }))
      },

      addTokens: (amount) => {
        set((state) => ({
          user: state.user ? { ...state.user, tokens: state.user.tokens + amount } : null,
        }))
      },

      spendTokens: (amount) => {
        const { user } = get()
        if (!user || user.tokens < amount) return false

        set((state) => ({
          user: state.user ? { ...state.user, tokens: state.user.tokens - amount } : null,
        }))
        return true
      },

      addBadge: (badge) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                badges: [...new Set([...state.user.badges, badge])],
              }
            : null,
        }))
      },

      setCurrentQuery: (query) => set({ currentQuery: query }),
      setCurrentDialect: (dialect) => set({ currentDialect: dialect }),
    }),
    {
      name: "sqlsense-storage",
    },
  ),
)
