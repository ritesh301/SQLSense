"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { GitBranch, Clock, User, RotateCcw, Eye, Download, Plus, Edit, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// --- NEW: Define types for API data ---
interface SchemaVersion {
  id: number;
  name: string;
  description: string;
  schema_ddl: string;
  database_type: string;
  explanation: string | null;
  tables_info: string; // JSON string
  version: number;
  created_at: string;
  is_active: boolean;
}

export default function VersionControl() {
  // --- NEW: State for API data, loading, and errors ---
  const [schemas, setSchemas] = useState<SchemaVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  // --- NEW: Fetch data from backend on component mount ---
  useEffect(() => {
    const fetchSchemas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schema-versions`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch schema versions.");
        }
        setSchemas(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error Fetching Schemas",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemas();
  }, [toast]);


  const handleRollback = (schemaId: number, version: number) => {
    // FUTURE IMPLEMENTATION: This would require a backend endpoint.
    // For example: POST /api/schemas/{schemaId}/rollback
    // This endpoint would create a new version that is a copy of an older one.
    toast({
      title: "Rollback (Not Implemented)",
      description: `This would revert to a previous version of schema ${schemaId}.`,
    })
  }

  const handleViewDiff = (schemaId: number) => {
    // FUTURE IMPLEMENTATION: This would require a backend endpoint or client-side logic.
    // It would fetch two versions of a schema and show the differences.
    toast({
      title: "View Diff (Not Implemented)",
      description: "This would show changes between schema versions.",
    })
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
            <h2 className="text-2xl font-bold mb-2">Failed to Load Schemas</h2>
            <p>{error}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Schema Version Control</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and manage different versions of your database schemas
          </p>
        </motion.div>

        <div className="space-y-6">
          {schemas.map((schema, index) => (
            <motion.div
              key={schema.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{schema.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{schema.description}</p>
                      </div>
                    </div>
                    <Badge variant={schema.is_active ? "default" : "secondary"}>
                      {schema.is_active ? `v${schema.version} (Active)` : `v${schema.version}`}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(schema.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      {/* Author is not in the backend model, so we'll use a placeholder */}
                      <span>Auto-saved</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <GitBranch className="w-4 h-4" />
                      <span>Version {schema.version}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Schema DDL Preview</h4>
                    <pre className="text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
                      <code>{schema.schema_ddl.substring(0, 200)}...</code>
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDiff(schema.id)} disabled>
                      <Eye className="w-4 h-4 mr-2" />
                      View Diff
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRollback(schema.id, schema.version)}
                      disabled={schema.version <= 1}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rollback
                    </Button>

                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>

                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {schemas.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Schemas Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first schema in the Schema Designer to see version history here.
              </p>
              <Link href="/schema-designer">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Schema
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
