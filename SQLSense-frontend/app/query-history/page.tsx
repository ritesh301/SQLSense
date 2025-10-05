"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { History, Search, Copy, Edit, Play, Clock, Database, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"

// Define a type for the data coming from the backend API
interface QueryHistoryItem {
  id: number;
  natural_query: string;
  generated_sql: string;
  database_type: string;
  created_at: string;
  explanation: string | null;
  model_used: string | null;
  context: string | null;
  is_favorite: boolean;
}

// Helper function to determine query type from SQL string
const getQueryType = (sql: string): string => {
  const upperSql = sql.trim().toUpperCase();
  if (upperSql.startsWith('SELECT')) return 'SELECT';
  if (upperSql.startsWith('INSERT')) return 'INSERT';
  if (upperSql.startsWith('UPDATE')) return 'UPDATE';
  if (upperSql.startsWith('DELETE')) return 'DELETE';
  return 'OTHER';
};

export default function QueryHistoryPage() {
  // State for data fetched from the backend
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterDialect, setFilterDialect] = useState("all")

  // Zustand store for cross-component state updates
  const { setCurrentQuery, setCurrentDialect } = useAppStore()
  const { toast } = useToast()

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch query history.");
        }
        
        // The backend returns a paginated object; we use the 'queries' array
        setHistory(data.queries || []);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error Fetching History",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [toast]); // Dependency array ensures this runs once

  // Memoized filtering logic to avoid re-calculating on every render
  const filteredQueries = useMemo(() => {
    return history.filter((query) => {
      const queryType = getQueryType(query.generated_sql);
      const matchesSearch =
        query.natural_query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.generated_sql.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || queryType === filterType
      const matchesDialect = filterDialect === "all" || query.database_type === filterDialect

      return matchesSearch && matchesType && matchesDialect
    });
  }, [history, searchTerm, filterType, filterDialect]);

  const handleReuseQuery = (query: QueryHistoryItem) => {
    // This function can be expanded to navigate the user back to the main page
    // For now, it updates the global state
    setCurrentQuery(query.natural_query)
    setCurrentDialect(query.database_type)
    toast({
      title: "Query Loaded",
      description: "Query has been loaded into the main input. Navigate to the home page to use it.",
    })
  }

  const handleCopySQL = (sql: string) => {
    navigator.clipboard.writeText(sql)
    toast({
      title: "Copied!",
      description: "SQL query copied to clipboard",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SELECT":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "INSERT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Query History</h1>
          <p className="text-gray-600 dark:text-gray-300">Browse and reuse your previous SQL queries</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search queries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Query Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SELECT">SELECT</SelectItem>
                    <SelectItem value="INSERT">INSERT</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDialect} onValueChange={setFilterDialect}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="SQL Dialect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dialects</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Query List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading History...</h3>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <History className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to Load History</h3>
              <p>{error}</p>
            </div>
          ) : filteredQueries.length > 0 ? (
            filteredQueries.map((query, index) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{query.natural_query}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(query.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Database className="w-4 h-4" />
                            <span>{query.database_type.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getTypeColor(getQueryType(query.generated_sql))}>
                        {getQueryType(query.generated_sql)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="bg-gray-900 dark:bg-gray-950 text-green-400 p-4 rounded-lg mb-4">
                      <pre className="text-sm overflow-x-auto">
                        <code>{query.generated_sql}</code>
                      </pre>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReuseQuery(query)}>
                        <Play className="w-4 h-4 mr-2" />
                        Re-use
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleCopySQL(query.generated_sql)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy SQL
                      </Button>

                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit & Refine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {searchTerm || filterType !== "all" || filterDialect !== "all"
                  ? "No Matching Queries"
                  : "No Query History"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== "all" || filterDialect !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start generating SQL queries to see your history here"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
