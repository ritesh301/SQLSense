"use client"

import { motion } from "framer-motion"
import { Database, Github, Mail, Globe, Users, Zap, Heart, Code, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const teamMembers = [
  {
    name: "Ajinkya Suryawanshi",
    role: "Developer",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Full-stack developer passionate about AI and database technologies.",
  },
  {
    name: "Ritesh Pradhan",
    role: "Developer",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Specializes in natural language processing and machine learning.",
  },
  {
    name: "Ritesh Thete",
    role: "Database Architect",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Expert in database design and optimization across multiple platforms.",
  },
]

const technologies = [
  { name: "Next.js", icon: Code, description: "React framework for production" },
  { name: "Tailwind CSS", icon: Sparkles, description: "Utility-first CSS framework" },
  { name: "Framer Motion", icon: Zap, description: "Animation library for React" },
  { name: "FastAPI", icon: Database, description: "Modern Python web framework" },
]

export default function About() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">About SQLSense</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Empowering developers and data professionals to work smarter with AI-powered SQL generation and schema
              design tools.
            </p>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
                  We believe that working with databases should be intuitive and efficient. SQLSense bridges the gap
                  between natural language and SQL, making database operations accessible to everyone while maintaining
                  the power and precision that professionals need.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose SQLSense?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Generate complex SQL queries in seconds, not minutes",
              },
              {
                icon: Database,
                title: "Multi-Platform",
                description: "Support for PostgreSQL, MySQL, and SQLite",
              },
              {
                icon: Users,
                title: "Team Friendly",
                description: "Collaborate on schemas with version control",
              },
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "Advanced natural language processing",
              },
              {
                icon: Globe,
                title: "Web-Based",
                description: "Access from anywhere, no installation required",
              },
              {
                icon: Heart,
                title: "Developer First",
                description: "Built by developers, for developers",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Built With Modern Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {technologies.map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <tech.icon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                    </div>
                    <h3 className="font-semibold mb-1">{tech.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{tech.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                    <Badge variant="secondary" className="mb-3">
                      {member.role}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Have questions, feedback, or want to contribute? We'd love to hear from you!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="flex items-center space-x-2">
                  <Github className="w-4 h-4" />
                  <span>View on GitHub</span>
                </Button>

                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Mail className="w-4 h-4" />
                  <span>Contact Us</span>
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">Made with ❤️ by the SQLSense team • © 2024 SQLSense</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
