"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, Clock, Database, Target, Activity, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

// --- NEW: Define types for API data ---
interface AnalyticsData {
  sql_generations_total: number;
  schema_generations_total: number;
  total_queries_in_history: number;
}

interface QueryHistoryItem {
  id: number;
  natural_query: string;
  generated_sql: string;
  database_type: string;
  created_at: string;
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


export default function Analytics() {
  // --- NEW: State for API data, loading, and errors ---
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<QueryHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // --- NEW: Fetch data from backend on component mount ---
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both analytics summary and recent history in parallel
        const [analyticsRes, historyRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/history?page=1&per_page=5`) // Fetch 5 most recent for activity feed
        ]);

        const analyticsJson = await analyticsRes.json();
        const historyJson = await historyRes.json();

        if (!analyticsRes.ok) {
          throw new Error(analyticsJson.error || "Failed to fetch analytics data.");
        }
        if (!historyRes.ok) {
          throw new Error(historyJson.error || "Failed to fetch recent activity.");
        }

        setAnalyticsData(analyticsJson);
        setRecentActivity(historyJson.queries || []);

      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error Fetching Data",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [toast]);


  // --- These calculations are now based on the fetched data ---
  const queryTypes = useMemo(() => {
    if (!analyticsData) return {};
    // This is a simplified view based on total counts.
    // For a detailed breakdown, you would need to fetch the full history.
    return {
      'SQL Queries': analyticsData.sql_generations_total,
      'Schema Designs': analyticsData.schema_generations_total,
    }
  }, [analyticsData]);

  const totalEvents = useMemo(() => {
      if (!analyticsData) return 1;
      return analyticsData.sql_generations_total + analyticsData.schema_generations_total;
  }, [analyticsData]);


  const getTypeColor = (type: string) => {
    switch (type) {
      case "SQL Queries":
        return "bg-green-500"
      case "Schema Designs":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen text-red-500">
            <AlertTriangle className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Failed to Load Analytics</h2>
            <p>{error}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Insights into your SQL query patterns and productivity</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Queries Saved</p>
                    <p className="text-2xl font-bold">{analyticsData?.total_queries_in_history ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">SQL Generations</p>
                    <p className="text-2xl font-bold">{analyticsData?.sql_generations_total ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Schema Generations</p>
                    <p className="text-2xl font-bold">{analyticsData?.schema_generations_total ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Query Types Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Event Types Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(queryTypes).map(([type, count]) => {
                    const percentage = (count / totalEvents) * 100
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                            <span className="font-medium">{type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{count}</span>
                            <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((query, index) => (
                    <motion.div
                      key={query.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{query.natural_query}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {new Date(query.created_at).toLocaleDateString()} • {query.database_type.toUpperCase()}
                        </p>
                      </div>
                      <Badge className={getTypeColor(getQueryType(query.generated_sql)).replace("bg-", "bg-opacity-20 text-")}>
                        {getQueryType(query.generated_sql)}
                      </Badge>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
